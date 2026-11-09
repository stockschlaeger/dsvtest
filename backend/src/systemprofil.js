// Systemprofil der Altanwendung (DSV_SYSTEMPROFIL, eine Zeile): Vorbelegungen und Optionen
const { zeile } = require('./db');

const CACHE_MS = 60 * 1000;
let cache = { zeit: 0, profil: null };

async function systemprofil() {
  if (!cache.profil || Date.now() - cache.zeit > CACHE_MS) {
    cache = { zeit: Date.now(), profil: (await zeile('SELECT * FROM dsv_systemprofil FETCH FIRST 1 ROWS ONLY')) || {} };
  }
  return cache.profil;
}

// Schalter wie „J“, „JA“ oder „EIN“
const aktiv = (wert) => /^(J|E)/i.test(String(wert || '').trim());

module.exports = { systemprofil, aktiv };
