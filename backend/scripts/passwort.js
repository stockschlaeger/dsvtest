// Passwort für einen Login der lokalen Anmeldung setzen; legt den Login bei Bedarf an (z. B. den ersten Admin aus DSV_ADMINS).
//   npm run passwort -- <login>                     Startpasswort erzeugen und ausgeben
//   npm run passwort -- <login> --altkennung ADMIN  dabei der Altkennung zuordnen
// Das Startpasswort muss bei der ersten Anmeldung geändert werden.
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const { query, zeile, beenden } = require('../src/db');
const lokal = require('../src/lokaleAnmeldung');

const argumente = process.argv.slice(2);
const login = lokal.loginAus(argumente.find((a, i) => !a.startsWith('--') && argumente[i - 1] !== '--altkennung'));
const altkennung = argumente.includes('--altkennung') ? String(argumente[argumente.indexOf('--altkennung') + 1] || '').toUpperCase() : null;

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
  const passwort = await lokal.passwortSetzen(login);
  console.log(`Login:          ${login}${userId ? ` (Altkennung ${userId})` : ' (noch keiner Altkennung zugeordnet)'}`);
  console.log(`Startpasswort:  ${passwort}   – muss bei der ersten Anmeldung geändert werden`);
})()
  .catch((error) => {
    console.error('Fehler:', error.message);
    process.exitCode = 1;
  })
  .finally(() => beenden());
