// Recherche über Akten (DSV_AKTE), Vorgänge (DSV_VORG) und Dokumente (DSV_DOKU) – nur lesbares Schriftgut
//
// Filter (alle optional, kombinierbar):
//   q            Freitext: Aktenzeichen, Betreff, Bemerkung; bei Dokumenten auch Fremdnummer, Dateiname/-pfad;
//                Stichworte (inkl. Synonyme) – bei Akten/Vorgängen über ihre Dokumente (wie DSV_AKTESTWSYNO)
//   org          Referate, kommagetrennt;  abteilung  Abteilungen (erstes Zeichen des Referats), kommagetrennt
//   aktenplan    Aktenplankennzeichen (DSV_LAP.AKTE) einschließlich Unterpositionen
//   stichwort    exaktes Stichwort einschließlich Synonyme
//   bearbeiter, status, eai, klasse
//   datumsfeld   erst_regdatum | aend_regdatum | datum_letzteverf | erstdatum (Dokumentdatum), dazu von/bis (JJJJ-MM-TT);
//                Dokumentfelder auf Akten-/Vorgangsebene: „enthält solche Dokumente“
//   adresse, gz  Einsender/Empfänger (Kürzel, Bezeichnung) und Geschäftszeichen (wie DSV_RCH.eins_empf_gz_auswerten)
// Sortierung: sortierung = aktenzeichen | betreff | org | bearbeiter | status | erst_regdatum | aend_regdatum
//             | datum_letzteverf | erstdatum, reihenfolge = auf | ab
const { zeile, zeilen, Sql, dialekt: d, likeMuster } = require('./db');
const zugriff = require('./zugriff');
const stichworte = require('./stichworte');
const { aktenzeichen } = require('./schriftgut');

const EBENEN = ['akte', 'vorgang', 'dokument'];
const TABELLE = { akte: 'dsv_akte', vorgang: 'dsv_vorg', dokument: 'dsv_doku' };
const LIMIT = 500;

const SORTIERUNG = {
  aktenzeichen: (e) => ({ akte: 'x.akte, x.org', vorgang: 'x.akte, x.org, x.vorg_nr', dokument: 'x.akte, x.org, x.vorg_nr, x.dokunr' })[e],
  betreff: () => 'x.betreff',
  org: () => 'x.org',
  bearbeiter: () => 'x.bearbeiter',
  status: () => 'x.status',
  erst_regdatum: () => 'x.erst_regdatum',
  aend_regdatum: () => 'x.aend_regdatum',
  datum_letzteverf: (e) => (e === 'akte' ? null : 'x.datum_letzteverf'),
  erstdatum: (e) => (e === 'dokument' ? 'x.erstdatum' : null)
};

const DATUMSFELDER = ['erst_regdatum', 'aend_regdatum', 'datum_letzteverf', 'erstdatum'];
const TAG = /^\d{4}-\d{2}-\d{2}$/;
const liste = (wert) => String(wert || '').split(',').map((eintrag) => eintrag.trim()).filter(Boolean);

// Dokumente, die zu einer Akte/einem Vorgang (x) gehören, mit Zusatzbedingung an d
const enthaeltDokument = (q, user, ebene, bedingung) => `EXISTS (SELECT 1 FROM dsv_doku d
  WHERE d.org = x.org AND d.akte = x.akte ${ebene === 'vorgang' ? 'AND d.vorg = x.vorg' : ''}
  AND ${zugriff.lesenDokument(q, user, 'd')} AND ${bedingung})`;

function stichwortBedingung(q, user, ebene, nummern) {
  if (!nummern.length) return d.falsch;
  const zuo = (dok) => `EXISTS (SELECT 1 FROM dsv_stwzuo z WHERE z.lfd_schrnr = ${dok}.lfd_doknr AND z.schriftgutlapart = 'D'
    AND ${q.in('z.stwnr', nummern)})`;
  return ebene === 'dokument' ? zuo('x') : enthaeltDokument(q, user, ebene, zuo('d'));
}

