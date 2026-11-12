// Benutzerverwaltung (nur Administration):
//   Anmeldungen   Login → Altkennung (dsv_app.anmeldung), sperren; bei lokaler Anmeldung auch Logins anlegen und Passwörter setzen
//   Profile       DSV_BENUTZERPROFIL mit den Rollen KLASSE_REG/SB/SY/ST/DS/NS und Vorbelegungen
//   Zuständigkeit DSV_GVP (Referat, optional Aktenplan-Teilbaum, Recht)
//   Vertretungen  DSV_VERTRETUNG
const { query, zeile, zeilen, transaktion, dialekt: d, likeMuster } = require('./db');
const config = require('./config');
const benutzer = require('./benutzer');
const lokal = require('./lokaleAnmeldung');
const { pruefe } = require('./pruefung');
const { protokolliere, unterschiede } = require('./protokoll');
const { einfuegen, aendern } = require('./tabellen');
const { HttpFehler } = require('./fehler');

const PROFILFELDER = ['kennung', 'voreinst_org', 'konfiguration', 'ben_eai', 'ben_klasse', 'ben_umfang'];
const KLASSENSPALTEN = benutzer.KLASSEN.map((klasse) => `klasse_${klasse.toLowerCase()}`);
const GVP_SCHLUESSEL = ['org', 'hgruppe', 'gruppe', 'ugruppe', 'tglieder'];

// Änderungen an Rechten sofort wirksam machen
const fertig = () => benutzer.vergessen();

const fehlerUebersetzen = (error, eindeutig) => {
  if (error.code === '23505') return new HttpFehler(409, eindeutig);
  if (error.code === '23503') return new HttpFehler(400, 'Ungültiger Wert (Referat, Konfiguration oder Vorbelegung nicht in den Wertelisten)');
  return error;
};

// ---------- Anmeldungen ----------

// Ohne Passwort-Hash; nur ob ein Passwort gesetzt ist und ob eine vorübergehende Sperre läuft
const anmeldungen = async () => (await zeilen(`
  SELECT a.login, a.user_id, a.name, a.email, a.gesperrt, a.erste_anmeldung, a.letzte_anmeldung, a.zugeordnet_von, a.zugeordnet_am,
    ${d.zahl('a.passwort_hash IS NOT NULL')} AS hat_passwort, a.passwort_aendern, a.passwort_gesetzt_am,
    CASE WHEN a.gesperrt_bis > CURRENT_TIMESTAMP THEN a.gesperrt_bis END AS gesperrt_bis, p.kennung
  FROM dsv_app.anmeldung a LEFT JOIN dsv_benutzerprofil p ON p.user_id = a.user_id
  ORDER BY CASE WHEN a.user_id IS NULL THEN 0 ELSE 1 END, a.letzte_anmeldung DESC NULLS LAST, a.login
`)).map((a) => ({
  ...a, gesperrt: Boolean(a.gesperrt), passwort_aendern: Boolean(a.passwort_aendern), hat_passwort: Boolean(a.hat_passwort)
}));

async function pruefeAltkennung(eingabe) {
  const userId = eingabe ? String(eingabe).trim().toUpperCase() : null;
  if (userId && !(await zeile('SELECT 1 FROM dsv_benutzerprofil WHERE user_id = $1', [userId]))) {
    throw new HttpFehler(400, `Unbekannte Altkennung ${userId}`);
  }
  return userId;
}

