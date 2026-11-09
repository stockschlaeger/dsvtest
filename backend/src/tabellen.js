// Allgemeines Einfügen und Ändern in den Alttabellen (PostgreSQL und Oracle, siehe db.js)
const { dialekt, mitZeile } = require('./db');

// Platzhalter für den aktuellen Zeitpunkt (LOCALTIMESTAMP(0) bzw. SYSDATE)
const JETZT = Symbol('jetzt');

function ausdruck(wert, parameter) {
  if (wert === JETZT) return dialekt.jetzt;
  parameter.push(wert);
  return `$${parameter.length}`;
}

// Leere Werte werden weggelassen, damit die Standardwerte der Alttabellen greifen (z. B. ERSTDATUM, GEHEIM).
// Gibt die neue Zeile zurück.
async function einfuegen(tabelle, werte) {
  const parameter = [];
  const spalten = Object.keys(werte).filter((spalte) => werte[spalte] !== null && werte[spalte] !== undefined);
  const ausdruecke = spalten.map((spalte) => ausdruck(werte[spalte], parameter));
  return mitZeile(`INSERT INTO ${tabelle} (${spalten.join(', ')}) VALUES (${ausdruecke.join(', ')})`, parameter, tabelle);
}

// bedingung nutzt $1 … $n für bedingungWerte; die zu setzenden Werte folgen danach. Gibt die (erste) geänderte Zeile zurück.
async function aendern(tabelle, bedingung, bedingungWerte, werte) {
  const parameter = [...bedingungWerte];
  const setzen = Object.entries(werte).map(([spalte, wert]) => `${spalte} = ${ausdruck(wert, parameter)}`);
  if (!setzen.length) return null;
  return mitZeile(`UPDATE ${tabelle} SET ${setzen.join(', ')} WHERE ${bedingung}`, parameter, tabelle);
}

module.exports = { JETZT, einfuegen, aendern };
