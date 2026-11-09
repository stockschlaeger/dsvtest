// Änderungsprotokoll der neuen Anwendung (dsv_app.protokoll)
const { query, zeilen } = require('./db');

async function protokolliere(user, typ, id, aktion, details = null) {
  await query(
    'INSERT INTO dsv_app.protokoll (login, user_id, objekt_typ, objekt_id, aktion, details) VALUES ($1, $2, $3, $4, $5, $6)',
    [user.login, user.userId, typ, String(id), aktion, details && JSON.stringify(details)]
  );
}

// details: PostgreSQL liefert jsonb als Objekt, Oracle den JSON-Text (CLOB)
const liste = async (typ, id) =>
  (await zeilen('SELECT * FROM dsv_app.protokoll WHERE objekt_typ = $1 AND objekt_id = $2 ORDER BY id DESC FETCH FIRST 200 ROWS ONLY', [typ, String(id)]))
    .map((eintrag) => (typeof eintrag.details === 'string' ? { ...eintrag, details: JSON.parse(eintrag.details) } : eintrag));

// Geänderte Felder als { feld: [alt, neu] }
function unterschiede(alt, neu) {
  const ergebnis = {};
  for (const [feld, wert] of Object.entries(neu)) {
    const vorher = alt[feld] ?? null;
    if (String(vorher ?? '') !== String(wert ?? '')) ergebnis[feld] = [vorher, wert];
  }
  return ergebnis;
}

module.exports = { protokolliere, liste, unterschiede };