// Login vorab anlegen: lokal mit Startpasswort (leer = erzeugen), bei Keycloak nur die Zuordnung.
// Ohne Altkennung wird die gleichnamige Altkennung zugeordnet, falls vorhanden.
async function anmeldungAnlegen(user, eingabe) {
  const login = lokal.loginAus(eingabe.login);
  if (!/^[a-z0-9._@$#-]{1,255}$/.test(login)) throw new HttpFehler(400, 'Login: nur Buchstaben, Ziffern und . _ @ $ # - erlaubt');
  const userId = (await pruefeAltkennung(eingabe.user_id)) ?? (await zeile('SELECT user_id FROM dsv_benutzerprofil WHERE user_id = upper($1)', [login]))?.user_id ?? null;
  const name = eingabe.name ? String(eingabe.name).trim().slice(0, 255) : null;
  const passwort = await transaktion(async () => {
    try {
      await zeile(`
        INSERT INTO dsv_app.anmeldung (login, user_id, name, letzte_anmeldung, zugeordnet_von, zugeordnet_am)
        VALUES ($1, $2, $3, NULL, $4, ${userId ? 'CURRENT_TIMESTAMP' : 'NULL'})`, [login, userId, name, userId ? user.login : null]);
    } catch (error) {
      if (error.code === '23505') throw new HttpFehler(409, `Den Login ${login} gibt es bereits`);
      throw error;
    }
    await protokolliere(user, 'anmeldung', login, 'angelegt', { user_id: userId });
    return config.anmeldung.modus === 'lokal' ? lokal.passwortSetzen(login, eingabe.passwort || null) : null;
  });
  fertig();
  return { login, user_id: userId, passwort };
}

async function passwortZuruecksetzen(user, login, eingabe) {
  if (config.anmeldung.modus !== 'lokal') throw new HttpFehler(400, 'Passwörter verwaltet der Keycloak der Organisation');
  const passwort = await lokal.passwortSetzen(login, eingabe?.passwort || null);
  await protokolliere(user, 'anmeldung', login, 'passwort_gesetzt');
  return { login, passwort };
}

async function anmeldungEntfernen(user, login) {
  if (login === user.login) throw new HttpFehler(400, 'Den eigenen Login können Sie nicht entfernen');
  const geloescht = await zeile('SELECT user_id FROM dsv_app.anmeldung WHERE login = $1', [login]);
  if (!geloescht) throw new HttpFehler(404, 'Anmeldung nicht gefunden');
  await query('DELETE FROM dsv_app.anmeldung WHERE login = $1', [login]);
  await protokolliere(user, 'anmeldung', login, 'entfernt', { user_id: geloescht.user_id });
  fertig();
}

async function anmeldungAendern(user, login, eingabe) {
  const alt = await zeile('SELECT * FROM dsv_app.anmeldung WHERE login = $1', [login]);
  if (!alt) throw new HttpFehler(404, 'Anmeldung nicht gefunden');
  alt.gesperrt = Boolean(alt.gesperrt); // Oracle: 0/1
  const neu = {};
  if (eingabe.user_id !== undefined) neu.user_id = await pruefeAltkennung(eingabe.user_id);
  if (eingabe.gesperrt !== undefined) neu.gesperrt = Boolean(eingabe.gesperrt);
  const geaendert = unterschiede(alt, neu);
  if (!Object.keys(geaendert).length) return;
  // Zuordnungsstempel nur, wenn sich die Altkennung ändert
  const zuordnung = 'user_id' in geaendert ? ', zugeordnet_von = $4, zugeordnet_am = CURRENT_TIMESTAMP' : '';
  await query(`UPDATE dsv_app.anmeldung SET user_id = $2, gesperrt = $3${zuordnung} WHERE login = $1`, [
    login, neu.user_id !== undefined ? neu.user_id : alt.user_id, neu.gesperrt ?? alt.gesperrt, ...(zuordnung ? [user.login] : [])
  ]);
  if (neu.gesperrt) await lokal.sitzungenBeenden(login);
  await protokolliere(user, 'anmeldung', login, 'geaendert', geaendert);
  fertig();
}

// ---------- Profile ----------

async function profile(q) {
  const filter = q ? `WHERE ${d.ilike('p.user_id', '$1')} OR ${d.ilike('p.kennung', '$1')}` : '';
  return zeilen(`
    SELECT p.*,
      (SELECT COUNT(*) FROM dsv_gvp g WHERE g.bearbeiter = p.user_id) AS anzahl_gvp,
      (SELECT ${d.textListe('a.login', ', ')} FROM dsv_app.anmeldung a WHERE a.user_id = p.user_id) AS anmeldungen
    FROM dsv_benutzerprofil p ${filter} ORDER BY p.user_id FETCH FIRST 1000 ROWS ONLY
  `, q ? [likeMuster(q)] : []);
}

async function profil(userId) {
  const p = await zeile('SELECT * FROM dsv_benutzerprofil WHERE user_id = $1', [String(userId).toUpperCase()]);
  if (!p) throw new HttpFehler(404, 'Profil nicht gefunden');
  const [gvp, vertritt, vertreten, logins] = await Promise.all([
    zeilen(`SELECT g.*, o.name AS org_name, r.name AS recht_name FROM dsv_gvp g
      LEFT JOIN dsv_lov_org o ON o.org = g.org LEFT JOIN dsv_lov_rechte r ON r.recht = g.recht
      WHERE g.bearbeiter = $1 ORDER BY g.org, g.hgruppe NULLS FIRST, g.gruppe NULLS FIRST, g.ugruppe NULLS FIRST, g.tglieder NULLS FIRST`, [p.user_id]),
    zeilen('SELECT registrator FROM dsv_vertretung WHERE vertreter = $1 ORDER BY registrator', [p.user_id]),
    zeilen('SELECT vertreter FROM dsv_vertretung WHERE registrator = $1 ORDER BY vertreter', [p.user_id]),
    zeilen('SELECT login, gesperrt, letzte_anmeldung FROM dsv_app.anmeldung WHERE user_id = $1 ORDER BY login', [p.user_id])
  ]);
  return {
    ...p,
    klassen: benutzer.KLASSEN.filter((klasse) => p[`klasse_${klasse.toLowerCase()}`] === 'X'),
    gvp,
    vertritt: vertritt.map((r) => r.registrator),
    vertreten_von: vertreten.map((r) => r.vertreter),
    anmeldungen: logins
  };
}

function klassenWerte(klassen) {
  if (klassen === undefined) return {};
  if (!Array.isArray(klassen)) throw new HttpFehler(400, 'Rollen: Liste erwartet');
  const unbekannt = klassen.filter((klasse) => !benutzer.KLASSEN.includes(klasse));
  if (unbekannt.length) throw new HttpFehler(400, `Unbekannte Rolle: ${unbekannt.join(', ')}`);
  return Object.fromEntries(benutzer.KLASSEN.map((klasse, i) => [KLASSENSPALTEN[i], klassen.includes(klasse) ? 'X' : null]));
}

async function profilAnlegen(user, eingabe) {
  const werte = await pruefe('dsv_benutzerprofil', eingabe, ['user_id', ...PROFILFELDER], { pflicht: ['user_id', 'kennung'], gross: ['user_id', 'kennung'] });
  try {
    await einfuegen('dsv_benutzerprofil', { ...werte, ...klassenWerte(eingabe.klassen ?? []) });
  } catch (error) {
    throw fehlerUebersetzen(error, 'Altkennung oder Kennung ist bereits vergeben');
  }
  await protokolliere(user, 'profil', werte.user_id, 'angelegt', { klassen: eingabe.klassen ?? [] });
  fertig();
  return werte.user_id;
}

async function profilAendern(user, userId, eingabe) {
  const alt = await zeile('SELECT * FROM dsv_benutzerprofil WHERE user_id = $1', [String(userId).toUpperCase()]);
  if (!alt) throw new HttpFehler(404, 'Profil nicht gefunden');
  const werte = { ...(await pruefe('dsv_benutzerprofil', eingabe, PROFILFELDER, { gross: ['kennung'] })), ...klassenWerte(eingabe.klassen) };
  if (werte.kennung === null) throw new HttpFehler(400, 'Kennung ist ein Pflichtfeld');
  const geaendert = unterschiede(alt, werte);
  if (!Object.keys(geaendert).length) return;
  try {
    await aendern('dsv_benutzerprofil', 'user_id = $1', [alt.user_id], Object.fromEntries(Object.keys(geaendert).map((f) => [f, werte[f]])));
  } catch (error) {
    throw fehlerUebersetzen(error, 'Die Kennung ist bereits vergeben');
  }
  await protokolliere(user, 'profil', alt.user_id, 'geaendert', geaendert);
  fertig();
}

// ---------- Geschäftsverteilungsplan ----------

async function gvpHinzufuegen(user, userId, eingabe) {
  const bearbeiter = String(userId).toUpperCase();
  const werte = await pruefe('dsv_gvp', eingabe, [...GVP_SCHLUESSEL, 'recht', 'bemerkung'], { pflicht: ['org', 'recht'], gross: ['tglieder', 'recht'] });
  // DSV_GVP hat keinen Fremdschlüssel auf die Referate – daher hier prüfen
  if (!(await zeile('SELECT 1 FROM dsv_lov_org WHERE org = $1', [werte.org]))) throw new HttpFehler(400, `Referat ${werte.org} gibt es nicht`);
  try {
    await einfuegen('dsv_gvp', { bearbeiter, hgruppe: null, gruppe: null, ugruppe: null, tglieder: null, ...werte });
  } catch (error) {
    throw fehlerUebersetzen(error, 'Diesen Eintrag gibt es bereits');
  }
  await protokolliere(user, 'profil', bearbeiter, 'gvp_hinzugefuegt', werte);
  fertig();
}

async function gvpEntfernen(user, userId, eingabe) {
  const bearbeiter = String(userId).toUpperCase();
  const werte = GVP_SCHLUESSEL.map((feld) => eingabe?.[feld] || null);
  const bedingung = `bearbeiter = $1 AND org = $2 AND ${d.gleich('hgruppe', '$3')} AND ${d.gleich('gruppe', '$4')}
      AND ${d.gleich('ugruppe', '$5')} AND ${d.gleich('tglieder', '$6')}`;
  const geloescht = await zeile(`SELECT * FROM dsv_gvp WHERE ${bedingung}`, [bearbeiter, ...werte]);
  if (!geloescht) throw new HttpFehler(404, 'Eintrag nicht gefunden');
  await query(`DELETE FROM dsv_gvp WHERE ${bedingung}`, [bearbeiter, ...werte]);
  await protokolliere(user, 'profil', bearbeiter, 'gvp_entfernt', geloescht);
  fertig();
}

// ---------- Vertretungen ----------

async function vertretung(user, eingabe, entfernen) {
  const registrator = String(eingabe?.registrator || '').trim().toUpperCase();
  const vertreter = String(eingabe?.vertreter || '').trim().toUpperCase();
  if (!registrator || !vertreter) throw new HttpFehler(400, 'Vertretene Person und Vertreter angeben');
  if (registrator === vertreter) throw new HttpFehler(400, 'Eine Person kann sich nicht selbst vertreten');
  // Vertretungen gibt es nur zwischen Registratoren (Handbuch 7.6)
  if (!entfernen) {
    const { anzahl } = await zeile(`SELECT COUNT(*) AS anzahl FROM dsv_benutzerprofil WHERE user_id IN ($1, $2) AND klasse_reg = 'X'`, [registrator, vertreter]);
    if (anzahl < 2) throw new HttpFehler(400, 'Vertretungen gibt es nur zwischen Registratoren (beide mit Rolle Registratur)');
  }
  await transaktion(async () => {
    if (entfernen) {
      await zeile('DELETE FROM dsv_vertretung WHERE registrator = $1 AND vertreter = $2', [registrator, vertreter]);
    } else {
      try {
        await zeile('INSERT INTO dsv_vertretung (registrator, vertreter) VALUES ($1, $2)', [registrator, vertreter]);
      } catch (error) {
        if (error.code === '23503') throw new HttpFehler(400, 'Unbekannte Kennung');
        throw fehlerUebersetzen(error, 'Diese Vertretung gibt es bereits');
      }
    }
    await protokolliere(user, 'profil', registrator, entfernen ? 'vertretung_entfernt' : 'vertretung_hinzugefuegt', { vertreter });
  });
  fertig();
}

module.exports = { anmeldungen, anmeldungAnlegen, anmeldungAendern, passwortZuruecksetzen, anmeldungEntfernen, profile, profil, profilAnlegen, profilAendern, gvpHinzufuegen, gvpEntfernen, vertretung };
