-- Beispieldaten im Format der Altanwendung (nur für die lokale Entwicklung).
-- Bedeutungen laut Handbuch; die Codes in den Wertelisten sind teils Platzhalter (bekannt: zdA, Altreg., GG, WV, g),
-- bis der echte Bestand per ora2pg importiert ist. BEARBEITER = im Geschäftsgang bei (Ausleihe), nicht „zuständig“.

-- Wertelisten
INSERT INTO dsv_lov_jn VALUES ('J', 'Ja'), ('N', 'Nein');
INSERT INTO dsv_lov_eai VALUES ('E', 'Eingang'), ('A', 'Ausgang'), ('I', 'Intern');
INSERT INTO dsv_lov_form VALUES ('P', 'Papier'), ('EL', 'elektronisch');
INSERT INTO dsv_lov_klasse VALUES ('OF', 'offen'), ('NF', 'VS-NfD');
INSERT INTO dsv_lov_status VALUES
  ('oV', 'ohne Verfügung'), ('zdA', 'zu den Akten'), ('wegl.', 'weglegen'), ('gesp.', 'gesperrt'), ('Altreg.', 'Altregistratur'),
  ('GG', 'Geschäftsgang'), ('WV', 'Wiedervorlage'), ('umreg.', 'umregistriert'), ('Archiv', 'Archiv'), ('g', 'gelöscht');
INSERT INTO dsv_lov_rechte VALUES ('L', 'Lesen'), ('S', 'Schreiben');
INSERT INTO dsv_lov_schriftgutart VALUES ('A', 'Akte'), ('V', 'Vorgang'), ('D', 'Dokument');
INSERT INTO dsv_lov_schriftgutlapart VALUES ('D', 'Dokument'), ('P', 'Aktenplan');
INSERT INTO dsv_lov_konfiguration VALUES ('1a', 'mit Wiedervorlage/Geschäftsgang');
INSERT INTO dsv_systemprofil (name_lang, protokollstatus, sonderzeichen, stw_option_wortende, stw_option_zahlen, vorg_sort_num, vorg_von_bis_num,
  rch_datum, sys_profil_eai, sys_profil_klasse, sys_profil_umfang, gz_gross_jn, bc_spender_jn)
VALUES ('DSV Entwicklung', 'EIN', '-/()"', 'JA', 'JA', 'A', 'A', '1 Jahr', 'E', 'OF', 'D', 'N', 'N');
INSERT INTO dsv_lov_org VALUES
  ('11', 'Organisation und Liegenschaften'),
  ('12', 'Personal'),
  ('72c', 'IT-Infrastruktur'),
  ('77', 'Digitale Projekte');
INSERT INTO dsv_stopworte VALUES ('DER'), ('DIE'), ('DAS'), ('UND'), ('FÜR'), ('VON'), ('MIT'), ('DEN'), ('DEM'), ('DES'), ('EIN'), ('EINE'), ('IM'), ('IN'), ('ZUR'), ('ZUM'), ('AUF'), ('AN');

-- Aktenplan: Hauptgruppen und Positionen (AKTE = HGRUPPE||GRUPPE||UGRUPPE[.TGLIEDER])
INSERT INTO dsv_hg (hgruppe, betreff, hinweis) VALUES
  ('00', 'Allgemeine Verwaltung', NULL),
  ('10', 'Personal', NULL),
  ('20', 'Projekte', NULL);
INSERT INTO dsv_lap (lfd_apnr, hgruppe, gruppe, ugruppe, tglieder, akte, betreff, aufbfrist, hinweis) VALUES
  (-10000001, '00', '1', NULL, NULL, '001', 'Organisation', 30, NULL),
  (-10000002, '00', '2', NULL, NULL, '002', 'Beschaffung', 6, NULL),
  (-10000003, '00', '2', '1', NULL, '0021', 'Büroausstattung', 6, NULL),
  (-10000004, '00', '2', '2', NULL, '0022', 'IT-Ausstattung', 6, NULL),
  (-10000005, '00', '2', '2', 'NB', '0022.NB', 'Notebooks und Zubehör', 6, 'Nur Endgeräte'),
  (-10000006, '00', '3', NULL, NULL, '003', 'Liegenschaften', 30, NULL),
  (-10000007, '10', '1', NULL, NULL, '101', 'Personalgewinnung', 10, NULL),
  (-10000008, '10', '1', '1', NULL, '1011', 'Stellenbesetzung', 10, NULL),
  (-10000009, '20', '1', NULL, NULL, '201', 'IT-Projekte', 10, NULL);

