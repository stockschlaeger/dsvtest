// Wiedervorlagen = Anforderungen der Altanwendung (DSV_ANFORDERUNGEN, Handbuch 5.7/5.8)
// UMFANG A/V/D mit LFD_SCHRNR = lfd. Nummer von Akte/Vorgang/Dokument; Schlüssel (LFD_SCHRNR, WV_DATUM).
// Sichtbar wie in DSV_ANFORDERUNGEN_: nur für Schriftgut, das der Benutzer lesen darf.
// Anlegen/Erledigen: Registratur und Sachbearbeitung mit Schreibrecht. Bereitstellen (Registratur): Ausleihe in den
// Geschäftsgang an den Empfänger, die Anforderung ist damit erledigt. Erledigt = Anforderung ausgetragen.
const { zeile, zeilen, transaktion, Sql, dialekt: d } = require('./db');
const zugriff = require('./zugriff');
const schriftgut = require('./schriftgut');
const config = require('./config');
const { stempel } = require('./benutzer');
const { pruefe } = require('./pruefung');
const { protokolliere } = require('./protokoll');
const { JETZT, einfuegen, aendern } = require('./tabellen');
const { HttpFehler } = require('./fehler');

const UMFANG = { A: 'akte', V: 'vorgang', D: 'dokument' };
const FELDER = ['wv_datum', 'bearbeiter', 'bemerkung', 'feste_wv'];

function auswahl(q, user) {
  return {
    von: `dsv_anforderungen w
      LEFT JOIN dsv_akte ak ON w.umfang = 'A' AND ak.lfd_aktenr = w.lfd_schrnr
      LEFT JOIN dsv_vorg vo ON w.umfang = 'V' AND vo.lfd_vorgnr = w.lfd_schrnr
      LEFT JOIN dsv_doku dk ON w.umfang = 'D' AND dk.lfd_doknr = w.lfd_schrnr`,
    lesbar: `((ak.lfd_aktenr IS NOT NULL AND ${zugriff.lesen(q, user, 'ak')})
      OR (vo.lfd_vorgnr IS NOT NULL AND ${zugriff.lesen(q, user, 'vo')})
      OR (dk.lfd_doknr IS NOT NULL AND ${zugriff.lesenDokument(q, user, 'dk')}))`
  };
}

// An mich: an meine Kennung oder an Personen, die ich vertrete
const anMich = (q, user) =>
  `(w.bearbeiter = ${q.p(user.userId)} OR w.bearbeiter IN (SELECT registrator FROM dsv_vertretung WHERE vertreter = ${q.p(user.userId)}))`;

function aufbereiten(w) {
  const typ = UMFANG[w.umfang];
  const az = typ === 'akte' ? `${w.org}-${w.akte}` : typ === 'vorgang' ? `${w.org}-${w.akte}/${w.vorg}` : `${w.org}-${w.akte}/${w.vorg}/${w.dokunr}`;
  return { ...w, typ, aktenzeichen: az, schluessel: `${w.lfd_schrnr}|${w.wv_datum}`, faellig: w.wv_datum.slice(0, 10) <= new Date().toLocaleDateString('sv-SE') };
}

// ansicht: meine | erstellt (von mir angelegt) | alle (alle lesbaren)
async function liste(user, { ansicht = 'meine', umfang, id } = {}) {
  const q = new Sql();
  const { von, lesbar } = auswahl(q, user);
  const bedingungen = [lesbar];
  if (ansicht === 'meine') bedingungen.push(anMich(q, user));
  if (ansicht === 'erstellt') bedingungen.push(`w.registrator = ${q.p(user.userId)}`);
  if (umfang && id) bedingungen.push(`w.umfang = ${q.p(umfang)} AND w.lfd_schrnr = ${q.p(Number(id))}`);
  const rows = await zeilen(`
    SELECT w.*, COALESCE(ak.betreff, vo.betreff, dk.betreff) AS betreff
    FROM ${von} WHERE ${bedingungen.join(' AND ')}
    ORDER BY w.wv_datum, w.lfd_schrnr FETCH FIRST 1000 ROWS ONLY
  `, q.werte);
  return rows.map(aufbereiten);
}

async function anzahlFaellig(user) {
  const q = new Sql();
  const { von, lesbar } = auswahl(q, user);
  const { anzahl } = await zeile(`SELECT COUNT(*) AS anzahl FROM ${von} WHERE ${lesbar} AND ${anMich(q, user)} AND w.wv_datum < ${d.heute} + 1`, q.werte);
  return anzahl;
}

async function pruefeBearbeiter(kennung) {
  if (!(await zeile('SELECT 1 FROM dsv_benutzerprofil WHERE user_id = $1', [kennung]))) throw new HttpFehler(400, `Unbekannte Kennung ${kennung}`);
}

