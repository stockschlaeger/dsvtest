// Nacharbeit für ein Schema, das ora2pg selbst angelegt hat (statt db/altschema.sql):
//   1. Prüfregeln mit upper() (Stichwort, Stoppwort, Vorgang, Teilgliederung) mit COLLATE pg_c_utf8, damit „ß“ wie bei
//      Oracle UPPER unverändert bleibt. Mit der Standard-Locale macht PostgreSQL daraus „ẞ“, und Stichworte wie „MAßNAHME“
//      verletzen die Regel. pg_c_utf8 gibt es ab PostgreSQL 17; eine neue Datenbank ist dafür nicht nötig.
//   2. Schlüssel, Prüfregeln und eindeutige Indizes aus db/altschema.sql, die fehlen oder abweichen
//      (u. a. der eindeutige Index PKVORG und UNIQUE NULLS NOT DISTINCT für UQGVP/UQLAPAKTE2).
//   3. Sequenzen, die hinter den vergebenen Nummern liegen, auf die nächste freie Nummer setzen.
// Ohne Argument wird nur angezeigt, was zu tun wäre:   npm run db:nach-ora2pg
// Ausführen (in einer Transaktion, alles oder nichts):  npm run db:nach-ora2pg -- --ausfuehren
const fs = require('fs');
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const config = require('../src/config');
const { query, zeile, zeilen, transaktion, beenden } = require('../src/db');

const ausfuehren = process.argv.includes('--ausfuehren');
const schema = config.datenbank.schema;

// upper(x) → upper((x) COLLATE pg_c_utf8); x darf eine Klammerebene enthalten, z. B. (stichwort)::text
const mitKollation = (def) => def.replace(/upper\(((?:[^()]|\([^()]*\))*)\)/gi, (treffer, inhalt) =>
  (/pg_c_utf8/.test(inhalt) ? treffer : `upper((${inhalt}) COLLATE pg_c_utf8)`));

// Sollzustand aus altschema.sql: ALTER TABLE … ADD CONSTRAINT … und CREATE UNIQUE INDEX …
function sollAusAltschema() {
  const text = fs.readFileSync(path.join(__dirname, '..', 'db', 'altschema.sql'), 'utf8')
    .split('\n').filter((z) => !z.trim().startsWith('--')).join('\n');
  const soll = [];
  for (const m of text.matchAll(/ALTER TABLE (\w+) ADD CONSTRAINT (\w+) ([^;]+);/g)) {
    soll.push({ art: 'constraint', tabelle: m[1], name: m[2], def: m[3].trim().replace(/\s+/g, ' ') });
  }
  for (const m of text.matchAll(/CREATE UNIQUE INDEX (\w+) ON (\w+) \(([^)]*)\);/g)) {
    soll.push({ art: 'index', tabelle: m[2], name: m[1], def: `(${m[3]})` });
  }
  return soll;
}

const SEQUENZEN = {
  dsv_seq_akte: ['dsv_akte', 'lfd_aktenr'],
  dsv_seq_vorg: ['dsv_vorg', 'lfd_vorgnr'],
  dsv_seq_doku: ['dsv_doku', 'lfd_doknr'],
  dsv_seq_adr: ['dsv_adressen', 'adr_nr'],
  dsv_seq_stwt: ['dsv_stichworte', 'stwnr'],
  dsv_seq_lap: ['dsv_lap', 'lfd_apnr']
};

