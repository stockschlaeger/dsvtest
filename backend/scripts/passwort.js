// Passwort für einen Login der lokalen Anmeldung setzen; legt den Login bei Bedarf an (z. B. den ersten Admin aus DSV_ADMINS).
//   npm run passwort -- <login>                     Startpasswort erzeugen und ausgeben
//   npm run passwort -- <login> --altkennung ADMIN  dabei der Altkennung zuordnen
//   npm run passwort -- test --testzugang --altkennung ADMIN
//                                                   Testzugang: Passwort = Login (oder --passwort X), ohne Passwortregeln
//                                                   und ohne Pflicht zur Änderung – nur für Test und Entwicklung
// Sonst ist es ein Startpasswort, das bei der ersten Anmeldung geändert werden muss.
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const { query, zeile, beenden, dialekt } = require('../src/db');
const lokal = require('../src/lokaleAnmeldung');
const { hashen } = require('../src/passwort');

// Fehlermeldung auch für Verbindungsfehler ohne Text (z. B. ECONNREFUSED als AggregateError)
const fehlerText = (error) => [error.message, error.code, ...(error.errors || []).map((e) => `${e.code || ''} ${e.address || ''}:${e.port || ''} ${e.message || ''}`.trim())]
  .filter(Boolean).join(' | ') || String(error);

const argumente = process.argv.slice(2);
const wert = (name) => (argumente.includes(name) ? String(argumente[argumente.indexOf(name) + 1] || '') : null);
const login = lokal.loginAus(argumente.find((a, i) => !a.startsWith('--') && !['--altkennung', '--passwort'].includes(argumente[i - 1])));
const altkennung = wert('--altkennung')?.toUpperCase() || null;
const testzugang = argumente.includes('--testzugang');

(async () => {
  if (!login) throw new Error('Aufruf: npm run passwort -- <login> [--altkennung KENNUNG]');
  const userId = altkennung || (await zeile('SELECT user_id FROM dsv_benutzerprofil WHERE user_id = upper($1)', [login]))?.user_id || null;
  if (altkennung && !(await zeile('SELECT 1 FROM dsv_benutzerprofil WHERE user_id = $1', [altkennung]))) throw new Error(`Unbekannte Altkennung ${altkennung}`);
  const vorhanden = await zeile('SELECT user_id FROM dsv_app.anmeldung WHERE login = $1', [login]);
  if (!vorhanden) {
    await query(`INSERT INTO dsv_app.anmeldung (login, user_id, letzte_anmeldung, zugeordnet_von, zugeordnet_am)
      VALUES ($1, $2, NULL, ${userId ? "'konsole', CURRENT_TIMESTAMP" : 'NULL, NULL'})`, [login, userId]);
  } else if (userId && userId !== vorhanden.user_id) {
    await query(`UPDATE dsv_app.anmeldung SET user_id = $2, zugeordnet_von = 'konsole', zugeordnet_am = CURRENT_TIMESTAMP WHERE login = $1`, [login, userId]);
  }
  const zuordnung = `${login}${userId ? ` (Altkennung ${userId})` : ' (noch keiner Altkennung zugeordnet – in der Benutzerverwaltung zuordnen)'}`;
  if (testzugang) {
    const passwort = wert('--passwort') || login;
    await query(`UPDATE dsv_app.anmeldung SET passwort_hash = $2, passwort_aendern = ${dialekt.nein}, passwort_gesetzt_am = CURRENT_TIMESTAMP,
      fehlversuche = 0, gesperrt_bis = NULL, gesperrt = ${dialekt.nein} WHERE login = $1`, [login, await hashen(passwort)]);
    console.log(`Testzugang:     ${zuordnung}`);
    console.log(`Passwort:       ${passwort}   – ohne Passwortregeln, nur für Test und Entwicklung`);
    return;
  }
  const passwort = await lokal.passwortSetzen(login, wert('--passwort'));
  console.log(`Login:          ${zuordnung}`);
  console.log(`Startpasswort:  ${passwort}   – muss bei der ersten Anmeldung geändert werden`);
})()
  .catch((error) => {
    console.error('Fehler:', fehlerText(error));
    process.exitCode = 1;
  })
  .finally(() => beenden());
