// Nacharbeit für ein Schema, das ora2pg selbst angelegt hat (statt db/altschema.sql). Sollzustand ist altschema.sql:
//   1. Sequenzen, die fehlen, mit Startwert aus dem Oracle-Export anlegen; Sequenzen hinter den vergebenen Nummern
//      auf die nächste freie Nummer setzen.
//   2. Primär- und Unique-Schlüssel: erkannt an Tabelle und Spalten, nicht am Namen (ora2pg vergibt die Namen ohne
//      KEEP_PKEY_NAMES neu, z. B. dsv_akte_pkey statt PKAKTE). Gibt es nur einen eindeutigen Index, wird er als Schlüssel
//      übernommen (USING INDEX), sonst wird der Schlüssel angelegt. UQGVP/UQLAPAKTE2 mit NULLS NOT DISTINCT wie in Oracle.
//   3. Fehlende Indizes, Fremdschlüssel und Prüfregeln anlegen.
//   4. Prüfregeln mit upper() mit COLLATE pg_c_utf8 (ab PostgreSQL 17), damit „ß“ wie bei Oracle UPPER unverändert
//      bleibt – mit der Standard-Locale macht PostgreSQL daraus „ẞ“.
// Ohne Argument wird nur angezeigt, was zu tun wäre:   npm run db:nach-ora2pg
// Ausführen:                                           npm run db:nach-ora2pg -- --ausfuehren
// Jeder Schritt läuft einzeln (Sicherungspunkt): scheitert einer, z. B. an doppelten Daten, wird er mit Grund gemeldet,
// die übrigen werden trotzdem ausgeführt. Nach dem Bereinigen der Daten einfach erneut starten.
const fs = require('fs');
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const config = require('../src/config');
const { query, zeile, zeilen, transaktion, beenden } = require('../src/db');

// Fehlermeldung auch für Verbindungsfehler ohne Text (z. B. ECONNREFUSED als AggregateError)
const fehlerText = (error) => [error.message, error.code, ...(error.errors || []).map((e) => `${e.code || ''} ${e.address || ''}:${e.port || ''} ${e.message || ''}`.trim())]
  .filter(Boolean).join(' | ') || String(error);

const ausfuehren = process.argv.includes('--ausfuehren');
const schema = config.datenbank.schema;

// upper(x) → upper((x) COLLATE pg_c_utf8); x darf eine Klammerebene enthalten, z. B. (stichwort)::text
const mitKollation = (def) => def.replace(/upper\(((?:[^()]|\([^()]*\))*)\)/gi, (treffer, inhalt) =>
  (/pg_c_utf8/.test(inhalt) ? treffer : `upper((${inhalt}) COLLATE pg_c_utf8)`));

const spaltenListe = (text) => text.split(',').map((s) => s.trim().replace(/"/g, '').toLowerCase()).join(',');

// Sollzustand aus altschema.sql
function sollAusAltschema() {
  const text = fs.readFileSync(path.join(__dirname, '..', 'db', 'altschema.sql'), 'utf8')
    .split('\n').filter((z) => !z.trim().startsWith('--')).join('\n');
  const soll = { sequenzen: [], schluessel: [], fremd: [], pruef: [], indizes: [] };
  for (const m of text.matchAll(/CREATE SEQUENCE (\w+)([^;]*);/g)) {
    soll.sequenzen.push({ name: m[1], sql: m[0].slice(0, -1), start: Number((/START WITH (-?\d+)/.exec(m[2]) || [])[1]), steigend: !/INCREMENT BY -/.test(m[2]) });
  }
  for (const m of text.matchAll(/ALTER TABLE (\w+) ADD CONSTRAINT (\w+) ([^;]+);/g)) {
    const eintrag = { tabelle: m[1], name: m[2], def: m[3].trim().replace(/\s+/g, ' ') };
    const schluessel = /^(PRIMARY KEY|UNIQUE)( NULLS NOT DISTINCT)? \(([^)]*)\)$/.exec(eintrag.def);
    if (schluessel) soll.schluessel.push({ ...eintrag, art: schluessel[1], nnd: Boolean(schluessel[2]), spalten: spaltenListe(schluessel[3]) });
    else if (/^FOREIGN KEY/.test(eintrag.def)) soll.fremd.push(eintrag);
    else soll.pruef.push(eintrag);
  }
  // Schlüssel ohne Namen (ALTER TABLE x ADD UNIQUE (…)) – Name wie ihn PostgreSQL vergeben würde
  for (const m of text.matchAll(/ALTER TABLE (\w+) ADD (PRIMARY KEY|UNIQUE) \(([^)]*)\);/g)) {
    const spalten = spaltenListe(m[3]);
    const name = m[2] === 'PRIMARY KEY' ? `${m[1]}_pkey` : `${m[1]}_${spalten.replace(/,/g, '_')}_key`;
    soll.schluessel.push({ tabelle: m[1], name, def: `${m[2]} (${m[3]})`, art: m[2], nnd: false, spalten, ohneName: true });
  }
  for (const m of text.matchAll(/CREATE (UNIQUE )?INDEX (\w+) ON (\w+) \(([^)]*)\);/g)) {
    soll.indizes.push({ eindeutig: Boolean(m[1]), name: m[2], tabelle: m[3], spalten: spaltenListe(m[4]), sql: m[0].slice(0, -1) });
  }
  return soll;
}

