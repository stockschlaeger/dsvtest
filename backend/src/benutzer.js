// Benutzerkontext: Keycloak-Anmeldung → Altkennung (DSV_BENUTZERPROFIL.USER_ID) → Rollen der Altanwendung
//
// - Zuordnung in dsv_app.anmeldung; ohne Eintrag wird der Login in Großbuchstaben als Altkennung versucht.
// - Rollen: KLASSE_REG/SB/NS/SY/ST/DS = 'X' (Registratur, Sachbearbeitung, Nur Lesen, Systemverwaltung,
//   Stammdatenverwaltung, Datenschutz); mehrere Rollen werden vereinigt.
// - Aktive Vertretung (nur zwischen Registratoren): handelnAls = Kennung der vertretenen Person.
// - Benutzerverwaltung: Logins aus DSV_ADMINS oder Profile mit der Rolle aus DSV_ADMIN_KLASSE.
const config = require('./config');
const { query, zeile, zeilen } = require('./db');

const KLASSEN = ['REG', 'SB', 'NS', 'SY', 'ST', 'DS'];
const CACHE_MS = 15 * 1000;
const cache = new Map();

const vergessen = () => cache.clear();

const klassenVon = (profil) => (profil ? KLASSEN.filter((klasse) => profil[`klasse_${klasse.toLowerCase()}`] === 'X') : []);

async function anmeldungErfassen({ login, name, email }) {
  // Anlegen oder aktualisieren (ohne ON CONFLICT/MERGE, damit es auf PostgreSQL und Oracle gleich läuft)
  const { rowCount } = await query(
    'UPDATE dsv_app.anmeldung SET letzte_anmeldung = CURRENT_TIMESTAMP, name = $2, email = $3 WHERE login = $1', [login, name, email]);
  if (!rowCount) {
    try {
      await query('INSERT INTO dsv_app.anmeldung (login, name, email, letzte_anmeldung) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)', [login, name, email]);
    } catch (error) {
      if (error.code !== '23505') throw error; // gleichzeitig angelegt
    }
  }
  const eintrag = await zeile('SELECT * FROM dsv_app.anmeldung WHERE login = $1', [login]);
  // Automatische Zuordnung, wenn der Login der Altkennung entspricht
  if (!eintrag.user_id) {
    const profil = await zeile('SELECT user_id FROM dsv_benutzerprofil WHERE user_id = upper($1)', [login]);
    if (profil) {
      await query(`UPDATE dsv_app.anmeldung SET user_id = $2, zugeordnet_von = 'automatisch', zugeordnet_am = CURRENT_TIMESTAMP WHERE login = $1`,
        [login, profil.user_id]);
      return { ...eintrag, user_id: profil.user_id };
    }
  }
  return eintrag;
}

// Vertretbar sind Registratoren, für die der Benutzer als Vertreter eingetragen ist (beide mit Rolle Registratur)
const vertretbar = async (userId) => (await zeilen(`
  SELECT v.registrator FROM dsv_vertretung v JOIN dsv_benutzerprofil p ON p.user_id = v.registrator
  WHERE v.vertreter = $1 AND p.klasse_reg = 'X' ORDER BY v.registrator`, [userId])).map((r) => r.registrator);

async function kontext(anmeldung) {
  const gespeichert = cache.get(anmeldung.login);
  if (gespeichert && Date.now() - gespeichert.zeit < CACHE_MS) return gespeichert.user;

  const eintrag = await anmeldungErfassen(anmeldung);
  const profil = eintrag.user_id ? await zeile('SELECT * FROM dsv_benutzerprofil WHERE user_id = $1', [eintrag.user_id]) : null;
  const klassen = klassenVon(profil);
  const userId = profil ? profil.user_id : null;
  const vertretungen = userId && klassen.includes('REG') ? await vertretbar(userId) : [];
  const vertretungAktiv = vertretungen.includes(eintrag.vertretung_aktiv) ? eintrag.vertretung_aktiv : null;
  const handelnAls = vertretungAktiv || userId;

  // Zuständigkeiten der handelnden Kennung und (nur lesend) die der vertretbaren Personen
  const zustaendigkeiten = handelnAls
    ? await zeilen(`
        SELECT g.org, g.hgruppe, g.gruppe, g.ugruppe, g.tglieder, g.recht, NULL AS vertreten FROM dsv_gvp g WHERE g.bearbeiter = $1
        UNION ALL
        SELECT g.org, g.hgruppe, g.gruppe, g.ugruppe, g.tglieder, $3 AS recht, g.bearbeiter AS vertreten
        FROM dsv_gvp g JOIN dsv_vertretung v ON v.registrator = g.bearbeiter WHERE v.vertreter = $2 AND g.bearbeiter <> $1
        ORDER BY 1, 2 NULLS FIRST`, [handelnAls, userId, config.rechtLesen])
    : [];

  const user = {
    login: anmeldung.login,
    name: anmeldung.name,
    userId,
    handelnAls,
    vertretungAktiv,
    vertretungen,
    profil,
    klassen,
    zustaendigkeiten,
    gesperrt: Boolean(eintrag.gesperrt),
    registratur: klassen.includes('REG'),
    sachbearbeitung: klassen.includes('SB'),
    stammdaten: klassen.includes('ST'),
    siehtGeheim: klassen.includes('REG') || klassen.includes('DS'),
    kannSchreiben: (klassen.includes('REG') || klassen.includes('SB')) && zustaendigkeiten.some((z) => !z.vertreten && z.recht !== config.rechtLesen),
    admin: config.admins.includes(anmeldung.login) || klassen.includes(config.adminKlasse)
  };
  cache.set(anmeldung.login, { zeit: Date.now(), user });
  return user;
}

// Vertretung übernehmen bzw. abwählen (null)
async function vertretungWaehlen(user, registrator) {
  const ziel = registrator ? String(registrator).toUpperCase() : null;
  if (ziel && !user.vertretungen.includes(ziel)) return false;
  await query('UPDATE dsv_app.anmeldung SET vertretung_aktiv = $2 WHERE login = $1', [user.login, ziel]);
  cache.delete(user.login);
  return true;
}

// Registrator-Felder: bei aktiver Vertretung die vertretene Person, dazu der tatsächlich Handelnde als Vertreter
const stempel = (user) => ({ registrator: user.handelnAls, vertreter: user.vertretungAktiv ? user.userId : null });

module.exports = { KLASSEN, klassenVon, kontext, vergessen, vertretungWaehlen, stempel };
