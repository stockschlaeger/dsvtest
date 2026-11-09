// Lokale Anmeldung (AUTH_MODUS=lokal) als Übergang bis zum Keycloak der Organisation:
//   - Login + Passwort aus dsv_app.anmeldung; der Login ist in der Regel die Altkennung (wie früher der Oracle-Benutzer).
//   - Sitzung als httpOnly-Cookie (SameSite=Strict); in dsv_app.sitzung steht nur der Hash des Cookie-Werts.
//   - Nach AUTH_MAX_FEHLVERSUCHE falschen Passwörtern ist der Login AUTH_SPERR_MINUTEN gesperrt.
//   - Von der Administration gesetzte Passwörter muss der Benutzer bei der nächsten Anmeldung ändern.
const crypto = require('crypto');
const config = require('./config');
const { query, zeile, transaktion, dialekt: d } = require('./db');
const passwort = require('./passwort');
const { HttpFehler } = require('./fehler');

const COOKIE = 'dsv_sitzung';
const tokenHash = (token) => crypto.createHash('sha256').update(token).digest('hex');
const { sitzungMinuten, maxFehlversuche, sperrMinuten } = config.anmeldung;

// Vergleichs-Hash für unbekannte Logins, damit die Antwortzeit nichts verrät
let blindHash;

const loginAus = (wert) => String(wert || '').trim().toLowerCase();

function cookieWert(req) {
  for (const teil of (req.headers.cookie || '').split(';')) {
    const [name, ...wert] = teil.trim().split('=');
    if (name === COOKIE) return decodeURIComponent(wert.join('='));
  }
  return null;
}

const cookieOptionen = () => ({ httpOnly: true, sameSite: 'strict', secure: config.anmeldung.cookieSecure, path: '/api' });
const cookieSetzen = (res, token) => res.cookie(COOKIE, token, cookieOptionen());
const cookieLoeschen = (res) => res.clearCookie(COOKIE, cookieOptionen());

async function anmelden(eingabe) {
  const login = loginAus(eingabe?.login);
  const kennwort = eingabe?.passwort;
  if (!login || typeof kennwort !== 'string' || !kennwort) throw new HttpFehler(400, 'Login und Passwort angeben');
  const falsch = new HttpFehler(401, 'Login oder Passwort falsch', 'ANMELDUNG_FALSCH');

  const eintrag = await zeile(`SELECT login, passwort_hash, gesperrt, ${d.zahl('gesperrt_bis > CURRENT_TIMESTAMP')} AS voruebergehend FROM dsv_app.anmeldung WHERE login = $1`, [login]);
  if (!eintrag?.passwort_hash) {
    blindHash ||= passwort.hashen(passwort.erzeugen());
    await passwort.stimmt(kennwort, await blindHash);
    throw falsch;
  }
  if (eintrag.voruebergehend) throw new HttpFehler(429, `Zu viele Fehlversuche – bitte in ${sperrMinuten} Minuten erneut versuchen`, 'VORUEBERGEHEND_GESPERRT');
  if (!(await passwort.stimmt(kennwort, eintrag.passwort_hash))) {
    await query(`
      UPDATE dsv_app.anmeldung SET
        fehlversuche = CASE WHEN fehlversuche + 1 >= $2 THEN 0 ELSE fehlversuche + 1 END,
        gesperrt_bis = CASE WHEN fehlversuche + 1 >= $2 THEN CURRENT_TIMESTAMP + ${d.minuten('$3')} ELSE gesperrt_bis END
      WHERE login = $1`, [login, maxFehlversuche, sperrMinuten]);
    throw falsch;
  }
  if (eintrag.gesperrt) throw new HttpFehler(403, 'Ihr Zugang ist gesperrt.', 'GESPERRT');

  const token = crypto.randomBytes(32).toString('base64url');
  await transaktion(async () => {
    await query('UPDATE dsv_app.anmeldung SET fehlversuche = 0, gesperrt_bis = NULL WHERE login = $1', [login]);
    await query('DELETE FROM dsv_app.sitzung WHERE ablauf < CURRENT_TIMESTAMP');
    await query(`INSERT INTO dsv_app.sitzung (token_hash, login, ablauf) VALUES ($1, $2, CURRENT_TIMESTAMP + ${d.minuten('$3')})`, [tokenHash(token), login, sitzungMinuten]);
  });
  return token;
}

