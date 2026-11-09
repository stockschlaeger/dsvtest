// Datenbankanbindung: Oracle (Altdatenbank im Übergang) oder PostgreSQL (Ziel des Lift & Shift).
//   Oracle:     DB_CONNECT_STRING (host:port/service) mit DB_USER und DB_PASSWORD
//   PostgreSQL: DATABASE_URL (postgres://…), wenn DB_CONNECT_STRING nicht gesetzt ist
//
// Das SQL der Module läuft auf beiden: Platzhalter $1 … $n, App-Tabellen als dsv_app.<name>. Für Oracle werden
// Platzhalter zu Bind-Variablen, dsv_app.<name> zu DSV_APP_<NAME>, Spaltennamen klein, Wahrheitswerte zu 1/0 und
// Fehlercodes zu denen von PostgreSQL. Was sich nicht neutral schreiben lässt, liefern die Bausteine in `dialekt`.
const { AsyncLocalStorage } = require('async_hooks');
const config = require('./config');

const oracle = config.datenbank.typ === 'oracle';

// Laufende Transaktion je Anfrage, damit Module einfach query() verwenden können. Eine Verbindung führt nur eine
// Anweisung zur Zeit aus; parallele Abfragen (Promise.all) innerhalb einer Transaktion laufen daher nacheinander.
const kontext = new AsyncLocalStorage();
const imKontext = (verbindung, fn) => kontext.run({ verbindung, kette: Promise.resolve() }, fn);

// ---------- PostgreSQL ----------

function postgresTreiber() {
  const { Pool, types } = require('pg');
  // bigint/numeric als Zahl (lfd. Nummern liegen weit unter 2^53), Zeitstempel ohne Zeitzone unverändert als lokale Zeit
  types.setTypeParser(20, Number);
  types.setTypeParser(1700, Number);
  types.setTypeParser(1114, (wert) => wert.replace(' ', 'T'));
  types.setTypeParser(1082, (wert) => wert);

  const pool = new Pool({
    connectionString: config.datenbank.url,
    options: `-c search_path=${config.datenbank.schema},public -c timezone=${config.datenbank.zeitzone}`
  });

  return {
    async ausfuehren(verbindung, text, werte) {
      const ergebnis = await (verbindung || pool).query(text, werte);
      return { rows: ergebnis.rows, rowCount: ergebnis.rowCount };
    },
    async transaktion(fn) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const ergebnis = await imKontext(client, fn);
        await client.query('COMMIT');
        return ergebnis;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    beenden: () => pool.end()
  };
}

// ---------- Oracle ----------

// Oracle-Fehlernummern → SQLSTATE von PostgreSQL (darauf prüfen die Module und die Fehlerbehandlung)
const ORACLE_FEHLER = {
  1: '23505', // Unique verletzt
  2291: '23503', 2292: '23503', // Fremdschlüssel
  2290: '23514', // Prüfregel
  1400: '23502', 1407: '23502', // NOT NULL
  1401: '22001', 12899: '22001', // zu lang
  1722: '22P02', // keine Zahl
  1830: '22007', 1840: '22007', 1841: '22007', 1843: '22007', 1847: '22007', 1858: '22007', 1861: '22007' // Datum
};

