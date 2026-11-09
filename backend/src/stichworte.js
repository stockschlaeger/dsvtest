// Stichworte (DSV_STICHWORTE, Großbuchstaben), Synonyme (DSV_STWSYNO, beide Richtungen ausgewertet), Stoppworte
const { zeile, zeilen, transaktion, Sql, dialekt: d, maskieren, naechsteNummer } = require('./db');
const { grossWieOracle } = require('./pruefung');
const { protokolliere } = require('./protokoll');
const { HttpFehler } = require('./fehler');

// Stichworte mit Anfang „text“ samt Synonymen und Anzahl der Zuordnungen
async function suche(text, limit = 100) {
  const worte = await zeilen(`
    SELECT s.stwnr, s.stichwort, (SELECT COUNT(*) FROM dsv_stwzuo z WHERE z.stwnr = s.stwnr) AS anzahl
    FROM dsv_stichworte s WHERE ${d.like('s.stichwort', '$1')} ORDER BY s.stichwort FETCH FIRST ${Math.max(1, Math.trunc(Number(limit)) || 100)} ROWS ONLY
  `, [`${maskieren(grossWieOracle(String(text || '').trim()))}%`]);
  if (!worte.length) return [];
  const q = new Sql();
  const nummern = worte.map((w) => w.stwnr);
  const synonyme = await zeilen(`
    SELECT y.stichwnr AS von, s.stwnr, s.stichwort FROM dsv_stwsyno y JOIN dsv_stichworte s ON s.stwnr = y.synonr WHERE ${q.in('y.stichwnr', nummern)}
    UNION SELECT y.synonr AS von, s.stwnr, s.stichwort FROM dsv_stwsyno y JOIN dsv_stichworte s ON s.stwnr = y.stichwnr WHERE ${q.in('y.synonr', nummern)}
  `, q.werte);
  return worte.map((w) => ({ ...w, synonyme: synonyme.filter((y) => y.von === w.stwnr).map(({ stwnr, stichwort }) => ({ stwnr, stichwort })) }));
}

// Stichwort-Nummern samt Synonymen (für die Recherche)
async function mitSynonymen(stwnrs) {
  if (!stwnrs.length) return [];
  const q = new Sql();
  const rows = await zeilen(`
    SELECT synonr AS nr FROM dsv_stwsyno WHERE ${q.in('stichwnr', stwnrs)} UNION SELECT stichwnr FROM dsv_stwsyno WHERE ${q.in('synonr', stwnrs)}
  `, q.werte);
  return [...new Set([...stwnrs, ...rows.map((r) => r.nr)])];
}

const nummernFuerBegriff = async (begriff) =>
  mitSynonymen((await zeilen('SELECT stwnr FROM dsv_stichworte WHERE stichwort = $1', [grossWieOracle(String(begriff).trim())])).map((r) => r.stwnr));

const nummernFuerText = async (text) =>
  mitSynonymen((await zeilen(`SELECT stwnr FROM dsv_stichworte WHERE ${d.like('stichwort', '$1')} FETCH FIRST 500 ROWS ONLY`,
    [`%${maskieren(grossWieOracle(String(text).trim()))}%`])).map((r) => r.stwnr));

async function nummerFuer(wort) {
  const bereinigt = grossWieOracle(String(wort || '').trim());
  if (!bereinigt) throw new HttpFehler(400, 'Stichwort darf nicht leer sein');
  if (bereinigt.length > 50) throw new HttpFehler(400, 'Stichwort: höchstens 50 Zeichen');
  if (await zeile('SELECT 1 FROM dsv_stopworte WHERE stopwort = $1', [bereinigt])) throw new HttpFehler(400, `„${bereinigt}“ ist ein Stoppwort`);
  const vorhanden = await zeile('SELECT stwnr FROM dsv_stichworte WHERE stichwort = $1', [bereinigt]);
  if (vorhanden) return vorhanden.stwnr;
  const stwnr = await naechsteNummer('dsv_seq_stwt');
  await zeile('INSERT INTO dsv_stichworte (stwnr, stichwort) VALUES ($1, $2)', [stwnr, bereinigt]);
  return stwnr;
}

// Stichwortbestand und Synonyme pflegt die Stammdatenverwaltung (Handbuch 6.7)
function pruefeRecht(user) {
  if (!user.stammdaten) throw new HttpFehler(403, 'Synonyme pflegt die Stammdatenverwaltung');
}

async function synonymHinzufuegen(user, stwnr, wort) {
  pruefeRecht(user);
  const stichwort = await zeile('SELECT * FROM dsv_stichworte WHERE stwnr = $1', [Number(stwnr)]);
  if (!stichwort) throw new HttpFehler(404, 'Stichwort nicht gefunden');
  await transaktion(async () => {
    const synonym = await nummerFuer(wort);
    if (synonym === stichwort.stwnr) throw new HttpFehler(400, 'Ein Stichwort kann nicht sein eigenes Synonym sein');
    if (!(await zeile('SELECT 1 AS da FROM dsv_stwsyno WHERE stichwnr = $1 AND synonr = $2', [stichwort.stwnr, synonym]))) {
      await zeile('INSERT INTO dsv_stwsyno (stichwnr, synonr) VALUES ($1, $2)', [stichwort.stwnr, synonym]);
    }
    await protokolliere(user, 'stichwort', stichwort.stwnr, 'synonym_hinzugefuegt', { synonym: grossWieOracle(String(wort).trim()) });
  });
}

async function synonymEntfernen(user, stwnr, synonr) {
  pruefeRecht(user);
  await zeile('DELETE FROM dsv_stwsyno WHERE (stichwnr = $1 AND synonr = $2) OR (stichwnr = $2 AND synonr = $1)', [Number(stwnr), Number(synonr)]);
  await protokolliere(user, 'stichwort', stwnr, 'synonym_entfernt', { synonym: Number(synonr) });
}

module.exports = { suche, nummernFuerBegriff, nummernFuerText, synonymHinzufuegen, synonymEntfernen };
