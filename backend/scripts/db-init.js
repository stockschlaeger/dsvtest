// Legt das Altschema, die App-Tabellen und optional Beispieldaten an (nur lokale Entwicklung):
//   npm run db:init                 Schema "dsv" neu anlegen (vorhandene Daten werden gelöscht!) + App-Tabellen
//   npm run db:init -- --beispiele  zusätzlich Beispieldaten und lokale Test-Logins (Passwort = Login)
// Produktiv kommen Schema und Daten per ora2pg; dann nur db/app-schema.sql einspielen bzw. aktualisieren:
//   npm run db:app                  legt fehlende App-Tabellen/Spalten an, vorhandene Logins bleiben erhalten
// Oracle (DB_CONNECT_STRING gesetzt): nur npm run db:app – legt die Tabellen DSV_APP_* an (db/app-schema-oracle.sql);
// Alttabellen werden bei Oracle nie angelegt, geändert oder gelöscht.
const fs = require('fs');
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const { Client } = require('pg');
const config = require('../src/config');
const passwort = require('../src/passwort');

// Test-Logins wie im lokalen Keycloak (keycloak/realm-dsv.json), Passwort = Login – nur für Beispieldaten
const TEST_LOGINS = ['leser', 'bearbeiter', 'referat77', 'referat12', 'abteilung7', 'registratur', 'admin', 'm.neumann'];

const datei = (name) => fs.readFileSync(path.join(__dirname, '..', 'db', name), 'utf8');

// Oracle: Anweisungen einzeln ausführen; bereits vorhandene Tabellen/Indizes/Spalten überspringen
const ORACLE_VORHANDEN = [955, 1408, 1430, 2260, 2261, 2275];
async function oracle() {
  if (!process.argv.includes('--nur-app')) {
    throw new Error('Bei Oracle legt die App keine Alttabellen an und löscht nichts. Nur „npm run db:app“ (Tabellen DSV_APP_*).');
  }
  const { query, beenden } = require('../src/db');

// Fehlermeldung auch für Verbindungsfehler ohne Text (z. B. ECONNREFUSED als AggregateError)
const fehlerText = (error) => [error.message, error.code, ...(error.errors || []).map((e) => `${e.code || ''} ${e.address || ''}:${e.port || ''} ${e.message || ''}`.trim())]
  .filter(Boolean).join(' | ') || String(error);
  const anweisungen = datei('app-schema-oracle.sql')
    .split('\n').filter((zeile) => !zeile.trim().startsWith('--')).join('\n')
    .split(';').map((anweisung) => anweisung.trim()).filter(Boolean);
  try {
    for (const anweisung of anweisungen) {
      try {
        await query(anweisung);
        console.log(`✔ ${anweisung.split('\n')[0]}`);
      } catch (error) {
        if (!ORACLE_VORHANDEN.includes(error.errorNum)) throw error;
        console.log(`· vorhanden: ${anweisung.split('\n')[0]}`);
      }
    }
    console.log('App-Tabellen DSV_APP_* in Oracle angelegt bzw. vorhanden.');
  } finally {
    await beenden();
  }
}

if (config.datenbank.typ === 'oracle') {
  oracle().catch((error) => {
    console.error('Fehler:', fehlerText(error));
    process.exit(1);
  });
} else (async () => {
  const client = new Client({ connectionString: config.datenbank.url, options: `-c timezone=${config.datenbank.zeitzone}` });
  await client.connect();
  const nurApp = process.argv.includes('--nur-app');
  if (!nurApp) {
    const schema = config.datenbank.schema;
    await client.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE; CREATE SCHEMA ${schema}; SET search_path = ${schema};`);
    await client.query(datei('altschema.sql'));
    console.log(`Altschema in "${schema}" angelegt.`);
  }
  if (!nurApp) await client.query(`DROP SCHEMA IF EXISTS dsv_app CASCADE;`);
  await client.query(datei('app-schema.sql'));
  console.log(nurApp ? 'App-Tabellen in "dsv_app" angelegt bzw. aktualisiert.' : 'App-Tabellen in "dsv_app" angelegt.');
  if (process.argv.includes('--beispiele')) {
    await client.query(`SET search_path = ${config.datenbank.schema}; ${datei('beispieldaten.sql')}`);
    const hashes = await Promise.all(TEST_LOGINS.map((login) => passwort.hashen(login)));
    await client.query(`
      INSERT INTO dsv_app.anmeldung (login, user_id, passwort_hash, passwort_gesetzt_am, letzte_anmeldung, zugeordnet_von, zugeordnet_am)
      SELECT t.login, p.user_id, t.hash, now(), NULL, CASE WHEN p.user_id IS NOT NULL THEN 'beispieldaten' END, CASE WHEN p.user_id IS NOT NULL THEN now() END
      FROM unnest($1::text[], $2::text[]) AS t(login, hash) LEFT JOIN dsv_benutzerprofil p ON p.user_id = upper(t.login)`, [TEST_LOGINS, hashes]);
    console.log(`Beispieldaten eingespielt; Test-Logins (Passwort = Login): ${TEST_LOGINS.join(', ')}.`);
  }
  await client.end();
})().catch((error) => {
  console.error('Fehler:', fehlerText(error));
  process.exit(1);
});