// Bezeichner für ALTER SESSION (kommen aus der Konfiguration, nicht von Benutzern)
function bezeichner(wert, name) {
  if (!/^[A-Za-z][A-Za-z0-9_$#]*$/.test(wert)) throw new Error(`${name}: ungültiger Wert „${wert}“`);
  return wert.toUpperCase();
}

// DATE als 'JJJJ-MM-TTThh:mm:ss' wie bei PostgreSQL. Der Thin-Treiber liefert DATE in der Ortszeit der Anwendung;
// die Felder werden daher unverändert übernommen.
const zwei = (zahl) => String(zahl).padStart(2, '0');
const ortszeit = (d) =>
  `${d.getFullYear()}-${zwei(d.getMonth() + 1)}-${zwei(d.getDate())}T${zwei(d.getHours())}:${zwei(d.getMinutes())}:${zwei(d.getSeconds())}`;

const AUSGABE_ROWID = Symbol('rowid');

function oracleTreiber() {
  const oracledb = require('oracledb');
  const { user, password, connectString } = config.datenbank.oracle;
  if (!user || !password) throw new Error('Für Oracle DB_USER und DB_PASSWORD setzen');
  oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
  oracledb.fetchTypeHandler = (spalte) => {
    if (spalte.dbType === oracledb.DB_TYPE_DATE) return { converter: (wert) => (wert ? ortszeit(wert) : wert) };
    if (spalte.dbType === oracledb.DB_TYPE_CLOB) return { type: oracledb.STRING };
    return undefined;
  };

  // Sitzung: Datumsformat für Text ↔ DATE, Zeitzone für CURRENT_TIMESTAMP, ggf. Schema der Alttabellen
  const sitzung = [
    `NLS_DATE_FORMAT = 'YYYY-MM-DD"T"HH24:MI:SS'`,
    `TIME_ZONE = '${config.datenbank.zeitzone.replace(/'/g, '')}'`,
    config.datenbank.schema && `CURRENT_SCHEMA = ${bezeichner(config.datenbank.schema, 'DB_SCHEMA')}`
  ].filter(Boolean).join(' ');

  let pool;
  const poolHolen = () => {
    pool ||= oracledb.createPool({
      user,
      password,
      connectString,
      poolMin: 0,
      poolMax: 10,
      poolIncrement: 1,
      sessionCallback: (verbindung, tag, fertig) => {
        verbindung.execute(`ALTER SESSION SET ${sitzung}`).then(() => fertig(), fertig);
      }
    });
    return pool;
  };

  // $n → :n (jede Fundstelle eine eigene Bind-Variable), dsv_app.x → dsv_app_x, true/false → 1/0
  function uebersetzen(text, werte) {
    const binds = [];
    const sql = text
      .replace(/\bdsv_app\.(\w+)/g, 'dsv_app_$1')
      .replace(/\$(\d+)/g, (_, nummer) => {
        const wert = werte[Number(nummer) - 1];
        if (wert === AUSGABE_ROWID) binds.push({ dir: oracledb.BIND_OUT, type: oracledb.STRING, maxSize: 100 });
        else if (typeof wert === 'boolean') binds.push(wert ? 1 : 0);
        else binds.push(wert === undefined ? null : wert);
        return `:${binds.length}`;
      });
    return { sql, binds };
  }

  const klein = (zeile) => Object.fromEntries(Object.entries(zeile).map(([spalte, wert]) => [spalte.toLowerCase(), wert]));

  async function ausfuehrenMit(verbindung, text, werte, autoCommit) {
    const { sql, binds } = uebersetzen(text, werte);
    try {
      const ergebnis = await verbindung.execute(sql, binds, { autoCommit });
      return { rows: (ergebnis.rows || []).map(klein), rowCount: ergebnis.rowsAffected ?? ergebnis.rows?.length ?? 0, outBinds: ergebnis.outBinds };
    } catch (error) {
      if (ORACLE_FEHLER[error.errorNum]) {
        error.oracleCode = error.code;
        error.code = ORACLE_FEHLER[error.errorNum];
        error.constraint = (/\(([^)]+\.[^)]+)\)/.exec(error.message) || [])[1];
      }
      if (config.isDev) error.message += `\nSQL: ${sql.replace(/\s+/g, ' ').trim()}`;
      throw error;
    }
  }

  return {
    async ausfuehren(laufend, text, werte) {
      if (laufend) return ausfuehrenMit(laufend, text, werte, false);
      const verbindung = await (await poolHolen()).getConnection();
      try {
        return await ausfuehrenMit(verbindung, text, werte, true);
      } finally {
        await verbindung.close();
      }
    },
    async transaktion(fn) {
      const verbindung = await (await poolHolen()).getConnection();
      try {
        const ergebnis = await imKontext(verbindung, fn);
        await verbindung.commit();
        return ergebnis;
      } catch (error) {
        await verbindung.rollback().catch(() => {});
        throw error;
      } finally {
        await verbindung.close();
      }
    },
    beenden: async () => pool && (await pool).close(0)
  };
}

