-- Altschema der DSV-Anwendung für PostgreSQL (lokale Entwicklung)
-- Abgeleitet aus history/DSV.sql (Oracle). Produktiv wird das Schema per ora2pg erzeugt und befüllt;
-- Namen klein, Typen wie ora2pg: VARCHAR2→varchar, NUMBER(p,0)→smallint/integer/bigint, DATE→timestamp(0), LONG→text.
-- Views, Package und Prozedur werden bewusst nicht übernommen – ihre Logik steckt im Backend.

CREATE SEQUENCE dsv_seq_adr INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 53879;
CREATE SEQUENCE dsv_seq_akte INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -20078996;
CREATE SEQUENCE dsv_seq_anf INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 1;
CREATE SEQUENCE dsv_seq_doku INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 9700489556;
CREATE SEQUENCE dsv_seq_h1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 1933513;
CREATE SEQUENCE dsv_seq_lap INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -10040571;
CREATE SEQUENCE dsv_seq_stwt INCREMENT BY 1 MINVALUE 1 NO MAXVALUE START WITH 771043;
CREATE SEQUENCE dsv_seq_stwt_min INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -18;
CREATE SEQUENCE dsv_seq_umr INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -40213614;
CREATE SEQUENCE dsv_seq_vert INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -10;
CREATE SEQUENCE dsv_seq_vorg INCREMENT BY -1 MINVALUE -9223372036854775808 MAXVALUE -1 START WITH -30409644;

