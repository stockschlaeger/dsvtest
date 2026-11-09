// Anmeldung der Oberfläche; der Modus kommt vom Backend (GET /api → anmeldung):
//   lokal     Login/Passwort der App, Sitzung als httpOnly-Cookie
//   keycloak  Keycloak der Organisation (Authorization Code Flow mit PKCE), Token je Anfrage
// Rollen und Rechte kommen in beiden Fällen aus der App (/api/ich).
import Keycloak from 'keycloak-js';

let modus = 'lokal';
let keycloak = null;

export const anmeldeModus = () => modus;

export async function starten() {
  const antwort = await fetch('/api');
  if (!antwort.ok) throw new Error(`Server antwortet mit ${antwort.status}`);
  const info = await antwort.json();
  modus = info.anmeldung;
  if (modus !== 'keycloak') return;
  keycloak = new Keycloak({
    url: process.env.REACT_APP_KEYCLOAK_URL || info.keycloak.url,
    realm: process.env.REACT_APP_KEYCLOAK_REALM || info.keycloak.realm,
    clientId: process.env.REACT_APP_KEYCLOAK_CLIENT_ID || info.keycloak.clientId
  });
  await keycloak.init({ onLoad: 'login-required', pkceMethod: 'S256', checkLoginIframe: false });
}

// Kopfzeilen für jede API-Anfrage. Lokal schickt der Browser das Cookie selbst; der Header
// X-DSV-Anfrage weist ändernde Anfragen als Anfragen der eigenen Oberfläche aus.
export async function anfrageKopf() {
  if (modus !== 'keycloak') return { 'X-DSV-Anfrage': '1' };
  try {
    // Token erneuern, wenn es in weniger als 30 Sekunden abläuft
    await keycloak.updateToken(30);
  } catch (error) {
    keycloak.login();
  }
  return { Authorization: `Bearer ${keycloak.token}` };
}

export async function anmelden(login, passwort) {
  const antwort = await fetch('/api/anmeldung', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-DSV-Anfrage': '1' },
    body: JSON.stringify({ login, passwort })
  });
  if (!antwort.ok) throw new Error((await antwort.json().catch(() => ({}))).fehler || `Anmeldung fehlgeschlagen (${antwort.status})`);
}

export async function abmelden() {
  if (modus === 'keycloak') return keycloak.logout({ redirectUri: window.location.origin });
  await fetch('/api/abmeldung', { method: 'POST', headers: { 'X-DSV-Anfrage': '1' } }).catch(() => {});
  window.location.assign('/');
}
