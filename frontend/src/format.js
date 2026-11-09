// Anzeigeformate
export const datum = (wert) => (wert ? new Date(`${wert.slice(0, 10)}T00:00:00`).toLocaleDateString('de-DE') : '–');

export const zeitpunkt = (wert) =>
  wert ? new Date(wert).toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' }) : '–';

export function bytes(anzahl) {
  if (anzahl == null) return '–';
  const einheiten = ['B', 'KB', 'MB', 'GB'];
  let wert = anzahl;
  let stufe = 0;
  while (wert >= 1024 && stufe < einheiten.length - 1) {
    wert /= 1024;
    stufe += 1;
  }
  return `${wert.toLocaleString('de-DE', { maximumFractionDigits: stufe ? 1 : 0 })} ${einheiten[stufe]}`;
}

// Im Browser direkt öffnenbar (Dateipfade und file:// blockiert der Browser aus Sicherheitsgründen)
export const istUrl = (text) => /^https?:\/\//i.test(text);

// Lokales Datum JJJJ-MM-TT, optional um Tage verschoben
export const isoDatum = (tage = 0) => new Date(Date.now() + tage * 86400000).toLocaleDateString('sv-SE');

// Gruppenpfad oder Benutzername lesbar machen
export const empfaengerText = (empfaenger) => (empfaenger?.startsWith('/') ? `Gruppe ${empfaenger}` : empfaenger);

// Großschreibung wie Oracle UPPER: „ß“ bleibt „ß“ (sonst passt „MASSNAHME“ nicht zu „MAßNAHME“ im Bestand)
export const grossWieOracle = (text) =>
  Array.from(String(text), (z) => {
  const g = z.toUpperCase();
  return g.length === 1 && !(z <= '\u00ff' && g > '\u00ff') ? g : z;
}).join('');