CREATE TABLE ap_gwd (
  az varchar(1000),
  a0 varchar(1000),
  tz0 varchar(1000),
  a1 varchar(1000),
  tz1 varchar(1000),
  a2 varchar(1000),
  tz2 varchar(1000),
  a3 varchar(1000),
  tz3 varchar(1000),
  a4 varchar(1000),
  tz4 varchar(1000),
  a5 varchar(1000),
  tz5 varchar(1000),
  a6 varchar(1000),
  tz6 varchar(1000),
  a7 varchar(1000),
  tz7 varchar(1000),
  a8 varchar(1000),
  tz8 varchar(1000),
  a9 varchar(1000),
  tz9 varchar(1000),
  a10 varchar(1000),
  tz10 varchar(1000),
  a11 varchar(1000),
  betreff varchar(1000)
);
CREATE TABLE dsv_ablagen (
  user_id varchar(30),
  registriert varchar(255),
  nicht_registriert varchar(255)
);
CREATE TABLE dsv_adressen (
  adr_nr bigint,
  kuerzel varchar(10),
  bezeichnung_1 varchar(30),
  bezeichnung_2 varchar(30),
  bezeichnung_3 varchar(30),
  anrede varchar(30),
  strasse varchar(65),
  hausnummer varchar(10),
  plz varchar(7),
  ort varchar(65),
  land varchar(30),
  gueltig_ab timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  oeffentlich varchar(1) DEFAULT 'N',
  obsolet varchar(1) DEFAULT 'N',
  telnr varchar(20),
  gebdatum timestamp(0)
);
CREATE TABLE dsv_akte (
  lfd_aktenr bigint,
  lfd_apnr bigint,
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  betreff varchar(255),
  bemerkung varchar(255),
  status varchar(7),
  bearbeiter varchar(30),
  erst_registrator varchar(30),
  erst_reg_vertreter varchar(30),
  erst_regdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  aend_registrator varchar(30),
  aend_reg_vertreter varchar(30),
  aend_regdatum timestamp(0)
);
CREATE TABLE dsv_altap (
  lfd_apnr bigint,
  akte_alt varchar(25),
  betreff varchar(255)
);
CREATE TABLE dsv_anforderungen (
  lfd_schrnr bigint,
  umfang varchar(1),
  org varchar(3),
  akte varchar(25),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  vorg varchar(40),
  dokunr integer,
  bearbeiter varchar(30),
  anf_datum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  wv_datum timestamp(0),
  feste_wv varchar(1) DEFAULT 'N',
  bemerkung varchar(255),
  registrator varchar(30),
  reg_vertreter varchar(30),
  erst_regdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  vorg_nr bigint
);
CREATE TABLE dsv_anla (
  lfd_doknr bigint,
  anlanr integer,
  org varchar(3),
  akte varchar(25),
  vorg varchar(40),
  dokunr integer,
  lfd_dokanlnr bigint,
  akte_o varchar(25),
  vorg_o varchar(40),
  dokunr_o integer,
  text varchar(255)
);
CREATE TABLE dsv_benutzerprofil (
  user_id varchar(30),
  kennung varchar(30),
  voreinst_org varchar(3),
  klasse_reg varchar(1),
  klasse_sb varchar(1),
  klasse_sy varchar(1),
  klasse_st varchar(1),
  klasse_ds varchar(1),
  klasse_ns varchar(1),
  konfiguration varchar(2),
  ben_eai varchar(1),
  ben_klasse varchar(2),
  ben_umfang varchar(1)
);
CREATE TABLE dsv_berechtigte_sb (
  lfd_doknr bigint,
  user_id varchar(30)
);
CREATE TABLE dsv_doc_name_list (
  docuname varchar(80),
  user_pid bigint
);
CREATE TABLE dsv_doku (
  lfd_doknr bigint,
  lfd_aktenr numeric(10,1),
  lfd_vorgnr bigint,
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  vorg varchar(40),
  dokunr integer,
  betreff varchar(2000),
  bemerkung varchar(255),
  eai_kennung varchar(1),
  status varchar(7),
  klasse varchar(2),
  autor varchar(30),
  bearbeiter varchar(30),
  erstdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  datum_letzteverf timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  ende_aufbfrist timestamp(0),
  form varchar(2),
  form_pe varchar(2) DEFAULT 'P',
  dateiname varchar(80),
  dateipfad varchar(255),
  orig_vern varchar(1) DEFAULT 'N',
  umreg_doknr bigint,
  u_org varchar(3),
  u_akte varchar(25),
  u_vorg varchar(40),
  u_dokunr integer,
  fremdnr varchar(40),
  erst_registrator varchar(30),
  erst_reg_vertreter varchar(30),
  erst_regdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  aend_registrator varchar(30),
  aend_reg_vertreter varchar(30),
  aend_regdatum timestamp(0),
  vorg_nr bigint,
  geheim varchar(1) DEFAULT 'N'
);
CREATE TABLE dsv_doku_adr (
  lfd_doknr bigint,
  adr_nr bigint,
  eingdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  eins_gz varchar(30)
);
CREATE TABLE dsv_doku0104 (
  lfd_doknr bigint,
  lfd_aktenr numeric(10,1),
  lfd_vorgnr bigint,
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  vorg varchar(40),
  dokunr integer,
  betreff varchar(2000),
  bemerkung varchar(255),
  eai_kennung varchar(1),
  status varchar(7),
  klasse varchar(2),
  autor varchar(30),
  bearbeiter varchar(30),
  erstdatum timestamp(0),
  datum_letzteverf timestamp(0),
  ende_aufbfrist timestamp(0),
  form varchar(2),
  form_pe varchar(2),
  dateiname varchar(80),
  dateipfad varchar(255),
  orig_vern varchar(1),
  umreg_doknr bigint,
  u_org varchar(3),
  u_akte varchar(25),
  u_vorg varchar(40),
  u_dokunr integer,
  fremdnr varchar(40),
  erst_registrator varchar(30),
  erst_reg_vertreter varchar(30),
  erst_regdatum timestamp(0),
  aend_registrator varchar(30),
  aend_reg_vertreter varchar(30),
  aend_regdatum timestamp(0),
  vorg_nr bigint,
  geheim varchar(1)
);
CREATE TABLE dsv_dummy (
  dummy char(1)
);
CREATE TABLE dsv_forms (
  formnr smallint,
  titel varchar(45),
  version varchar(10),
  aufruf varchar(8),
  buttonlabel varchar(20),
  buttonname varchar(12)
);
CREATE TABLE dsv_gvp (
  bearbeiter varchar(30),
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  recht varchar(1) DEFAULT 'L',
  bemerkung varchar(255)
);
CREATE TABLE dsv_help (
  help_form varchar(50),
  help_block varchar(25),
  help_field varchar(25),
  help_text text
);
CREATE TABLE dsv_hg (
  hgruppe varchar(2),
  betreff varchar(255),
  hinweis varchar(255),
  lfd_apnr bigint
);
CREATE TABLE dsv_h1 (
  h1_zaehler bigint,
  lfd_schrnr bigint,
  lfd_vorgnr bigint,
  lfd_aktenr bigint
);
CREATE TABLE dsv_h2 (
  h2_zaehler bigint,
  lfd_schrnr bigint
);
CREATE TABLE dsv_konfiguration (
  formnr smallint,
  klasse_reg varchar(1),
  klasse_sb varchar(1),
  klasse_sy varchar(1),
  klasse_st varchar(1),
  klasse_ds varchar(1),
  klasse_ns varchar(1),
  konfiguration varchar(2)
);
CREATE TABLE dsv_lap (
  lfd_apnr bigint,
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  betreff varchar(255),
  aufbfrist bigint,
  hinweis varchar(255)
);
CREATE TABLE dsv_lov_eai (
  eai varchar(1),
  name varchar(7)
);
CREATE TABLE dsv_lov_einaus (
  einaus varchar(1),
  name varchar(3)
);
CREATE TABLE dsv_lov_form (
  form varchar(2),
  name varchar(18)
);
CREATE TABLE dsv_lov_jn (
  jn varchar(1),
  name varchar(4)
);
CREATE TABLE dsv_lov_klasse (
  klasse varchar(2),
  name varchar(20)
);
CREATE TABLE dsv_lov_konfiguration (
  konfiguration varchar(2),
  name varchar(40)
);
CREATE TABLE dsv_lov_meldart (
  meldart varchar(1),
  name varchar(20)
);
CREATE TABLE dsv_lov_org (
  org varchar(3),
  name varchar(50)
);
CREATE TABLE dsv_lov_rechte (
  recht varchar(1),
  name varchar(9)
);
CREATE TABLE dsv_lov_schriftgutart (
  schriftgutart varchar(1),
  name varchar(9)
);
CREATE TABLE dsv_lov_schriftgutlapart (
  schriftgutlapart varchar(1),
  name varchar(9)
);
CREATE TABLE dsv_lov_status (
  status varchar(7),
  name varchar(20)
);
CREATE TABLE dsv_meldungen (
  nummer varchar(10),
  text varchar(255),
  einaus varchar(1),
  art varchar(1)
);
CREATE TABLE dsv_protokoll (
  zeit timestamp(0),
  user_id varchar(30),
  nummer varchar(10),
  art varchar(1),
  bezug varchar(100),
  bemerkungen varchar(255)
);
CREATE TABLE dsv_protokoll_alt (
  zeit timestamp(0),
  user_id varchar(30),
  nummer varchar(10),
  art varchar(1),
  bezug varchar(100),
  bemerkungen varchar(255)
);
CREATE TABLE dsv_rep (
  r_name varchar(8),
  r_typ varchar(1),
  r_bezeichn varchar(50)
);
CREATE TABLE dsv_std_vorlageweg_akte (
  org varchar(3),
  akte varchar(25),
  position smallint,
  bearbeiter varchar(30)
);
CREATE TABLE dsv_std_vorlageweg_vorg (
  org varchar(3),
  akte varchar(25),
  vorg varchar(40),
  position smallint,
  bearbeiter varchar(30)
);
CREATE TABLE dsv_stichworte (
  stwnr bigint,
  stichwort varchar(50)
);
CREATE TABLE dsv_stopworte (
  stopwort varchar(30)
);
CREATE TABLE dsv_stwsyno (
  stichwnr bigint,
  synonr bigint
);
CREATE TABLE dsv_stwzuo (
  stwnr bigint,
  lfd_schrnr bigint,
  schriftgutlapart varchar(1)
);
CREATE TABLE dsv_systemprofil (
  name_lang varchar(60),
  protokolldatei varchar(255),
  protokollstatus varchar(3),
  ue_user varchar(30),
  ue_password varchar(10),
  hilfe_pfad varchar(255),
  dsv_formpfad varchar(255),
  dsv_ausgangspfad varchar(255),
  scratch_directory varchar(255),
  sonderzeichen varchar(120),
  stw_option_wortende varchar(4),
  stw_option_zahlen varchar(4),
  vorg_sort_num varchar(1) DEFAULT 'A',
  vorg_von_bis_num varchar(1) DEFAULT 'A',
  rch_datum varchar(30),
  bk_system varchar(30),
  barcode3 varchar(30),
  barcode_jn varchar(1),
  local_pfad varchar(255),
  sys_profil_eai varchar(1),
  sys_profil_klasse varchar(2),
  sys_profil_umfang varchar(1),
  gz_gross_jn varchar(1) DEFAULT 'N',
  bc_spender_jn varchar(1) DEFAULT 'N'
);
CREATE TABLE dsv_systemprofil_ceo (
  name_lang varchar(60),
  protokolldatei varchar(255),
  protokollstatus varchar(3),
  ue_user varchar(30),
  ue_password varchar(10),
  hilfe_pfad varchar(255),
  dsv_formpfad varchar(255),
  dsv_ausgangspfad varchar(255),
  scratch_directory varchar(255)
);
CREATE TABLE dsv_tmp_ap_stw (
  akte varchar(25),
  ok varchar(1),
  bemerkung varchar(2000)
);
CREATE TABLE dsv_tmp_stw_list (
  stichwort varchar(50),
  user_pid bigint
);
CREATE TABLE dsv_umregistrierungen (
  v_schrnr bigint,
  v_org varchar(3),
  v_akte varchar(25),
  v_hgruppe varchar(2),
  v_gruppe varchar(1),
  v_ugruppe varchar(1),
  v_tglieder varchar(20),
  v_vorg varchar(40),
  v_dokunr bigint,
  n_schrnr bigint,
  n_org varchar(3),
  n_akte varchar(25),
  n_hgruppe varchar(2),
  n_gruppe varchar(1),
  n_ugruppe varchar(1),
  n_tglieder varchar(20),
  n_vorg varchar(40),
  n_dokunr bigint,
  schriftgutart varchar(1),
  registrator varchar(30),
  erst_reg_vertreter varchar(30),
  umreg_datum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  bemerkung varchar(255)
);
CREATE TABLE dsv_verteiler (
  vert_nr bigint,
  adr_nr bigint
);
CREATE TABLE dsv_vertnamen (
  vert_nr bigint,
  vert varchar(25)
);
CREATE TABLE dsv_vertretung (
  registrator varchar(30),
  vertreter varchar(30)
);
CREATE TABLE dsv_vorg (
  lfd_vorgnr bigint,
  lfd_aktenr bigint,
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  vorg varchar(40),
  betreff varchar(2000),
  bemerkung varchar(255),
  status varchar(7),
  bearbeiter varchar(30),
  datum_letzteverf timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  erst_registrator varchar(30),
  erst_reg_vertreter varchar(30),
  erst_regdatum timestamp(0) DEFAULT LOCALTIMESTAMP(0),
  aend_registrator varchar(30),
  aend_reg_vertreter varchar(30),
  aend_regdatum timestamp(0),
  vorschl_beh varchar(1),
  entsch_archiv varchar(1),
  vorg_nr bigint
);
CREATE TABLE dsv_vorg0104 (
  lfd_vorgnr bigint,
  lfd_aktenr bigint,
  org varchar(3),
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  vorg varchar(40),
  betreff varchar(2000),
  bemerkung varchar(255),
  status varchar(7),
  bearbeiter varchar(30),
  datum_letzteverf timestamp(0),
  erst_registrator varchar(30),
  erst_reg_vertreter varchar(30),
  erst_regdatum timestamp(0),
  aend_registrator varchar(30),
  aend_reg_vertreter varchar(30),
  aend_regdatum timestamp(0),
  vorschl_beh varchar(1),
  entsch_archiv varchar(1),
  vorg_nr bigint
);
CREATE TABLE dsv_weitere_ablagen (
  user_id varchar(30),
  registriert varchar(255)
);
CREATE TABLE lap (
  lfd_apnr bigint,
  hgruppe varchar(2),
  gruppe varchar(1),
  ugruppe varchar(1),
  tglieder varchar(20),
  akte varchar(25),
  betreff varchar(255),
  aufbfrist bigint,
  hinweis varchar(255)
);
CREATE TABLE tmp_minumreg (
  minnumber numeric
);
CREATE TABLE user_vwr_table (
  alt varchar(20),
  neu varchar(40)
);