const treiber = oracle ? oracleTreiber() : postgresTreiber();

// ---------- Gemeinsame Schnittstelle ----------

function query(text, werte = []) {
  const laufend = kontext.getStore();
  if (!laufend) return treiber.ausfuehren(null, text, werte);
  const ergebnis = laufend.kette.then(() => treiber.ausfuehren(laufend.verbindung, text, werte));
  laufend.kette = ergebnis.catch(() => {});
  return ergebnis;
}
const zeilen = async (text, werte) => (await query(text, werte)).rows;
const zeile = async (text, werte) => (await query(text, werte)).rows[0];

async function transaktion(fn) {
  if (kontext.getStore()) return fn();
  return treiber.transaktion(fn);
}

const beenden = () => treiber.beenden();

// Bausteine für SQL, das sich nicht für beide Datenbanken gleich schreiben lässt
const dialekt = {
  oracle,
  // Bedingungen „immer wahr/falsch“ (Oracle vor 23 kennt TRUE/FALSE in SQL nicht)
  wahr: oracle ? '1 = 1' : 'TRUE',
  falsch: oracle ? '1 = 0' : 'FALSE',
  // Werte für Ja/Nein-Spalten der App-Tabellen (Oracle: NUMBER(1))
  ja: oracle ? '1' : 'TRUE',
  nein: oracle ? '0' : 'FALSE',
  // SELECT ohne Tabelle
  dual: oracle ? ' FROM dual' : '',
  // aktueller Zeitpunkt für DATE-Spalten der Alttabellen (Ortszeit wie SYSDATE)
  jetzt: oracle ? 'SYSDATE' : 'LOCALTIMESTAMP(0)',
  heute: oracle ? 'TRUNC(SYSDATE)' : 'CURRENT_DATE',
  // Bedingung als 1/0 in der Spaltenliste (Oracle kennt dort keine Wahrheitswerte)
  zahl: (bedingung) => `CASE WHEN ${bedingung} THEN 1 ELSE 0 END`,
  text: (wert, laenge) => `CAST(${wert} AS ${oracle ? 'VARCHAR2' : 'varchar'}(${laenge}))`,
  // Muster aus likeMuster()/maskieren() (Maskierung mit \)
  like: (ausdruck, muster) => `${ausdruck} LIKE ${muster} ESCAPE '\\'`,
  ilike: (ausdruck, muster) => (oracle ? `UPPER(${ausdruck}) LIKE UPPER(${muster}) ESCAPE '\\'` : `${ausdruck} ILIKE ${muster} ESCAPE '\\'`),
  // Tagesanteil eines Zeitpunkts; Parameter 'JJJJ-MM-TT' bzw. 'JJJJ-MM-TTThh:mm:ss' als Datum
  tag: (ausdruck) => (oracle ? `TRUNC(${ausdruck})` : `CAST(${ausdruck} AS date)`),
  datum: (p) => (oracle ? `TO_DATE(${p}, 'YYYY-MM-DD')` : `CAST(${p} AS date)`),
  zeitpunkt: (p) => (oracle ? `TO_DATE(${p}, 'YYYY-MM-DD"T"HH24:MI:SS')` : `CAST(${p} AS timestamp)`),
  minuten: (p) => (oracle ? `NUMTODSINTERVAL(${p}, 'MINUTE')` : `make_interval(mins => ${p})`),
  // a = b, wobei NULL = NULL gilt
  gleich: (a, b) => `(${a} = ${b} OR (${a} IS NULL AND ${b} IS NULL))`,
  textListe: (ausdruck, trenner) =>
    (oracle ? `LISTAGG(${ausdruck}, '${trenner}') WITHIN GROUP (ORDER BY ${ausdruck})` : `string_agg(${ausdruck}, '${trenner}' ORDER BY ${ausdruck})`)
};

// Platzhalter $1, $2, … beim Zusammensetzen von SQL
class Sql {
  constructor() {
    this.werte = [];
  }