// Sequenz → Tabelle/Spalte, deren Nummern sie vergibt
const SEQUENZ_SPALTE = {
  dsv_seq_akte: ['dsv_akte', 'lfd_aktenr'],
  dsv_seq_vorg: ['dsv_vorg', 'lfd_vorgnr'],
  dsv_seq_doku: ['dsv_doku', 'lfd_doknr'],
  dsv_seq_adr: ['dsv_adressen', 'adr_nr'],
  dsv_seq_stwt: ['dsv_stichworte', 'stwnr'],
  dsv_seq_lap: ['dsv_lap', 'lfd_apnr']
};

async function istZustand() {
  const alle = await zeilen(`
    SELECT c.conname AS name, c.conrelid::regclass::text AS tabelle, c.contype AS typ, pg_get_constraintdef(c.oid) AS def,
      (SELECT string_agg(a.attname, ',' ORDER BY k.ord) FROM unnest(c.conkey) WITH ORDINALITY k(nr, ord)
        JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.nr) AS spalten
    FROM pg_constraint c WHERE c.connamespace = $1::regnamespace`, [schema]);
  const constraints = new Map(alle.map((c) => [c.name, c]));
  // Primär-/Unique-Schlüssel nach Tabelle und Spalten (für Schlüssel ohne festen Namen)
  constraints.schluesselAuf = (tabelle, spalten) => alle.find((c) => ['p', 'u'].includes(c.typ) && c.tabelle.replace(/^.*\./, '') === tabelle && c.spalten === spalten);
  const indizes = await zeilen(`
    SELECT ic.relname AS name, tc.relname AS tabelle, i.indisunique AS eindeutig, i.indnullsnotdistinct AS nnd,
      EXISTS (SELECT 1 FROM pg_constraint c WHERE c.conindid = i.indexrelid AND c.conrelid = i.indrelid AND c.contype IN ('p', 'u', 'x')) AS gehoert_zu_constraint,
      (SELECT string_agg(a.attname, ',' ORDER BY k.ord) FROM unnest(i.indkey) WITH ORDINALITY k(nr, ord)
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = k.nr) AS spalten
    FROM pg_index i JOIN pg_class ic ON ic.oid = i.indexrelid JOIN pg_class tc ON tc.oid = i.indrelid
    WHERE tc.relnamespace = $1::regnamespace`, [schema]);
  // Sequenzen auch in anderen Schemas (ohne search_path in sequences.sql legt ora2pg sie z. B. in public an);
  // die App findet sie über den search_path (DB_SCHEMA, public)
  const sequenzen = new Map();
  for (const s of await zeilen(`SELECT schemaname, sequencename FROM pg_sequences ORDER BY CASE WHEN schemaname = $1 THEN 0 WHEN schemaname = 'public' THEN 1 ELSE 2 END`, [schema])) {
    if (!sequenzen.has(s.sequencename)) sequenzen.set(s.sequencename, s.schemaname);
  }
  return { constraints, indizes, sequenzen };
}

