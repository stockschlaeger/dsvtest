// Passwörter der lokalen Anmeldung: scrypt (in Node enthalten) mit zufälligem Salz.
// Gespeichert wird "scrypt$N$r$p$salz$hash" (Base64), damit sich die Parameter später ändern lassen.
const crypto = require('crypto');
const { promisify } = require('util');
const config = require('./config');
const { HttpFehler } = require('./fehler');

const scrypt = promisify(crypto.scrypt);
const PARAMETER = { N: 16384, r: 8, p: 1 };

async function hashen(passwort) {
  const salz = crypto.randomBytes(16);
  const hash = await scrypt(passwort, salz, 64, PARAMETER);
  return ['scrypt', PARAMETER.N, PARAMETER.r, PARAMETER.p, salz.toString('base64'), hash.toString('base64')].join('$');
}

async function stimmt(passwort, gespeichert) {
  const [art, N, r, p, salz, hash] = String(gespeichert || '').split('$');
  if (art !== 'scrypt' || !salz || !hash) return false;
  const soll = Buffer.from(hash, 'base64');
  const ist = await scrypt(String(passwort), Buffer.from(salz, 'base64'), soll.length, { N: Number(N), r: Number(r), p: Number(p) });
  return crypto.timingSafeEqual(soll, ist);
}

// Startpasswort: 12 Zeichen ohne leicht verwechselbare Zeichen
function erzeugen() {
  const zeichen = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 12 }, () => zeichen[crypto.randomInt(zeichen.length)]).join('');
}

function pruefeRegeln(passwort, login) {
  if (typeof passwort !== 'string' || passwort.length < config.anmeldung.passwortMin) {
    throw new HttpFehler(400, `Das Passwort muss mindestens ${config.anmeldung.passwortMin} Zeichen lang sein`);
  }
  if (passwort.length > 200) throw new HttpFehler(400, 'Das Passwort ist zu lang');
  if (login && passwort.toLowerCase().includes(login.toLowerCase())) throw new HttpFehler(400, 'Das Passwort darf den Login nicht enthalten');
}

module.exports = { hashen, stimmt, erzeugen, pruefeRegeln };