-- Benutzerprofile (Altkennungen) mit Rollen KLASSE_REG/SB/SY/ST/DS/NS
INSERT INTO dsv_benutzerprofil (user_id, kennung, voreinst_org, klasse_reg, klasse_sb, klasse_sy, klasse_st, klasse_ds, klasse_ns, konfiguration, ben_eai, ben_klasse, ben_umfang) VALUES
  ('LESER', 'LES', '72c', NULL, 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('BEARBEITER', 'BEA', '72c', NULL, 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('REFERAT77', 'R77', '77', NULL, 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('REFERAT12', 'R12', '12', NULL, 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('ABTEILUNG7', 'AL7', '72c', NULL, 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('REGISTRATUR', 'REG', '11', 'X', 'X', NULL, NULL, NULL, NULL, '1a', 'E', 'OF', 'D'),
  ('ADMIN', 'ADM', '11', 'X', NULL, NULL, 'X', 'X', NULL, '1a', 'I', 'OF', 'D');

-- Geschäftsverteilungsplan: Referat (ORG) und optional Aktenplan-Teilbaum, Recht L = Lesen, S = Schreiben
INSERT INTO dsv_gvp (bearbeiter, org, hgruppe, gruppe, ugruppe, tglieder, recht, bemerkung) VALUES
  ('LESER', '72c', NULL, NULL, NULL, NULL, 'L', NULL),
  ('BEARBEITER', '72c', NULL, NULL, NULL, NULL, 'S', NULL),
  ('BEARBEITER', '77', '20', NULL, NULL, NULL, 'L', 'nur Projekte von 77 lesen'),
  ('REFERAT77', '77', NULL, NULL, NULL, NULL, 'S', NULL),
  ('REFERAT12', '12', NULL, NULL, NULL, NULL, 'S', NULL),
  ('ABTEILUNG7', '72c', NULL, NULL, NULL, NULL, 'L', 'Abteilungsleitung 7'),
  ('ABTEILUNG7', '77', NULL, NULL, NULL, NULL, 'L', 'Abteilungsleitung 7'),
  ('REGISTRATUR', '11', NULL, NULL, NULL, NULL, 'S', NULL),
  ('REGISTRATUR', '12', NULL, NULL, NULL, NULL, 'S', NULL),
  ('REGISTRATUR', '72c', NULL, NULL, NULL, NULL, 'S', NULL),
  ('REGISTRATUR', '77', NULL, NULL, NULL, NULL, 'S', NULL),
  ('ADMIN', '11', NULL, NULL, NULL, NULL, 'S', NULL);

-- Vertretung (nur zwischen Registratoren): ADMIN vertritt REGISTRATUR
INSERT INTO dsv_vertretung (registrator, vertreter) VALUES ('REGISTRATUR', 'ADMIN');

-- Akten (ORG + Aktenplanposition, Aktenzeichen ORG-AKTE)
INSERT INTO dsv_akte (lfd_aktenr, lfd_apnr, org, hgruppe, gruppe, ugruppe, tglieder, akte, betreff, bemerkung, status, bearbeiter, erst_registrator, erst_regdatum, aend_registrator, aend_regdatum) VALUES
  (-20000001, -10000005, '72c', '00', '2', '2', 'NB', '0022.NB', 'Notebooks und Zubehör', 'Ersatzbeschaffung 2026', 'oV', NULL, 'REGISTRATUR', '2026-02-10 09:00', NULL, NULL),
  (-20000002, -10000006, '11', '00', '3', NULL, NULL, '003', 'Liegenschaften', 'Lagerhalle Süd', 'oV', NULL, 'REGISTRATUR', '2025-06-03 10:30', NULL, NULL),
  (-20000003, -10000008, '12', '10', '1', '1', NULL, '1011', 'Stellenbesetzung', NULL, 'oV', NULL, 'REGISTRATUR', '2026-09-01 08:15', NULL, NULL),
  (-20000004, -10000009, '77', '20', '1', NULL, NULL, '201', 'IT-Projekte', NULL, 'oV', NULL, 'REGISTRATUR', '2025-11-20 14:00', NULL, NULL),
  (-20000005, -10000009, '72c', '20', '1', NULL, NULL, '201', 'IT-Projekte', NULL, 'oV', NULL, 'REGISTRATUR', '2026-10-12 11:00', NULL, NULL),
  (-20000006, -10000003, '72c', '00', '2', '1', NULL, '0021', 'Büroausstattung', NULL, 'zdA', NULL, 'REGISTRATUR', '2019-03-04 09:00', 'REGISTRATUR', '2021-12-20 16:00');

-- Vorgänge (Aktenzeichen ORG-AKTE/VORG)
INSERT INTO dsv_vorg (lfd_vorgnr, lfd_aktenr, org, hgruppe, gruppe, ugruppe, tglieder, akte, vorg, vorg_nr, betreff, bemerkung, status, bearbeiter, datum_letzteverf, erst_registrator, erst_regdatum, vorschl_beh, entsch_archiv) VALUES
  (-30000001, -20000001, '72c', '00', '2', '2', 'NB', '0022.NB', '1', 1, 'Ausschreibung Notebooks', NULL, 'GG', 'BEARBEITER', '2026-10-20 10:00', 'REGISTRATUR', '2026-02-10 09:05', NULL, NULL),
  (-30000002, -20000001, '72c', '00', '2', '2', 'NB', '0022.NB', '2', 2, 'Rahmenvertrag Zubehör', NULL, 'zdA', NULL, '2026-03-01 12:00', 'REGISTRATUR', '2026-02-12 09:00', 'V', NULL),
  (-30000003, -20000002, '11', '00', '3', NULL, NULL, '003', '1', 1, 'Mietvertrag Lagerhalle Süd', NULL, 'oV', NULL, '2026-10-10 09:00', 'REGISTRATUR', '2025-06-03 10:35', NULL, NULL),
  (-30000004, -20000003, '12', '10', '1', '1', NULL, '1011', 'IT-2026-03', 1, 'Sachbearbeitung IT (Kennziffer IT-2026-03)', NULL, 'oV', NULL, '2026-10-05 08:00', 'REGISTRATUR', '2026-09-01 08:20', NULL, NULL),
  (-30000005, -20000004, '77', '20', '1', NULL, NULL, '201', '1', 1, 'Website-Relaunch', NULL, 'oV', NULL, '2026-09-15 15:00', 'REGISTRATUR', '2025-11-20 14:05', NULL, NULL),
  (-30000006, -20000005, '72c', '20', '1', NULL, NULL, '201', '1', 1, 'Netzwerkerneuerung Standort Nord', NULL, 'oV', NULL, '2026-10-12 11:00', 'REGISTRATUR', '2026-10-12 11:05', NULL, NULL),
  (-30000007, -20000006, '72c', '00', '2', '1', NULL, '0021', '1', 1, 'Büromöbel 2019', NULL, 'zdA', NULL, '2021-12-20 16:00', 'REGISTRATUR', '2019-03-04 09:05', 'V', 'V');

-- Dokumente (Aktenzeichen ORG-AKTE/VORG/DOKUNR); DATEIPFAD/DATEINAME verweisen auf die Datei
INSERT INTO dsv_doku (lfd_doknr, lfd_aktenr, lfd_vorgnr, org, hgruppe, gruppe, ugruppe, tglieder, akte, vorg, vorg_nr, dokunr, betreff, bemerkung, eai_kennung, status, klasse, autor, bearbeiter, erstdatum, datum_letzteverf, form_pe, dateiname, dateipfad, fremdnr, erst_registrator, erst_regdatum, geheim) VALUES
  (9700000001, -20000001, -30000001, '72c', '00', '2', '2', 'NB', '0022.NB', '1', 1, 1, 'Leistungsbeschreibung Notebooks', NULL, 'I', 'oV', 'OF', 'BEARBEITER', NULL, '2026-10-01', '2026-10-01 09:00', 'EL', 'Leistungsbeschreibung.docx', '\\fileserver\beschaffung\2026\notebooks', NULL, 'REGISTRATUR', '2026-10-01 09:00', 'N'),
  (9700000002, -20000001, -30000001, '72c', '00', '2', '2', 'NB', '0022.NB', '1', 1, 2, 'Angebot Beispiel GmbH', 'Angebotssumme 23.450 EUR', 'E', 'oV', 'OF', NULL, NULL, '2026-10-20', '2026-10-20 10:00', 'EL', '2026-0815.pdf', 'https://example.org/angebote', 'V-2026-0815', 'REGISTRATUR', '2026-10-20 10:00', 'N'),
  (9700000003, -20000001, -30000001, '72c', '00', '2', '2', 'NB', '0022.NB', '1', 1, 3, 'Vergabevermerk (vertraulich)', NULL, 'I', 'oV', 'NF', 'BEARBEITER', NULL, '2026-10-22', '2026-10-22 14:00', 'EL', 'Vergabevermerk.docx', '\\fileserver\beschaffung\2026\notebooks', NULL, 'BEARBEITER', '2026-10-22 14:00', 'J'),
  (9700000004, -20000001, -30000002, '72c', '00', '2', '2', 'NB', '0022.NB', '2', 2, 1, 'Rahmenvertrag Zubehör', NULL, 'A', 'zdA', 'OF', 'BEARBEITER', NULL, '2026-03-01', '2026-03-01 12:00', 'P', NULL, NULL, NULL, 'REGISTRATUR', '2026-03-01 12:00', 'N'),
  (9700000005, -20000002, -30000003, '11', '00', '3', NULL, NULL, '003', '1', 1, 1, 'Angebot Vertragsverlängerung', NULL, 'E', 'oV', 'OF', NULL, NULL, '2026-10-10', '2026-10-10 09:00', 'EL', 'Verlaengerung.pdf', 'https://intranet.example/liegenschaften/lager-sued', 'LS-17/26', 'REGISTRATUR', '2026-10-10 09:00', 'N'),
  (9700000006, -20000003, -30000004, '12', '10', '1', '1', NULL, '1011', 'IT-2026-03', 1, 1, 'Bewerbung Max Mustermann', NULL, 'E', 'oV', 'NF', NULL, NULL, '2026-10-05', '2026-10-05 08:00', 'EL', 'Mustermann_Max.pdf', '\\fileserver\personal\bewerbungen\IT-2026-03', NULL, 'REGISTRATUR', '2026-10-05 08:00', 'J'),
  (9700000007, -20000004, -30000005, '77', '20', '1', NULL, NULL, '201', '1', 1, 1, 'Protokoll Kick-off', NULL, 'I', 'oV', 'OF', 'REFERAT77', NULL, '2026-09-15', '2026-09-15 15:00', 'EL', 'kick-off', 'https://wiki.example/projekte/website-relaunch', NULL, 'REFERAT77', '2026-09-15 15:00', 'N'),
  (9700000008, -20000005, -30000006, '72c', '20', '1', NULL, NULL, '201', '1', 1, 1, 'Netzplan Standort Nord', NULL, 'I', 'oV', 'OF', 'BEARBEITER', NULL, '2026-10-12', '2026-10-12 11:00', 'EL', 'Netzplan_Nord.vsdx', '\\fileserver\it\netze\nord', NULL, 'BEARBEITER', '2026-10-12 11:00', 'N'),
  (9700000009, -20000006, -30000007, '72c', '00', '2', '1', NULL, '0021', '1', 1, 1, 'Lieferschein Büromöbel', NULL, 'E', 'zdA', 'OF', NULL, NULL, '2019-04-02', '2019-04-02 10:00', 'P', NULL, NULL, NULL, 'REGISTRATUR', '2019-04-02 10:00', 'N');

-- Geheime Dokumente: zusätzlich berechtigte Sachbearbeiter
INSERT INTO dsv_berechtigte_sb (lfd_doknr, user_id) VALUES (9700000003, 'BEARBEITER'), (9700000006, 'REFERAT12');

-- Anlagen: Freitext oder Verweis auf ein anderes registriertes Dokument
INSERT INTO dsv_anla (lfd_doknr, anlanr, org, akte, vorg, dokunr, lfd_dokanlnr, akte_o, vorg_o, dokunr_o, text) VALUES
  (9700000002, 1, '72c', '0022.NB', '1', 2, NULL, NULL, NULL, NULL, 'Preisblatt'),
  (9700000002, 2, '72c', '0022.NB', '1', 2, 9700000001, '0022.NB', '1', 1, 'Bezug: Leistungsbeschreibung');

-- Adressen und Zuordnung zu Dokumenten (Einsender/Empfänger mit Geschäftszeichen)
INSERT INTO dsv_adressen (adr_nr, kuerzel, bezeichnung_1, bezeichnung_2, bezeichnung_3, anrede, strasse, hausnummer, plz, ort, land, gueltig_ab, oeffentlich, obsolet, telnr) VALUES
  (53001, 'BSPGMBH', 'Beispiel GmbH', 'Vertrieb', NULL, 'Firma', 'Industriestraße', '5', '12345', 'Musterstadt', 'D', '2020-01-01', 'J', 'N', '0123 4567'),
  (53002, 'MOEBNORD', 'Möbelwerk Nord AG', NULL, NULL, 'Firma', 'Hafenweg', '12', '23456', 'Hafenstadt', 'D', '2018-05-01', 'J', 'N', NULL),
  (53003, 'IMMOSUED', 'Immobilien Süd KG', NULL, NULL, 'Firma', 'Marktplatz', '1', '12345', 'Musterstadt', 'D', '2015-01-01', 'J', 'N', NULL),
  (53004, 'MUSTERM', 'Mustermann', 'Max', NULL, 'Herr', 'Lindenweg', '3', '12345', 'Musterstadt', 'D', '2026-10-05', 'N', 'N', NULL);
INSERT INTO dsv_doku_adr (lfd_doknr, adr_nr, eingdatum, eins_gz) VALUES
  (9700000002, 53001, '2026-10-20', 'V-2026-0815'),
  (9700000004, 53002, '2026-03-01', NULL),
  (9700000005, 53003, '2026-10-10', 'LS-17/26'),
  (9700000006, 53004, '2026-10-05', NULL),
  (9700000009, 53002, '2019-04-02', 'LS-2019-114');

-- Stichworte (Großbuchstaben), Synonyme, Zuordnung zu Dokumenten (D) und Aktenplanpositionen (P)
INSERT INTO dsv_stichworte (stwnr, stichwort) VALUES
  (771001, 'BESCHAFFUNG'), (771002, 'EINKAUF'), (771003, 'VERTRAG'), (771004, 'KONTRAKT'),
  (771005, 'IT'), (771006, 'BEWERBUNG'), (771007, 'VERGABE'), (771008, 'NETZWERK');
INSERT INTO dsv_stwsyno (stichwnr, synonr) VALUES (771001, 771002), (771003, 771004);
INSERT INTO dsv_stwzuo (stwnr, lfd_schrnr, schriftgutlapart) VALUES
  (771001, 9700000001, 'D'), (771005, 9700000001, 'D'),
  (771001, 9700000002, 'D'), (771007, 9700000002, 'D'),
  (771003, 9700000004, 'D'),
  (771006, 9700000006, 'D'),
  (771008, 9700000008, 'D'), (771005, 9700000008, 'D'),
  (771001, -10000002, 'P');

-- Anforderungen / Wiedervorlagen (UMFANG A/V/D, LFD_SCHRNR = lfd. Nummer des Schriftguts)
INSERT INTO dsv_anforderungen (lfd_schrnr, umfang, org, akte, hgruppe, gruppe, ugruppe, tglieder, vorg, vorg_nr, dokunr, bearbeiter, anf_datum, wv_datum, feste_wv, bemerkung, registrator, erst_regdatum) VALUES
  (-30000001, 'V', '72c', '0022.NB', '00', '2', '2', 'NB', '1', 1, NULL, 'BEARBEITER', CURRENT_DATE - 10, CURRENT_DATE - 2, 'N', 'Angebote prüfen und Vergabevermerk schreiben', 'BEARBEITER', CURRENT_DATE - 10),
  (-20000002, 'A', '11', '003', '00', '3', NULL, NULL, NULL, NULL, NULL, 'REGISTRATUR', CURRENT_DATE - 3, CURRENT_DATE + 14, 'N', 'Entscheidung zur Vertragsverlängerung vorbereiten', 'REGISTRATUR', CURRENT_DATE - 3),
  (-30000004, 'V', '12', '1011', '10', '1', '1', NULL, 'IT-2026-03', 1, NULL, 'REFERAT12', CURRENT_DATE - 1, CURRENT_DATE, 'N', 'Vorstellungsgespräche terminieren', 'REFERAT12', CURRENT_DATE - 1),
  (-20000005, 'A', '72c', '201', '20', '1', NULL, NULL, NULL, NULL, NULL, 'BEARBEITER', CURRENT_DATE, CURRENT_DATE + 7, 'N', 'Angebote für Netzwerkkomponenten einholen', 'BEARBEITER', CURRENT_DATE);