// Gültige Sitzung zum Cookie (verlängert sie) oder null
async function sitzung(req) {
  const token = cookieWert(req);
  if (!token) return null;
  const hash = tokenHash(token);
  const { rowCount } = await query(`
    UPDATE dsv_app.sitzung SET ablauf = CURRENT_TIMESTAMP + ${d.minuten('$2')}
    WHERE token_hash = $1 AND ablauf > CURRENT_TIMESTAMP`, [hash, sitzungMinuten]);
  if (!rowCount) return null;
  return zeile(`
    SELECT a.login, a.name, a.email, a.passwort_aendern
    FROM dsv_app.sitzung s JOIN dsv_app.anmeldung a ON a.login = s.login WHERE s.token_hash = $1`, [hash]);
}

async function abmelden(req) {
  const token = cookieWert(req);
  if (token) await query('DELETE FROM dsv_app.sitzung WHERE token_hash = $1', [tokenHash(token)]);
}

// Eigenes Passwort ändern; andere Sitzungen des Logins enden
async function passwortAendern(req, eingabe) {
  const { login } = req.user;
  const eintrag = await zeile('SELECT passwort_hash FROM dsv_app.anmeldung WHERE login = $1', [login]);
  if (!eintrag?.passwort_hash || !(await passwort.stimmt(eingabe?.alt ?? '', eintrag.passwort_hash))) {
    throw new HttpFehler(400, 'Das bisherige Passwort ist falsch');
  }
  passwort.pruefeRegeln(eingabe?.neu, login);
  if (eingabe.neu === eingabe.alt) throw new HttpFehler(400, 'Das neue Passwort muss sich vom bisherigen unterscheiden');
  const hash = await passwort.hashen(eingabe.neu);
  await transaktion(async () => {
    await query(`UPDATE dsv_app.anmeldung SET passwort_hash = $2, passwort_aendern = ${d.nein}, passwort_gesetzt_am = CURRENT_TIMESTAMP WHERE login = $1`, [login, hash]);
    await query('DELETE FROM dsv_app.sitzung WHERE login = $1 AND token_hash <> $2', [login, tokenHash(cookieWert(req) || '')]);
  });
}

// Passwort durch die Administration setzen (leer = erzeugen); muss bei der nächsten Anmeldung geändert werden.
// Hebt eine vorübergehende Sperre auf und beendet alle Sitzungen des Logins. Gibt das Passwort zurück.
async function passwortSetzen(loginEingabe, vorgabe) {
  const login = loginAus(loginEingabe);
  const neu = vorgabe || passwort.erzeugen();
  if (vorgabe) passwort.pruefeRegeln(vorgabe, login);
  const hash = await passwort.hashen(neu);
  await transaktion(async () => {
    const { rowCount } = await query(`
      UPDATE dsv_app.anmeldung SET passwort_hash = $2, passwort_aendern = ${d.ja}, passwort_gesetzt_am = CURRENT_TIMESTAMP, fehlversuche = 0,
        gesperrt_bis = NULL
      WHERE login = $1`, [login, hash]);
    if (!rowCount) throw new HttpFehler(404, 'Login nicht gefunden');
    await query('DELETE FROM dsv_app.sitzung WHERE login = $1', [login]);
  });
  return neu;
}

const sitzungenBeenden = (login) => query('DELETE FROM dsv_app.sitzung WHERE login = $1', [loginAus(login)]);

module.exports = { loginAus, cookieSetzen, cookieLoeschen, anmelden, sitzung, abmelden, passwortAendern, passwortSetzen, sitzungenBeenden };
