// Felder von Akte (DSV_AKTE), Vorgang (DSV_VORG) und Dokument (DSV_DOKU) der Altanwendung
export const AV = { A: 'Archivieren', V: 'Vernichten' };

// typ: text | textarea | date | lov (Werteliste) | kennung (Altkennung) | jn (J/N) | select (feste Optionen)
export const FELDER = {
  org: { label: 'Referat', typ: 'lov', lov: 'org', pflicht: true, nurNeu: true },
  vorg: { label: 'Vorgangskennung', typ: 'text', nurNeu: true, hilfe: 'Leer lassen für die nächste laufende Nummer' },
  betreff: { label: 'Betreff', typ: 'textarea' },
  bemerkung: { label: 'Bemerkung', typ: 'textarea' },
  status: { label: 'Status', typ: 'lov', lov: 'status', pflicht: true },
  bearbeiter: { label: 'Im Geschäftsgang bei', typ: 'kennung', hilfe: 'Kennung eintragen = ausleihen (Status Geschäftsgang), leeren = Rückgabe' },
  autor: { label: 'Autor', typ: 'kennung' },
  eai_kennung: { label: 'Eingang / Ausgang / Intern', typ: 'lov', lov: 'eai', pflicht: true },
  klasse: { label: 'Dokumentenklasse', typ: 'lov', lov: 'klasse' },
  form_pe: { label: 'Form (Papier/elektronisch)', typ: 'lov', lov: 'form' },
  erstdatum: { label: 'Dokumentdatum', typ: 'date' },
  ende_aufbfrist: { label: 'Ende Aufbewahrungsfrist', typ: 'date' },
  fremdnr: { label: 'Fremdnummer', typ: 'text' },
  dateipfad: { label: 'Dateipfad', typ: 'text', hilfe: 'Ablageort der Datei, z. B. \\\\server\\freigabe\\ordner oder https://…' },
  dateiname: { label: 'Dateiname', typ: 'text' },
  geheim: { label: 'Geheim', typ: 'jn', hilfe: 'Nur Registratur, Datenschutz und berechtigte Sachbearbeiter sehen das Dokument' },
  orig_vern: { label: 'Original vernichtet', typ: 'jn' },
  vorschl_beh: { label: 'Vorschlag Behörde', typ: 'select', optionen: AV },
  entsch_archiv: { label: 'Entscheidung Archiv', typ: 'select', optionen: AV }
};

export const TYPEN = {
  akte: { label: 'Akte', api: 'akten', pfad: '/akten', felder: ['org', 'betreff', 'bemerkung', 'status', 'bearbeiter'] },
  vorgang: { label: 'Vorgang', api: 'vorgaenge', pfad: '/vorgaenge', felder: ['vorg', 'betreff', 'bemerkung', 'status', 'bearbeiter', 'vorschl_beh', 'entsch_archiv'] },
  dokument: {
    label: 'Dokument',
    api: 'dokumente',
    pfad: '/dokumente',
    felder: ['betreff', 'eai_kennung', 'status', 'klasse', 'erstdatum', 'autor', 'bearbeiter', 'form_pe', 'fremdnr', 'dateipfad', 'dateiname',
      'bemerkung', 'ende_aufbfrist', 'geheim', 'orig_vern']
  }
};

export const UMFANG = { A: 'akte', V: 'vorgang', D: 'dokument' };
export const objektPfad = (typ, id) => `${TYPEN[typ].pfad}/${id}`;

// Weitere Feldnamen, die im Protokoll auftauchen
const WEITERE = {
  stichworte: 'Stichworte',
  adressen: 'Einsender/Empfänger',
  berechtigte: 'Berechtigte Sachbearbeiter',
  user_id: 'Altkennung',
  gesperrt: 'Gesperrt',
  kennung: 'Kennung',
  voreinst_org: 'Voreingestelltes Referat',
  klasse_reg: 'Registratur',
  klasse_sb: 'Sachbearbeitung',
  klasse_ns: 'Nur Lesen',
  klasse_sy: 'Systemverwaltung',
  klasse_st: 'Stammdatenverwaltung',
  klasse_ds: 'Datenschutz',
  bezeichnung_1: 'Bezeichnung',
  kuerzel: 'Kürzel'
};

export const feldLabel = (name) => FELDER[name]?.label || WEITERE[name] || name;