async function plan() {
  const { version } = await zeile(`SELECT current_setting('server_version_num')::int AS version`);
  if (version < 150000) throw new Error('PostgreSQL 15 oder neuer nötig (UNIQUE NULLS NOT DISTINCT)');
  const { passt } = await zeile(`SELECT upper('ß') = 'ß' AS passt`);
  if (!passt && version < 170000) {
    throw new Error('upper() macht hier aus „ß“ ein „ẞ“, und COLLATE pg_c_utf8 gibt es erst ab PostgreSQL 17 – '
      + 'Datenbank mit LOCALE_PROVIDER builtin, BUILTIN_LOCALE \'C.UTF-8\' neu anlegen und Daten neu laden');
  }
  const umschreiben = (def) => (passt ? def : mitKollation(def));
  const soll = sollAusAltschema();
  const ist = await istZustand();
  const schritte = [];
  const schritt = (text, ...sql) => schritte.push({ text, sql });

  // 1. Sequenzen anlegen bzw. hinter die vergebenen Nummern setzen
  for (const s of soll.sequenzen) {
    const seqSchema = ist.sequenzen.get(s.name);
    const neu = !seqSchema;
    if (neu) schritt(`Sequenz ${s.name} anlegen (Start ${s.start} laut Oracle-Export)`, s.sql);
    else if (seqSchema !== schema && seqSchema !== 'public') {
      schritt(`Sequenz ${s.name} liegt im Schema ${seqSchema} – nach ${schema} verschieben`, `ALTER SEQUENCE ${seqSchema}.${s.name} SET SCHEMA ${schema}`);
    }
    const bezug = SEQUENZ_SPALTE[s.name];
    if (!bezug) continue;
    const [tabelle, spalte] = bezug;
    const { kleinste, groesste } = await zeile(`SELECT MIN(${spalte}) AS kleinste, MAX(${spalte}) AS groesste FROM ${tabelle}`);
    const grenze = s.steigend ? groesste : kleinste;
    if (grenze === null || grenze === undefined) continue;
    let kommt = s.start;
    if (!neu) {
      const { last_value: letzte, is_called: benutzt } = await zeile(`SELECT last_value, is_called FROM ${seqSchema}.${s.name}`);
      const { increment_by: schrittweite } = await zeile('SELECT increment_by FROM pg_sequences WHERE schemaname = $1 AND sequencename = $2', [seqSchema, s.name]);
      kommt = benutzt ? letzte + schrittweite : letzte;
    }
    if (s.steigend ? kommt <= grenze : kommt >= grenze) {
      const naechste = s.steigend ? grenze + 1 : grenze - 1;
      schritt(`Sequenz ${s.name} vergäbe ${kommt}, vergeben bis ${grenze} → nächste Nummer ${naechste}`, `SELECT setval('${neu ? schema : seqSchema}.${s.name}', ${naechste}, false)`);
    }
  }

  // 2. Primär- und Unique-Schlüssel (vor den Fremdschlüsseln, die sie brauchen)
  for (const s of soll.schluessel) {
    // gleicher Name oder gleiche Tabelle + Spalten (Name von ora2pg neu vergeben)
    const vorhanden = (ist.constraints.has(s.name) && ['p', 'u'].includes(ist.constraints.get(s.name).typ) && ist.constraints.get(s.name))
      || ist.constraints.schluesselAuf(s.tabelle, s.spalten);
    if (vorhanden) {
      if (s.nnd && !/NULLS NOT DISTINCT/.test(vorhanden.def)) {
        schritt(`${vorhanden.name} (${s.tabelle}): UNIQUE NULLS NOT DISTINCT wie in Oracle`,
          `ALTER TABLE ${s.tabelle} DROP CONSTRAINT ${vorhanden.name}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${s.def}`);
      }
      continue;
    }
    const gleicheSpalten = (i) => i.tabelle === s.tabelle && i.spalten === s.spalten;
    const index = ist.indizes.find((i) => gleicheSpalten(i) && i.eindeutig && !i.gehoert_zu_constraint)
      || ist.indizes.find((i) => i.name === s.name);
    if (index && gleicheSpalten(index) && index.eindeutig && !index.gehoert_zu_constraint && (!s.nnd || index.nnd)) {
      schritt(`${s.name} (${s.tabelle}): ${s.art} aus vorhandenem Index ${index.name} übernehmen`,
        `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${s.art} USING INDEX ${index.name}`);
    } else if (index && gleicheSpalten(index) && !index.gehoert_zu_constraint) {
      schritt(`${s.name} (${s.tabelle}): Index ${index.name} ersetzen durch ${s.def}`,
        `DROP INDEX ${index.name}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${s.def}`);
    } else if (index && index.name === s.name) {
      schritt(`${s.name} (${s.tabelle}): Name schon vergeben an Index ${index.name} (${index.tabelle}: ${index.spalten}) – bitte prüfen`);
    } else {
      schritt(`${s.name} (${s.tabelle}) fehlt – anlegen: ${s.def}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${s.def}`);
    }
  }

  // 3. eindeutige und normale Indizes
  for (const s of soll.indizes) {
    const vorhanden = ist.indizes.find((i) => i.name === s.name)
      || ist.indizes.find((i) => i.tabelle === s.tabelle && i.spalten === s.spalten && (!s.eindeutig || i.eindeutig));
    if (!vorhanden) schritt(`Index ${s.name} auf ${s.tabelle} (${s.spalten}) anlegen`, s.sql);
    else if (s.eindeutig && !vorhanden.eindeutig) schritt(`Index ${vorhanden.name} auf ${s.tabelle} ist nicht eindeutig – ersetzen`, `DROP INDEX ${vorhanden.name}`, s.sql);
  }

  // 4. Fremdschlüssel und Prüfregeln
  for (const s of soll.fremd) {
    if (!ist.constraints.has(s.name)) schritt(`${s.name} (${s.tabelle}) fehlt – anlegen: ${s.def}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${s.def}`);
  }
  for (const s of soll.pruef) {
    const vorhanden = ist.constraints.get(s.name);
    if (!vorhanden) {
      schritt(`${s.name} (${s.tabelle}) fehlt – anlegen: ${umschreiben(s.def)}`, `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${umschreiben(s.def)}`);
    } else if (!passt && /upper\(/i.test(vorhanden.def) && !/pg_c_utf8/.test(vorhanden.def)) {
      schritt(`${s.name} (${s.tabelle}): upper() mit COLLATE pg_c_utf8`, `ALTER TABLE ${s.tabelle} DROP CONSTRAINT ${s.name}`,
        `ALTER TABLE ${s.tabelle} ADD CONSTRAINT ${s.name} ${mitKollation(vorhanden.def)}`);
    }
  }
  return schritte;
}

(async () => {
  if (config.datenbank.typ !== 'postgres') throw new Error('Nur für PostgreSQL – in backend/.env DB_CONNECT_STRING entfernen und DATABASE_URL setzen');
  if (!(await zeile('SELECT 1 AS da FROM information_schema.tables WHERE table_schema = $1 AND table_name = $2', [schema, 'dsv_akte']))) {
    throw new Error(`Im Schema „${schema}“ gibt es keine Tabelle dsv_akte – DB_SCHEMA in backend/.env prüfen`);
  }
  const schritte = await plan();
  if (!schritte.length) {
    console.log(`Schema „${schema}“ entspricht altschema.sql, Sequenzen passen – nichts zu tun.`);
    return;
  }
  if (!ausfuehren) {
    console.log(`Zu tun im Schema „${schema}“ (nur Anzeige, ausführen mit: npm run db:nach-ora2pg -- --ausfuehren):`);
    for (const s of schritte) console.log(`  · ${s.text}`);
    return;
  }
  console.log(`Ausführen im Schema „${schema}“:`);
  let fehlgeschlagen = 0;
  await transaktion(async () => {
    for (const s of schritte) {
      if (!s.sql.length) {
        console.log(`  ⚠ ${s.text}`);
        continue;
      }
      await query('SAVEPOINT schritt');
      try {
        for (const sql of s.sql) await query(sql);
        await query('RELEASE SAVEPOINT schritt');
        console.log(`  ✔ ${s.text}`);
      } catch (error) {
        await query('ROLLBACK TO SAVEPOINT schritt');
        fehlgeschlagen += 1;
        console.log(`  ✘ ${s.text}\n      ${error.message}${error.detail ? ` – ${error.detail}` : ''}`);
      }
    }
  });
  console.log(fehlgeschlagen
    ? `\n${schritte.length - fehlgeschlagen} Schritte ausgeführt, ${fehlgeschlagen} fehlgeschlagen (✘). Daten dazu bereinigen und erneut starten.`
    : '\nFertig – alle Schritte ausgeführt.');
})()
  .catch((error) => {
    console.error('Fehler:', fehlerText(error));
    process.exitCode = 1;
  })
  .finally(() => beenden());
