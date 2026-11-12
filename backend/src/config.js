// Zentrale Konfiguration aus Umgebungsvariablen (siehe backend/.env)
const keycloakUrl = (process.env.KEYCLOAK_SERVER_URL || 'http://localhost:8180').replace(/\/$/, '');
const realm = process.env.KEYCLOAK_REALM || 'dsv';
const issuer = `${keycloakUrl}/realms/${realm}`;

const modus = (process.env.AUTH_MODUS || 'lokal').trim().toLowerCase();
if (!['lokal', 'keycloak'].includes(modus)) throw new Error(`AUTH_MODUS muss "lokal" oder "keycloak" sein, nicht "${modus}"`);
const zahl = (wert, standard) => (Number(wert) > 0 ? Number(wert) : standard);

const liste = (wert) => String(wert || '').split(',').map((eintrag) => eintrag.trim().toLowerCase()).filter(Boolean);

module.exports = {
  port: Number(process.env.PORT) || 5001,
  isDev: process.env.NODE_ENV !== 'production',
  // Anmeldung: "lokal" = Login und Passwort der App (Übergang), "keycloak" = Keycloak der Organisation.
  // Beide liefern nur den Login; Rollen und Rechte kommen immer aus den Alttabellen.
  anmeldung: {
    modus,
    // Sitzung endet nach so vielen Minuten ohne Anfrage
    sitzungMinuten: zahl(process.env.AUTH_SITZUNG_MINUTEN, 480),
    passwortMin: zahl(process.env.AUTH_PASSWORT_MIN, 10),
    // nach so vielen Fehlversuchen ist der Login für sperrMinuten gesperrt
    maxFehlversuche: zahl(process.env.AUTH_MAX_FEHLVERSUCHE, 5),
    sperrMinuten: zahl(process.env.AUTH_SPERR_MINUTEN, 15),
    // Cookie nur über HTTPS senden (Standard: in Produktion)
    cookieSecure: process.env.AUTH_COOKIE_SECURE ? process.env.AUTH_COOKIE_SECURE === 'true' : process.env.NODE_ENV === 'production'
  },
  // Keycloak der Organisation (AUTH_MODUS=keycloak): nur Anmeldung, keine Rollen/Gruppen
  keycloak: {
    url: keycloakUrl,
    realm,
    issuer,
    jwksUri: `${issuer}/protocol/openid-connect/certs`,
    clientId: process.env.KEYCLOAK_CLIENT_ID || 'dsv-web'
  },
  // Datenbank: Oracle, wenn DB_CONNECT_STRING gesetzt ist (Altdatenbank), sonst PostgreSQL über DATABASE_URL
  datenbank: {
    typ: process.env.DB_CONNECT_STRING ? 'oracle' : 'postgres',
    url: process.env.DATABASE_URL || 'postgres://dsv:dsv@localhost:5433/dsv',
    oracle: { user: process.env.DB_USER, password: process.env.DB_PASSWORD, connectString: process.env.DB_CONNECT_STRING },
    // Schema der Alttabellen: PostgreSQL Standard "dsv"; Oracle Standard = angemeldeter Benutzer (sonst CURRENT_SCHEMA)
    schema: process.env.DB_SCHEMA || (process.env.DB_CONNECT_STRING ? null : 'dsv'),
    // Zeitzone der Sitzung: Oracle-DATE und SYSDATE sind Ortszeit; LOCALTIMESTAMP soll dieselbe Ortszeit liefern
    zeitzone: process.env.DB_ZEITZONE || 'Europe/Berlin'
  },
  // Logins mit Zugriff auf die Benutzerverwaltung, auch ohne zugeordnete Altkennung (Erstbetrieb)
  admins: liste(process.env.DSV_ADMINS),
  // Rolle der Altanwendung, die zur Benutzerverwaltung berechtigt (KLASSE_SY)
  adminKlasse: (process.env.DSV_ADMIN_KLASSE || 'SY').toUpperCase(),
  // GVP-Recht, das nur Lesen erlaubt; jedes andere Recht erlaubt Schreiben
  rechtLesen: process.env.DSV_RECHT_LESEN || 'L',
  // Status-Codes aus DSV_LOV_STATUS (Handbuch Kap. 5.2): neues Schriftgut, Geschäftsgang, nur über Fachfunktionen setzbar
  status: {
    neu: process.env.DSV_STATUS_NEU || 'neu',
    geschaeftsgang: process.env.DSV_STATUS_GG || 'GG',
    system: (process.env.DSV_STATUS_SYSTEM || 'GG,WV,umreg.,Archiv,g').split(',').map((s) => s.trim()).filter(Boolean)
  }
};
