-- Vorprüfung in der Oracle-Altdatenbank vor dem Import – ändert nichts, liest nur.
-- Als Eigentümer der DSV-Tabellen ausführen (SQL Developer „Skript ausführen“ oder sqlplus) und die Ergebnisse vor dem
-- ora2pg-Lauf ansehen. Jede Abfrage nennt, was zu erwarten ist und was ein abweichendes Ergebnis bedeutet.

PROMPT === 1. Entspricht das Schema history/DSV.sql? Erwartet: 58 Tabellen, 429 Spalten, 0 Trigger
SELECT (SELECT COUNT(*) FROM user_tables) AS tabellen,
       (SELECT COUNT(*) FROM user_tab_columns c JOIN user_tables t ON t.table_name = c.table_name) AS spalten,
       (SELECT COUNT(*) FROM user_triggers) AS trigger_anzahl
FROM dual;

PROMPT --- Tabellen, die im Export fehlen (erwartet: keine Zeile)
SELECT table_name FROM user_tables
WHERE table_name NOT IN ('AP_GWD', 'DSV_ABLAGEN', 'DSV_ADRESSEN', 'DSV_AKTE', 'DSV_ALTAP', 'DSV_ANFORDERUNGEN', 'DSV_ANLA',
  'DSV_BENUTZERPROFIL', 'DSV_BERECHTIGTE_SB', 'DSV_DOC_NAME_LIST', 'DSV_DOKU', 'DSV_DOKU0104', 'DSV_DOKU_ADR', 'DSV_DUMMY',
  'DSV_FORMS', 'DSV_GVP', 'DSV_H1', 'DSV_H2', 'DSV_HELP', 'DSV_HG', 'DSV_KONFIGURATION', 'DSV_LAP', 'DSV_LOV_EAI',
  'DSV_LOV_EINAUS', 'DSV_LOV_FORM', 'DSV_LOV_JN', 'DSV_LOV_KLASSE', 'DSV_LOV_KONFIGURATION', 'DSV_LOV_MELDART', 'DSV_LOV_ORG',
  'DSV_LOV_RECHTE', 'DSV_LOV_SCHRIFTGUTART', 'DSV_LOV_SCHRIFTGUTLAPART', 'DSV_LOV_STATUS', 'DSV_MELDUNGEN', 'DSV_PROTOKOLL',
  'DSV_PROTOKOLL_ALT', 'DSV_REP', 'DSV_STD_VORLAGEWEG_AKTE', 'DSV_STD_VORLAGEWEG_VORG', 'DSV_STICHWORTE', 'DSV_STOPWORTE',
  'DSV_STWSYNO', 'DSV_STWZUO', 'DSV_SYSTEMPROFIL', 'DSV_SYSTEMPROFIL_CEO', 'DSV_TMP_AP_STW', 'DSV_TMP_STW_LIST',
  'DSV_UMREGISTRIERUNGEN', 'DSV_VERTEILER', 'DSV_VERTNAMEN', 'DSV_VERTRETUNG', 'DSV_VORG', 'DSV_VORG0104',
  'DSV_WEITERE_ABLAGEN', 'LAP', 'TMP_MINUMREG', 'USER_VWR_TABLE')
ORDER BY table_name;

PROMPT --- Trigger (erwartet: keine; sonst Logik prüfen, die die App nachbilden muss)
SELECT trigger_name, table_name, triggering_event, status FROM user_triggers ORDER BY table_name;

PROMPT === 2. Schlüssel und Prüfregeln, die in Oracle nicht aktiv oder nicht geprüft sind
PROMPT     Erwartet: nur PKVORG (DISABLED). Bei NOT VALIDATED können Altdaten die Regel verletzen – Postgres prüft beim Import.
SELECT table_name, constraint_name, constraint_type, status, validated
FROM user_constraints
WHERE constraint_type IN ('P', 'U', 'R', 'C') AND (status <> 'ENABLED' OR validated <> 'VALIDATED')
ORDER BY table_name, constraint_name;

PROMPT --- DSV_VORG: eindeutiger Index PKVORG vorhanden (erwartet UNIQUE/VALID) und keine doppelten LFD_VORGNR
SELECT index_name, uniqueness, status FROM user_indexes WHERE table_name = 'DSV_VORG' ORDER BY index_name;
SELECT lfd_vorgnr, COUNT(*) AS anzahl FROM dsv_vorg GROUP BY lfd_vorgnr HAVING COUNT(*) > 1;

PROMPT === 3. Zeichensatz und Sortierung
PROMPT     NLS_CHARACTERSET bestimmt NLS_LANG für ora2pg; NLS_SORT = GERMAN heißt: die Altanwendung sortierte deutsch
SELECT parameter, value FROM nls_database_parameters
WHERE parameter IN ('NLS_CHARACTERSET', 'NLS_LANGUAGE', 'NLS_TERRITORY', 'NLS_SORT', 'NLS_COMP')
ORDER BY parameter;

