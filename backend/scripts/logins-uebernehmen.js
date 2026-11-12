// Logins und Protokoll aus der Oracle-Zeit in die App-Tabellen von PostgreSQL übernehmen.
// ora2pg überträgt die Oracle-Tabellen DSV_APP_ANMELDUNG und DSV_APP_PROTOKOLL als gewöhnliche Tabellen
// (dsv_app_anmeldung, dsv_app_protokoll) ins Datenschema; die App nutzt unter PostgreSQL aber dsv_app.anmeldung und
// dsv_app.protokoll. Das Skript kopiert sie dorthin:
//   - Passwort-Hashes, Zuordnungen, Sperren und „Startpasswort ändern“ bleiben erhalten – alle melden sich wie bisher an.
//   - Bereits vorhandene Logins in dsv_app.anmeldung werden nicht überschrieben.
//   - Sitzungen werden nicht übernommen (alle melden sich einmal neu an).
//   - Die Quelltabellen bleiben unverändert; nach erfolgreicher Prüfung können sie gelöscht werden.
// Aufruf (nach npm run db:app):  npm run logins:uebernehmen
//
// Gab es unter Oracle noch keine App-Logins (keine Tabelle dsv_app_anmeldung), legt
//   npm run logins:uebernehmen -- --aus-kennungen
// für jede Altkennung (DSV_BENUTZERPROFIL.USER_ID) einen Login an: Login = Kennung klein, Startpasswort wird erzeugt und
// einmalig ausgegeben (muss bei der ersten Anmeldung geändert werden). Vorhandene Logins bleiben unverändert.
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const config = require('../src/config');
const { query, zeile, zeilen, transaktion, beenden } = require('../src/db');
const lokal = require('../src/lokaleAnmeldung');

// Je Altkennung ohne Login einen Login mit Startpasswort anlegen
async function ausKennungen() {
  const ohneLogin = await zeilen(`
    SELECT p.user_id, p.kennung FROM dsv_benutzerprofil p
    WHERE NOT EXISTS (SELECT 1 FROM dsv_app.anmeldung a WHERE a.user_id = p.user_id OR a.login = lower(p.user_id))
    ORDER BY p.user_id`);
  const liste = [];
  await transaktion(async () => {
    for (const p of ohneLogin) {
      const login = lokal.loginAus(p.user_id);
      await query(`INSERT INTO dsv_app.anmeldung (login, user_id, letzte_anmeldung, zugeordnet_von, zugeordnet_am)
        VALUES ($1, $2, NULL, 'übernahme', CURRENT_TIMESTAMP)`, [login, p.user_id]);
      liste.push({ login, kennung: p.kennung, passwort: await lokal.passwortSetzen(login) });
    }
  });
  console.log(`${liste.length} Logins aus Altkennungen angelegt (Startpasswort muss bei der ersten Anmeldung geändert werden):\n`);
  for (const e of liste) console.log(`${e.login.padEnd(32)} ${String(e.kennung || '').padEnd(12)} ${e.passwort}`);
}

const ja = (wert) => wert === true || Number(wert) === 1;

// Quelltabelle im Datenschema (oder einem anderen Schema, falls ora2pg dorthin exportiert hat)
async function quelle(tabelle) {
  const treffer = await zeilen(`
    SELECT table_schema FROM information_schema.tables
    WHERE table_name = $1 AND table_schema <> 'dsv_app'
    ORDER BY CASE WHEN table_schema = $2 THEN 0 ELSE 1 END, table_schema`, [tabelle, config.datenbank.schema]);
  return treffer[0] ? `${treffer[0].table_schema}.${tabelle}` : null;
}

(async () => {
  if (config.datenbank.typ !== 'postgres') throw new Error('Nur für PostgreSQL – in backend/.env DB_CONNECT_STRING entfernen und DATABASE_URL setzen');
  if (!(await zeile(`SELECT 1 AS da FROM information_schema.tables WHERE table_schema = 'dsv_app' AND table_name = 'anmeldung'`))) {
    throw new Error('Schema dsv_app fehlt – zuerst npm run db:app');
  }
  if (process.argv.includes('--aus-kennungen')) return ausKennungen();
  const anmeldungen = await quelle('dsv_app_anmeldung');
  if (!anmeldungen) {
    throw new Error('Keine Tabelle dsv_app_anmeldung gefunden – unter Oracle gab es also keine App-Logins.\n'
      + 'Logins für alle Altkennungen anlegen: npm run logins:uebernehmen -- --aus-kennungen');
  }
  const protokoll = await quelle('dsv_app_protokoll');

  await transaktion(async () => {
    let neu = 0;
    let vorhanden = 0;
    for (const a of await zeilen(`SELECT * FROM ${anmeldungen}`)) {
      const login = String(a.login).trim().toLowerCase();
      if (await zeile('SELECT 1 AS da FROM dsv_app.anmeldung WHERE login = $1', [login])) {
        vorhanden += 1;
        continue;
      }
      await query(`
        INSERT INTO dsv_app.anmeldung (login, user_id, name, email, gesperrt, erste_anmeldung, letzte_anmeldung, zugeordnet_von,
          zugeordnet_am, vertretung_aktiv, passwort_hash, passwort_aendern, passwort_gesetzt_am, fehlversuche, gesperrt_bis)
        VALUES ($1, $2, $3, $4, $5, COALESCE($6, now()), $7, $8, $9, $10, $11, $12, $13, 0, NULL)`, [
        login, a.user_id, a.name, a.email, ja(a.gesperrt), a.erste_anmeldung, a.letzte_anmeldung, a.zugeordnet_von,
        a.zugeordnet_am, a.vertretung_aktiv, a.passwort_hash, ja(a.passwort_aendern), a.passwort_gesetzt_am
      ]);
      neu += 1;
    }
    console.log(`Logins: ${neu} übernommen, ${vorhanden} waren schon vorhanden (aus ${anmeldungen})`);

    if (!protokoll) {
      console.log('Protokoll: keine Tabelle dsv_app_protokoll gefunden – übersprungen');
      return;
    }
    const bekannt = new Set((await zeilen('SELECT id FROM dsv_app.protokoll')).map((p) => Number(p.id)));
    let eintraege = 0;
    for (const p of await zeilen(`SELECT * FROM ${protokoll} ORDER BY id`)) {
      if (bekannt.has(Number(p.id))) continue;
      let details = p.details;
      if (typeof details === 'string') {
        try {
          details = JSON.parse(details);
        } catch (error) {
          details = { text: details };
        }
      }
      await query(`INSERT INTO dsv_app.protokoll (id, zeitpunkt, login, user_id, objekt_typ, objekt_id, aktion, details)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`, [p.id, p.zeitpunkt, p.login, p.user_id, p.objekt_typ, p.objekt_id, p.aktion,
        details == null ? null : JSON.stringify(details)]);
      eintraege += 1;
    }
    // Neue Einträge der App sollen hinter den übernommenen Nummern weiterzählen
    await query(`SELECT setval(pg_get_serial_sequence('dsv_app.protokoll', 'id'), GREATEST((SELECT COALESCE(MAX(id), 0) FROM dsv_app.protokoll), 1))`);
    console.log(`Protokoll: ${eintraege} Einträge übernommen (aus ${protokoll})`);
  });
  console.log('Fertig. Die Quelltabellen sind unverändert und können nach der Prüfung gelöscht werden.');
})()
  .catch((error) => {
    console.error('Fehler:', error.message);
    process.exitCode = 1;
  })
  .finally(() => beenden());
