// Adressen (DSV_ADRESSEN). Sichtbar wie in DSV_ADRESSEN_: öffentliche Adressen und solche, die an lesbaren Dokumenten hängen.
const { zeilen, zeile, Sql, dialekt: d, likeMuster, naechsteNummer } = require('./db');
const zugriff = require('./zugriff');
const { pruefe } = require('./pruefung');
const { protokolliere, unterschiede } = require('./protokoll');
const { JETZT, einfuegen, aendern } = require('./tabellen');
const { HttpFehler } = require('./fehler');

const FELDER = ['kuerzel', 'bezeichnung_1', 'bezeichnung_2', 'bezeichnung_3', 'anrede', 'strasse', 'hausnummer', 'plz', 'ort', 'land',
  'telnr', 'gebdatum', 'oeffentlich', 'obsolet', 'gueltig_ab'];

// Zusätzlich sieht die Registratur private Adressen, die noch an keinem Dokument hängen – sonst könnte sie eine neu
// erfasste Adresse weder ändern noch beim Registrieren als Einsender/Empfänger auswählen.
const sichtbar = (q, user) => `(a.oeffentlich = 'J' OR EXISTS (SELECT 1 FROM dsv_doku_adr z JOIN dsv_doku d ON d.lfd_doknr = z.lfd_doknr
  WHERE z.adr_nr = a.adr_nr AND ${zugriff.lesenDokument(q, user, 'd')})${user.registratur
  ? ' OR NOT EXISTS (SELECT 1 FROM dsv_doku_adr z2 WHERE z2.adr_nr = a.adr_nr)' : ''})`;

async function liste(user, { q: text, mitObsoleten } = {}) {
  const q = new Sql();
  const bedingungen = [sichtbar(q, user)];
  if (!mitObsoleten) bedingungen.push(`a.obsolet <> 'J'`);
  if (text) {
    const muster = q.p(likeMuster(text));
    const bezeichnung = `COALESCE(a.bezeichnung_1, '') || ' ' || COALESCE(a.bezeichnung_2, '') || ' ' || COALESCE(a.bezeichnung_3, '')`;
    bedingungen.push(`(${d.ilike('a.kuerzel', muster)} OR ${d.ilike(bezeichnung, muster)} OR ${d.ilike('a.ort', muster)} OR ${d.ilike('a.plz', muster)})`);
  }
  return zeilen(`
    SELECT a.*, (SELECT COUNT(*) FROM dsv_doku_adr z WHERE z.adr_nr = a.adr_nr) AS anzahl_dokumente
    FROM dsv_adressen a WHERE ${bedingungen.join(' AND ')}
    ORDER BY a.bezeichnung_1, a.bezeichnung_2 FETCH FIRST 300 ROWS ONLY
  `, q.werte);
}

async function laden(user, id) {
  const q = new Sql();
  const adresse = await zeile(`SELECT a.* FROM dsv_adressen a WHERE a.adr_nr = ${q.p(Number(id))} AND ${sichtbar(q, user)}`, q.werte);
  if (!adresse) throw new HttpFehler(404, 'Adresse nicht gefunden');
  return adresse;
}

// Öffentliche Adressen pflegt die Stammdatenverwaltung (Handbuch 6.3); die Registratur erfasst private Adressen
// (ohne Kürzel, nur am Dokument sichtbar) bei der Registrierung (5.2.2)
function pruefeRecht(user, oeffentlich) {
  if (user.stammdaten) return;
  if (user.registratur && oeffentlich !== 'J') return;
  throw new HttpFehler(403, oeffentlich === 'J' ? 'Öffentliche Adressen pflegt die Stammdatenverwaltung' : 'Adressen erfassen Registratur und Stammdatenverwaltung');
}

const eindeutig = (error) => {
  if (error.code === '23505') return new HttpFehler(409, 'Das Kürzel ist bereits vergeben');
  return error;
};

async function anlegen(user, eingabe) {
  const werte = await pruefe('dsv_adressen', eingabe, FELDER, { pflicht: ['bezeichnung_1'], gross: ['kuerzel', 'oeffentlich', 'obsolet'] });
  pruefeRecht(user, werte.oeffentlich ?? 'N');
  if (werte.oeffentlich !== 'J' && werte.kuerzel) throw new HttpFehler(400, 'Private Adressen haben kein Kürzel');
  try {
    const neu = await einfuegen('dsv_adressen', {
      adr_nr: await naechsteNummer('dsv_seq_adr'),
      gueltig_ab: JETZT,
      oeffentlich: 'N',
      obsolet: 'N',
      ...werte
    });
    await protokolliere(user, 'adresse', neu.adr_nr, 'angelegt', { bezeichnung: neu.bezeichnung_1 });
    return neu;
  } catch (error) {
    throw eindeutig(error);
  }
}

async function aendernAdresse(user, id, eingabe) {
  const alt = await laden(user, id);
  const werte = await pruefe('dsv_adressen', eingabe, FELDER, { gross: ['kuerzel', 'oeffentlich', 'obsolet'] });
  pruefeRecht(user, alt.oeffentlich === 'J' || werte.oeffentlich === 'J' ? 'J' : 'N');
  if (werte.bezeichnung_1 === null) throw new HttpFehler(400, 'Bezeichnung 1 ist ein Pflichtfeld');
  const geaendert = unterschiede(alt, werte);
  if (!Object.keys(geaendert).length) return alt;
  try {
    const neu = await aendern('dsv_adressen', 'adr_nr = $1', [alt.adr_nr], Object.fromEntries(Object.keys(geaendert).map((f) => [f, werte[f]])));
    await protokolliere(user, 'adresse', alt.adr_nr, 'geaendert', geaendert);
    return neu;
  } catch (error) {
    throw eindeutig(error);
  }
}

module.exports = { liste, laden, anlegen, aendernAdresse };
