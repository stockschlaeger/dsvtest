// Wertelisten der Altanwendung (DSV_LOV_*) für Auswahlfelder
const { zeilen } = require('./db');

const LISTEN = {
  org: ['dsv_lov_org', 'org'],
  status: ['dsv_lov_status', 'status'],
  eai: ['dsv_lov_eai', 'eai'],
  klasse: ['dsv_lov_klasse', 'klasse'],
  form: ['dsv_lov_form', 'form'],
  jn: ['dsv_lov_jn', 'jn'],
  rechte: ['dsv_lov_rechte', 'recht'],
  schriftgutart: ['dsv_lov_schriftgutart', 'schriftgutart'],
  konfiguration: ['dsv_lov_konfiguration', 'konfiguration'],
  umfang: ['dsv_lov_schriftgutlapart', 'schriftgutlapart']
};

async function alle() {
  const ergebnis = {};
  for (const [schluessel, [tabelle, spalte]] of Object.entries(LISTEN)) {
    ergebnis[schluessel] = await zeilen(`SELECT ${spalte} AS code, name FROM ${tabelle} ORDER BY ${spalte}`);
  }
  return ergebnis;
}

module.exports = { alle };
