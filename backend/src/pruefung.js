// Prüfung von Eingaben gegen die Spalten der Alttabellen (Längen und Typen aus information_schema)
const { spaltenInfo } = require('./db');
const { HttpFehler } = require('./fehler');

// Großschreibung wie Oracle UPPER in einer ISO-8859-Datenbank: einfache Zuordnung je Zeichen; „ß“ bleibt „ß“ statt „SS“,
// „µ“/„ÿ“ bleiben (Großform nicht in ISO-8859-1). Sonst würden Altdaten wie „MAßNAHME“ nicht mehr gefunden.
const grossWieOracle = (text) =>
  Array.from(String(text), (z) => {
    const g = z.toUpperCase();
    return g.length === 1 && !(z <= '\u00ff' && g > '\u00ff') ? g : z;
  }).join('');

// Anzeigenamen der Spalten für Fehlermeldungen und Protokoll
const FELDNAMEN = {
  org: 'Referat', akte: 'Aktenplankennzeichen', vorg: 'Vorgang', dokunr: 'Dokumentnummer',
  betreff: 'Betreff', bemerkung: 'Bemerkung', status: 'Status', bearbeiter: 'Bearbeiter', autor: 'Autor',
  eai_kennung: 'Eingang/Ausgang/Intern', klasse: 'Klasse', form_pe: 'Form', form: 'Formular',
  erstdatum: 'Dokumentdatum', ende_aufbfrist: 'Ende Aufbewahrungsfrist', datum_letzteverf: 'Letzte Verfügung',
  dateiname: 'Dateiname', dateipfad: 'Dateipfad', fremdnr: 'Fremdnummer', geheim: 'Geheim', orig_vern: 'Original vernichtet',
  vorschl_beh: 'Vorschlag Behörde', entsch_archiv: 'Entscheidung Archiv',
  kuerzel: 'Kürzel', bezeichnung_1: 'Bezeichnung 1', bezeichnung_2: 'Bezeichnung 2', bezeichnung_3: 'Bezeichnung 3',
  anrede: 'Anrede', strasse: 'Straße', hausnummer: 'Hausnummer', plz: 'PLZ', ort: 'Ort', land: 'Land',
  telnr: 'Telefon', gebdatum: 'Geburtsdatum', oeffentlich: 'Öffentlich', obsolet: 'Obsolet', gueltig_ab: 'Gültig ab',
  wv_datum: 'Wiedervorlage am', feste_wv: 'Feste Wiedervorlage', eingdatum: 'Eingangsdatum', eins_gz: 'Geschäftszeichen',
  user_id: 'Altkennung', kennung: 'Kennung', voreinst_org: 'Voreingestelltes Referat', konfiguration: 'Konfiguration',
  ben_eai: 'Vorbelegung E/A/I', ben_klasse: 'Vorbelegung Klasse', ben_umfang: 'Vorbelegung Umfang',
  hgruppe: 'Hauptgruppe', gruppe: 'Gruppe', ugruppe: 'Untergruppe', tglieder: 'Teilgliederung', recht: 'Recht',
  registrator: 'Vertretene Person', vertreter: 'Vertreter', stichwort: 'Stichwort'
};

const name = (feld) => FELDNAMEN[feld] || feld;
const DATUM = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?)?$/;

// Liefert die übergebenen Felder geprüft zurück; '' wird zu NULL. optionen.gross: Felder in Großbuchstaben
async function pruefe(tabelle, eingabe, felder, { pflicht = [], gross = [] } = {}) {
  if (typeof eingabe !== 'object' || eingabe === null || Array.isArray(eingabe)) {
    throw new HttpFehler(400, 'Objekt mit Angaben erwartet');
  }
  const spalten = (await spaltenInfo()).get(tabelle);
  const werte = {};
  for (const feld of felder) {
    let wert = eingabe[feld];
    if (wert === undefined) continue;
    const spalte = spalten.get(feld);
    if (wert === null || wert === '') {
      werte[feld] = null;
      continue;
    }
    if (spalte.typ.startsWith('character')) {
      if (typeof wert !== 'string' && typeof wert !== 'number') throw new HttpFehler(400, `${name(feld)}: Text erwartet`);
      wert = String(wert).trim();
      if (gross.includes(feld)) wert = grossWieOracle(wert);
      if (spalte.max && wert.length > spalte.max) throw new HttpFehler(400, `${name(feld)}: höchstens ${spalte.max} Zeichen`);
      werte[feld] = wert || null;
    } else if (spalte.typ.startsWith('timestamp') || spalte.typ === 'date') {
      if (typeof wert !== 'string' || !DATUM.test(wert)) throw new HttpFehler(400, `${name(feld)}: Datum im Format JJJJ-MM-TT erwartet`);
      // immer vollständig 'JJJJ-MM-TTThh:mm:ss' – so wandeln PostgreSQL und Oracle (NLS_DATE_FORMAT der Sitzung) gleich um
      werte[feld] = `${wert.slice(0, 10)}T${(wert.slice(11) || '00:00:00').padEnd(8, ':00').slice(0, 8)}`;
    } else {
      const zahl = Number(wert);
      if (!Number.isFinite(zahl)) throw new HttpFehler(400, `${name(feld)}: Zahl erwartet`);
      werte[feld] = zahl;
    }
  }
  for (const feld of pflicht) {
    if (werte[feld] === null || (werte[feld] === undefined && eingabe[feld] === undefined)) {
      throw new HttpFehler(400, `${name(feld)} ist ein Pflichtfeld`);
    }
  }
  return werte;
}

module.exports = { pruefe, name, FELDNAMEN, grossWieOracle };