PROMPT --- Windows-Zeichen (€ „ “ – …) in einer ISO-8859-Datenbank: Bytes 128–159
PROMPT     Nur relevant bei NLS_CHARACTERSET WE8ISO8859P1/P15. Bei Treffern ora2pg mit NLS_LANG ..._WE8ISO8859P1 und
PROMPT     CLIENT_ENCODING WIN1252 laden, sonst werden daraus unsichtbare Steuerzeichen.
SELECT 'DSV_AKTE' AS tabelle, COUNT(*) AS zeilen FROM dsv_akte
 WHERE REGEXP_LIKE(betreff, '[' || CHR(128) || '-' || CHR(159) || ']') OR REGEXP_LIKE(bemerkung, '[' || CHR(128) || '-' || CHR(159) || ']')
UNION ALL
SELECT 'DSV_VORG', COUNT(*) FROM dsv_vorg
 WHERE REGEXP_LIKE(betreff, '[' || CHR(128) || '-' || CHR(159) || ']') OR REGEXP_LIKE(bemerkung, '[' || CHR(128) || '-' || CHR(159) || ']')
UNION ALL
SELECT 'DSV_DOKU', COUNT(*) FROM dsv_doku
 WHERE REGEXP_LIKE(betreff, '[' || CHR(128) || '-' || CHR(159) || ']') OR REGEXP_LIKE(bemerkung, '[' || CHR(128) || '-' || CHR(159) || ']')
UNION ALL
SELECT 'DSV_ADRESSEN', COUNT(*) FROM dsv_adressen
 WHERE REGEXP_LIKE(bezeichnung_1 || bezeichnung_2 || bezeichnung_3 || strasse || ort, '[' || CHR(128) || '-' || CHR(159) || ']');

PROMPT --- Großgeschriebene Spalten mit µ oder ÿ (erwartet: 0). Postgres schreibt sie anders groß als Oracle;
PROMPT     solche Zeilen verletzen beim Import die Prüfregel „= upper(...)“ und müssen vorher angepasst werden.
SELECT 'DSV_STICHWORTE' AS tabelle, COUNT(*) AS zeilen FROM dsv_stichworte
 WHERE INSTR(stichwort, UNISTR('\00B5')) > 0 OR INSTR(stichwort, UNISTR('\00FF')) > 0
UNION ALL
SELECT 'DSV_STOPWORTE', COUNT(*) FROM dsv_stopworte
 WHERE INSTR(stopwort, UNISTR('\00B5')) > 0 OR INSTR(stopwort, UNISTR('\00FF')) > 0
UNION ALL
SELECT 'DSV_VORG', COUNT(*) FROM dsv_vorg
 WHERE INSTR(vorg, UNISTR('\00B5')) > 0 OR INSTR(vorg, UNISTR('\00FF')) > 0
UNION ALL
SELECT 'DSV_LAP', COUNT(*) FROM dsv_lap
 WHERE INSTR(tglieder, UNISTR('\00B5')) > 0 OR INSTR(tglieder, UNISTR('\00FF')) > 0;

PROMPT === 4. Offene Fragen der App
PROMPT --- Status-Codes (README „Offene Punkte“; App erwartet oV, GG, WV, umreg., Archiv, g – sonst DSV_STATUS_* setzen)
SELECT status, name FROM dsv_lov_status ORDER BY status;

PROMPT --- Status in Gebrauch und Bearbeiter: Die App setzt „Geschäftsgang“ genau dann, wenn ein Bearbeiter eingetragen ist
SELECT 'AKTE' AS ebene, status, COUNT(*) AS anzahl, COUNT(bearbeiter) AS mit_bearbeiter FROM dsv_akte GROUP BY status
UNION ALL
SELECT 'VORG', status, COUNT(*), COUNT(bearbeiter) FROM dsv_vorg GROUP BY status
UNION ALL
SELECT 'DOKU', status, COUNT(*), COUNT(bearbeiter) FROM dsv_doku GROUP BY status
ORDER BY 1, 2;

PROMPT --- Steht im Registrator die USER_ID (wie die App schreibt) oder die KENNUNG?
SELECT COUNT(*) AS dokumente,
       COUNT(u.user_id) AS registrator_ist_user_id,
       COUNT(k.kennung) AS registrator_ist_kennung,
       COUNT(d.erst_registrator) - COUNT(u.user_id) - COUNT(k.kennung) AS weder_noch
FROM dsv_doku d
LEFT JOIN dsv_benutzerprofil u ON u.user_id = d.erst_registrator
LEFT JOIN dsv_benutzerprofil k ON k.kennung = d.erst_registrator AND k.user_id <> d.erst_registrator;

PROMPT --- Rechte im GVP (App: L = nur lesen, jedes andere Recht = schreiben)
SELECT g.recht, r.name, COUNT(*) AS eintraege
FROM dsv_gvp g LEFT JOIN dsv_lov_rechte r ON r.recht = g.recht
GROUP BY g.recht, r.name ORDER BY g.recht;