ALTER TABLE dsv_ablagen ALTER COLUMN registriert SET NOT NULL;
ALTER TABLE dsv_ablagen ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE dsv_adressen ADD UNIQUE (kuerzel);
ALTER TABLE dsv_adressen ADD CONSTRAINT pkadressen PRIMARY KEY (adr_nr);
ALTER TABLE dsv_adressen ALTER COLUMN oeffentlich SET NOT NULL;
ALTER TABLE dsv_adressen ALTER COLUMN gueltig_ab SET NOT NULL;
ALTER TABLE dsv_adressen ALTER COLUMN bezeichnung_1 SET NOT NULL;
ALTER TABLE dsv_akte ADD CONSTRAINT uqorgakte UNIQUE (org, akte);
ALTER TABLE dsv_akte ADD CONSTRAINT pkakte PRIMARY KEY (lfd_aktenr);
ALTER TABLE dsv_akte ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN erst_registrator SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN status SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_akte ALTER COLUMN lfd_apnr SET NOT NULL;
ALTER TABLE dsv_altap ADD CONSTRAINT pkaltap PRIMARY KEY (lfd_apnr, akte_alt);
ALTER TABLE dsv_altap ALTER COLUMN akte_alt SET NOT NULL;
ALTER TABLE dsv_anforderungen ADD CONSTRAINT pkanforderung PRIMARY KEY (lfd_schrnr, wv_datum);
ALTER TABLE dsv_anforderungen ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN registrator SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN feste_wv SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN wv_datum SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN anf_datum SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN bearbeiter SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN umfang SET NOT NULL;
ALTER TABLE dsv_anforderungen ALTER COLUMN lfd_schrnr SET NOT NULL;
ALTER TABLE dsv_anla ADD CONSTRAINT pkanla PRIMARY KEY (lfd_doknr, anlanr);
ALTER TABLE dsv_anla ALTER COLUMN dokunr SET NOT NULL;
ALTER TABLE dsv_anla ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_anla ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_anla ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_anla ALTER COLUMN anlanr SET NOT NULL;
ALTER TABLE dsv_anla ALTER COLUMN lfd_doknr SET NOT NULL;
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT uqkennung UNIQUE (kennung);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT pkbenutzer PRIMARY KEY (user_id);
ALTER TABLE dsv_benutzerprofil ALTER COLUMN kennung SET NOT NULL;
ALTER TABLE dsv_berechtigte_sb ADD CONSTRAINT pk_ber_sb PRIMARY KEY (lfd_doknr, user_id);
ALTER TABLE dsv_berechtigte_sb ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE dsv_berechtigte_sb ALTER COLUMN lfd_doknr SET NOT NULL;
ALTER TABLE dsv_doku ADD CONSTRAINT uqdoku2 UNIQUE (org, akte, vorg, dokunr);
ALTER TABLE dsv_doku ADD CONSTRAINT pkdokunr PRIMARY KEY (lfd_doknr);
ALTER TABLE dsv_doku ADD CONSTRAINT ch_doku_geheim CHECK (geheim in ('J','N'));
ALTER TABLE dsv_doku ALTER COLUMN geheim SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN vorg_nr SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN erst_registrator SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN form_pe SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN datum_letzteverf SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN erstdatum SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN status SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN eai_kennung SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN betreff SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN dokunr SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN lfd_vorgnr SET NOT NULL;
ALTER TABLE dsv_doku ALTER COLUMN lfd_aktenr SET NOT NULL;
ALTER TABLE dsv_doku_adr ADD CONSTRAINT pkdoku_adr PRIMARY KEY (lfd_doknr, adr_nr);
ALTER TABLE dsv_doku_adr ALTER COLUMN adr_nr SET NOT NULL;
ALTER TABLE dsv_doku_adr ALTER COLUMN lfd_doknr SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN geheim SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN vorg_nr SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN erst_registrator SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN form_pe SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN datum_letzteverf SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN erstdatum SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN status SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN eai_kennung SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN betreff SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN dokunr SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN lfd_vorgnr SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN lfd_aktenr SET NOT NULL;
ALTER TABLE dsv_doku0104 ALTER COLUMN lfd_doknr SET NOT NULL;
ALTER TABLE dsv_forms ADD CONSTRAINT pkforms PRIMARY KEY (formnr);
-- NULLS NOT DISTINCT: Oracle wertet bei zusammengesetzten Schlüsseln NULL-Spalten als gleich (doppelte Einträge mit leerem
-- Aktenplan-Teil sind dort verboten); Postgres würde sie standardmäßig zulassen
ALTER TABLE dsv_gvp ADD CONSTRAINT uqgvp UNIQUE NULLS NOT DISTINCT (bearbeiter, org, hgruppe, gruppe, ugruppe, tglieder);
ALTER TABLE dsv_gvp ALTER COLUMN recht SET NOT NULL;
ALTER TABLE dsv_gvp ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_gvp ALTER COLUMN bearbeiter SET NOT NULL;
ALTER TABLE dsv_hg ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_konfiguration ADD CONSTRAINT pkkonf PRIMARY KEY (formnr, konfiguration);
ALTER TABLE dsv_konfiguration ALTER COLUMN formnr SET NOT NULL;
ALTER TABLE dsv_lap ADD CONSTRAINT chklapakte CHECK (akte = CASE WHEN tglieder IS NULL THEN concat(hgruppe, gruppe, ugruppe) ELSE concat(hgruppe, gruppe, ugruppe, '.', tglieder) END);
ALTER TABLE dsv_lap ADD CONSTRAINT uqlapakte2 UNIQUE NULLS NOT DISTINCT (hgruppe, gruppe, ugruppe, tglieder);
ALTER TABLE dsv_lap ADD UNIQUE (akte);
ALTER TABLE dsv_lap ADD CONSTRAINT pklap PRIMARY KEY (lfd_apnr);
ALTER TABLE dsv_lap ADD CONSTRAINT chktglieder CHECK (tglieder=upper(tglieder));
ALTER TABLE dsv_lap ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_lap ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_lov_eai ADD CONSTRAINT pkeai PRIMARY KEY (eai);
ALTER TABLE dsv_lov_einaus ADD CONSTRAINT pkeinaus PRIMARY KEY (einaus);
ALTER TABLE dsv_lov_form ADD CONSTRAINT pkform PRIMARY KEY (form);
ALTER TABLE dsv_lov_jn ADD CONSTRAINT pkjn PRIMARY KEY (jn);
ALTER TABLE dsv_lov_klasse ADD UNIQUE (name);
ALTER TABLE dsv_lov_klasse ADD CONSTRAINT pkklasse PRIMARY KEY (klasse);
ALTER TABLE dsv_lov_klasse ALTER COLUMN name SET NOT NULL;
ALTER TABLE dsv_lov_konfiguration ADD CONSTRAINT pkkonfiguration PRIMARY KEY (konfiguration);
ALTER TABLE dsv_lov_meldart ADD CONSTRAINT pkmeldart PRIMARY KEY (meldart);
ALTER TABLE dsv_lov_org ADD CONSTRAINT pkorg PRIMARY KEY (org);
ALTER TABLE dsv_lov_rechte ADD CONSTRAINT pkrechte PRIMARY KEY (recht);
ALTER TABLE dsv_lov_rechte ALTER COLUMN recht SET NOT NULL;
ALTER TABLE dsv_lov_schriftgutart ADD CONSTRAINT pkschriftgutart PRIMARY KEY (schriftgutart);
ALTER TABLE dsv_lov_schriftgutlapart ADD CONSTRAINT pkschriftgutlapart PRIMARY KEY (schriftgutlapart);
ALTER TABLE dsv_lov_status ADD CONSTRAINT pkstatus PRIMARY KEY (status);
ALTER TABLE dsv_meldungen ADD CONSTRAINT pkmeldungen PRIMARY KEY (nummer);
ALTER TABLE dsv_rep ALTER COLUMN r_typ SET NOT NULL;
ALTER TABLE dsv_rep ALTER COLUMN r_name SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_akte ADD CONSTRAINT pkstdvorlagewegakte PRIMARY KEY (org, akte, position);
ALTER TABLE dsv_std_vorlageweg_akte ALTER COLUMN bearbeiter SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_akte ALTER COLUMN position SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_akte ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_akte ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_vorg ADD CONSTRAINT pkstdvorlagewegvorgang PRIMARY KEY (org, akte, vorg, position);
ALTER TABLE dsv_std_vorlageweg_vorg ALTER COLUMN bearbeiter SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_vorg ALTER COLUMN position SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_vorg ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_vorg ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_std_vorlageweg_vorg ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_stichworte ADD CONSTRAINT chkstichwort CHECK (stichwort=upper(stichwort));
ALTER TABLE dsv_stichworte ADD UNIQUE (stichwort);
ALTER TABLE dsv_stichworte ADD CONSTRAINT pkstichworte PRIMARY KEY (stwnr);
ALTER TABLE dsv_stichworte ALTER COLUMN stichwort SET NOT NULL;
ALTER TABLE dsv_stopworte ADD CONSTRAINT chkstopwort CHECK (stopwort=upper(stopwort));
ALTER TABLE dsv_stopworte ADD CONSTRAINT pkstopwort PRIMARY KEY (stopwort);
ALTER TABLE dsv_stwsyno ADD CONSTRAINT pkstwsyno PRIMARY KEY (stichwnr, synonr);
ALTER TABLE dsv_stwzuo ADD CONSTRAINT pkstwzuo PRIMARY KEY (stwnr, lfd_schrnr);
ALTER TABLE dsv_stwzuo ALTER COLUMN schriftgutlapart SET NOT NULL;
ALTER TABLE dsv_systemprofil ADD CONSTRAINT chvorg_von_bis_num CHECK (vorg_von_bis_num in ('A','N'));
ALTER TABLE dsv_systemprofil ADD CONSTRAINT chvorg_sort_num CHECK (vorg_sort_num in ('A','N'));
ALTER TABLE dsv_systemprofil ALTER COLUMN bc_spender_jn SET NOT NULL;
ALTER TABLE dsv_systemprofil ALTER COLUMN gz_gross_jn SET NOT NULL;
ALTER TABLE dsv_systemprofil ALTER COLUMN sys_profil_umfang SET NOT NULL;
ALTER TABLE dsv_systemprofil ALTER COLUMN sys_profil_eai SET NOT NULL;
ALTER TABLE dsv_tmp_ap_stw ADD PRIMARY KEY (akte);
ALTER TABLE dsv_umregistrierungen ADD CONSTRAINT pkumregistrierungen PRIMARY KEY (v_schrnr, n_schrnr);
ALTER TABLE dsv_umregistrierungen ALTER COLUMN umreg_datum SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN registrator SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN schriftgutart SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN n_org SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN n_schrnr SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN v_org SET NOT NULL;
ALTER TABLE dsv_umregistrierungen ALTER COLUMN v_schrnr SET NOT NULL;
ALTER TABLE dsv_verteiler ADD CONSTRAINT pkverteiler PRIMARY KEY (vert_nr, adr_nr);
ALTER TABLE dsv_verteiler ALTER COLUMN adr_nr SET NOT NULL;
ALTER TABLE dsv_verteiler ALTER COLUMN vert_nr SET NOT NULL;
ALTER TABLE dsv_vertnamen ADD UNIQUE (vert);
ALTER TABLE dsv_vertnamen ADD CONSTRAINT pkvertname PRIMARY KEY (vert_nr);
ALTER TABLE dsv_vertnamen ALTER COLUMN vert SET NOT NULL;
ALTER TABLE dsv_vertretung ADD CONSTRAINT pkvertretung PRIMARY KEY (registrator, vertreter);
ALTER TABLE dsv_vorg ADD CONSTRAINT uqvorg2 UNIQUE (org, akte, vorg);
-- dsv_vorg: PRIMARY KEY (lfd_vorgnr) ist in Oracle deaktiviert, der eindeutige Index PKVORG besteht aber weiter
-- und erzwingt die Eindeutigkeit (NULL erlaubt) – genau so nachgebildet
CREATE UNIQUE INDEX pkvorg ON dsv_vorg (lfd_vorgnr);
ALTER TABLE dsv_vorg ADD CONSTRAINT uqvorg3 UNIQUE (org, akte, vorg_nr);
ALTER TABLE dsv_vorg ADD CONSTRAINT chkvorg CHECK (vorg=upper(vorg));
ALTER TABLE dsv_vorg ADD CONSTRAINT chentsch_archiv CHECK ((entsch_archiv is null) or (entsch_archiv in ('A','V')));
ALTER TABLE dsv_vorg ADD CONSTRAINT chvorschl_beh CHECK ((vorschl_beh is null) or (vorschl_beh in ('A','V')));
ALTER TABLE dsv_vorg ADD CONSTRAINT vorg_ohne_leerzeichen CHECK (vorg = ltrim (vorg));
ALTER TABLE dsv_vorg ALTER COLUMN vorg_nr SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN erst_registrator SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN datum_letzteverf SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN status SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_vorg ALTER COLUMN lfd_aktenr SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN vorg_nr SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN erst_regdatum SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN erst_registrator SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN datum_letzteverf SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN status SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN vorg SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN akte SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN hgruppe SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN org SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN lfd_aktenr SET NOT NULL;
ALTER TABLE dsv_vorg0104 ALTER COLUMN lfd_vorgnr SET NOT NULL;
ALTER TABLE dsv_weitere_ablagen ALTER COLUMN registriert SET NOT NULL;
ALTER TABLE dsv_weitere_ablagen ALTER COLUMN user_id SET NOT NULL;
ALTER TABLE user_vwr_table ALTER COLUMN neu SET NOT NULL;
ALTER TABLE user_vwr_table ALTER COLUMN alt SET NOT NULL;
ALTER TABLE dsv_ablagen ADD CONSTRAINT fkablben FOREIGN KEY (user_id) REFERENCES dsv_benutzerprofil (user_id);
ALTER TABLE dsv_adressen ADD CONSTRAINT fkobsolet FOREIGN KEY (obsolet) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_adressen ADD CONSTRAINT fkoeffentlich FOREIGN KEY (oeffentlich) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_akte ADD CONSTRAINT fkaktelap FOREIGN KEY (akte) REFERENCES dsv_lap (akte);
ALTER TABLE dsv_akte ADD CONSTRAINT fkaorg FOREIGN KEY (org) REFERENCES dsv_lov_org (org);
ALTER TABLE dsv_akte ADD CONSTRAINT fkapnr FOREIGN KEY (lfd_apnr) REFERENCES dsv_lap (lfd_apnr);
ALTER TABLE dsv_akte ADD CONSTRAINT fkastatus FOREIGN KEY (status) REFERENCES dsv_lov_status (status);
ALTER TABLE dsv_altap ADD CONSTRAINT fkaltapnr FOREIGN KEY (lfd_apnr) REFERENCES dsv_lap (lfd_apnr);
ALTER TABLE dsv_anforderungen ADD CONSTRAINT fkanfordumfang FOREIGN KEY (umfang) REFERENCES dsv_lov_schriftgutart (schriftgutart);
ALTER TABLE dsv_anforderungen ADD CONSTRAINT fkfeste_wv FOREIGN KEY (feste_wv) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT fkbeneai FOREIGN KEY (ben_eai) REFERENCES dsv_lov_eai (eai);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT fkbenklasse FOREIGN KEY (ben_klasse) REFERENCES dsv_lov_klasse (klasse);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT fkbenorg FOREIGN KEY (voreinst_org) REFERENCES dsv_lov_org (org);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT fkbenumfang FOREIGN KEY (ben_umfang) REFERENCES dsv_lov_schriftgutlapart (schriftgutlapart);
ALTER TABLE dsv_benutzerprofil ADD CONSTRAINT fkkonfiguration FOREIGN KEY (konfiguration) REFERENCES dsv_lov_konfiguration (konfiguration);
ALTER TABLE dsv_berechtigte_sb ADD CONSTRAINT fk_ber_sb2 FOREIGN KEY (user_id) REFERENCES dsv_benutzerprofil (user_id);
ALTER TABLE dsv_doku ADD CONSTRAINT fkdorg FOREIGN KEY (org) REFERENCES dsv_lov_org (org);
ALTER TABLE dsv_doku ADD CONSTRAINT fkdstatus FOREIGN KEY (status) REFERENCES dsv_lov_status (status);
ALTER TABLE dsv_doku ADD CONSTRAINT fkeai FOREIGN KEY (eai_kennung) REFERENCES dsv_lov_eai (eai);
ALTER TABLE dsv_doku ADD CONSTRAINT fkform_pe FOREIGN KEY (form_pe) REFERENCES dsv_lov_form (form);
ALTER TABLE dsv_doku ADD CONSTRAINT fkklasse FOREIGN KEY (klasse) REFERENCES dsv_lov_klasse (klasse);
ALTER TABLE dsv_doku ADD CONSTRAINT fkorig_vern FOREIGN KEY (orig_vern) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_doku_adr ADD CONSTRAINT fkdokuadr FOREIGN KEY (adr_nr) REFERENCES dsv_adressen (adr_nr);
ALTER TABLE dsv_gvp ADD CONSTRAINT fkgvpbearbeiter FOREIGN KEY (bearbeiter) REFERENCES dsv_benutzerprofil (user_id);
ALTER TABLE dsv_gvp ADD CONSTRAINT fkgvprecht FOREIGN KEY (recht) REFERENCES dsv_lov_rechte (recht);
ALTER TABLE dsv_konfiguration ADD CONSTRAINT fkkonfformnr FOREIGN KEY (formnr) REFERENCES dsv_forms (formnr);
ALTER TABLE dsv_meldungen ADD CONSTRAINT fkmeldart FOREIGN KEY (art) REFERENCES dsv_lov_meldart (meldart);
ALTER TABLE dsv_meldungen ADD CONSTRAINT fkproteinaus FOREIGN KEY (einaus) REFERENCES dsv_lov_einaus (einaus);
ALTER TABLE dsv_protokoll ADD CONSTRAINT fkprotokollart FOREIGN KEY (art) REFERENCES dsv_lov_meldart (meldart);
ALTER TABLE dsv_protokoll ADD CONSTRAINT fkprotokollmeldungen FOREIGN KEY (nummer) REFERENCES dsv_meldungen (nummer);
ALTER TABLE dsv_stwsyno ADD CONSTRAINT fkstichwort FOREIGN KEY (stichwnr) REFERENCES dsv_stichworte (stwnr);
ALTER TABLE dsv_stwsyno ADD CONSTRAINT fksynonym FOREIGN KEY (synonr) REFERENCES dsv_stichworte (stwnr);
ALTER TABLE dsv_stwzuo ADD CONSTRAINT fkstwzuo FOREIGN KEY (stwnr) REFERENCES dsv_stichworte (stwnr);
ALTER TABLE dsv_stwzuo ADD CONSTRAINT fkstwzuoart FOREIGN KEY (schriftgutlapart) REFERENCES dsv_lov_schriftgutlapart (schriftgutlapart);
ALTER TABLE dsv_systemprofil ADD CONSTRAINT fkbc_spender_jn FOREIGN KEY (bc_spender_jn) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_systemprofil ADD CONSTRAINT fkgz_gross_jn FOREIGN KEY (gz_gross_jn) REFERENCES dsv_lov_jn (jn);
ALTER TABLE dsv_systemprofil ADD CONSTRAINT fksyseai FOREIGN KEY (sys_profil_eai) REFERENCES dsv_lov_eai (eai);
ALTER TABLE dsv_systemprofil ADD CONSTRAINT fksysklasse FOREIGN KEY (sys_profil_klasse) REFERENCES dsv_lov_klasse (klasse);
ALTER TABLE dsv_systemprofil ADD CONSTRAINT fksysumfang FOREIGN KEY (sys_profil_umfang) REFERENCES dsv_lov_schriftgutlapart (schriftgutlapart);
ALTER TABLE dsv_umregistrierungen ADD CONSTRAINT fkumregschriftgutart FOREIGN KEY (schriftgutart) REFERENCES dsv_lov_schriftgutart (schriftgutart);
ALTER TABLE dsv_verteiler ADD CONSTRAINT fkvertadr FOREIGN KEY (adr_nr) REFERENCES dsv_adressen (adr_nr);
ALTER TABLE dsv_verteiler ADD CONSTRAINT fkvertvertnamen FOREIGN KEY (vert_nr) REFERENCES dsv_vertnamen (vert_nr);
ALTER TABLE dsv_vertretung ADD CONSTRAINT fkvertreg FOREIGN KEY (registrator) REFERENCES dsv_benutzerprofil (user_id);
ALTER TABLE dsv_vertretung ADD CONSTRAINT fkvertrvertr FOREIGN KEY (vertreter) REFERENCES dsv_benutzerprofil (user_id);
ALTER TABLE dsv_vorg ADD CONSTRAINT fkvorg FOREIGN KEY (org) REFERENCES dsv_lov_org (org);
ALTER TABLE dsv_vorg ADD CONSTRAINT fkvorgakte2 FOREIGN KEY (org, akte) REFERENCES dsv_akte (org, akte);
ALTER TABLE dsv_vorg ADD CONSTRAINT fkvorgaktenr FOREIGN KEY (lfd_aktenr) REFERENCES dsv_akte (lfd_aktenr);
ALTER TABLE dsv_vorg ADD CONSTRAINT fkvstatus FOREIGN KEY (status) REFERENCES dsv_lov_status (status);

CREATE INDEX dsv_i1_akte ON dsv_akte (akte);
CREATE INDEX dsv_i1_anfo ON dsv_anforderungen (org, akte);
CREATE INDEX dsv_i1_doku ON dsv_doku (erstdatum);
CREATE INDEX dsv_i1_h1 ON dsv_h1 (h1_zaehler);
CREATE INDEX dsv_i1_h2 ON dsv_h2 (h2_zaehler);
CREATE INDEX dsv_i2_anfo ON dsv_anforderungen (org, akte, vorg, dokunr, wv_datum);
CREATE INDEX dsv_i2_doku_adr ON dsv_doku_adr (adr_nr);
CREATE INDEX dsv_i2_stwzuo ON dsv_stwzuo (lfd_schrnr);
CREATE INDEX dsv_i3_adr ON dsv_adressen (bezeichnung_1);
CREATE INDEX dsv_i4_adr ON dsv_adressen (bezeichnung_2);
CREATE INDEX dsv_i5_adr ON dsv_adressen (bezeichnung_3);
CREATE INDEX dsv_i_stwsyno ON dsv_stwsyno (synonr);
CREATE UNIQUE INDEX dsv_i1_anla ON dsv_anla (org, akte, vorg, dokunr, anlanr);