async function anlegen(user, eingabe) {
  const typ = UMFANG[eingabe?.umfang];
  if (!typ) throw new HttpFehler(400, 'Umfang muss A, V oder D sein');
  const objekt = await schriftgut.mitRecht(user, typ, eingabe.id, 'wiedervorlage');
  const werte = await pruefe('dsv_anforderungen', eingabe, FELDER, { pflicht: ['wv_datum'], gross: ['bearbeiter', 'feste_wv'] });
  werte.bearbeiter = werte.bearbeiter || user.handelnAls;
  await pruefeBearbeiter(werte.bearbeiter);
  // Bei Dokumenten mit Zugriffsschutz wird „X“ vorangestellt, damit die Registratur vor dem Ausführen prüft
  if (typ === 'dokument' && objekt.geheim === 'J' && !String(werte.bemerkung || '').startsWith('X')) {
    werte.bemerkung = `X ${werte.bemerkung || ''}`.trim();
  }
  const { registrator, vertreter } = stempel(user);

  const schluessel = { akte: 'lfd_aktenr', vorgang: 'lfd_vorgnr', dokument: 'lfd_doknr' }[typ];
  try {
    const neu = await einfuegen('dsv_anforderungen', {
      lfd_schrnr: objekt[schluessel],
      umfang: eingabe.umfang,
      org: objekt.org, akte: objekt.akte, hgruppe: objekt.hgruppe, gruppe: objekt.gruppe, ugruppe: objekt.ugruppe, tglieder: objekt.tglieder,
      vorg: typ === 'akte' ? null : objekt.vorg,
      vorg_nr: typ === 'akte' ? null : objekt.vorg_nr,
      dokunr: typ === 'dokument' ? objekt.dokunr : null,
      feste_wv: 'N',
      ...werte,
      anf_datum: JETZT,
      registrator,
      reg_vertreter: vertreter,
      erst_regdatum: JETZT
    });
    await protokolliere(user, typ, objekt[schluessel], 'wiedervorlage', { wv_datum: neu.wv_datum, bearbeiter: neu.bearbeiter });
    return aufbereiten(neu);
  } catch (error) {
    if (error.code === '23505') throw new HttpFehler(409, 'Für dieses Schriftgut gibt es an diesem Datum bereits eine Wiedervorlage');
    throw error;
  }
}

// Ändern und Erledigen: Registratur oder Sachbearbeitung mit Schreibrecht auf das Schriftgut
async function zumBearbeiten(user, schrnr, datum, recht = 'wiedervorlage') {
  const q = new Sql();
  const { von, lesbar } = auswahl(q, user);
  const w = await zeile(`
    SELECT w.* FROM ${von}
    WHERE w.lfd_schrnr = ${q.p(Number(schrnr))} AND w.wv_datum = ${d.zeitpunkt(q.p(datum))} AND ${lesbar}
  `, q.werte);
  if (!w) throw new HttpFehler(404, 'Wiedervorlage nicht gefunden');
  const objekt = await schriftgut.mitRecht(user, UMFANG[w.umfang], w.lfd_schrnr, recht);
  return { ...w, objekt };
}

async function aendernWv(user, schrnr, datum, eingabe) {
  const alt = await zumBearbeiten(user, schrnr, datum);
  const werte = await pruefe('dsv_anforderungen', eingabe, FELDER, { gross: ['bearbeiter', 'feste_wv'] });
  if (werte.wv_datum === null || werte.bearbeiter === null) throw new HttpFehler(400, 'Datum und Empfänger sind Pflichtfelder');
  if (werte.bearbeiter) await pruefeBearbeiter(werte.bearbeiter);
  try {
    const neu = await aendern('dsv_anforderungen', `lfd_schrnr = $1 AND wv_datum = ${d.zeitpunkt('$2')}`, [alt.lfd_schrnr, alt.wv_datum], werte);
    await protokolliere(user, UMFANG[alt.umfang], alt.lfd_schrnr, 'wiedervorlage_geaendert', { von: alt.wv_datum, nach: neu?.wv_datum });
  } catch (error) {
    if (error.code === '23505') throw new HttpFehler(409, 'An diesem Datum gibt es bereits eine Wiedervorlage');
    throw error;
  }
}

async function erledigen(user, schrnr, datum) {
  const w = await zumBearbeiten(user, schrnr, datum);
  await transaktion(async () => {
    await zeile(`DELETE FROM dsv_anforderungen WHERE lfd_schrnr = $1 AND wv_datum = ${d.zeitpunkt('$2')}`, [w.lfd_schrnr, w.wv_datum]);
    await protokolliere(user, UMFANG[w.umfang], w.lfd_schrnr, 'wiedervorlage_erledigt', { wv_datum: w.wv_datum, bearbeiter: w.bearbeiter, bemerkung: w.bemerkung });
  });
}

// Bereitstellen (Handbuch 5.8, Marke J): Ausleihe des Schriftguts an den Empfänger – Status Geschäftsgang,
// Bearbeiter = Empfänger, Datum letzte Verfügung; höchstens eine Ausleihe. Die Anforderung ist damit erledigt.
async function bereitstellen(user, schrnr, datum) {
  const w = await zumBearbeiten(user, schrnr, datum, 'bearbeiten');
  const typ = UMFANG[w.umfang];
  const { objekt } = w;
  if (objekt.status === config.status.geschaeftsgang && objekt.bearbeiter) {
    throw new HttpFehler(409, `${objekt.aktenzeichen} ist bereits im Geschäftsgang bei ${objekt.bearbeiter}`);
  }
  const tabelle = { akte: 'dsv_akte', vorgang: 'dsv_vorg', dokument: 'dsv_doku' }[typ];
  const { registrator, vertreter } = stempel(user);
  await transaktion(async () => {
    await aendern(tabelle, `${schriftgut.SCHLUESSEL[typ]} = $1`, [w.lfd_schrnr], {
      status: config.status.geschaeftsgang,
      bearbeiter: w.bearbeiter,
      ...(typ === 'akte' ? {} : { datum_letzteverf: JETZT }),
      aend_registrator: registrator,
      aend_reg_vertreter: vertreter,
      aend_regdatum: JETZT
    });
    await zeile(`DELETE FROM dsv_anforderungen WHERE lfd_schrnr = $1 AND wv_datum = ${d.zeitpunkt('$2')}`, [w.lfd_schrnr, w.wv_datum]);
    await protokolliere(user, typ, w.lfd_schrnr, 'bereitgestellt', { wv_datum: w.wv_datum, bearbeiter: w.bearbeiter, bemerkung: w.bemerkung });
  });
}

module.exports = { liste, anzahlFaellig, anlegen, aendernWv, erledigen, bereitstellen };