PROMPT --- Benutzerdaten ohne Fremdschlüssel (Hinweise, kein Importfehler)
SELECT 'GVP-Einträge ohne Benutzerprofil' AS pruefung, COUNT(*) AS anzahl FROM dsv_gvp g
 WHERE NOT EXISTS (SELECT 1 FROM dsv_benutzerprofil p WHERE p.user_id = g.bearbeiter)
UNION ALL
SELECT 'GVP-Einträge mit unbekanntem Referat', COUNT(*) FROM dsv_gvp g
 WHERE NOT EXISTS (SELECT 1 FROM dsv_lov_org o WHERE o.org = g.org)
UNION ALL
SELECT 'Profile mit Kleinbuchstaben in USER_ID (automatische Login-Zuordnung greift nicht)', COUNT(*) FROM dsv_benutzerprofil
 WHERE user_id <> UPPER(user_id)
UNION ALL
SELECT 'Vertretungen, bei denen eine Seite keine Registratur-Rolle hat (App ignoriert sie)', COUNT(*) FROM dsv_vertretung v
 WHERE NOT EXISTS (SELECT 1 FROM dsv_benutzerprofil p WHERE p.user_id = v.registrator AND p.klasse_reg = 'X')
    OR NOT EXISTS (SELECT 1 FROM dsv_benutzerprofil p WHERE p.user_id = v.vertreter AND p.klasse_reg = 'X');

PROMPT === 5. Sequenzen gegen vorhandene Nummern
PROMPT     Aufsteigend (INCREMENT_BY > 0): LAST_NUMBER muss größer als die größte Nummer sein,
PROMPT     absteigend (< 0): kleiner als die kleinste. Sonst vergibt die App bereits belegte Nummern.
SELECT sequence_name, increment_by, last_number FROM user_sequences ORDER BY sequence_name;
SELECT 'DSV_AKTE (dsv_seq_akte)' AS tabelle, MIN(lfd_aktenr) AS kleinste, MAX(lfd_aktenr) AS groesste FROM dsv_akte
UNION ALL SELECT 'DSV_VORG (dsv_seq_vorg)', MIN(lfd_vorgnr), MAX(lfd_vorgnr) FROM dsv_vorg
UNION ALL SELECT 'DSV_DOKU (dsv_seq_doku)', MIN(lfd_doknr), MAX(lfd_doknr) FROM dsv_doku
UNION ALL SELECT 'DSV_ADRESSEN (dsv_seq_adr)', MIN(adr_nr), MAX(adr_nr) FROM dsv_adressen
UNION ALL SELECT 'DSV_STICHWORTE (dsv_seq_stwt)', MIN(stwnr), MAX(stwnr) FROM dsv_stichworte
UNION ALL SELECT 'DSV_LAP (dsv_seq_lap)', MIN(lfd_apnr), MAX(lfd_apnr) FROM dsv_lap;

PROMPT === 6. Dateiverweise: Wie sehen die Pfade aus (Laufwerksbuchstaben, UNC, URL)?
SELECT form_pe, COUNT(*) AS dokumente, COUNT(dateipfad) AS mit_pfad, COUNT(dateiname) AS mit_dateiname
FROM dsv_doku GROUP BY form_pe ORDER BY form_pe;
SELECT * FROM (
  SELECT SUBSTR(dateipfad, 1, 20) AS pfadanfang, COUNT(*) AS anzahl
  FROM dsv_doku WHERE dateipfad IS NOT NULL
  GROUP BY SUBSTR(dateipfad, 1, 20) ORDER BY COUNT(*) DESC
) WHERE ROWNUM <= 20;

PROMPT === 7. Datenmenge und genutzte Funktionen (Zeilen laut Statistik, LAST_ANALYZED beachten)
SELECT table_name, num_rows, last_analyzed FROM user_tables ORDER BY num_rows DESC NULLS LAST, table_name;
SELECT 'Umregistrierungen' AS funktion, COUNT(*) AS anzahl, MAX(umreg_datum) AS zuletzt FROM dsv_umregistrierungen
UNION ALL SELECT 'Wiedervorlagen', COUNT(*), MAX(anf_datum) FROM dsv_anforderungen
UNION ALL SELECT 'Aussonderung (Vorgänge mit Vorschlag/Entscheidung)', COUNT(*), MAX(aend_regdatum) FROM dsv_vorg
 WHERE vorschl_beh IS NOT NULL OR entsch_archiv IS NOT NULL
UNION ALL SELECT 'Verteiler', COUNT(*), NULL FROM dsv_vertnamen
UNION ALL SELECT 'Vorlagewege (Vorgänge)', COUNT(*), NULL FROM dsv_std_vorlageweg_vorg
UNION ALL SELECT 'Ablagen', COUNT(*), NULL FROM dsv_ablagen
UNION ALL SELECT 'DSV-Protokoll', COUNT(*), MAX(zeit) FROM dsv_protokoll;