  p(wert) {
    this.werte.push(wert);
    return `$${this.werte.length}`;
  }

  liste(werte) {
    return werte.map((wert) => this.p(wert)).join(', ');
  }

  // ausdruck IN (…) – auch für leere Listen und mehr als 1000 Werte (Grenze bei Oracle)
  in(ausdruck, werte) {
    if (!werte.length) return dialekt.falsch;
    const teile = [];
    for (let i = 0; i < werte.length; i += 1000) teile.push(`${ausdruck} IN (${this.liste(werte.slice(i, i + 1000))})`);
    return teile.length === 1 ? teile[0] : `(${teile.join(' OR ')})`;
  }
}

// LIKE-Muster mit maskierten Platzhaltern (Maskierung mit \, siehe dialekt.like/ilike)
const maskieren = (text) => String(text).replace(/[\\%_]/g, (zeichen) => `\\${zeichen}`);
const likeMuster = (text) => `%${maskieren(text)}%`;

// Nächster Wert einer Sequenz
async function naechsteNummer(sequenz) {
  return (await zeile(oracle ? `SELECT ${sequenz}.NEXTVAL AS id FROM dual` : `SELECT nextval('${sequenz}') AS id`)).id;
}

// INSERT/UPDATE ausführen und die (erste) betroffene Zeile zurückgeben
async function mitZeile(text, werte, tabelle) {
  if (!oracle) return (await query(`${text} RETURNING *`, werte)).rows[0];
  const ergebnis = await query(`${text} RETURNING ROWID INTO $${werte.length + 1}`, [...werte, AUSGABE_ROWID]);
  const rowid = ergebnis.outBinds?.[0]?.[0];
  return rowid ? zeile(`SELECT * FROM ${tabelle} WHERE ROWID = $1`, [rowid]) : undefined;
}

// Spalten der Alttabellen (Längen, Pflichtfelder) für die Prüfung von Eingaben; Typen in der Schreibweise von PostgreSQL
const ORACLE_TYPEN = {
  VARCHAR2: 'character varying', NVARCHAR2: 'character varying', VARCHAR: 'character varying', CHAR: 'character', NCHAR: 'character',
  DATE: 'timestamp without time zone', NUMBER: 'numeric', FLOAT: 'numeric', LONG: 'text', CLOB: 'text'
};

async function spaltenZeilen() {
  if (!oracle) {
    return zeilen(`
      SELECT table_name, column_name, data_type, character_maximum_length, is_nullable, column_default
      FROM information_schema.columns WHERE table_schema = $1`, [config.datenbank.schema]);
  }
  const rows = await zeilen(`
    SELECT LOWER(table_name) AS table_name, LOWER(column_name) AS column_name, data_type, char_length, nullable, data_default
    FROM all_tab_columns WHERE owner = SYS_CONTEXT('USERENV', 'CURRENT_SCHEMA')`);
  return rows.map((row) => ({
    table_name: row.table_name,
    column_name: row.column_name,
    data_type: ORACLE_TYPEN[row.data_type] || (row.data_type.startsWith('TIMESTAMP') ? 'timestamp' : row.data_type.toLowerCase()),
    character_maximum_length: row.char_length || null,
    is_nullable: row.nullable === 'N' ? 'NO' : 'YES',
    column_default: row.data_default && row.data_default.trim().toUpperCase() !== 'NULL' ? row.data_default.trim() : null
  }));
}

let spalten = null;
async function spaltenInfo() {
  if (!spalten) {
    spalten = new Map();
    for (const row of await spaltenZeilen()) {
      if (!spalten.has(row.table_name)) spalten.set(row.table_name, new Map());
      spalten.get(row.table_name).set(row.column_name, {
        typ: row.data_type,
        max: row.character_maximum_length,
        pflicht: row.is_nullable === 'NO' && row.column_default === null
      });
    }
  }
  return spalten;
}

module.exports = { query, zeilen, zeile, transaktion, beenden, dialekt, Sql, likeMuster, maskieren, naechsteNummer, mitZeile, spaltenInfo };
