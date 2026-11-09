const path = require('path');

// .env laden (Node >= 20.12), vorhandene Umgebungsvariablen haben Vorrang
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch (error) {
  // keine .env vorhanden
}

const app = require('./src/app');
const config = require('./src/config');
const { spaltenInfo, zeile, dialekt } = require('./src/db');

// Verbindung und Altschema beim Start prüfen
spaltenInfo()
  .then(async (spalten) => {
    if (!spalten.has('dsv_akte')) throw new Error(`Im Schema "${config.datenbank.schema || config.datenbank.oracle.user}" fehlen die DSV-Tabellen`);
    if (dialekt.oracle && !spalten.has('dsv_app_anmeldung')) throw new Error('App-Tabellen DSV_APP_* fehlen – npm run db:app ausführen');
    // PostgreSQL: upper() muss „ß“ unverändert lassen wie Oracle UPPER, sonst verletzen Altdaten die Prüfregeln
    const { gleich } = dialekt.oracle ? { gleich: true } : await zeile(`SELECT upper('ß') = 'ß' AS gleich`);
    if (!gleich) console.warn(`WARNUNG: upper('ß') ist in dieser Datenbank nicht 'ß' – Datenbank mit LOCALE_PROVIDER builtin, BUILTIN_LOCALE 'C.UTF-8' anlegen (siehe README)`);
    app.listen(config.port, () => {
      console.log(`DSV-API läuft auf http://localhost:${config.port}`);
      console.log(config.anmeldung.modus === 'lokal'
        ? 'Anmeldung:       lokal (Login/Passwort der App)'
        : `Anmeldung:       Keycloak ${config.keycloak.issuer} (Client ${config.keycloak.clientId})`);
      console.log(dialekt.oracle
        ? `Datenbank:       Oracle ${config.datenbank.oracle.user}@${config.datenbank.oracle.connectString}${config.datenbank.schema ? ` (Schema ${config.datenbank.schema})` : ''}`
        : `Datenbank:       PostgreSQL ${config.datenbank.url.replace(/:[^:@/]+@/, ':***@')} (Schema ${config.datenbank.schema})`);
    });
  })
  .catch((error) => {
    console.error('Start fehlgeschlagen:', error.message);
    process.exit(1);
  });