async function bedingungen(user, ebene, f) {
  const q = new Sql();
  const teile = [ebene === 'dokument' ? zugriff.lesenDokument(q, user, 'x') : zugriff.lesen(q, user, 'x')];

  const organisation = [];
  if (f.org.length) organisation.push(q.in('x.org', f.org));
  if (f.abteilung.length) organisation.push(q.in('SUBSTR(x.org, 1, 1)', f.abteilung));
  if (organisation.length) teile.push(`(${organisation.join(' OR ')})`);

  if (f.aktenplan) {
    const lap = await zeile('SELECT hgruppe, gruppe, ugruppe, tglieder FROM dsv_lap WHERE akte = $1', [f.aktenplan]);
    if (!lap) teile.push(d.falsch);
    else {
      teile.push(`x.hgruppe = ${q.p(lap.hgruppe)}`);
      for (const ebeneAp of ['gruppe', 'ugruppe', 'tglieder']) if (lap[ebeneAp] !== null) teile.push(`x.${ebeneAp} = ${q.p(lap[ebeneAp])}`);
    }
  }

  if (f.q) {
    const muster = q.p(likeMuster(f.q));
    const azAusdruck = { akte: `x.org || '-' || x.akte`, vorgang: `x.org || '-' || x.akte || '/' || x.vorg`, dokument: `x.org || '-' || x.akte || '/' || x.vorg || '/' || x.dokunr` }[ebene];
    const text = [d.ilike(azAusdruck, muster), d.ilike('x.betreff', muster), d.ilike('x.bemerkung', muster)];
    if (ebene === 'dokument') text.push(d.ilike('x.fremdnr', muster), d.ilike('x.dateiname', muster), d.ilike('x.dateipfad', muster));
    text.push(stichwortBedingung(q, user, ebene, await stichworte.nummernFuerText(f.q)));
    teile.push(`(${text.join(' OR ')})`);
  }
  if (f.stichwort) teile.push(stichwortBedingung(q, user, ebene, await stichworte.nummernFuerBegriff(f.stichwort)));
  if (f.bearbeiter) teile.push(`upper(x.bearbeiter) = upper(${q.p(f.bearbeiter)})`);
  if (f.status) teile.push(`x.status = ${q.p(f.status)}`);

  // Dokumentbezogene Filter
  const dok = [];
  if (f.eai) dok.push((dk) => `${dk}.eai_kennung = ${q.p(f.eai)}`);
  if (f.klasse) dok.push((dk) => `${dk}.klasse = ${q.p(f.klasse)}`);
  if (f.adresse || f.gz) {
    dok.push((dk) => {
      const adr = [];
      if (f.adresse) {
        const muster = q.p(likeMuster(f.adresse));
        const bezeichnung = `COALESCE(a.bezeichnung_1, '') || ' ' || COALESCE(a.bezeichnung_2, '') || ' ' || COALESCE(a.bezeichnung_3, '')`;
        adr.push(`(${d.ilike('a.kuerzel', muster)} OR ${d.ilike(bezeichnung, muster)})`);
      }
      if (f.gz) adr.push(d.ilike('z.eins_gz', q.p(likeMuster(f.gz))));
      return `EXISTS (SELECT 1 FROM dsv_doku_adr z JOIN dsv_adressen a ON a.adr_nr = z.adr_nr WHERE z.lfd_doknr = ${dk}.lfd_doknr AND ${adr.join(' AND ')})`;
    });
  }

  // Zeitraum
  if (f.von || f.bis) {
    const bereich = (spalte) => [f.von && `${d.tag(spalte)} >= ${d.datum(q.p(f.von))}`, f.bis && `${d.tag(spalte)} <= ${d.datum(q.p(f.bis))}`].filter(Boolean).join(' AND ');
    if (f.datumsfeld === 'erstdatum' && ebene !== 'dokument') dok.push((dk) => bereich(`${dk}.erstdatum`));
    else if (f.datumsfeld === 'datum_letzteverf' && ebene === 'akte') teile.push(`EXISTS (SELECT 1 FROM dsv_vorg v WHERE v.org = x.org AND v.akte = x.akte AND ${bereich('v.datum_letzteverf')})`);
    else teile.push(bereich(`x.${f.datumsfeld}`));
  }

  if (dok.length) {
    teile.push(ebene === 'dokument' ? dok.map((b) => b('x')).join(' AND ') : enthaeltDokument(q, user, ebene, dok.map((b) => b('d')).join(' AND ')));
  }
  return { sql: teile.join(' AND '), werte: q.werte };
}

function leseFilter(abfrage) {
  const text = (name) => (typeof abfrage[name] === 'string' ? abfrage[name].trim() : '');
  return {
    q: text('q'),
    org: liste(abfrage.org),
    abteilung: liste(abfrage.abteilung),
    aktenplan: text('aktenplan'),
    stichwort: text('stichwort'),
    bearbeiter: text('bearbeiter'),
    status: text('status'),
    eai: text('eai'),
    klasse: text('klasse'),
    adresse: text('adresse'),
    gz: text('gz'),
    von: TAG.test(text('von')) ? text('von') : '',
    bis: TAG.test(text('bis')) ? text('bis') : '',
    datumsfeld: DATUMSFELDER.includes(abfrage.datumsfeld) ? abfrage.datumsfeld : 'erst_regdatum'
  };
}

async function recherche(user, abfrage) {
  const filter = leseFilter(abfrage);
  const ebene = EBENEN.includes(abfrage.ebene) ? abfrage.ebene : 'akte';
  const sortierung = Object.hasOwn(SORTIERUNG, abfrage.sortierung) && SORTIERUNG[abfrage.sortierung](ebene) ? abfrage.sortierung : 'aktenzeichen';
  const reihenfolge = abfrage.reihenfolge === 'ab' ? 'ab' : 'auf';

  const anzahl = {};
  let treffer = [];
  for (const aktuelle of EBENEN) {
    const { sql, werte } = await bedingungen(user, aktuelle, filter);
    anzahl[aktuelle] = (await zeile(`SELECT COUNT(*) AS anzahl FROM ${TABELLE[aktuelle]} x WHERE ${sql}`, werte)).anzahl;
    if (aktuelle !== ebene) continue;
    const richtung = reihenfolge === 'ab' ? 'DESC' : 'ASC';
    const ordnung = SORTIERUNG[sortierung](aktuelle).split(', ').map((spalte) => `${spalte} ${richtung} NULLS LAST`).join(', ');
    treffer = (await zeilen(`
      SELECT x.*, o.name AS org_name FROM ${TABELLE[aktuelle]} x LEFT JOIN dsv_lov_org o ON o.org = x.org
      WHERE ${sql} ORDER BY ${ordnung}, x.org, x.akte FETCH FIRST ${LIMIT} ROWS ONLY
    `, werte)).map((t) => ({
      ...t,
      id: t[{ akte: 'lfd_aktenr', vorgang: 'lfd_vorgnr', dokument: 'lfd_doknr' }[aktuelle]],
      aktenzeichen: aktenzeichen(aktuelle, t)
    }));
  }
  return { ebene, filter, sortierung, reihenfolge, anzahl, treffer, begrenzt: anzahl[ebene] > LIMIT };
}

module.exports = { recherche };