async function plan() {
  const schritte = [];
  const { version } = await zeile(`SELECT current_setting('server_version_num')::int AS version`);
  const { passt } = await zeile(`SELECT upper('ß') = 'ß' AS passt`);
  if (!passt && version < 170000) {
    throw new Error('upper() macht hier aus „ß“ ein „ẞ“, und COLLATE pg_c_utf8 gibt es erst ab PostgreSQL 17 – '
      + 'Datenbank mit LOCALE_PROVIDER builtin, BUILTIN_LOCALE \'C.UTF-8\' neu anlegen und Daten neu laden');
  }
  const umschreiben = (def) => (passt ? def : mitKollation(def));

  const vorhanden = new Map((await zeilen(`
    SELECT c.conname AS name, c.conrelid::regclass::text AS tabelle, pg_get_constraintdef(c.oid) AS def, c.contype AS typ
    FROM pg_constraint c WHERE c.connamespace = $1::regnamespace`, [schema])).map((c) => [c.name, c]));
  const indizes = new Set((await zeilen('SELECT indexname FROM pg_indexes WHERE schemaname = $1', [schema])).map((i) => i.indexname));

  for (const s of sollAusAltschema()) {
    if (s.art === 'index') {
      if (!indizes.has(s.name)) schritte.push({ text: `Index ${s.name} auf ${s.tabelle} ${s.def} anlegen`, sql: `CREATE UNIQUE INDEX ${s.name} ON ${s.tabelle} ${s.def}` });
      continue;
    }
    const ist = vorhanden.get(s.name);
    const soll = umschreiben(s.def);
    const anlegen = `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${soll}`;
    if (!ist) {
      schritte.push({ text: `${s.name} auf ${s.tabelle} fehlt – anlegen: ${soll}`, sql: anlegen });
    } else if (!passt && /upper\(/i.test(ist.def) && !/pg_c_utf8/.test(ist.def)) {
      schritte.push({ text: `${s.name} (${s.tabelle}): upper() mit COLLATE pg_c_utf8`, sql: [`ALTER TABLE ${s.tabelle} DROP CONSTRAINT ${s.name}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${mitKollation(ist.def)}`] });
    } else if (/NULLS NOT DISTINCT/.test(s.def) && !/NULLS NOT DISTINCT/.test(ist.def)) {
      schritte.push({ text: `${s.name} (${s.tabelle}): UNIQUE NULLS NOT DISTINCT wie in Oracle`, sql: [`ALTER TABLE ${s.tabelle} DROP CONSTRAINT ${s.name}`, anlegen] });
    }
  }

  for (const [sequenz, [tabelle, spalte]] of Object.entries(SEQUENZEN)) {
    const seq = await zeile('SELECT increment_by FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2', [schema, sequenz]);
    if (!seq) {
      schritte.push({ text: `Sequenz ${sequenz} fehlt – bitte mit ora2pg (TYPE SEQUENCE) übernehmen`, sql: null });
      continue;
    }
    const { kleinste, groesste } = await zeile(`SELECT MIN(${spalte}) AS kleinste, MAX(${spalte}) AS groesste FROM ${tabelle}`);
    const steigend = seq.increment_by > 0;
    const grenze = steigend ? groesste : kleinste;
    if (grenze === null || grenze === undefined) continue;
    // nächste Nummer, die die Sequenz vergeben würde
    const { last_value: letzte, is_called: benutzt } = await zeile(`SELECT last_value, is_called FROM ${schema}.${sequenz}`);
    const kommt = benutzt ? letzte + seq.increment_by : letzte;
    if (steigend ? kommt <= grenze : kommt >= grenze) {
      const naechste = steigend ? grenze + 1 : grenze - 1;
      schritte.push({ text: `Sequenz ${sequenz} vergäbe ${kommt}, vergeben bis ${grenze} → nächste Nummer ${naechste}`, sql: `SELECT setval('${sequenz}', ${naechste}, false)` });
    }
  }
  return schritte;
}

(async () => {
  if (config.datenbank.typ !== 'postgres') throw new Error('Nur für PostgreSQL – in backend/.env DB_CONNECT_STRING entfernen und DATABASE_URL setzen');
  const schritte = await plan();
  if (!schritte.length) {
    console.log(`Schema „${schema}“ entspricht altschema.sql, Sequenzen passen – nichts zu tun.`);
    return;
  }
  console.log(`${ausfuehren ? 'Ausführen' : 'Zu tun (nur Anzeige, ausführen mit -- --ausfuehren)'} im Schema „${schema}“:`);
  for (const s of schritte) console.log(`  · ${s.text}`);
  if (!ausfuehren) return;
  await transaktion(async () => {
    for (const s of schritte) {
      for (const sql of [].concat(s.sql || [])) {
        try {
          await query(sql);
        } catch (error) {
          throw new Error(`${s.text}\n    ${error.message}${error.detail ? `\n    ${error.detail}` : ''}\n  Nichts wurde geändert – betroffene Daten bereinigen und erneut starten.`);
        }
      }
    }
  });
  console.log('Fertig.');
})()
  .catch((error) => {
    console.error('Fehler:', error.message);
    process.exitCode = 1;
  })
  .finally(() => beenden());
