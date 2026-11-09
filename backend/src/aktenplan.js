// Aktenplan der Altanwendung: Hauptgruppen (DSV_HG) und Positionen (DSV_LAP) mit HGRUPPE/GRUPPE/UGRUPPE/TGLIEDER.
// Der Baum wird ebenenweise geladen; gezählt werden die Akten, die der Benutzer lesen darf.
const { zeilen, Sql, dialekt: d, likeMuster, maskieren } = require('./db');
const zugriff = require('./zugriff');

// Akten unterhalb eines Knotens (n): gleiche Hauptgruppe, weitere Ebenen nur wenn am Knoten gesetzt
const unterhalb = (a, n) => `${a}.hgruppe = ${n}.hgruppe
  AND (${n}.gruppe IS NULL OR ${a}.gruppe = ${n}.gruppe)
  AND (${n}.ugruppe IS NULL OR ${a}.ugruppe = ${n}.ugruppe)
  AND (${n}.tglieder IS NULL OR ${a}.tglieder = ${n}.tglieder)`;

async function kinder(user, { hgruppe, gruppe, ugruppe } = {}) {
  const q = new Sql();
  let knoten;
  if (!hgruppe) {
    // Hauptgruppen, auch solche, die nur im Aktenplan, nicht in DSV_HG stehen
    knoten = `SELECT h.hgruppe, ${d.text('NULL', 1)} AS gruppe, ${d.text('NULL', 1)} AS ugruppe, ${d.text('NULL', 20)} AS tglieder,
        h.hgruppe AS kennzeichen, h.betreff, h.hinweis, l.aufbfrist, l.lfd_apnr
      FROM (SELECT hgruppe, betreff, hinweis FROM dsv_hg
            UNION SELECT DISTINCT hgruppe, NULL, NULL FROM dsv_lap WHERE hgruppe NOT IN (SELECT hgruppe FROM dsv_hg)) h
      LEFT JOIN dsv_lap l ON l.hgruppe = h.hgruppe AND l.gruppe IS NULL AND l.ugruppe IS NULL AND l.tglieder IS NULL`;
  } else {
    const ebene = !gruppe
      ? `l.hgruppe = ${q.p(hgruppe)} AND l.gruppe IS NOT NULL AND l.ugruppe IS NULL AND l.tglieder IS NULL`
      : !ugruppe
        ? `l.hgruppe = ${q.p(hgruppe)} AND l.gruppe = ${q.p(gruppe)} AND l.ugruppe IS NOT NULL AND l.tglieder IS NULL`
        : `l.hgruppe = ${q.p(hgruppe)} AND l.gruppe = ${q.p(gruppe)} AND l.ugruppe = ${q.p(ugruppe)} AND l.tglieder IS NOT NULL`;
    knoten = `SELECT l.hgruppe, l.gruppe, l.ugruppe, l.tglieder, l.akte AS kennzeichen, l.betreff, l.hinweis, l.aufbfrist, l.lfd_apnr
      FROM dsv_lap l WHERE ${ebene}`;
  }
  return zeilen(`
    SELECT n.*,
      ${d.zahl(`n.tglieder IS NULL AND EXISTS (SELECT 1 FROM dsv_lap k WHERE k.hgruppe = n.hgruppe
        AND ((n.gruppe IS NULL AND k.gruppe IS NOT NULL)
          OR (n.gruppe IS NOT NULL AND n.ugruppe IS NULL AND k.gruppe = n.gruppe AND k.ugruppe IS NOT NULL)
          OR (n.ugruppe IS NOT NULL AND k.gruppe = n.gruppe AND k.ugruppe = n.ugruppe AND k.tglieder IS NOT NULL)))`)} AS hat_kinder,
      (SELECT COUNT(*) FROM dsv_akte a WHERE ${unterhalb('a', 'n')} AND ${zugriff.lesen(q, user, 'a')}) AS anzahl_akten
    FROM (${knoten}) n
    ORDER BY n.kennzeichen
  `, q.werte);
}

// Positionen nach Kennzeichen (Anfang) oder Betreff suchen
async function suche(q) {
  const s = new Sql();
  return zeilen(`
    SELECT lfd_apnr, hgruppe, gruppe, ugruppe, tglieder, akte AS kennzeichen, betreff, aufbfrist, hinweis
    FROM dsv_lap WHERE ${d.like('akte', s.p(`${maskieren(q)}%`))} OR ${d.ilike('betreff', s.p(likeMuster(q)))}
    ORDER BY akte FETCH FIRST 50 ROWS ONLY
  `, s.werte);
}

module.exports = { kinder, suche, unterhalb };
