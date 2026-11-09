// Anmeldung (nur Authentifizierung) und Benutzerkontext aus den Alttabellen.
//   AUTH_MODUS=lokal     Sitzungs-Cookie der lokalen Anmeldung (lokaleAnmeldung.js)
//   AUTH_MODUS=keycloak  Bearer-Token vom Keycloak der Organisation
// Beide liefern nur den Login; Rollen und Rechte bestimmt benutzer.kontext aus den Alttabellen.
const { createRemoteJWKSet, jwtVerify } = require('jose');
const config = require('./config');
const benutzer = require('./benutzer');
const lokal = require('./lokaleAnmeldung');
const { HttpFehler } = require('./fehler');

let jwks;

async function keycloakLogin(req) {
  const [schema, token] = (req.headers.authorization || '').split(' ');
  if (schema !== 'Bearer' || !token) throw new HttpFehler(401, 'Nicht angemeldet', 'NICHT_ANGEMELDET');
  jwks ||= createRemoteJWKSet(new URL(config.keycloak.jwksUri));
  let payload;
  try {
    ({ payload } = await jwtVerify(token, jwks, { issuer: config.keycloak.issuer }));
    // Token muss für die App ausgestellt sein (azp) oder sie als Empfänger nennen (aud)
    const empfaenger = [].concat(payload.aud || []);
    if (payload.azp !== config.keycloak.clientId && !empfaenger.includes(config.keycloak.clientId)) {
      throw new Error(`Token ist nicht für ${config.keycloak.clientId} ausgestellt`);
    }
  } catch (error) {
    throw new HttpFehler(401, config.isDev ? `Ungültiges oder abgelaufenes Token: ${error.message}` : 'Ungültiges oder abgelaufenes Token', 'NICHT_ANGEMELDET');
  }
  return { login: String(payload.preferred_username || payload.sub).toLowerCase(), name: payload.name || null, email: payload.email || null };
}

async function lokalerLogin(req) {
  const sitzung = await lokal.sitzung(req);
  if (!sitzung) throw new HttpFehler(401, 'Nicht angemeldet', 'NICHT_ANGEMELDET');
  return sitzung;
}

const authentifizierung = async (req, res, next) => {
  try {
    const anmeldung = config.anmeldung.modus === 'lokal' ? await lokalerLogin(req) : await keycloakLogin(req);
    // Kopie, weil benutzer.kontext den Kontext je Login zwischenspeichert
    req.user = { ...(await benutzer.kontext(anmeldung)), passwortAendern: Boolean(anmeldung.passwort_aendern) };
    next();
  } catch (error) {
    next(error);
  }
};

// Lokale Anmeldung: Cookies schickt der Browser auch bei Anfragen fremder Seiten mit. Ändernde Anfragen
// müssen daher den Header der eigenen Oberfläche tragen (fremde Seiten können ihn nicht setzen).
const eigeneOberflaeche = (req, res, next) => {
  if (config.anmeldung.modus !== 'lokal' || ['GET', 'HEAD', 'OPTIONS'].includes(req.method) || req.get('X-DSV-Anfrage') === '1') return next();
  next(new HttpFehler(403, 'Anfrage abgelehnt'));
};

// Startpasswort: bis zur Änderung nur /api/ich, Passwort ändern und Abmelden
const erfordertEigenesPasswort = (req, res, next) => {
  if (req.user.passwortAendern) return next(new HttpFehler(403, 'Bitte zuerst das Startpasswort ändern', 'PASSWORT_AENDERN'));
  next();
};

// Fachliche Routen nur mit zugeordneter Altkennung
const erfordertAltkennung = (req, res, next) => {
  if (req.user.gesperrt) return next(new HttpFehler(403, 'Ihr Zugang ist gesperrt.', 'GESPERRT'));
  if (!req.user.userId) {
    return next(new HttpFehler(403, `Ihre Anmeldung „${req.user.login}“ ist noch keiner Kennung zugeordnet. Bitte wenden Sie sich an die Administration.`, 'NICHT_ZUGEORDNET'));
  }
  next();
};

const erfordertAdmin = (req, res, next) => {
  if (req.user.gesperrt || !req.user.admin) return next(new HttpFehler(403, 'Nur für die Administration', 'KEIN_ADMIN'));
  next();
};

module.exports = { authentifizierung, eigeneOberflaeche, erfordertEigenesPasswort, erfordertAltkennung, erfordertAdmin };
