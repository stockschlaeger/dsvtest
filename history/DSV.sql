--------------------------------------------------------
--  Datei erstellt -Mittwoch-August-26-2026   
--------------------------------------------------------
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_ADR
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_ADR"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 53879 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_AKTE
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_AKTE"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -20078996 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_ANF
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_ANF"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 1 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_DOKU
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_DOKU"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 9700489556 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_H1
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_H1"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 1933513 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_LAP
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_LAP"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -10040571 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_STWT
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_STWT"  MINVALUE 1 MAXVALUE 999999999999999999999999999 INCREMENT BY 1 START WITH 771043 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_STWT_MIN
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_STWT_MIN"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -18 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_UMR
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_UMR"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -40213614 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_VERT
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_VERT"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -10 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Sequence DSV_SEQ_VORG
--------------------------------------------------------

   CREATE SEQUENCE  "DSV_SEQ_VORG"  MINVALUE -99999999999999999999999999 MAXVALUE -1 INCREMENT BY -1 START WITH -30409644 NOCACHE  NOORDER  NOCYCLE
--------------------------------------------------------
--  DDL for Table AP_GWD
--------------------------------------------------------

  CREATE TABLE "AP_GWD" ("AZ" VARCHAR2(1000), "A0" VARCHAR2(1000), "TZ0" VARCHAR2(1000), "A1" VARCHAR2(1000), "TZ1" VARCHAR2(1000), "A2" VARCHAR2(1000), "TZ2" VARCHAR2(1000), "A3" VARCHAR2(1000), "TZ3" VARCHAR2(1000), "A4" VARCHAR2(1000), "TZ4" VARCHAR2(1000), "A5" VARCHAR2(1000), "TZ5" VARCHAR2(1000), "A6" VARCHAR2(1000), "TZ6" VARCHAR2(1000), "A7" VARCHAR2(1000), "TZ7" VARCHAR2(1000), "A8" VARCHAR2(1000), "TZ8" VARCHAR2(1000), "A9" VARCHAR2(1000), "TZ9" VARCHAR2(1000), "A10" VARCHAR2(1000), "TZ10" VARCHAR2(1000), "A11" VARCHAR2(1000), "BETREFF" VARCHAR2(1000))
--------------------------------------------------------
--  DDL for Table DSV_ABLAGEN
--------------------------------------------------------

  CREATE TABLE "DSV_ABLAGEN" ("USER_ID" VARCHAR2(30), "REGISTRIERT" VARCHAR2(255), "NICHT_REGISTRIERT" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_ADRESSEN
--------------------------------------------------------

  CREATE TABLE "DSV_ADRESSEN" ("ADR_NR" NUMBER(10,0), "KUERZEL" VARCHAR2(10), "BEZEICHNUNG_1" VARCHAR2(30), "BEZEICHNUNG_2" VARCHAR2(30), "BEZEICHNUNG_3" VARCHAR2(30), "ANREDE" VARCHAR2(30), "STRASSE" VARCHAR2(65), "HAUSNUMMER" VARCHAR2(10), "PLZ" VARCHAR2(7), "ORT" VARCHAR2(65), "LAND" VARCHAR2(30), "GUELTIG_AB" DATE DEFAULT SYSDATE, "OEFFENTLICH" VARCHAR2(1) DEFAULT 'N', "OBSOLET" VARCHAR2(1) DEFAULT 'N', "TELNR" VARCHAR2(20), "GEBDATUM" DATE)
--------------------------------------------------------
--  DDL for Table DSV_AKTE
--------------------------------------------------------

  CREATE TABLE "DSV_AKTE" ("LFD_AKTENR" NUMBER(10,0), "LFD_APNR" NUMBER(10,0), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "BETREFF" VARCHAR2(255), "BEMERKUNG" VARCHAR2(255), "STATUS" VARCHAR2(7), "BEARBEITER" VARCHAR2(30), "ERST_REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE DEFAULT SYSDATE, "AEND_REGISTRATOR" VARCHAR2(30), "AEND_REG_VERTRETER" VARCHAR2(30), "AEND_REGDATUM" DATE)
--------------------------------------------------------
--  DDL for Table DSV_ALTAP
--------------------------------------------------------

  CREATE TABLE "DSV_ALTAP" ("LFD_APNR" NUMBER(10,0), "AKTE_ALT" VARCHAR2(25), "BETREFF" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_ANFORDERUNGEN
--------------------------------------------------------

  CREATE TABLE "DSV_ANFORDERUNGEN" ("LFD_SCHRNR" NUMBER(10,0), "UMFANG" VARCHAR2(1), "ORG" VARCHAR2(3), "AKTE" VARCHAR2(25), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "VORG" VARCHAR2(40), "DOKUNR" NUMBER(5,0), "BEARBEITER" VARCHAR2(30), "ANF_DATUM" DATE DEFAULT SYSDATE, "WV_DATUM" DATE, "FESTE_WV" VARCHAR2(1) DEFAULT 'N', "BEMERKUNG" VARCHAR2(255), "REGISTRATOR" VARCHAR2(30), "REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE DEFAULT SYSDATE, "VORG_NR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_ANLA
--------------------------------------------------------

  CREATE TABLE "DSV_ANLA" ("LFD_DOKNR" NUMBER(10,0), "ANLANR" NUMBER(5,0), "ORG" VARCHAR2(3), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "DOKUNR" NUMBER(5,0), "LFD_DOKANLNR" NUMBER(10,0), "AKTE_O" VARCHAR2(25), "VORG_O" VARCHAR2(40), "DOKUNR_O" NUMBER(5,0), "TEXT" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_BENUTZERPROFIL
--------------------------------------------------------

  CREATE TABLE "DSV_BENUTZERPROFIL" ("USER_ID" VARCHAR2(30), "KENNUNG" VARCHAR2(30), "VOREINST_ORG" VARCHAR2(3), "KLASSE_REG" VARCHAR2(1), "KLASSE_SB" VARCHAR2(1), "KLASSE_SY" VARCHAR2(1), "KLASSE_ST" VARCHAR2(1), "KLASSE_DS" VARCHAR2(1), "KLASSE_NS" VARCHAR2(1), "KONFIGURATION" VARCHAR2(2), "BEN_EAI" VARCHAR2(1), "BEN_KLASSE" VARCHAR2(2), "BEN_UMFANG" VARCHAR2(1))
--------------------------------------------------------
--  DDL for Table DSV_BERECHTIGTE_SB
--------------------------------------------------------

  CREATE TABLE "DSV_BERECHTIGTE_SB" ("LFD_DOKNR" NUMBER(10,0), "USER_ID" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_DOC_NAME_LIST
--------------------------------------------------------

  CREATE TABLE "DSV_DOC_NAME_LIST" ("DOCUNAME" VARCHAR2(80), "USER_PID" NUMBER(*,0))
--------------------------------------------------------
--  DDL for Table DSV_DOKU
--------------------------------------------------------

  CREATE TABLE "DSV_DOKU" ("LFD_DOKNR" NUMBER(10,0), "LFD_AKTENR" NUMBER(10,1), "LFD_VORGNR" NUMBER(10,0), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "DOKUNR" NUMBER(5,0), "BETREFF" VARCHAR2(2000), "BEMERKUNG" VARCHAR2(255), "EAI_KENNUNG" VARCHAR2(1), "STATUS" VARCHAR2(7), "KLASSE" VARCHAR2(2), "AUTOR" VARCHAR2(30), "BEARBEITER" VARCHAR2(30), "ERSTDATUM" DATE DEFAULT SYSDATE, "DATUM_LETZTEVERF" DATE DEFAULT SYSDATE, "ENDE_AUFBFRIST" DATE, "FORM" VARCHAR2(2), "FORM_PE" VARCHAR2(2) DEFAULT 'P', "DATEINAME" VARCHAR2(80), "DATEIPFAD" VARCHAR2(255), "ORIG_VERN" VARCHAR2(1) DEFAULT 'N', "UMREG_DOKNR" NUMBER(10,0), "U_ORG" VARCHAR2(3), "U_AKTE" VARCHAR2(25), "U_VORG" VARCHAR2(40), "U_DOKUNR" NUMBER(5,0), "FREMDNR" VARCHAR2(40), "ERST_REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE DEFAULT SYSDATE, "AEND_REGISTRATOR" VARCHAR2(30), "AEND_REG_VERTRETER" VARCHAR2(30), "AEND_REGDATUM" DATE, "VORG_NR" NUMBER(10,0), "GEHEIM" VARCHAR2(1) DEFAULT 'N')
--------------------------------------------------------
--  DDL for Table DSV_DOKU_ADR
--------------------------------------------------------

  CREATE TABLE "DSV_DOKU_ADR" ("LFD_DOKNR" NUMBER(10,0), "ADR_NR" NUMBER(10,0), "EINGDATUM" DATE DEFAULT SYSDATE, "EINS_GZ" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_DOKU0104
--------------------------------------------------------

  CREATE TABLE "DSV_DOKU0104" ("LFD_DOKNR" NUMBER(10,0), "LFD_AKTENR" NUMBER(10,1), "LFD_VORGNR" NUMBER(10,0), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "DOKUNR" NUMBER(5,0), "BETREFF" VARCHAR2(2000), "BEMERKUNG" VARCHAR2(255), "EAI_KENNUNG" VARCHAR2(1), "STATUS" VARCHAR2(7), "KLASSE" VARCHAR2(2), "AUTOR" VARCHAR2(30), "BEARBEITER" VARCHAR2(30), "ERSTDATUM" DATE, "DATUM_LETZTEVERF" DATE, "ENDE_AUFBFRIST" DATE, "FORM" VARCHAR2(2), "FORM_PE" VARCHAR2(2), "DATEINAME" VARCHAR2(80), "DATEIPFAD" VARCHAR2(255), "ORIG_VERN" VARCHAR2(1), "UMREG_DOKNR" NUMBER(10,0), "U_ORG" VARCHAR2(3), "U_AKTE" VARCHAR2(25), "U_VORG" VARCHAR2(40), "U_DOKUNR" NUMBER(5,0), "FREMDNR" VARCHAR2(40), "ERST_REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE, "AEND_REGISTRATOR" VARCHAR2(30), "AEND_REG_VERTRETER" VARCHAR2(30), "AEND_REGDATUM" DATE, "VORG_NR" NUMBER(10,0), "GEHEIM" VARCHAR2(1))
--------------------------------------------------------
--  DDL for Table DSV_DUMMY
--------------------------------------------------------

  CREATE TABLE "DSV_DUMMY" ("DUMMY" CHAR(1))
--------------------------------------------------------
--  DDL for Table DSV_FORMS
--------------------------------------------------------

  CREATE TABLE "DSV_FORMS" ("FORMNR" NUMBER(3,0), "TITEL" VARCHAR2(45), "VERSION" VARCHAR2(10), "AUFRUF" VARCHAR2(8), "BUTTONLABEL" VARCHAR2(20), "BUTTONNAME" VARCHAR2(12))
--------------------------------------------------------
--  DDL for Table DSV_GVP
--------------------------------------------------------

  CREATE TABLE "DSV_GVP" ("BEARBEITER" VARCHAR2(30), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "RECHT" VARCHAR2(1) DEFAULT 'L', "BEMERKUNG" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_HELP
--------------------------------------------------------

  CREATE TABLE "DSV_HELP" ("HELP_FORM" VARCHAR2(50), "HELP_BLOCK" VARCHAR2(25), "HELP_FIELD" VARCHAR2(25), "HELP_TEXT" LONG)
--------------------------------------------------------
--  DDL for Table DSV_HG
--------------------------------------------------------

  CREATE TABLE "DSV_HG" ("HGRUPPE" VARCHAR2(2), "BETREFF" VARCHAR2(255), "HINWEIS" VARCHAR2(255), "LFD_APNR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_H1
--------------------------------------------------------

  CREATE TABLE "DSV_H1" ("H1_ZAEHLER" NUMBER(10,0), "LFD_SCHRNR" NUMBER(10,0), "LFD_VORGNR" NUMBER(10,0), "LFD_AKTENR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_H2
--------------------------------------------------------

  CREATE TABLE "DSV_H2" ("H2_ZAEHLER" NUMBER(10,0), "LFD_SCHRNR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_KONFIGURATION
--------------------------------------------------------

  CREATE TABLE "DSV_KONFIGURATION" ("FORMNR" NUMBER(3,0), "KLASSE_REG" VARCHAR2(1), "KLASSE_SB" VARCHAR2(1), "KLASSE_SY" VARCHAR2(1), "KLASSE_ST" VARCHAR2(1), "KLASSE_DS" VARCHAR2(1), "KLASSE_NS" VARCHAR2(1), "KONFIGURATION" VARCHAR2(2))
--------------------------------------------------------
--  DDL for Table DSV_LAP
--------------------------------------------------------

  CREATE TABLE "DSV_LAP" ("LFD_APNR" NUMBER(10,0), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "BETREFF" VARCHAR2(255), "AUFBFRIST" NUMBER(10,0), "HINWEIS" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_LOV_EAI
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_EAI" ("EAI" VARCHAR2(1), "NAME" VARCHAR2(7))
--------------------------------------------------------
--  DDL for Table DSV_LOV_EINAUS
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_EINAUS" ("EINAUS" VARCHAR2(1), "NAME" VARCHAR2(3))
--------------------------------------------------------
--  DDL for Table DSV_LOV_FORM
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_FORM" ("FORM" VARCHAR2(2), "NAME" VARCHAR2(18))
--------------------------------------------------------
--  DDL for Table DSV_LOV_JN
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_JN" ("JN" VARCHAR2(1), "NAME" VARCHAR2(4))
--------------------------------------------------------
--  DDL for Table DSV_LOV_KLASSE
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_KLASSE" ("KLASSE" VARCHAR2(2), "NAME" VARCHAR2(20))
--------------------------------------------------------
--  DDL for Table DSV_LOV_KONFIGURATION
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_KONFIGURATION" ("KONFIGURATION" VARCHAR2(2), "NAME" VARCHAR2(40))
--------------------------------------------------------
--  DDL for Table DSV_LOV_MELDART
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_MELDART" ("MELDART" VARCHAR2(1), "NAME" VARCHAR2(20))
--------------------------------------------------------
--  DDL for Table DSV_LOV_ORG
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_ORG" ("ORG" VARCHAR2(3), "NAME" VARCHAR2(50))
--------------------------------------------------------
--  DDL for Table DSV_LOV_RECHTE
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_RECHTE" ("RECHT" VARCHAR2(1), "NAME" VARCHAR2(9))
--------------------------------------------------------
--  DDL for Table DSV_LOV_SCHRIFTGUTART
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_SCHRIFTGUTART" ("SCHRIFTGUTART" VARCHAR2(1), "NAME" VARCHAR2(9))
--------------------------------------------------------
--  DDL for Table DSV_LOV_SCHRIFTGUTLAPART
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART" VARCHAR2(1), "NAME" VARCHAR2(9))
--------------------------------------------------------
--  DDL for Table DSV_LOV_STATUS
--------------------------------------------------------

  CREATE TABLE "DSV_LOV_STATUS" ("STATUS" VARCHAR2(7), "NAME" VARCHAR2(20))
--------------------------------------------------------
--  DDL for Table DSV_MELDUNGEN
--------------------------------------------------------

  CREATE TABLE "DSV_MELDUNGEN" ("NUMMER" VARCHAR2(10), "TEXT" VARCHAR2(255), "EINAUS" VARCHAR2(1), "ART" VARCHAR2(1))
--------------------------------------------------------
--  DDL for Table DSV_PROTOKOLL
--------------------------------------------------------

  CREATE TABLE "DSV_PROTOKOLL" ("ZEIT" DATE, "USER_ID" VARCHAR2(30), "NUMMER" VARCHAR2(10), "ART" VARCHAR2(1), "BEZUG" VARCHAR2(100), "BEMERKUNGEN" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_PROTOKOLL_ALT
--------------------------------------------------------

  CREATE TABLE "DSV_PROTOKOLL_ALT" ("ZEIT" DATE, "USER_ID" VARCHAR2(30), "NUMMER" VARCHAR2(10), "ART" VARCHAR2(1), "BEZUG" VARCHAR2(100), "BEMERKUNGEN" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_REP
--------------------------------------------------------

  CREATE TABLE "DSV_REP" ("R_NAME" VARCHAR2(8), "R_TYP" VARCHAR2(1), "R_BEZEICHN" VARCHAR2(50))
--------------------------------------------------------
--  DDL for Table DSV_STD_VORLAGEWEG_AKTE
--------------------------------------------------------

  CREATE TABLE "DSV_STD_VORLAGEWEG_AKTE" ("ORG" VARCHAR2(3), "AKTE" VARCHAR2(25), "POSITION" NUMBER(3,0), "BEARBEITER" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_STD_VORLAGEWEG_VORG
--------------------------------------------------------

  CREATE TABLE "DSV_STD_VORLAGEWEG_VORG" ("ORG" VARCHAR2(3), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "POSITION" NUMBER(3,0), "BEARBEITER" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_STICHWORTE
--------------------------------------------------------

  CREATE TABLE "DSV_STICHWORTE" ("STWNR" NUMBER(10,0), "STICHWORT" VARCHAR2(50))
--------------------------------------------------------
--  DDL for Table DSV_STOPWORTE
--------------------------------------------------------

  CREATE TABLE "DSV_STOPWORTE" ("STOPWORT" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_STWSYNO
--------------------------------------------------------

  CREATE TABLE "DSV_STWSYNO" ("STICHWNR" NUMBER(10,0), "SYNONR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_STWZUO
--------------------------------------------------------

  CREATE TABLE "DSV_STWZUO" ("STWNR" NUMBER(10,0), "LFD_SCHRNR" NUMBER(10,0), "SCHRIFTGUTLAPART" VARCHAR2(1))
--------------------------------------------------------
--  DDL for Table DSV_SYSTEMPROFIL
--------------------------------------------------------

  CREATE TABLE "DSV_SYSTEMPROFIL" ("NAME_LANG" VARCHAR2(60), "PROTOKOLLDATEI" VARCHAR2(255), "PROTOKOLLSTATUS" VARCHAR2(3), "UE_USER" VARCHAR2(30), "UE_PASSWORD" VARCHAR2(10), "HILFE_PFAD" VARCHAR2(255), "DSV_FORMPFAD" VARCHAR2(255), "DSV_AUSGANGSPFAD" VARCHAR2(255), "SCRATCH_DIRECTORY" VARCHAR2(255), "SONDERZEICHEN" VARCHAR2(120), "STW_OPTION_WORTENDE" VARCHAR2(4), "STW_OPTION_ZAHLEN" VARCHAR2(4), "VORG_SORT_NUM" VARCHAR2(1) DEFAULT 'A', "VORG_VON_BIS_NUM" VARCHAR2(1) DEFAULT 'A', "RCH_DATUM" VARCHAR2(30), "BK_SYSTEM" VARCHAR2(30), "BARCODE3" VARCHAR2(30), "BARCODE_JN" VARCHAR2(1), "LOCAL_PFAD" VARCHAR2(255), "SYS_PROFIL_EAI" VARCHAR2(1), "SYS_PROFIL_KLASSE" VARCHAR2(2), "SYS_PROFIL_UMFANG" VARCHAR2(1), "GZ_GROSS_JN" VARCHAR2(1) DEFAULT 'N', "BC_SPENDER_JN" VARCHAR2(1) DEFAULT 'N')
--------------------------------------------------------
--  DDL for Table DSV_SYSTEMPROFIL_CEO
--------------------------------------------------------

  CREATE TABLE "DSV_SYSTEMPROFIL_CEO" ("NAME_LANG" VARCHAR2(60), "PROTOKOLLDATEI" VARCHAR2(255), "PROTOKOLLSTATUS" VARCHAR2(3), "UE_USER" VARCHAR2(30), "UE_PASSWORD" VARCHAR2(10), "HILFE_PFAD" VARCHAR2(255), "DSV_FORMPFAD" VARCHAR2(255), "DSV_AUSGANGSPFAD" VARCHAR2(255), "SCRATCH_DIRECTORY" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_TMP_AP_STW
--------------------------------------------------------

  CREATE TABLE "DSV_TMP_AP_STW" ("AKTE" VARCHAR2(25), "OK" VARCHAR2(1), "BEMERKUNG" VARCHAR2(2000))
--------------------------------------------------------
--  DDL for Table DSV_TMP_STW_LIST
--------------------------------------------------------

  CREATE TABLE "DSV_TMP_STW_LIST" ("STICHWORT" VARCHAR2(50), "USER_PID" NUMBER(*,0))
--------------------------------------------------------
--  DDL for Table DSV_UMREGISTRIERUNGEN
--------------------------------------------------------

  CREATE TABLE "DSV_UMREGISTRIERUNGEN" ("V_SCHRNR" NUMBER(10,0), "V_ORG" VARCHAR2(3), "V_AKTE" VARCHAR2(25), "V_HGRUPPE" VARCHAR2(2), "V_GRUPPE" VARCHAR2(1), "V_UGRUPPE" VARCHAR2(1), "V_TGLIEDER" VARCHAR2(20), "V_VORG" VARCHAR2(40), "V_DOKUNR" NUMBER(10,0), "N_SCHRNR" NUMBER(10,0), "N_ORG" VARCHAR2(3), "N_AKTE" VARCHAR2(25), "N_HGRUPPE" VARCHAR2(2), "N_GRUPPE" VARCHAR2(1), "N_UGRUPPE" VARCHAR2(1), "N_TGLIEDER" VARCHAR2(20), "N_VORG" VARCHAR2(40), "N_DOKUNR" NUMBER(10,0), "SCHRIFTGUTART" VARCHAR2(1), "REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "UMREG_DATUM" DATE DEFAULT SYSDATE, "BEMERKUNG" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table DSV_VERTEILER
--------------------------------------------------------

  CREATE TABLE "DSV_VERTEILER" ("VERT_NR" NUMBER(10,0), "ADR_NR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_VERTNAMEN
--------------------------------------------------------

  CREATE TABLE "DSV_VERTNAMEN" ("VERT_NR" NUMBER(10,0), "VERT" VARCHAR2(25))
--------------------------------------------------------
--  DDL for Table DSV_VERTRETUNG
--------------------------------------------------------

  CREATE TABLE "DSV_VERTRETUNG" ("REGISTRATOR" VARCHAR2(30), "VERTRETER" VARCHAR2(30))
--------------------------------------------------------
--  DDL for Table DSV_VORG
--------------------------------------------------------

  CREATE TABLE "DSV_VORG" ("LFD_VORGNR" NUMBER(10,0), "LFD_AKTENR" NUMBER(10,0), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "BETREFF" VARCHAR2(2000), "BEMERKUNG" VARCHAR2(255), "STATUS" VARCHAR2(7), "BEARBEITER" VARCHAR2(30), "DATUM_LETZTEVERF" DATE DEFAULT SYSDATE, "ERST_REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE DEFAULT SYSDATE, "AEND_REGISTRATOR" VARCHAR2(30), "AEND_REG_VERTRETER" VARCHAR2(30), "AEND_REGDATUM" DATE, "VORSCHL_BEH" VARCHAR2(1), "ENTSCH_ARCHIV" VARCHAR2(1), "VORG_NR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_VORG0104
--------------------------------------------------------

  CREATE TABLE "DSV_VORG0104" ("LFD_VORGNR" NUMBER(10,0), "LFD_AKTENR" NUMBER(10,0), "ORG" VARCHAR2(3), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "VORG" VARCHAR2(40), "BETREFF" VARCHAR2(2000), "BEMERKUNG" VARCHAR2(255), "STATUS" VARCHAR2(7), "BEARBEITER" VARCHAR2(30), "DATUM_LETZTEVERF" DATE, "ERST_REGISTRATOR" VARCHAR2(30), "ERST_REG_VERTRETER" VARCHAR2(30), "ERST_REGDATUM" DATE, "AEND_REGISTRATOR" VARCHAR2(30), "AEND_REG_VERTRETER" VARCHAR2(30), "AEND_REGDATUM" DATE, "VORSCHL_BEH" VARCHAR2(1), "ENTSCH_ARCHIV" VARCHAR2(1), "VORG_NR" NUMBER(10,0))
--------------------------------------------------------
--  DDL for Table DSV_WEITERE_ABLAGEN
--------------------------------------------------------

  CREATE TABLE "DSV_WEITERE_ABLAGEN" ("USER_ID" VARCHAR2(30), "REGISTRIERT" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table LAP
--------------------------------------------------------

  CREATE TABLE "LAP" ("LFD_APNR" NUMBER(10,0), "HGRUPPE" VARCHAR2(2), "GRUPPE" VARCHAR2(1), "UGRUPPE" VARCHAR2(1), "TGLIEDER" VARCHAR2(20), "AKTE" VARCHAR2(25), "BETREFF" VARCHAR2(255), "AUFBFRIST" NUMBER(10,0), "HINWEIS" VARCHAR2(255))
--------------------------------------------------------
--  DDL for Table TMP_MINUMREG
--------------------------------------------------------

  CREATE TABLE "TMP_MINUMREG" ("MINNUMBER" NUMBER)
--------------------------------------------------------
--  DDL for Table USER_VWR_TABLE
--------------------------------------------------------

  CREATE TABLE "USER_VWR_TABLE" ("ALT" VARCHAR2(20), "NEU" VARCHAR2(40))
--------------------------------------------------------
--  DDL for View DSV_ABLAGEN_REG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ABLAGEN_REG" ("USER_ID", "ABLAGE") AS select user_id, registriert from dsv_ablagen
union select user_id, registriert from dsv_weitere_ablagen
--------------------------------------------------------
--  DDL for View DSV_ADRDOKREF
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRDOKREF" ("ADR_NR", "EINGDATUM", "EINS_GZ", "BEZEICHNUNG", "PLZORTSTRHNR", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "PLZ", "ORT", "STRASSE", "HAUSNUMMER", "LAND", "GUELTIG_AB", "OBSOLET", "OEFFENTLICH", "ORG", "AKTE", "VORG", "DOKUNR", "AZ", "EAI_KENNUNG", "BETREFF") AS select r.adr_nr, r.eingdatum, r.eins_gz,
	  a.bezeichnung_1||' '||a.bezeichnung_2||' '||a.bezeichnung_3,
	  a.plz||' '||a.ort||' '||a.strasse||' '||a.hausnummer,
	  a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3,
	  a.anrede, a.plz, a.ort, a.strasse, a.hausnummer, a.land,
	  a.gueltig_ab, a.obsolet, a.oeffentlich,
	  d.org, d.akte, d.vorg, d.dokunr,
	  d.org||'-'||d.akte||'/'||d.vorg||'/'||d.dokunr,
	  eai_kennung, betreff
   from dsv_doku d, dsv_doku_adr r, dsv_adressen a
   where d.lfd_doknr = r.lfd_doknr
   and d.status != 'g'
   and   a.adr_nr = r.adr_nr
--------------------------------------------------------
--  DDL for View DSV_ADRDOKREF_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRDOKREF_" ("ADR_NR", "EINGDATUM", "EINS_GZ", "BEZEICHNUNG", "PLZORTSTRHNR", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "PLZ", "ORT", "STRASSE", "HAUSNUMMER", "LAND", "GUELTIG_AB", "OBSOLET", "OEFFENTLICH", "ORG", "AKTE", "VORG", "DOKUNR", "AZ", "EAI_KENNUNG", "BETREFF") AS select r.adr_nr, r.eingdatum, r.eins_gz,
	  a.bezeichnung_1||' '||a.bezeichnung_2||' '||a.bezeichnung_3,
	  a.plz||' '||a.ort||' '||a.strasse||' '||a.hausnummer,
	  a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3,
	  a.anrede, a.plz, a.ort, a.strasse, a.hausnummer, a.land,
	  a.gueltig_ab, a.obsolet, a.oeffentlich,
	  d.org, d.akte, d.vorg, d.dokunr,
	  d.org||'-'||d.akte||'/'||d.vorg||'/'||d.dokunr,
	  eai_kennung, betreff
   from dsv_doku_ d, dsv_doku_adr r, dsv_adressen a
   where d.lfd_doknr = r.lfd_doknr
   and d.status != 'g'
   and   a.adr_nr = r.adr_nr
--------------------------------------------------------
--  DDL for View DSV_ADRESSEN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRESSEN_" ("ADR_NR", "KUERZEL", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "STRASSE", "HAUSNUMMER", "PLZ", "ORT", "LAND", "GUELTIG_AB", "OEFFENTLICH", "OBSOLET", "TELNR", "GEBDATUM") AS (select
   a.adr_nr,a.kuerzel,a.bezeichnung_1,a.bezeichnung_2,a.bezeichnung_3,a.anrede,
   a.strasse,a.hausnummer,a.plz,a.ort,a.land,a.gueltig_ab,a.oeffentlich,
   a.obsolet,a.telnr,a.gebdatum
  from dsv_adressen a
  where a.oeffentlich='J')
  union all
  (select distinct
   a.adr_nr,a.kuerzel,a.bezeichnung_1,a.bezeichnung_2,a.bezeichnung_3,a.anrede,
   a.strasse,a.hausnummer,a.plz,a.ort,a.land,a.gueltig_ab,a.oeffentlich,
   a.obsolet,a.telnr,a.gebdatum
  from dsv_doku_ d, dsv_adressen a, dsv_doku_adr z
  where a.oeffentlich='N'
    and a.adr_nr=z.adr_nr
    and z.lfd_doknr=d.lfd_doknr)
--------------------------------------------------------
--  DDL for View DSV_ADRREF
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRREF" ("LFD_DOKNR", "ADR_NR", "EINGDATUM", "EINS_GZ", "KUERZEL", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "STRASSE", "HAUSNUMMER", "PLZ", "ORT", "LAND", "GUELTIG_AB", "OEFFENTLICH", "TELNR", "GEBDATUM") AS select r.lfd_doknr, r.adr_nr, r.eingdatum, r.eins_gz,a.kuerzel,
	 a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3,
	 a.anrede, a.strasse, a.hausnummer, a.plz, a.ort, a.land,
	 a.gueltig_ab, a.oeffentlich, a.telnr, a.gebdatum
   from  dsv_doku_adr r, dsv_adressen a
   where r.adr_nr = a.adr_nr
--------------------------------------------------------
--  DDL for View DSV_ADRREF_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRREF_" ("LFD_DOKNR", "ADR_NR", "EINGDATUM", "EINS_GZ", "KUERZEL", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "STRASSE", "HAUSNUMMER", "PLZ", "ORT", "LAND", "GUELTIG_AB", "OEFFENTLICH", "TELNR", "GEBDATUM") AS select a.lfd_doknr, a.adr_nr, a.eingdatum, a.eins_gz,a.kuerzel,
	 a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3,
	 a.anrede, a.strasse, a.hausnummer, a.plz, a.ort, a.land,
	 a.gueltig_ab, a.oeffentlich, a.telnr, a.gebdatum
   from  dsv_doku_ d, dsv_adrref a
   where a.lfd_doknr =d.lfd_doknr
--------------------------------------------------------
--  DDL for View DSV_ADRREF_KURZ
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRREF_KURZ" ("LFD_DOKNR", "ADRINFO") AS select lfd_doknr, bezeichnung_1||' '||ort
  from dsv_adrref
--------------------------------------------------------
--  DDL for View DSV_ADRREF_KURZ_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ADRREF_KURZ_" ("LFD_DOKNR", "ADRINFO") AS select lfd_doknr, bezeichnung_1||' '||ort
  from dsv_adrref_
--------------------------------------------------------
--  DDL for View DSV_AKTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AKTE_" ("LFD_AKTENR", "LFD_APNR", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AKTE", "BETREFF", "BEMERKUNG", "STATUS", "BEARBEITER", "ERST_REGISTRATOR", "ERST_REG_VERTRETER", "ERST_REGDATUM", "AEND_REGISTRATOR", "AEND_REG_VERTRETER", "AEND_REGDATUM") AS select
   a.lfd_aktenr,a.lfd_apnr,a.org,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.akte,
   a.betreff,a.bemerkung,a.status,a.bearbeiter,a.erst_registrator,a.erst_reg_vertreter,
   a.erst_regdatum,a.aend_registrator,a.aend_reg_vertreter,a.aend_regdatum
  from dsv_akte a, dsv_dist_lese_gvp g
  where g.bearbeiter = (select user from dual)
    and a.org=g.org
    and (a.hgruppe  = g.hgruppe  or g.hgruppe  is null)
    and (a.gruppe   = g.gruppe   or g.gruppe   is null)
    and (a.ugruppe  = g.ugruppe  or g.ugruppe  is null)
    and (a.tglieder = g.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_AKTESTW
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AKTESTW" ("LFD_AKTENR", "STICHWORT") AS select a.lfd_aktenr, s.stichwort
  from dsv_stichworte s,
      dsv_stwzuo z, dsv_doku d, dsv_akte a
  where z.stwnr = s.stwnr
  and   d.lfd_doknr = z.lfd_schrnr
  and   d.org = a.org
  and   d.akte = a.akte
--------------------------------------------------------
--  DDL for View DSV_AKTESTW_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AKTESTW_" ("LFD_AKTENR", "STICHWORT") AS select a.lfd_aktenr, s.stichwort
  from dsv_stichworte s,
       dsv_akte_ a, dsv_doku_ d, dsv_stwzuo z
  where z.stwnr = s.stwnr
  and   d.lfd_doknr = z.lfd_schrnr
  and   d.org = a.org
  and   d.akte = a.akte
--------------------------------------------------------
--  DDL for View DSV_AKTESTWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AKTESTWSYNO" ("LFD_AKTENR", "LFD_VORGNR", "LFD_DOKNR", "STICHWORT") AS select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_stichworte s, dsv_stwzuo z, dsv_doku d, dsv_akte a
   where  z.stwnr = s.stwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
   union
   select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stw_synonym
   from   dsv_stwzuo z, dsv_vstwsyno s, dsv_doku d, dsv_akte a
   where  z.stwnr = s.stichwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
   union
   select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_stwzuo z, dsv_v2stwsyno s, dsv_doku d, dsv_akte a
   where  z.stwnr = s.synonr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
--------------------------------------------------------
--  DDL for View DSV_AKTESTWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AKTESTWSYNO_" ("LFD_AKTENR", "LFD_VORGNR", "LFD_DOKNR", "STICHWORT") AS select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_akte_ a, dsv_doku_ d, dsv_stwzuo z, dsv_stichworte s
   where  z.stwnr = s.stwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
   union
   select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stw_synonym
   from   dsv_akte_ a, dsv_doku_ d, dsv_stwzuo z, dsv_vstwsyno s
   where  z.stwnr = s.stichwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
   union
   select a.lfd_aktenr, d.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_akte_ a, dsv_doku_ d, dsv_stwzuo z, dsv_v2stwsyno s
   where  z.stwnr = s.synonr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = a.org
   and    d.akte = a.akte
--------------------------------------------------------
--  DDL for View DSV_ALTAP_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ALTAP_" ("LFD_APNR", "AKTE_ALT", "BETREFF") AS select "LFD_APNR","AKTE_ALT","BETREFF" from dsv_altap
--------------------------------------------------------
--  DDL for View DSV_ANFORDERUNGEN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ANFORDERUNGEN_" ("LFD_SCHRNR", "UMFANG", "ORG", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "VORG", "VORG_NR", "DOKUNR", "BEARBEITER", "ANF_DATUM", "WV_DATUM", "FESTE_WV", "BEMERKUNG", "REGISTRATOR", "REG_VERTRETER", "ERST_REGDATUM") AS select
    a.lfd_schrnr,a.umfang,a.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.vorg,
    a.vorg_nr,a.dokunr,a.bearbeiter,a.anf_datum,a.wv_datum,a.feste_wv,a.bemerkung,
    a.registrator,a.reg_vertreter,a.erst_regdatum
  from dsv_anforderungen a
  where ((a.umfang='A' and a.lfd_schrnr in (select lfd_aktenr from dsv_akte_))
      or (a.umfang='V' and a.lfd_schrnr in (select lfd_vorgnr from dsv_vorg_))
      or (a.umfang='D' and a.lfd_schrnr in (select lfd_doknr from dsv_doku_)))
--------------------------------------------------------
--  DDL for View DSV_ANFORD_RPF
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ANFORD_RPF" ("LFD_SCHRNR", "UMFANG", "ORG", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "VORG", "VORG_NR", "DOKUNR", "BEARBEITER", "STATUS", "ANF_DATUM", "WV_DATUM", "FESTE_WV", "BEMERKUNG", "REGISTRATOR", "REG_VERTRETER", "ERST_REGDATUM") AS select
    a.lfd_schrnr,a.umfang,a.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.vorg,
    a.vorg_nr,a.dokunr,a.bearbeiter,b.status,a.anf_datum,a.wv_datum,a.feste_wv,a.bemerkung,
    a.registrator,a.reg_vertreter,a.erst_regdatum
  from dsv_anforderungen a, dsv_schriftgut_ b
  where ((a.umfang='A' and a.lfd_schrnr in (select lfd_aktenr from dsv_akte_))
      or (a.umfang='V' and a.lfd_schrnr in (select lfd_vorgnr from dsv_vorg_))
      or (a.umfang='D' and a.lfd_schrnr in (select lfd_doknr from dsv_doku_)))
      and a.lfd_schrnr = b.lfd_schrnr
      order by a.org,a.akte,a.vorg,a.dokunr
--------------------------------------------------------
--  DDL for View DSV_ANLA_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_ANLA_" ("LFD_DOKNR", "ANLANR", "ORG", "AKTE", "VORG", "DOKUNR", "LFD_DOKANLNR", "AKTE_O", "VORG_O", "DOKUNR_O", "TEXT") AS select
    a.lfd_doknr,a.anlanr,a.org,a.akte,a.vorg,a.dokunr,a.lfd_dokanlnr,
    a.akte_o,a.vorg_o,a.dokunr_o,a.text
  from dsv_anla a, dsv_doku_ d
  where a.lfd_doknr =d.lfd_doknr
--------------------------------------------------------
--  DDL for View DSV_APSTW_DIST
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_APSTW_DIST" ("STWNR", "STICHWORT") AS select stwnr, stichwort
  from dsv_stichworte s
  where exists (
    select 1
    from dsv_stwzuo z
    where z.schriftgutlapart = 'P'
    and   z.stwnr = s.stwnr )
--------------------------------------------------------
--  DDL for View DSV_APSTW_DIST_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_APSTW_DIST_" ("STWNR", "STICHWORT") AS select "STWNR","STICHWORT" from dsv_apstw_dist
--------------------------------------------------------
--  DDL for View DSV_AUSSOND
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AUSSOND" ("AZ", "ORG", "AKTE", "ORG_UGRUPPE", "VORG", "VORG_NR", "BETREFF", "REGDATUM", "DATUM_LETZTEVERF", "STATUS") AS select v.org||'-'||v.akte||'/'||v.vorg,
       v.org,v.akte,
       v.org||v.hgruppe||v.gruppe||v.ugruppe,
       v.vorg,v.vorg_nr,v.betreff,v.erst_regdatum,v.datum_letzteverf,v.status
from dsv_vorg v, dsv_lap l
where v.akte = l.akte
and status in ('zdA','Altreg.')
and add_months(trunc(v.datum_letzteverf,'YY'), 12*(1+nvl(l.aufbfrist,20)))
   <=sysdate
and   not exists
  ( select 'x'
    from dsv_doku d
    where d.org=v.org
    and   d.akte=v.akte
    and   d.vorg=v.vorg
    and (ende_aufbfrist > sysdate or status in ('GG','WV'))
  )
--------------------------------------------------------
--  DDL for View DSV_AUSSOND_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AUSSOND_" ("AZ", "ORG", "AKTE", "ORG_UGRUPPE", "VORG", "VORG_NR", "BETREFF", "REGDATUM", "DATUM_LETZTEVERF", "STATUS") AS select v.org||'-'||v.akte||'/'||v.vorg,
       v.org,v.akte,
       v.org||v.hgruppe||v.gruppe||v.ugruppe,
       v.vorg,v.vorg_nr,v.betreff,v.erst_regdatum,v.datum_letzteverf,v.status
from dsv_vorg_ v, dsv_lap l
where v.akte = l.akte
and status in ('zdA','Altreg.')
and add_months(trunc(v.datum_letzteverf,'YY'), 12*(1+nvl(l.aufbfrist,20)))
   <=sysdate
and   not exists
  ( select 'x'
    from dsv_doku d
    where d.org=v.org
    and   d.akte=v.akte
    and   d.vorg=v.vorg
    and (ende_aufbfrist > sysdate or status in ('GG','WV'))
  )
--------------------------------------------------------
--  DDL for View DSV_AV
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AV" ("ADR_NR", "AV_NR", "VERT", "KUERZEL", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "STRASSE", "HAUSNUMMER", "PLZ", "ORT", "LAND", "ADR", "OEFFENTLICH", "OBSOLET", "GUELTIG_AB") AS select adr_nr,adr_nr,'',
	 kuerzel,bezeichnung_1,bezeichnung_2,bezeichnung_3,anrede,
	 strasse,hausnummer,plz,ort,land,
	 kuerzel||' '||bezeichnung_1||' '||bezeichnung_2||' '||
	 bezeichnung_3||' '||ort,oeffentlich,obsolet,gueltig_ab
  from dsv_adressen
  union
  select a.adr_nr,b.vert_nr,b.vert,
	 kuerzel,bezeichnung_1,bezeichnung_2,bezeichnung_3,anrede,
	 strasse,hausnummer,plz,ort,land,
	 kuerzel||' '||bezeichnung_1||' '||bezeichnung_2||' '||
	 bezeichnung_3||' '||ort,oeffentlich,obsolet,gueltig_ab
  from dsv_verteiler a, dsv_vertnamen b, dsv_adressen c
  where a.vert_nr=b.vert_nr
  and   a.adr_nr=c.adr_nr
  union
  select a.adr_nr,a.vert_nr,'',
	 kuerzel,bezeichnung_1,bezeichnung_2,bezeichnung_3,anrede,
	 strasse,hausnummer,plz,ort,land,
	 kuerzel||' '||bezeichnung_1||' '||bezeichnung_2||' '||
	 bezeichnung_3||' '||ort,oeffentlich,obsolet,gueltig_ab
  from dsv_verteiler a, dsv_adressen c
  where  a.adr_nr=c.adr_nr
  and not exists
     (select 'x' from dsv_vertnamen c where c.vert_nr = a.vert_nr)
--------------------------------------------------------
--  DDL for View DSV_AV_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_AV_" ("ADR_NR", "AV_NR", "VERT", "KUERZEL", "BEZEICHNUNG_1", "BEZEICHNUNG_2", "BEZEICHNUNG_3", "ANREDE", "STRASSE", "HAUSNUMMER", "PLZ", "ORT", "LAND", "ADR", "OEFFENTLICH", "OBSOLET", "GUELTIG_AB") AS select "ADR_NR","AV_NR","VERT","KUERZEL","BEZEICHNUNG_1","BEZEICHNUNG_2","BEZEICHNUNG_3","ANREDE","STRASSE","HAUSNUMMER","PLZ","ORT","LAND","ADR","OEFFENTLICH","OBSOLET","GUELTIG_AB" from dsv_av
--------------------------------------------------------
--  DDL for View DSV_BEAAKTE
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEAAKTE" ("ORG_UGRUPPE", "BEARBEITER", "ORG", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "BETREFF", "RECHT") AS select a.org||a.akte ,g.bearbeiter,
	a.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.betreff, g.recht
  from dsv_gvp g, dsv_akte a
  where g.org=a.org
  and   (g.hgruppe=a.hgruppe or g.hgruppe is null)
  and   (g.gruppe=a.gruppe or g.gruppe is null)
  and   (g.ugruppe=a.ugruppe or g.ugruppe is null)
  and   (g.tglieder=a.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_BEAAKTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEAAKTE_" ("ORG_UGRUPPE_", "BEARBEITER_", "ORG_", "AKTE_", "HGRUPPE_", "GRUPPE_", "UGRUPPE_", "TGLIEDER_", "BETREFF_", "RECHT_") AS select a.org||a.akte,g.bearbeiter,
            a.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.betreff,g.recht
   from dsv_gvp g,dsv_akte a
   where g.org=a.org
   and   (g.hgruppe=a.hgruppe or g.hgruppe is null)
   and   (g.gruppe=a.gruppe or g.gruppe is null)
   and   (g.ugruppe=a.ugruppe or g.ugruppe is null)
   and   (g.tglieder=a.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_BEAAKTE_RECHT
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEAAKTE_RECHT" ("ORG_UGRUPPE", "BEARBEITER", "ORG", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "BETREFF", "GVP_HGRUPPE", "GVP_GRUPPE", "GVP_UGRUPPE", "GVP_TGLIEDER", "RECHT") AS select a.org||a.akte,g.bearbeiter,	 a.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,         a.betreff,g.hgruppe,g.gruppe,g.ugruppe,g.tglieder,g.recht
  from dsv_gvp g,dsv_akte a
  where g.org=a.org
  and   (g.hgruppe=a.hgruppe or g.hgruppe is null)
  and   (g.gruppe=a.gruppe or g.gruppe is null)
  and   (g.ugruppe=a.ugruppe or g.ugruppe is null)
  and   (g.tglieder=a.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_BEALAP
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEALAP" ("LFD_APNR", "ORG_UGRUPPE", "BEARBEITER", "ORG", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "BETREFF", "RECHT") AS select a.lfd_apnr, g.org||a.akte,g.bearbeiter,
	 g.org,a.akte,a.hgruppe,a.gruppe,a.ugruppe,a.tglieder,a.betreff,g.recht
  from dsv_gvp g,dsv_lap a
  where (g.hgruppe=a.hgruppe or g.hgruppe is null)
  and   (g.gruppe=a.gruppe or g.gruppe is null)
  and   (g.ugruppe=a.ugruppe or g.ugruppe is null)
  and   (g.tglieder=a.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_BEALAPOO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEALAPOO" ("LFD_APNR", "BEARBEITER", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "BETREFF", "HINWEIS", "RECHT") AS select distinct a.lfd_apnr, g.bearbeiter, a.akte,
           a.hgruppe, a.gruppe, a.ugruppe, a.tglieder, a.betreff, a.hinweis, g.recht
  from dsv_gvp g, dsv_lap a
  where (g.hgruppe=a.hgruppe or g.hgruppe is null)
  and   (g.gruppe=a.gruppe or g.gruppe is null)
  and   (g.ugruppe=a.ugruppe or g.ugruppe is null)
  and   (g.tglieder=a.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_BEAORG
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BEAORG" ("BEARBEITER", "ORG") AS select distinct bearbeiter,org from dsv_gvp
--------------------------------------------------------
--  DDL for View DSV_BENUTZER_BUTTONS
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BENUTZER_BUTTONS" ("FORMNR", "BUTTONNAME", "BUTTONLABEL") AS select f.formnr, f.buttonname,f.buttonlabel
  from dsv_benutzerprofil b ,dsv_forms f, dsv_konfiguration k
  where upper(b.user_id)=user
    and    (b.konfiguration = k.konfiguration or k.konfiguration = ' ')
    and    (f.formnr = k.formnr)
    and	(
              (b.klasse_reg='X' and k.klasse_reg='X')
          or (b.klasse_sb='X' and k.klasse_sb='X')
          or (b.klasse_sy='X' and k.klasse_sy='X')
          or (b.klasse_st='X' and k.klasse_st='X')
          or (b.klasse_ds='X' and k.klasse_ds='X')
          or (b.klasse_ns='X' and k.klasse_ns='X')
             )
--------------------------------------------------------
--  DDL for View DSV_BERECHTIGTE_SB_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_BERECHTIGTE_SB_" ("LFD_DOKNR", "USER_ID") AS select "LFD_DOKNR","USER_ID" from dsv_berechtigte_sb
   where user_id = (select user from dual)
   or 'X'=(select klasse_reg from dsv_benutzerprofil where user_id =(select user from dual))
--------------------------------------------------------
--  DDL for View DSV_DIST_LESE_GVP
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DIST_LESE_GVP" ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER") AS (
   select distinct bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_lese_gvp
   where  hgruppe is null
  )
  union all
  (
   select distinct bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_lese_gvp
   where  hgruppe is not null and gruppe is null
   and    (bearbeiter,org) not in
            (select bearbeiter,org from dsv_lese_gvp where hgruppe is null)
  )
  union all
  (
   select distinct bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_lese_gvp
   where  gruppe is not null and ugruppe is null
   and    (bearbeiter,org) not in
            (select bearbeiter,org from dsv_lese_gvp where hgruppe is null)
   and    (bearbeiter,org,hgruppe) not in
            (select bearbeiter,org,hgruppe from dsv_lese_gvp
             where hgruppe is not null and gruppe is null)
  )
  union all
  (
   select distinct bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_lese_gvp
   where  ugruppe is not null and tglieder is null
   and    (bearbeiter,org) not in
            (select bearbeiter,org from dsv_lese_gvp where hgruppe is null)
   and    (bearbeiter,org,hgruppe) not in
            (select bearbeiter,org,hgruppe from dsv_lese_gvp
             where hgruppe is not null and gruppe is null)
   and    (bearbeiter,org,hgruppe,gruppe) not in
            (select bearbeiter,org,hgruppe,gruppe from dsv_lese_gvp
             where gruppe is not null and ugruppe is null)
  )
  union all
  (
   select distinct bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_lese_gvp
   where  tglieder is not null
   and    (bearbeiter,org) not in
            (select bearbeiter,org from dsv_lese_gvp where hgruppe is null)
   and    (bearbeiter,org,hgruppe) not in
            (select bearbeiter,org,hgruppe from dsv_lese_gvp
             where hgruppe is not null and gruppe is null)
   and    (bearbeiter,org,hgruppe,gruppe) not in
            (select bearbeiter,org,hgruppe,gruppe from dsv_lese_gvp
             where gruppe is not null and ugruppe is null)
   and    (bearbeiter,org,hgruppe,gruppe,ugruppe) not in
            (select bearbeiter,org,hgruppe,gruppe,ugruppe from dsv_lese_gvp
             where ugruppe is not null and tglieder is null)
  )
--------------------------------------------------------
--  DDL for View DSV_DOKSTW
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTW" ("LFD_DOKNR", "STWNR", "STICHWORT") AS select z.lfd_schrnr, z.stwnr, s.stichwort
  from dsv_stichworte s, dsv_stwzuo z
  where z.schriftgutlapart = 'D'		/* geändert 19.08.95 BW */
  and   z.stwnr = s.stwnr
--------------------------------------------------------
--  DDL for View DSV_DOKSTW_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTW_" ("LFD_DOKNR", "STWNR", "STICHWORT") AS select s.lfd_doknr,s.stwnr,s.stichwort
  from dsv_doku_ d, dsv_dokstw s
  where s.lfd_doknr=d.lfd_doknr
--------------------------------------------------------
--  DDL for View DSV_DOKSTW_DIST
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTW_DIST" ("STWNR", "STICHWORT") AS select stwnr, stichwort
  from dsv_stichworte s
  where exists (
    select 1
    from dsv_stwzuo z
    where z.schriftgutlapart = 'D'		/* geändert 19.08.95 BW */
    and   z.stwnr = s.stwnr )
--------------------------------------------------------
--  DDL for View DSV_DOKSTW_DIST_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTW_DIST_" ("STWNR", "STICHWORT") AS select "STWNR","STICHWORT" from dsv_dokstw_dist
--------------------------------------------------------
--  DDL for View DSV_DOKSTWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTWSYNO" ("LFD_DOKNR", "STICHWORT") AS select lfd_doknr, stichwort
   from   dsv_dokstw
   union
   select z.lfd_schrnr, s.stw_synonym
   from   dsv_stwzuo z, dsv_vstwsyno s
   where  z.schriftgutlapart = 'D'
   and    z.stwnr = s.stichwnr
   union
   select z.lfd_schrnr, s.stichwort
   from   dsv_stwzuo z, dsv_v2stwsyno s
   where  z.schriftgutlapart = 'D'
   and    z.stwnr = s.synonr
--------------------------------------------------------
--  DDL for View DSV_DOKSTWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKSTWSYNO_" ("LFD_DOKNR", "STICHWORT") AS select s.lfd_doknr, s.stichwort
   from dsv_doku_ d, dsv_dokstwsyno s
   where s.lfd_doknr = d.lfd_doknr
--------------------------------------------------------
--  DDL for View DSV_DOKU_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKU_" ("LFD_DOKNR", "LFD_AKTENR", "LFD_VORGNR", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AKTE", "VORG", "VORG_NR", "DOKUNR", "BETREFF", "BEMERKUNG", "EAI_KENNUNG", "STATUS", "KLASSE", "AUTOR", "BEARBEITER", "ERSTDATUM", "DATUM_LETZTEVERF", "ENDE_AUFBFRIST", "FORM", "FORM_PE", "DATEINAME", "DATEIPFAD", "ORIG_VERN", "UMREG_DOKNR", "U_ORG", "U_AKTE", "U_VORG", "U_DOKUNR", "FREMDNR", "ERST_REGISTRATOR", "ERST_REG_VERTRETER", "ERST_REGDATUM", "AEND_REGISTRATOR", "AEND_REG_VERTRETER", "AEND_REGDATUM") AS select
    d.lfd_doknr,d.lfd_aktenr,d.lfd_vorgnr,d.org,d.hgruppe,d.gruppe,d.ugruppe,d.tglieder,
    d.akte,d.vorg,d.vorg_nr,d.dokunr,d.betreff,d.bemerkung,d.eai_kennung,d.status,
    d.klasse,d.autor,d.bearbeiter,d.erstdatum,d.datum_letzteverf,d.ende_aufbfrist,
    d.form,d.form_pe,d.dateiname,d.dateipfad,d.orig_vern,d.umreg_doknr,d.u_org,d.u_akte,
    d.u_vorg,d.u_dokunr,d.fremdnr,d.erst_registrator,d.erst_reg_vertreter,
    d.erst_regdatum,d.aend_registrator,d.aend_reg_vertreter,d.aend_regdatum
  from dsv_doku d, dsv_dist_lese_gvp g
  where g.bearbeiter = (select user from dual)
    and d.org=g.org
    and (d.hgruppe  = g.hgruppe  or g.hgruppe  is null)
    and (d.gruppe   = g.gruppe   or g.gruppe   is null)
    and (d.ugruppe  = g.ugruppe  or g.ugruppe  is null)
    and (d.tglieder = g.tglieder or g.tglieder is null)
    and (
         (exists (select 'X' from dsv_benutzerprofil
                 where user_id = (select user from dual)
                 and (klasse_reg='X' or klasse_ds='X')))
        or
        (d.geheim='N')
        or
        (d.geheim='J' and
         exists (select 'X' from dsv_berechtigte_sb b
                 where b.lfd_doknr=d.lfd_doknr and b.user_id=(select user from dual)))
    )
--------------------------------------------------------
--  DDL for View DSV_DOKU_ADR_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_DOKU_ADR_" ("LFD_DOKNR", "ADR_NR", "EINGDATUM", "EINS_GZ") AS select
    a.lfd_doknr,a.adr_nr,a.eingdatum,a.eins_gz
  from dsv_doku_ d, dsv_doku_adr a
  where a.lfd_doknr =d.lfd_doknr
--------------------------------------------------------
--  DDL for View DSV_GVP_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_GVP_" ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "RECHT", "BEMERKUNG") AS select "BEARBEITER","ORG","HGRUPPE","GRUPPE","UGRUPPE","TGLIEDER","RECHT","BEMERKUNG" from dsv_gvp
   where bearbeiter = (select user from dual)
--------------------------------------------------------
--  DDL for View DSV_GVPBETREFF
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_GVPBETREFF" ("ORG", "BEARBEITER", "AKTE", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "BETREFF") AS select distinct b.org, b.bearbeiter, l.hgruppe, l.hgruppe,
                ' ',' ',' ',l.betreff
from   dsv_hg l, dsv_beaakte b
where  l.hgruppe =b.hgruppe
union
select distinct b.org, b.bearbeiter, l.hgruppe||l.gruppe,
                l.hgruppe, l.gruppe,' ', ' ', l.betreff
from   dsv_lap l, dsv_beaakte b
where  l.hgruppe =b.hgruppe
and    l.gruppe=b.gruppe
and    l.ugruppe is null
union
select distinct b.org, b.bearbeiter, l.hgruppe||l.gruppe||l.ugruppe,
                l.hgruppe, l.gruppe, l.ugruppe, ' ', l.betreff
from   dsv_lap l, dsv_beaakte b
where  l.hgruppe =b.hgruppe
and    l.gruppe=b.gruppe
and    l.ugruppe=b.ugruppe
and    l.tglieder is null
union
select distinct b.org, b.bearbeiter, l.hgruppe||l.gruppe||l.ugruppe||'.'||
                l.tglieder,
                l.hgruppe, l.gruppe,l.ugruppe, l.tglieder, l.betreff
from   dsv_lap l, dsv_beaakte b
where  l.hgruppe =b.hgruppe
and    l.gruppe=b.gruppe
and    l.ugruppe=b.ugruppe
and    l.tglieder=b.tglieder
--------------------------------------------------------
--  DDL for View DSV_HG_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_HG_" ("HGRUPPE", "BETREFF", "HINWEIS", "LFD_APNR") AS select "HGRUPPE","BETREFF","HINWEIS","LFD_APNR" from dsv_hg
--------------------------------------------------------
--  DDL for View DSV_LAP_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LAP_" ("LFD_APNR", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AKTE", "BETREFF", "AUFBFRIST", "HINWEIS") AS select "LFD_APNR","HGRUPPE","GRUPPE","UGRUPPE","TGLIEDER","AKTE","BETREFF","AUFBFRIST","HINWEIS" from dsv_lap
--------------------------------------------------------
--  DDL for View DSV_LAPSTW
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LAPSTW" ("LFD_APNR", "STWNR", "STICHWORT") AS select z.lfd_schrnr, z.stwnr, s.stichwort
  from dsv_stichworte s, dsv_stwzuo z
  where z.stwnr = s.stwnr		/* geändert 19.08.95 BW */
  and z.schriftgutlapart = 'P'
--------------------------------------------------------
--  DDL for View DSV_LAPSTW_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LAPSTW_" ("LFD_APNR", "STWNR", "STICHWORT") AS select "LFD_APNR","STWNR","STICHWORT" from dsv_lapstw
--------------------------------------------------------
--  DDL for View DSV_LAPSTWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LAPSTWSYNO" ("LFD_APNR", "STICHWORT") AS select lfd_apnr, stichwort
   from   dsv_lapstw
   union
   select z.lfd_schrnr, s.stw_synonym
   from   dsv_stwzuo z, dsv_vstwsyno s
   where  z.schriftgutlapart = 'P'
   and    z.stwnr = s.stichwnr
   union
   select z.lfd_schrnr, s.stichwort
   from   dsv_stwzuo z, dsv_v2stwsyno s
   where  z.schriftgutlapart = 'P'
   and    z.stwnr = s.synonr
--------------------------------------------------------
--  DDL for View DSV_LAPSTWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LAPSTWSYNO_" ("LFD_APNR", "STICHWORT") AS select "LFD_APNR","STICHWORT" from dsv_lapstwsyno
--------------------------------------------------------
--  DDL for View DSV_LESE_GVP
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LESE_GVP" ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER") AS select bearbeiter,org,hgruppe,gruppe,ugruppe,tglieder from dsv_gvp
  union all
  select v.vertreter,g.org,g.hgruppe,g.gruppe,g.ugruppe,g.tglieder
  from dsv_gvp g, dsv_vertretung v
  where g.bearbeiter=v.registrator
--------------------------------------------------------
--  DDL for View DSV_LOV_EAI_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_EAI_" ("EAI", "NAME") AS select "EAI","NAME" from dsv_lov_eai
--------------------------------------------------------
--  DDL for View DSV_LOV_EINAUS_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_EINAUS_" ("EINAUS", "NAME") AS select "EINAUS","NAME" from dsv_lov_einaus
--------------------------------------------------------
--  DDL for View DSV_LOV_FORM_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_FORM_" ("FORM", "NAME") AS select "FORM","NAME" from dsv_lov_form
--------------------------------------------------------
--  DDL for View DSV_LOV_JN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_JN_" ("JN", "NAME") AS select "JN","NAME" from dsv_lov_jn
--------------------------------------------------------
--  DDL for View DSV_LOV_KLASSE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_KLASSE_" ("KLASSE", "NAME") AS select "KLASSE","NAME" from dsv_lov_klasse
--------------------------------------------------------
--  DDL for View DSV_LOV_KONFIGURATION_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_KONFIGURATION_" ("KONFIGURATION", "NAME") AS select "KONFIGURATION","NAME" from dsv_lov_konfiguration
--------------------------------------------------------
--  DDL for View DSV_LOV_MELDART_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_MELDART_" ("MELDART", "NAME") AS select "MELDART","NAME" from dsv_lov_meldart
--------------------------------------------------------
--  DDL for View DSV_LOV_ORG_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_ORG_" ("ORG", "NAME") AS select "ORG","NAME" from dsv_lov_org
--------------------------------------------------------
--  DDL for View DSV_LOV_RECHTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_RECHTE_" ("RECHT", "NAME") AS select "RECHT","NAME" from dsv_lov_rechte
--------------------------------------------------------
--  DDL for View DSV_LOV_SCHRIFTGUTART_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_SCHRIFTGUTART_" ("SCHRIFTGUTART", "NAME") AS select "SCHRIFTGUTART","NAME" from dsv_lov_schriftgutart
--------------------------------------------------------
--  DDL for View DSV_LOV_SCHRIFTGUTLAPART_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_SCHRIFTGUTLAPART_" ("SCHRIFTGUTLAPART", "NAME") AS select "SCHRIFTGUTLAPART","NAME" from dsv_lov_schriftgutlapart
--------------------------------------------------------
--  DDL for View DSV_LOV_STATUS_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_LOV_STATUS_" ("STATUS", "NAME") AS select "STATUS","NAME" from dsv_lov_status
--------------------------------------------------------
--  DDL for View DSV_MELDUNGEN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_MELDUNGEN_" ("NUMMER", "TEXT", "EINAUS", "ART") AS select "NUMMER","TEXT","EINAUS","ART" from dsv_meldungen
--------------------------------------------------------
--  DDL for View DSV_PROTMELD
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTMELD" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN", "TEXT", "EINAUS") AS select zeit,user_id,a.nummer,a.art,bezug,bemerkungen,b.text,b.einaus
from dsv_protokoll a, dsv_meldungen b
where a.nummer=b.nummer
--------------------------------------------------------
--  DDL for View DSV_PROTMELD_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTMELD_" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN", "TEXT", "EINAUS") AS select "ZEIT","USER_ID","NUMMER","ART","BEZUG","BEMERKUNGEN","TEXT","EINAUS" from dsv_protmeld
   where user_id = (select user from dual)
--------------------------------------------------------
--  DDL for View DSV_PROTMELD_ALT
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTMELD_ALT" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN", "TEXT", "EINAUS") AS select zeit,user_id,a.nummer,a.art,bezug,bemerkungen,b.text,b.einaus
from dsv_protokoll_alt a, dsv_meldungen b
where a.nummer=b.nummer
--------------------------------------------------------
--  DDL for View DSV_PROTMELD_ALT_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTMELD_ALT_" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN", "TEXT", "EINAUS") AS select "ZEIT","USER_ID","NUMMER","ART","BEZUG","BEMERKUNGEN","TEXT","EINAUS" from dsv_protmeld_alt
   where user_id = (select user from dual)
--------------------------------------------------------
--  DDL for View DSV_PROTOKOLL_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTOKOLL_" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN") AS select "ZEIT","USER_ID","NUMMER","ART","BEZUG","BEMERKUNGEN" from dsv_protokoll
   where user_id = (select user from dual)
--------------------------------------------------------
--  DDL for View DSV_PROTOKOLL_ALT_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_PROTOKOLL_ALT_" ("ZEIT", "USER_ID", "NUMMER", "ART", "BEZUG", "BEMERKUNGEN") AS select "ZEIT","USER_ID","NUMMER","ART","BEZUG","BEMERKUNGEN" from dsv_protokoll_alt
   where user_id = (select user from dual)
--------------------------------------------------------
--  DDL for View DSV_SCHRIFTGUT
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_SCHRIFTGUT" ("ORG", "AKTE", "VORG", "VORG_NR", "DOKUNR", "STATUS", "BEARBEITER", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AZ", "LFD_SCHRNR", "UMFANG", "LFD_VORGNR") AS select org, akte, vorg, vorg_nr, dokunr, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg||'/'||to_char(dokunr), lfd_doknr,'D', lfd_vorgnr
  from dsv_doku
 union all
  select org, akte, vorg, vorg_nr, 0, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg, lfd_vorgnr,'V', lfd_vorgnr
  from dsv_vorg
 union all
  select org, akte, null, 0 , 0, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte, lfd_aktenr, 'A', 0
  from dsv_akte
--------------------------------------------------------
--  DDL for View DSV_SCHRIFTGUT_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_SCHRIFTGUT_" ("ORG", "AKTE", "VORG", "VORG_NR", "DOKUNR", "STATUS", "BEARBEITER", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AZ", "LFD_SCHRNR", "UMFANG", "LFD_VORGNR") AS select org, akte, vorg, vorg_nr, dokunr, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg||'/'||to_char(dokunr), lfd_doknr,'D', lfd_vorgnr
  from dsv_doku_
 union all
  select org, akte, vorg, vorg_nr, 0, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg, lfd_vorgnr,'V', lfd_vorgnr
  from dsv_vorg_
 union all
  select org, akte, null, 0 , 0, status, bearbeiter,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte, lfd_aktenr, 'A', 0
  from dsv_akte_
--------------------------------------------------------
--  DDL for View DSV_SCHRIFTGUT_BETR
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_SCHRIFTGUT_BETR" ("ORG", "AKTE", "VORG", "DOKUNR", "STATUS", "BEARBEITER", "BETREFF", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AZ", "LFD_SCHRNR", "UMFANG") AS select org, akte, vorg, dokunr, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg||'/'||to_char(dokunr), lfd_doknr,'D'
  from dsv_doku
 union all
  select org, akte, vorg, 0, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg, lfd_vorgnr,'V'
  from dsv_vorg
 union all
  select org, akte, null, 0, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte, lfd_aktenr,'A'
  from dsv_akte
--------------------------------------------------------
--  DDL for View DSV_SCHRIFTGUT_BETR_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_SCHRIFTGUT_BETR_" ("ORG", "AKTE", "VORG", "DOKUNR", "STATUS", "BEARBEITER", "BETREFF", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AZ", "LFD_SCHRNR", "UMFANG") AS select org, akte, vorg, dokunr, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg||'/'||to_char(dokunr), lfd_doknr,'D'
  from dsv_doku_
 union all
  select org, akte, vorg, 0, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte||'/'||vorg, lfd_vorgnr,'V'
  from dsv_vorg_
 union all
  select org, akte, null, 0, status, bearbeiter, betreff,
    hgruppe, gruppe, ugruppe, tglieder,
    org||'-'||akte, lfd_aktenr,'A'
  from dsv_akte_
--------------------------------------------------------
--  DDL for View DSV_STD_VORLAGEWEG_AKTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STD_VORLAGEWEG_AKTE_" ("ORG", "AKTE", "POSITION", "BEARBEITER") AS select
    v.org,v.akte,v.position,v.bearbeiter
  from dsv_std_vorlageweg_akte v, dsv_akte_ a
  where a.org=v.org and a.akte=v.akte
--------------------------------------------------------
--  DDL for View DSV_STD_VORLAGEWEG_VORG_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STD_VORLAGEWEG_VORG_" ("ORG", "AKTE", "VORG", "POSITION", "BEARBEITER") AS select
    v.org,v.akte,v.vorg,v.position,v.bearbeiter
    from dsv_std_vorlageweg_vorg v, dsv_vorg_ w
    where v.org= w.org and v.akte=w.akte and v.vorg=w.vorg
--------------------------------------------------------
--  DDL for View DSV_STICHWORTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STICHWORTE_" ("STWNR", "STICHWORT") AS select "STWNR","STICHWORT" from dsv_stichworte
--------------------------------------------------------
--  DDL for View DSV_STOPWORTE_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STOPWORTE_" ("STOPWORT") AS select "STOPWORT" from dsv_stopworte
--------------------------------------------------------
--  DDL for View DSV_STWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STWSYNO_" ("STICHWNR", "SYNONR") AS select "STICHWNR","SYNONR" from dsv_stwsyno
--------------------------------------------------------
--  DDL for View DSV_STWZUO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_STWZUO_" ("STWNR", "LFD_SCHRNR", "SCHRIFTGUTLAPART") AS (select
     s.stwnr,s.lfd_schrnr,s.schriftgutlapart
   from dsv_stwzuo s
   where s.schriftgutlapart='P')
   union all
   (select
     s.stwnr,s.lfd_schrnr,s.schriftgutlapart
   from dsv_stwzuo s, dsv_doku_ d
   where s.schriftgutlapart='D' and  s.lfd_schrnr =d.lfd_doknr)
--------------------------------------------------------
--  DDL for View DSV_UMREGISTRIERUNGEN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_UMREGISTRIERUNGEN_" ("V_SCHRNR", "V_ORG", "V_AKTE", "V_HGRUPPE", "V_GRUPPE", "V_UGRUPPE", "V_TGLIEDER", "V_VORG", "V_DOKUNR", "N_SCHRNR", "N_ORG", "N_AKTE", "N_HGRUPPE", "N_GRUPPE", "N_UGRUPPE", "N_TGLIEDER", "N_VORG", "N_DOKUNR", "SCHRIFTGUTART", "REGISTRATOR", "ERST_REG_VERTRETER", "UMREG_DATUM", "BEMERKUNG") AS select "V_SCHRNR","V_ORG","V_AKTE","V_HGRUPPE","V_GRUPPE","V_UGRUPPE","V_TGLIEDER","V_VORG","V_DOKUNR","N_SCHRNR","N_ORG","N_AKTE","N_HGRUPPE","N_GRUPPE","N_UGRUPPE","N_TGLIEDER","N_VORG","N_DOKUNR","SCHRIFTGUTART","REGISTRATOR","ERST_REG_VERTRETER","UMREG_DATUM","BEMERKUNG" from dsv_umregistrierungen
  where 'X'=(select klasse_reg from dsv_benutzerprofil where user_id =(select user from dual))
--------------------------------------------------------
--  DDL for View DSV_VERTEILER_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VERTEILER_" ("VERT_NR", "ADR_NR") AS select "VERT_NR","ADR_NR" from dsv_verteiler
--------------------------------------------------------
--  DDL for View DSV_VERTNAMEN_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VERTNAMEN_" ("VERT_NR", "VERT") AS select "VERT_NR","VERT" from dsv_vertnamen
--------------------------------------------------------
--  DDL for View DSV_VERTR
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VERTR" ("REGISTRATOR", "VERTRETER") AS select '-',user
  from dual
  union
  select registrator,vertreter
  from dsv_vertretung
  where vertreter=user
--------------------------------------------------------
--  DDL for View DSV_VERTR_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VERTR_" ("REGISTRATOR", "VERTRETER") AS select "REGISTRATOR","VERTRETER" from dsv_vertr
--------------------------------------------------------
--  DDL for View DSV_VERTRETUNG_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VERTRETUNG_" ("REGISTRATOR", "VERTRETER") AS select "REGISTRATOR","VERTRETER" from dsv_vertretung
--------------------------------------------------------
--  DDL for View DSV_VORG_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VORG_" ("LFD_VORGNR", "LFD_AKTENR", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER", "AKTE", "VORG", "VORG_NR", "BETREFF", "BEMERKUNG", "STATUS", "BEARBEITER", "DATUM_LETZTEVERF", "ERST_REGISTRATOR", "ERST_REG_VERTRETER", "ERST_REGDATUM", "AEND_REGISTRATOR", "AEND_REG_VERTRETER", "AEND_REGDATUM", "VORSCHL_BEH", "ENTSCH_ARCHIV") AS select
   v.lfd_vorgnr,v.lfd_aktenr,v.org,v.hgruppe,v.gruppe,v.ugruppe,v.tglieder,v.akte,
   v.vorg,v.vorg_nr,v.betreff,v.bemerkung,v.status,v.bearbeiter,v.datum_letzteverf,
   v.erst_registrator,v.erst_reg_vertreter,v.erst_regdatum,v.aend_registrator,
   v.aend_reg_vertreter,v.aend_regdatum,v.vorschl_beh,v.entsch_archiv
  from dsv_vorg v, dsv_dist_lese_gvp g
  where g.bearbeiter = (select user from dual)
    and v.org=g.org
    and (v.hgruppe  = g.hgruppe  or g.hgruppe  is null)
    and (v.gruppe   = g.gruppe   or g.gruppe   is null)
    and (v.ugruppe  = g.ugruppe  or g.ugruppe  is null)
    and (v.tglieder = g.tglieder or g.tglieder is null)
--------------------------------------------------------
--  DDL for View DSV_VORGSTW
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VORGSTW" ("LFD_VORGNR", "STICHWORT") AS select v.lfd_vorgnr, s.stichwort
  from dsv_stichworte s,
      dsv_stwzuo z, dsv_doku d, dsv_vorg v
  where z.stwnr = s.stwnr
  and   d.lfd_doknr = z.lfd_schrnr
  and   d.org = v.org
  and   d.akte = v.akte
  and   d.vorg = v.vorg
--------------------------------------------------------
--  DDL for View DSV_VORGSTW_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VORGSTW_" ("LFD_VORGNR", "STICHWORT") AS select v.lfd_vorgnr, s.stichwort
  from dsv_stichworte s,
      dsv_vorg_ v, dsv_doku_ d, dsv_stwzuo z
  where z.stwnr = s.stwnr
  and   d.lfd_doknr = z.lfd_schrnr
  and   d.org = v.org
  and   d.akte = v.akte
  and   d.vorg = v.vorg
--------------------------------------------------------
--  DDL for View DSV_VORGSTWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VORGSTWSYNO" ("LFD_VORGNR", "LFD_DOKNR", "STICHWORT") AS select v.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_stichworte s, dsv_stwzuo z, dsv_doku d, dsv_vorg v
   where  z.stwnr = s.stwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
   union
   select v.lfd_vorgnr, d.lfd_doknr, s.stw_synonym
   from   dsv_stwzuo z, dsv_vstwsyno s, dsv_doku d, dsv_vorg v
   where  z.stwnr = s.stichwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
   union
   select v.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_stwzuo z, dsv_v2stwsyno s, dsv_doku d, dsv_vorg v
   where  z.stwnr = s.synonr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
--------------------------------------------------------
--  DDL for View DSV_VORGSTWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VORGSTWSYNO_" ("LFD_VORGNR", "LFD_DOKNR", "STICHWORT") AS select v.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_vorg_ v, dsv_doku_ d, dsv_stwzuo z, dsv_stichworte s
   where  z.stwnr = s.stwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
   union
   select v.lfd_vorgnr, d.lfd_doknr, s.stw_synonym
   from   dsv_vorg_ v, dsv_doku_ d, dsv_stwzuo z, dsv_vstwsyno s
   where  z.stwnr = s.stichwnr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
   union
   select v.lfd_vorgnr, d.lfd_doknr, s.stichwort
   from   dsv_vorg_ v, dsv_doku_ d, dsv_stwzuo z, dsv_v2stwsyno s
   where  z.stwnr = s.synonr
   and    d.lfd_doknr = z.lfd_schrnr
   and    d.org = v.org
   and    d.akte = v.akte
   and    d.vorg = v.vorg
--------------------------------------------------------
--  DDL for View DSV_VSTWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VSTWSYNO" ("STICHWNR", "SYNONR", "STW_SYNONYM") AS select sy.stichwnr, sy.synonr, st.stichwort
  from dsv_stwsyno sy, dsv_stichworte st
  where st.stwnr = sy.synonr
--------------------------------------------------------
--  DDL for View DSV_VSTWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_VSTWSYNO_" ("STICHWNR", "SYNONR", "STW_SYNONYM") AS select "STICHWNR","SYNONR","STW_SYNONYM" from dsv_vstwsyno
--------------------------------------------------------
--  DDL for View DSV_V2STWSYNO
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_V2STWSYNO" ("STICHWNR", "SYNONR", "STICHWORT") AS select sy.stichwnr, sy.synonr, st.stichwort
  from dsv_stwsyno sy, dsv_stichworte st
  where st.stwnr = sy.stichwnr
--------------------------------------------------------
--  DDL for View DSV_V2STWSYNO_
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "DSV_V2STWSYNO_" ("STICHWNR", "SYNONR", "STICHWORT") AS select "STICHWNR","SYNONR","STICHWORT" from dsv_v2stwsyno
--------------------------------------------------------
--  DDL for View USR_VWR
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE VIEW "USR_VWR" ("ALT", "NEU") AS select "ALT","NEU" from bestand.v_usr_vwr_tmp
--------------------------------------------------------
--  DDL for Index DSV_I_STWSYNO
--------------------------------------------------------

  CREATE INDEX "DSV_I_STWSYNO" ON "DSV_STWSYNO" ("SYNONR")
--------------------------------------------------------
--  DDL for Index DSV_I1_AKTE
--------------------------------------------------------

  CREATE INDEX "DSV_I1_AKTE" ON "DSV_AKTE" ("AKTE")
--------------------------------------------------------
--  DDL for Index DSV_I1_ANFO
--------------------------------------------------------

  CREATE INDEX "DSV_I1_ANFO" ON "DSV_ANFORDERUNGEN" ("ORG", "AKTE")
--------------------------------------------------------
--  DDL for Index DSV_I1_ANLA
--------------------------------------------------------

  CREATE UNIQUE INDEX "DSV_I1_ANLA" ON "DSV_ANLA" ("ORG", "AKTE", "VORG", "DOKUNR", "ANLANR")
--------------------------------------------------------
--  DDL for Index DSV_I1_DOKU
--------------------------------------------------------

  CREATE INDEX "DSV_I1_DOKU" ON "DSV_DOKU" ("ERSTDATUM")
--------------------------------------------------------
--  DDL for Index DSV_I1_H1
--------------------------------------------------------

  CREATE INDEX "DSV_I1_H1" ON "DSV_H1" ("H1_ZAEHLER")
--------------------------------------------------------
--  DDL for Index DSV_I1_H2
--------------------------------------------------------

  CREATE INDEX "DSV_I1_H2" ON "DSV_H2" ("H2_ZAEHLER")
--------------------------------------------------------
--  DDL for Index DSV_I2_ANFO
--------------------------------------------------------

  CREATE INDEX "DSV_I2_ANFO" ON "DSV_ANFORDERUNGEN" ("ORG", "AKTE", "VORG", "DOKUNR", "WV_DATUM")
--------------------------------------------------------
--  DDL for Index DSV_I2_DOKU_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I2_DOKU_ADR" ON "DSV_DOKU_ADR" ("ADR_NR")
--------------------------------------------------------
--  DDL for Index DSV_I2_STWZUO
--------------------------------------------------------

  CREATE INDEX "DSV_I2_STWZUO" ON "DSV_STWZUO" ("LFD_SCHRNR")
--------------------------------------------------------
--  DDL for Index DSV_I3_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I3_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_1")
--------------------------------------------------------
--  DDL for Index DSV_I4_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I4_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_2")
--------------------------------------------------------
--  DDL for Index DSV_I5_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I5_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_3")
--------------------------------------------------------
--  DDL for Index PKADRESSEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKADRESSEN" ON "DSV_ADRESSEN" ("ADR_NR")
--------------------------------------------------------
--  DDL for Index PKAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKAKTE" ON "DSV_AKTE" ("LFD_AKTENR")
--------------------------------------------------------
--  DDL for Index PKALTAP
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKALTAP" ON "DSV_ALTAP" ("LFD_APNR", "AKTE_ALT")
--------------------------------------------------------
--  DDL for Index PKANFORDERUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKANFORDERUNG" ON "DSV_ANFORDERUNGEN" ("LFD_SCHRNR", "WV_DATUM")
--------------------------------------------------------
--  DDL for Index PKANLA
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKANLA" ON "DSV_ANLA" ("LFD_DOKNR", "ANLANR")
--------------------------------------------------------
--  DDL for Index PKBENUTZER
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKBENUTZER" ON "DSV_BENUTZERPROFIL" ("USER_ID")
--------------------------------------------------------
--  DDL for Index PK_BER_SB
--------------------------------------------------------

  CREATE UNIQUE INDEX "PK_BER_SB" ON "DSV_BERECHTIGTE_SB" ("LFD_DOKNR", "USER_ID")
--------------------------------------------------------
--  DDL for Index PKDOKU_ADR
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKDOKU_ADR" ON "DSV_DOKU_ADR" ("LFD_DOKNR", "ADR_NR")
--------------------------------------------------------
--  DDL for Index PKDOKUNR
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKDOKUNR" ON "DSV_DOKU" ("LFD_DOKNR")
--------------------------------------------------------
--  DDL for Index PKEAI
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKEAI" ON "DSV_LOV_EAI" ("EAI")
--------------------------------------------------------
--  DDL for Index PKEINAUS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKEINAUS" ON "DSV_LOV_EINAUS" ("EINAUS")
--------------------------------------------------------
--  DDL for Index PKFORM
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKFORM" ON "DSV_LOV_FORM" ("FORM")
--------------------------------------------------------
--  DDL for Index PKFORMS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKFORMS" ON "DSV_FORMS" ("FORMNR")
--------------------------------------------------------
--  DDL for Index PKJN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKJN" ON "DSV_LOV_JN" ("JN")
--------------------------------------------------------
--  DDL for Index PKKLASSE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKLASSE" ON "DSV_LOV_KLASSE" ("KLASSE")
--------------------------------------------------------
--  DDL for Index PKKONF
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKONF" ON "DSV_KONFIGURATION" ("FORMNR", "KONFIGURATION")
--------------------------------------------------------
--  DDL for Index PKKONFIGURATION
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKONFIGURATION" ON "DSV_LOV_KONFIGURATION" ("KONFIGURATION")
--------------------------------------------------------
--  DDL for Index PKLAP
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKLAP" ON "DSV_LAP" ("LFD_APNR")
--------------------------------------------------------
--  DDL for Index PKMELDART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKMELDART" ON "DSV_LOV_MELDART" ("MELDART")
--------------------------------------------------------
--  DDL for Index PKMELDUNGEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKMELDUNGEN" ON "DSV_MELDUNGEN" ("NUMMER")
--------------------------------------------------------
--  DDL for Index PKORG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKORG" ON "DSV_LOV_ORG" ("ORG")
--------------------------------------------------------
--  DDL for Index PKRECHTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKRECHTE" ON "DSV_LOV_RECHTE" ("RECHT")
--------------------------------------------------------
--  DDL for Index PKSCHRIFTGUTART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSCHRIFTGUTART" ON "DSV_LOV_SCHRIFTGUTART" ("SCHRIFTGUTART")
--------------------------------------------------------
--  DDL for Index PKSCHRIFTGUTLAPART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSCHRIFTGUTLAPART" ON "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART")
--------------------------------------------------------
--  DDL for Index PKSTATUS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTATUS" ON "DSV_LOV_STATUS" ("STATUS")
--------------------------------------------------------
--  DDL for Index PKSTDVORLAGEWEGAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTDVORLAGEWEGAKTE" ON "DSV_STD_VORLAGEWEG_AKTE" ("ORG", "AKTE", "POSITION")
--------------------------------------------------------
--  DDL for Index PKSTDVORLAGEWEGVORGANG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTDVORLAGEWEGVORGANG" ON "DSV_STD_VORLAGEWEG_VORG" ("ORG", "AKTE", "VORG", "POSITION")
--------------------------------------------------------
--  DDL for Index PKSTICHWORTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTICHWORTE" ON "DSV_STICHWORTE" ("STWNR")
--------------------------------------------------------
--  DDL for Index PKSTOPWORT
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTOPWORT" ON "DSV_STOPWORTE" ("STOPWORT")
--------------------------------------------------------
--  DDL for Index PKSTWSYNO
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTWSYNO" ON "DSV_STWSYNO" ("STICHWNR", "SYNONR")
--------------------------------------------------------
--  DDL for Index PKSTWZUO
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTWZUO" ON "DSV_STWZUO" ("STWNR", "LFD_SCHRNR")
--------------------------------------------------------
--  DDL for Index PKUMREGISTRIERUNGEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKUMREGISTRIERUNGEN" ON "DSV_UMREGISTRIERUNGEN" ("V_SCHRNR", "N_SCHRNR")
--------------------------------------------------------
--  DDL for Index PKVERTEILER
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTEILER" ON "DSV_VERTEILER" ("VERT_NR", "ADR_NR")
--------------------------------------------------------
--  DDL for Index PKVERTNAME
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTNAME" ON "DSV_VERTNAMEN" ("VERT_NR")
--------------------------------------------------------
--  DDL for Index PKVERTRETUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTRETUNG" ON "DSV_VERTRETUNG" ("REGISTRATOR", "VERTRETER")
--------------------------------------------------------
--  DDL for Index PKVORG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVORG" ON "DSV_VORG" ("LFD_VORGNR")
--------------------------------------------------------
--  DDL for Index SYS_C0012204
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012204" ON "DSV_ADRESSEN" ("KUERZEL")
--------------------------------------------------------
--  DDL for Index SYS_C0012222
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012222" ON "DSV_LAP" ("AKTE")
--------------------------------------------------------
--  DDL for Index SYS_C0012230
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012230" ON "DSV_LOV_KLASSE" ("NAME")
--------------------------------------------------------
--  DDL for Index SYS_C0012242
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012242" ON "DSV_STICHWORTE" ("STICHWORT")
--------------------------------------------------------
--  DDL for Index SYS_C0012250
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012250" ON "DSV_TMP_AP_STW" ("AKTE")
--------------------------------------------------------
--  DDL for Index SYS_C0012254
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012254" ON "DSV_VERTNAMEN" ("VERT")
--------------------------------------------------------
--  DDL for Index UQDOKU2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQDOKU2" ON "DSV_DOKU" ("ORG", "AKTE", "VORG", "DOKUNR")
--------------------------------------------------------
--  DDL for Index UQGVP
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQGVP" ON "DSV_GVP" ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER")
--------------------------------------------------------
--  DDL for Index UQKENNUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQKENNUNG" ON "DSV_BENUTZERPROFIL" ("KENNUNG")
--------------------------------------------------------
--  DDL for Index UQLAPAKTE2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQLAPAKTE2" ON "DSV_LAP" ("HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER")
--------------------------------------------------------
--  DDL for Index UQORGAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQORGAKTE" ON "DSV_AKTE" ("ORG", "AKTE")
--------------------------------------------------------
--  DDL for Index UQVORG2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQVORG2" ON "DSV_VORG" ("ORG", "AKTE", "VORG")
--------------------------------------------------------
--  DDL for Index UQVORG3
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQVORG3" ON "DSV_VORG" ("ORG", "AKTE", "VORG_NR")
--------------------------------------------------------
--  DDL for Index DSV_I5_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I5_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_3")
--------------------------------------------------------
--  DDL for Index PKADRESSEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKADRESSEN" ON "DSV_ADRESSEN" ("ADR_NR")
--------------------------------------------------------
--  DDL for Index SYS_C0012204
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012204" ON "DSV_ADRESSEN" ("KUERZEL")
--------------------------------------------------------
--  DDL for Index DSV_I3_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I3_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_1")
--------------------------------------------------------
--  DDL for Index DSV_I4_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I4_ADR" ON "DSV_ADRESSEN" ("BEZEICHNUNG_2")
--------------------------------------------------------
--  DDL for Index DSV_I1_AKTE
--------------------------------------------------------

  CREATE INDEX "DSV_I1_AKTE" ON "DSV_AKTE" ("AKTE")
--------------------------------------------------------
--  DDL for Index PKAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKAKTE" ON "DSV_AKTE" ("LFD_AKTENR")
--------------------------------------------------------
--  DDL for Index UQORGAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQORGAKTE" ON "DSV_AKTE" ("ORG", "AKTE")
--------------------------------------------------------
--  DDL for Index PKALTAP
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKALTAP" ON "DSV_ALTAP" ("LFD_APNR", "AKTE_ALT")
--------------------------------------------------------
--  DDL for Index DSV_I2_ANFO
--------------------------------------------------------

  CREATE INDEX "DSV_I2_ANFO" ON "DSV_ANFORDERUNGEN" ("ORG", "AKTE", "VORG", "DOKUNR", "WV_DATUM")
--------------------------------------------------------
--  DDL for Index DSV_I1_ANFO
--------------------------------------------------------

  CREATE INDEX "DSV_I1_ANFO" ON "DSV_ANFORDERUNGEN" ("ORG", "AKTE")
--------------------------------------------------------
--  DDL for Index PKANFORDERUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKANFORDERUNG" ON "DSV_ANFORDERUNGEN" ("LFD_SCHRNR", "WV_DATUM")
--------------------------------------------------------
--  DDL for Index DSV_I1_ANLA
--------------------------------------------------------

  CREATE UNIQUE INDEX "DSV_I1_ANLA" ON "DSV_ANLA" ("ORG", "AKTE", "VORG", "DOKUNR", "ANLANR")
--------------------------------------------------------
--  DDL for Index PKANLA
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKANLA" ON "DSV_ANLA" ("LFD_DOKNR", "ANLANR")
--------------------------------------------------------
--  DDL for Index PKBENUTZER
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKBENUTZER" ON "DSV_BENUTZERPROFIL" ("USER_ID")
--------------------------------------------------------
--  DDL for Index UQKENNUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQKENNUNG" ON "DSV_BENUTZERPROFIL" ("KENNUNG")
--------------------------------------------------------
--  DDL for Index PK_BER_SB
--------------------------------------------------------

  CREATE UNIQUE INDEX "PK_BER_SB" ON "DSV_BERECHTIGTE_SB" ("LFD_DOKNR", "USER_ID")
--------------------------------------------------------
--  DDL for Index DSV_I1_DOKU
--------------------------------------------------------

  CREATE INDEX "DSV_I1_DOKU" ON "DSV_DOKU" ("ERSTDATUM")
--------------------------------------------------------
--  DDL for Index PKDOKUNR
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKDOKUNR" ON "DSV_DOKU" ("LFD_DOKNR")
--------------------------------------------------------
--  DDL for Index UQDOKU2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQDOKU2" ON "DSV_DOKU" ("ORG", "AKTE", "VORG", "DOKUNR")
--------------------------------------------------------
--  DDL for Index PKDOKU_ADR
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKDOKU_ADR" ON "DSV_DOKU_ADR" ("LFD_DOKNR", "ADR_NR")
--------------------------------------------------------
--  DDL for Index DSV_I2_DOKU_ADR
--------------------------------------------------------

  CREATE INDEX "DSV_I2_DOKU_ADR" ON "DSV_DOKU_ADR" ("ADR_NR")
--------------------------------------------------------
--  DDL for Index PKFORMS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKFORMS" ON "DSV_FORMS" ("FORMNR")
--------------------------------------------------------
--  DDL for Index UQGVP
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQGVP" ON "DSV_GVP" ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER")
--------------------------------------------------------
--  DDL for Index DSV_I1_H1
--------------------------------------------------------

  CREATE INDEX "DSV_I1_H1" ON "DSV_H1" ("H1_ZAEHLER")
--------------------------------------------------------
--  DDL for Index DSV_I1_H2
--------------------------------------------------------

  CREATE INDEX "DSV_I1_H2" ON "DSV_H2" ("H2_ZAEHLER")
--------------------------------------------------------
--  DDL for Index PKKONF
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKONF" ON "DSV_KONFIGURATION" ("FORMNR", "KONFIGURATION")
--------------------------------------------------------
--  DDL for Index PKLAP
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKLAP" ON "DSV_LAP" ("LFD_APNR")
--------------------------------------------------------
--  DDL for Index UQLAPAKTE2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQLAPAKTE2" ON "DSV_LAP" ("HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER")
--------------------------------------------------------
--  DDL for Index SYS_C0012222
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012222" ON "DSV_LAP" ("AKTE")
--------------------------------------------------------
--  DDL for Index PKEAI
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKEAI" ON "DSV_LOV_EAI" ("EAI")
--------------------------------------------------------
--  DDL for Index PKEINAUS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKEINAUS" ON "DSV_LOV_EINAUS" ("EINAUS")
--------------------------------------------------------
--  DDL for Index PKFORM
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKFORM" ON "DSV_LOV_FORM" ("FORM")
--------------------------------------------------------
--  DDL for Index PKJN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKJN" ON "DSV_LOV_JN" ("JN")
--------------------------------------------------------
--  DDL for Index PKKLASSE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKLASSE" ON "DSV_LOV_KLASSE" ("KLASSE")
--------------------------------------------------------
--  DDL for Index SYS_C0012230
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012230" ON "DSV_LOV_KLASSE" ("NAME")
--------------------------------------------------------
--  DDL for Index PKKONFIGURATION
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKKONFIGURATION" ON "DSV_LOV_KONFIGURATION" ("KONFIGURATION")
--------------------------------------------------------
--  DDL for Index PKMELDART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKMELDART" ON "DSV_LOV_MELDART" ("MELDART")
--------------------------------------------------------
--  DDL for Index PKORG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKORG" ON "DSV_LOV_ORG" ("ORG")
--------------------------------------------------------
--  DDL for Index PKRECHTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKRECHTE" ON "DSV_LOV_RECHTE" ("RECHT")
--------------------------------------------------------
--  DDL for Index PKSCHRIFTGUTART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSCHRIFTGUTART" ON "DSV_LOV_SCHRIFTGUTART" ("SCHRIFTGUTART")
--------------------------------------------------------
--  DDL for Index PKSCHRIFTGUTLAPART
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSCHRIFTGUTLAPART" ON "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART")
--------------------------------------------------------
--  DDL for Index PKSTATUS
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTATUS" ON "DSV_LOV_STATUS" ("STATUS")
--------------------------------------------------------
--  DDL for Index PKMELDUNGEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKMELDUNGEN" ON "DSV_MELDUNGEN" ("NUMMER")
--------------------------------------------------------
--  DDL for Index PKSTDVORLAGEWEGAKTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTDVORLAGEWEGAKTE" ON "DSV_STD_VORLAGEWEG_AKTE" ("ORG", "AKTE", "POSITION")
--------------------------------------------------------
--  DDL for Index PKSTDVORLAGEWEGVORGANG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTDVORLAGEWEGVORGANG" ON "DSV_STD_VORLAGEWEG_VORG" ("ORG", "AKTE", "VORG", "POSITION")
--------------------------------------------------------
--  DDL for Index PKSTICHWORTE
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTICHWORTE" ON "DSV_STICHWORTE" ("STWNR")
--------------------------------------------------------
--  DDL for Index SYS_C0012242
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012242" ON "DSV_STICHWORTE" ("STICHWORT")
--------------------------------------------------------
--  DDL for Index PKSTOPWORT
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTOPWORT" ON "DSV_STOPWORTE" ("STOPWORT")
--------------------------------------------------------
--  DDL for Index DSV_I_STWSYNO
--------------------------------------------------------

  CREATE INDEX "DSV_I_STWSYNO" ON "DSV_STWSYNO" ("SYNONR")
--------------------------------------------------------
--  DDL for Index PKSTWSYNO
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTWSYNO" ON "DSV_STWSYNO" ("STICHWNR", "SYNONR")
--------------------------------------------------------
--  DDL for Index DSV_I2_STWZUO
--------------------------------------------------------

  CREATE INDEX "DSV_I2_STWZUO" ON "DSV_STWZUO" ("LFD_SCHRNR")
--------------------------------------------------------
--  DDL for Index PKSTWZUO
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKSTWZUO" ON "DSV_STWZUO" ("STWNR", "LFD_SCHRNR")
--------------------------------------------------------
--  DDL for Index SYS_C0012250
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012250" ON "DSV_TMP_AP_STW" ("AKTE")
--------------------------------------------------------
--  DDL for Index PKUMREGISTRIERUNGEN
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKUMREGISTRIERUNGEN" ON "DSV_UMREGISTRIERUNGEN" ("V_SCHRNR", "N_SCHRNR")
--------------------------------------------------------
--  DDL for Index PKVERTEILER
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTEILER" ON "DSV_VERTEILER" ("VERT_NR", "ADR_NR")
--------------------------------------------------------
--  DDL for Index SYS_C0012254
--------------------------------------------------------

  CREATE UNIQUE INDEX "SYS_C0012254" ON "DSV_VERTNAMEN" ("VERT")
--------------------------------------------------------
--  DDL for Index PKVERTNAME
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTNAME" ON "DSV_VERTNAMEN" ("VERT_NR")
--------------------------------------------------------
--  DDL for Index PKVERTRETUNG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVERTRETUNG" ON "DSV_VERTRETUNG" ("REGISTRATOR", "VERTRETER")
--------------------------------------------------------
--  DDL for Index UQVORG3
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQVORG3" ON "DSV_VORG" ("ORG", "AKTE", "VORG_NR")
--------------------------------------------------------
--  DDL for Index PKVORG
--------------------------------------------------------

  CREATE UNIQUE INDEX "PKVORG" ON "DSV_VORG" ("LFD_VORGNR")
--------------------------------------------------------
--  DDL for Index UQVORG2
--------------------------------------------------------

  CREATE UNIQUE INDEX "UQVORG2" ON "DSV_VORG" ("ORG", "AKTE", "VORG")
--------------------------------------------------------
--  DDL for Procedure MIN_DSV_SEQ_UMR
--------------------------------------------------------
set define off;

  CREATE OR REPLACE EDITIONABLE PROCEDURE "MIN_DSV_SEQ_UMR" as
minvorg number;
mindoku number;
begin
   select min(lfd_doknr) into mindoku from dsv_doku;
   select min(lfd_vorgnr) into minvorg from dsv_vorg;
   if minvorg <= mindoku then
      insert into tmp_minumreg (minnumber) values (minvorg);
   else
      insert into tmp_minumreg (minnumber) values (mindoku);
   end if;
end;
--------------------------------------------------------
--  DDL for Package DSV_RCH
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE "DSV_RCH" AS
FUNCTION eins_empf_gz_auswerten
   (eins_empf        IN  VARCHAR2,
    gz               IN  VARCHAR2,
    v_zaehler        IN  NUMBER,
    fehlertext       OUT VARCHAR2)
   RETURN INTEGER;
END dsv_rch;
--------------------------------------------------------
--  DDL for Package Body DSV_RCH
--------------------------------------------------------

  CREATE OR REPLACE EDITIONABLE PACKAGE BODY "DSV_RCH" AS
/*-----------------------------------------------------------
eins_empf_gz_auswerten
-------------------------------------------------------------
Die Funktion wertet die Angaben für Einsender/Empf. und
Geschäftszeichen in der Recherchemaske aus. Es werden alle
lfd_doknr, die den eingegebenen Bedingunge genügen, in die
Tabelle dsv_h2 geschrieben.
Die Funktion gibt bei auftretenden Fehlern den Oracle-Fehlertext
in dem Parameter "fehlertext" aus.
RETURN = 0: o.k.
RETURN != 0: Fehler
-----------------------------------------------------------*/
FUNCTION eins_empf_gz_auswerten
   (eins_empf        IN  VARCHAR2,
    gz               IN  VARCHAR2,
    v_zaehler       IN  NUMBER,
    fehlertext       OUT VARCHAR2)
   RETURN INTEGER
IS
   statement         VARCHAR2(2000);
   sql_ausf_cursor   INTEGER;
   returnwert        INTEGER;
   gz_klausel        VARCHAR2(2000);
   kuerzel_klausel   VARCHAR2(2000);
   bez_1_klausel     VARCHAR2(2000);
   bez_123_klausel   VARCHAR2(2000);
BEGIN
   IF gz IS NOT NULL THEN
      IF instr(gz, '%', 1, 1) = 0 THEN
         gz_klausel := 'eins_gz IN ('''||REPLACE(gz,',',''',''') || ''') ';
      ELSE
         gz_klausel := 'eins_gz LIKE ''' ||REPLACE(gz,',',''' OR eins_gz LIKE ''') || '''';
      END IF;
   END IF;
   IF eins_empf IS NOT NULL THEN
      IF instr(eins_empf, '%', 1, 1) = 0 THEN
         kuerzel_klausel:= 'UPPER(KUERZEL) IN ('''||UPPER(REPLACE(eins_empf,',',''','''))|| ''') ';
      ELSE
         kuerzel_klausel:= 'UPPER(KUERZEL) LIKE ''' ||UPPER(REPLACE(eins_empf,',',''' OR UPPER(KUERZEL) LIKE '''))|| '''';
      END IF;
      bez_1_klausel:=REPLACE(kuerzel_klausel,'KUERZEL','BEZEICHNUNG_1');
      bez_123_klausel:=REPLACE(kuerzel_klausel,'KUERZEL','BEZEICHNUNG_1||BEZEICHNUNG_2||BEZEICHNUNG_3');
   END IF;
   IF gz IS NOT NULL AND eins_empf IS NOT NULL THEN
      statement:='INSERT INTO dsv_h2 (h2_zaehler, lfd_schrnr)
                  SELECT '||TO_CHAR(v_zaehler)||', lfd_doknr FROM dsv_adrref
                  WHERE '||gz_klausel||' AND ('||
                     kuerzel_klausel||' OR '||bez_1_klausel||' OR '||bez_123_klausel||')';
   ELSIF gz IS NULL AND eins_empf IS NOT NULL THEN
      statement:='INSERT INTO dsv_h2 (h2_zaehler, lfd_schrnr)
                  SELECT '||TO_CHAR(v_zaehler)||', lfd_doknr FROM dsv_adrref
                  WHERE '||kuerzel_klausel||' OR '||bez_1_klausel||' OR '||bez_123_klausel;
   ELSIF gz IS NOT NULL AND eins_empf IS NULL THEN
      statement:='INSERT INTO dsv_h2 (h2_zaehler, lfd_schrnr)
                  SELECT '||TO_CHAR(v_zaehler)||', lfd_doknr FROM dsv_adrref
                  WHERE '||gz_klausel;
   END IF;
   IF statement IS NOT NULL THEN
      sql_ausf_cursor := dbms_sql.open_cursor;
      dbms_sql.parse (sql_ausf_cursor,statement, dbms_sql.v7);
      returnwert := dbms_sql.execute (sql_ausf_cursor);
      dbms_sql.close_cursor (sql_ausf_cursor);
   END IF;
   RETURN 0;
   EXCEPTION WHEN OTHERS THEN
      fehlertext:=SQLERRM;
      RETURN SQLCODE;
END eins_empf_gz_auswerten;
END dsv_rch;
--------------------------------------------------------
--  Constraints for Table DSV_ABLAGEN
--------------------------------------------------------

  ALTER TABLE "DSV_ABLAGEN" MODIFY ("REGISTRIERT" NOT NULL ENABLE)
  ALTER TABLE "DSV_ABLAGEN" MODIFY ("USER_ID" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_ADRESSEN
--------------------------------------------------------

  ALTER TABLE "DSV_ADRESSEN" ADD UNIQUE ("KUERZEL") USING INDEX  ENABLE
  ALTER TABLE "DSV_ADRESSEN" ADD CONSTRAINT "PKADRESSEN" PRIMARY KEY ("ADR_NR") USING INDEX  ENABLE
  ALTER TABLE "DSV_ADRESSEN" MODIFY ("OEFFENTLICH" NOT NULL ENABLE)
  ALTER TABLE "DSV_ADRESSEN" MODIFY ("GUELTIG_AB" NOT NULL ENABLE)
  ALTER TABLE "DSV_ADRESSEN" MODIFY ("BEZEICHNUNG_1" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_AKTE
--------------------------------------------------------

  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "UQORGAKTE" UNIQUE ("ORG", "AKTE") USING INDEX  ENABLE
  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "PKAKTE" PRIMARY KEY ("LFD_AKTENR") USING INDEX  ENABLE
  ALTER TABLE "DSV_AKTE" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("ERST_REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("STATUS" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_AKTE" MODIFY ("LFD_APNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_ALTAP
--------------------------------------------------------

  ALTER TABLE "DSV_ALTAP" ADD CONSTRAINT "PKALTAP" PRIMARY KEY ("LFD_APNR", "AKTE_ALT") USING INDEX  ENABLE
  ALTER TABLE "DSV_ALTAP" MODIFY ("AKTE_ALT" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_ANFORDERUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_ANFORDERUNGEN" ADD CONSTRAINT "PKANFORDERUNG" PRIMARY KEY ("LFD_SCHRNR", "WV_DATUM") USING INDEX  ENABLE
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("FESTE_WV" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("WV_DATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("ANF_DATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("BEARBEITER" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("UMFANG" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANFORDERUNGEN" MODIFY ("LFD_SCHRNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_ANLA
--------------------------------------------------------

  ALTER TABLE "DSV_ANLA" ADD CONSTRAINT "PKANLA" PRIMARY KEY ("LFD_DOKNR", "ANLANR") USING INDEX  ENABLE
  ALTER TABLE "DSV_ANLA" MODIFY ("DOKUNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANLA" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANLA" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANLA" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANLA" MODIFY ("ANLANR" NOT NULL ENABLE)
  ALTER TABLE "DSV_ANLA" MODIFY ("LFD_DOKNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_BENUTZERPROFIL
--------------------------------------------------------

  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "UQKENNUNG" UNIQUE ("KENNUNG") USING INDEX  ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "PKBENUTZER" PRIMARY KEY ("USER_ID") USING INDEX  ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" MODIFY ("KENNUNG" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_BERECHTIGTE_SB
--------------------------------------------------------

  ALTER TABLE "DSV_BERECHTIGTE_SB" ADD CONSTRAINT "PK_BER_SB" PRIMARY KEY ("LFD_DOKNR", "USER_ID") USING INDEX  ENABLE
  ALTER TABLE "DSV_BERECHTIGTE_SB" MODIFY ("USER_ID" NOT NULL ENABLE)
  ALTER TABLE "DSV_BERECHTIGTE_SB" MODIFY ("LFD_DOKNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_DOKU
--------------------------------------------------------

  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "UQDOKU2" UNIQUE ("ORG", "AKTE", "VORG", "DOKUNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "PKDOKUNR" PRIMARY KEY ("LFD_DOKNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "CH_DOKU_GEHEIM" CHECK (geheim in ('J','N')) ENABLE
  ALTER TABLE "DSV_DOKU" MODIFY ("GEHEIM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("VORG_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("ERST_REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("FORM_PE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("DATUM_LETZTEVERF" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("ERSTDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("STATUS" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("EAI_KENNUNG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("BETREFF" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("DOKUNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("LFD_VORGNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU" MODIFY ("LFD_AKTENR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_DOKU_ADR
--------------------------------------------------------

  ALTER TABLE "DSV_DOKU_ADR" ADD CONSTRAINT "PKDOKU_ADR" PRIMARY KEY ("LFD_DOKNR", "ADR_NR") USING INDEX  ENABLE
  ALTER TABLE "DSV_DOKU_ADR" MODIFY ("ADR_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU_ADR" MODIFY ("LFD_DOKNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_DOKU0104
--------------------------------------------------------

  ALTER TABLE "DSV_DOKU0104" MODIFY ("GEHEIM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("VORG_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("ERST_REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("FORM_PE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("DATUM_LETZTEVERF" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("ERSTDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("STATUS" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("EAI_KENNUNG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("BETREFF" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("DOKUNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("LFD_VORGNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("LFD_AKTENR" NOT NULL ENABLE)
  ALTER TABLE "DSV_DOKU0104" MODIFY ("LFD_DOKNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_FORMS
--------------------------------------------------------

  ALTER TABLE "DSV_FORMS" ADD CONSTRAINT "PKFORMS" PRIMARY KEY ("FORMNR") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_GVP
--------------------------------------------------------

  ALTER TABLE "DSV_GVP" ADD CONSTRAINT "UQGVP" UNIQUE ("BEARBEITER", "ORG", "HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER") USING INDEX  ENABLE
  ALTER TABLE "DSV_GVP" MODIFY ("RECHT" NOT NULL ENABLE)
  ALTER TABLE "DSV_GVP" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_GVP" MODIFY ("BEARBEITER" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_HG
--------------------------------------------------------

  ALTER TABLE "DSV_HG" MODIFY ("HGRUPPE" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_KONFIGURATION
--------------------------------------------------------

  ALTER TABLE "DSV_KONFIGURATION" ADD CONSTRAINT "PKKONF" PRIMARY KEY ("FORMNR", "KONFIGURATION") USING INDEX  ENABLE
  ALTER TABLE "DSV_KONFIGURATION" MODIFY ("FORMNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_LAP
--------------------------------------------------------

  ALTER TABLE "DSV_LAP" ADD CONSTRAINT "CHKLAPAKTE" CHECK (akte = decode(tglieder,'',hgruppe||gruppe||ugruppe, 			         hgruppe||gruppe||ugruppe||'.'||tglieder)) ENABLE
  ALTER TABLE "DSV_LAP" ADD CONSTRAINT "UQLAPAKTE2" UNIQUE ("HGRUPPE", "GRUPPE", "UGRUPPE", "TGLIEDER") USING INDEX  ENABLE
  ALTER TABLE "DSV_LAP" ADD UNIQUE ("AKTE") USING INDEX  ENABLE
  ALTER TABLE "DSV_LAP" ADD CONSTRAINT "PKLAP" PRIMARY KEY ("LFD_APNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_LAP" ADD CONSTRAINT "CHKTGLIEDER" CHECK (tglieder=upper(tglieder)) ENABLE
  ALTER TABLE "DSV_LAP" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_LAP" MODIFY ("HGRUPPE" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_LOV_EAI
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_EAI" ADD CONSTRAINT "PKEAI" PRIMARY KEY ("EAI") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_EINAUS
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_EINAUS" ADD CONSTRAINT "PKEINAUS" PRIMARY KEY ("EINAUS") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_FORM
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_FORM" ADD CONSTRAINT "PKFORM" PRIMARY KEY ("FORM") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_JN
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_JN" ADD CONSTRAINT "PKJN" PRIMARY KEY ("JN") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_KLASSE
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_KLASSE" ADD UNIQUE ("NAME") USING INDEX  ENABLE
  ALTER TABLE "DSV_LOV_KLASSE" ADD CONSTRAINT "PKKLASSE" PRIMARY KEY ("KLASSE") USING INDEX  ENABLE
  ALTER TABLE "DSV_LOV_KLASSE" MODIFY ("NAME" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_LOV_KONFIGURATION
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_KONFIGURATION" ADD CONSTRAINT "PKKONFIGURATION" PRIMARY KEY ("KONFIGURATION") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_MELDART
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_MELDART" ADD CONSTRAINT "PKMELDART" PRIMARY KEY ("MELDART") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_ORG
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_ORG" ADD CONSTRAINT "PKORG" PRIMARY KEY ("ORG") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_RECHTE
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_RECHTE" ADD CONSTRAINT "PKRECHTE" PRIMARY KEY ("RECHT") USING INDEX  ENABLE
  ALTER TABLE "DSV_LOV_RECHTE" MODIFY ("RECHT" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_LOV_SCHRIFTGUTART
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_SCHRIFTGUTART" ADD CONSTRAINT "PKSCHRIFTGUTART" PRIMARY KEY ("SCHRIFTGUTART") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_SCHRIFTGUTLAPART
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_SCHRIFTGUTLAPART" ADD CONSTRAINT "PKSCHRIFTGUTLAPART" PRIMARY KEY ("SCHRIFTGUTLAPART") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_LOV_STATUS
--------------------------------------------------------

  ALTER TABLE "DSV_LOV_STATUS" ADD CONSTRAINT "PKSTATUS" PRIMARY KEY ("STATUS") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_MELDUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_MELDUNGEN" ADD CONSTRAINT "PKMELDUNGEN" PRIMARY KEY ("NUMMER") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_REP
--------------------------------------------------------

  ALTER TABLE "DSV_REP" MODIFY ("R_TYP" NOT NULL ENABLE)
  ALTER TABLE "DSV_REP" MODIFY ("R_NAME" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_STD_VORLAGEWEG_AKTE
--------------------------------------------------------

  ALTER TABLE "DSV_STD_VORLAGEWEG_AKTE" ADD CONSTRAINT "PKSTDVORLAGEWEGAKTE" PRIMARY KEY ("ORG", "AKTE", "POSITION") USING INDEX  ENABLE
  ALTER TABLE "DSV_STD_VORLAGEWEG_AKTE" MODIFY ("BEARBEITER" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_AKTE" MODIFY ("POSITION" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_AKTE" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_AKTE" MODIFY ("ORG" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_STD_VORLAGEWEG_VORG
--------------------------------------------------------

  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" ADD CONSTRAINT "PKSTDVORLAGEWEGVORGANG" PRIMARY KEY ("ORG", "AKTE", "VORG", "POSITION") USING INDEX  ENABLE
  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" MODIFY ("BEARBEITER" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" MODIFY ("POSITION" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_STD_VORLAGEWEG_VORG" MODIFY ("ORG" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_STICHWORTE
--------------------------------------------------------

  ALTER TABLE "DSV_STICHWORTE" ADD CONSTRAINT "CHKSTICHWORT" CHECK (stichwort=upper(stichwort)) ENABLE
  ALTER TABLE "DSV_STICHWORTE" ADD UNIQUE ("STICHWORT") USING INDEX  ENABLE
  ALTER TABLE "DSV_STICHWORTE" ADD CONSTRAINT "PKSTICHWORTE" PRIMARY KEY ("STWNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_STICHWORTE" MODIFY ("STICHWORT" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_STOPWORTE
--------------------------------------------------------

  ALTER TABLE "DSV_STOPWORTE" ADD CONSTRAINT "CHKSTOPWORT" CHECK (stopwort=upper(stopwort)) ENABLE
  ALTER TABLE "DSV_STOPWORTE" ADD CONSTRAINT "PKSTOPWORT" PRIMARY KEY ("STOPWORT") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_STWSYNO
--------------------------------------------------------

  ALTER TABLE "DSV_STWSYNO" ADD CONSTRAINT "PKSTWSYNO" PRIMARY KEY ("STICHWNR", "SYNONR") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_STWZUO
--------------------------------------------------------

  ALTER TABLE "DSV_STWZUO" ADD CONSTRAINT "PKSTWZUO" PRIMARY KEY ("STWNR", "LFD_SCHRNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_STWZUO" MODIFY ("SCHRIFTGUTLAPART" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_SYSTEMPROFIL
--------------------------------------------------------

  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "CHVORG_VON_BIS_NUM" CHECK (vorg_von_bis_num in ('A','N')) ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "CHVORG_SORT_NUM" CHECK (vorg_sort_num in ('A','N')) ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" MODIFY ("BC_SPENDER_JN" NOT NULL ENABLE)
  ALTER TABLE "DSV_SYSTEMPROFIL" MODIFY ("GZ_GROSS_JN" NOT NULL ENABLE)
  ALTER TABLE "DSV_SYSTEMPROFIL" MODIFY ("SYS_PROFIL_UMFANG" NOT NULL ENABLE)
  ALTER TABLE "DSV_SYSTEMPROFIL" MODIFY ("SYS_PROFIL_EAI" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_TMP_AP_STW
--------------------------------------------------------

  ALTER TABLE "DSV_TMP_AP_STW" ADD PRIMARY KEY ("AKTE") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_UMREGISTRIERUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_UMREGISTRIERUNGEN" ADD CONSTRAINT "PKUMREGISTRIERUNGEN" PRIMARY KEY ("V_SCHRNR", "N_SCHRNR") USING INDEX  ENABLE
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("UMREG_DATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("SCHRIFTGUTART" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("N_ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("N_SCHRNR" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("V_ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_UMREGISTRIERUNGEN" MODIFY ("V_SCHRNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_VERTEILER
--------------------------------------------------------

  ALTER TABLE "DSV_VERTEILER" ADD CONSTRAINT "PKVERTEILER" PRIMARY KEY ("VERT_NR", "ADR_NR") USING INDEX  ENABLE
  ALTER TABLE "DSV_VERTEILER" MODIFY ("ADR_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VERTEILER" MODIFY ("VERT_NR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_VERTNAMEN
--------------------------------------------------------

  ALTER TABLE "DSV_VERTNAMEN" ADD UNIQUE ("VERT") USING INDEX  ENABLE
  ALTER TABLE "DSV_VERTNAMEN" ADD CONSTRAINT "PKVERTNAME" PRIMARY KEY ("VERT_NR") USING INDEX  ENABLE
  ALTER TABLE "DSV_VERTNAMEN" MODIFY ("VERT" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_VERTRETUNG
--------------------------------------------------------

  ALTER TABLE "DSV_VERTRETUNG" ADD CONSTRAINT "PKVERTRETUNG" PRIMARY KEY ("REGISTRATOR", "VERTRETER") USING INDEX  ENABLE
--------------------------------------------------------
--  Constraints for Table DSV_VORG
--------------------------------------------------------

  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "UQVORG2" UNIQUE ("ORG", "AKTE", "VORG") USING INDEX  ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "PKVORG" PRIMARY KEY ("LFD_VORGNR") DISABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "UQVORG3" UNIQUE ("ORG", "AKTE", "VORG_NR") USING INDEX  ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "CHKVORG" CHECK (vorg=upper(vorg)) ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "CHENTSCH_ARCHIV" CHECK ((entsch_archiv is null) or (entsch_archiv in ('A','V'))) ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "CHVORSCHL_BEH" CHECK ((vorschl_beh is null) or (vorschl_beh in ('A','V'))) ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "VORG_OHNE_LEERZEICHEN" CHECK (vorg = ltrim (vorg)) ENABLE
  ALTER TABLE "DSV_VORG" MODIFY ("VORG_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("ERST_REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("DATUM_LETZTEVERF" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("STATUS" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG" MODIFY ("LFD_AKTENR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_VORG0104
--------------------------------------------------------

  ALTER TABLE "DSV_VORG0104" MODIFY ("VORG_NR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("ERST_REGDATUM" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("ERST_REGISTRATOR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("DATUM_LETZTEVERF" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("STATUS" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("VORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("AKTE" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("HGRUPPE" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("ORG" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("LFD_AKTENR" NOT NULL ENABLE)
  ALTER TABLE "DSV_VORG0104" MODIFY ("LFD_VORGNR" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table DSV_WEITERE_ABLAGEN
--------------------------------------------------------

  ALTER TABLE "DSV_WEITERE_ABLAGEN" MODIFY ("REGISTRIERT" NOT NULL ENABLE)
  ALTER TABLE "DSV_WEITERE_ABLAGEN" MODIFY ("USER_ID" NOT NULL ENABLE)
--------------------------------------------------------
--  Constraints for Table USER_VWR_TABLE
--------------------------------------------------------

  ALTER TABLE "USER_VWR_TABLE" MODIFY ("NEU" NOT NULL ENABLE)
  ALTER TABLE "USER_VWR_TABLE" MODIFY ("ALT" NOT NULL ENABLE)
--------------------------------------------------------
--  Ref Constraints for Table DSV_ABLAGEN
--------------------------------------------------------

  ALTER TABLE "DSV_ABLAGEN" ADD CONSTRAINT "FKABLBEN" FOREIGN KEY ("USER_ID") REFERENCES "DSV_BENUTZERPROFIL" ("USER_ID") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_ADRESSEN
--------------------------------------------------------

  ALTER TABLE "DSV_ADRESSEN" ADD CONSTRAINT "FKOBSOLET" FOREIGN KEY ("OBSOLET") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
  ALTER TABLE "DSV_ADRESSEN" ADD CONSTRAINT "FKOEFFENTLICH" FOREIGN KEY ("OEFFENTLICH") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_AKTE
--------------------------------------------------------

  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "FKAKTELAP" FOREIGN KEY ("AKTE") REFERENCES "DSV_LAP" ("AKTE") ENABLE
  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "FKAORG" FOREIGN KEY ("ORG") REFERENCES "DSV_LOV_ORG" ("ORG") ENABLE
  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "FKAPNR" FOREIGN KEY ("LFD_APNR") REFERENCES "DSV_LAP" ("LFD_APNR") ENABLE
  ALTER TABLE "DSV_AKTE" ADD CONSTRAINT "FKASTATUS" FOREIGN KEY ("STATUS") REFERENCES "DSV_LOV_STATUS" ("STATUS") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_ALTAP
--------------------------------------------------------

  ALTER TABLE "DSV_ALTAP" ADD CONSTRAINT "FKALTAPNR" FOREIGN KEY ("LFD_APNR") REFERENCES "DSV_LAP" ("LFD_APNR") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_ANFORDERUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_ANFORDERUNGEN" ADD CONSTRAINT "FKANFORDUMFANG" FOREIGN KEY ("UMFANG") REFERENCES "DSV_LOV_SCHRIFTGUTART" ("SCHRIFTGUTART") ENABLE
  ALTER TABLE "DSV_ANFORDERUNGEN" ADD CONSTRAINT "FKFESTE_WV" FOREIGN KEY ("FESTE_WV") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_BENUTZERPROFIL
--------------------------------------------------------

  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "FKBENEAI" FOREIGN KEY ("BEN_EAI") REFERENCES "DSV_LOV_EAI" ("EAI") ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "FKBENKLASSE" FOREIGN KEY ("BEN_KLASSE") REFERENCES "DSV_LOV_KLASSE" ("KLASSE") ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "FKBENORG" FOREIGN KEY ("VOREINST_ORG") REFERENCES "DSV_LOV_ORG" ("ORG") ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "FKBENUMFANG" FOREIGN KEY ("BEN_UMFANG") REFERENCES "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART") ENABLE
  ALTER TABLE "DSV_BENUTZERPROFIL" ADD CONSTRAINT "FKKONFIGURATION" FOREIGN KEY ("KONFIGURATION") REFERENCES "DSV_LOV_KONFIGURATION" ("KONFIGURATION") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_BERECHTIGTE_SB
--------------------------------------------------------

  ALTER TABLE "DSV_BERECHTIGTE_SB" ADD CONSTRAINT "FK_BER_SB2" FOREIGN KEY ("USER_ID") REFERENCES "DSV_BENUTZERPROFIL" ("USER_ID") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_DOKU
--------------------------------------------------------

  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKDORG" FOREIGN KEY ("ORG") REFERENCES "DSV_LOV_ORG" ("ORG") ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKDSTATUS" FOREIGN KEY ("STATUS") REFERENCES "DSV_LOV_STATUS" ("STATUS") ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKEAI" FOREIGN KEY ("EAI_KENNUNG") REFERENCES "DSV_LOV_EAI" ("EAI") ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKFORM_PE" FOREIGN KEY ("FORM_PE") REFERENCES "DSV_LOV_FORM" ("FORM") ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKKLASSE" FOREIGN KEY ("KLASSE") REFERENCES "DSV_LOV_KLASSE" ("KLASSE") ENABLE
  ALTER TABLE "DSV_DOKU" ADD CONSTRAINT "FKORIG_VERN" FOREIGN KEY ("ORIG_VERN") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_DOKU_ADR
--------------------------------------------------------

  ALTER TABLE "DSV_DOKU_ADR" ADD CONSTRAINT "FKDOKUADR" FOREIGN KEY ("ADR_NR") REFERENCES "DSV_ADRESSEN" ("ADR_NR") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_GVP
--------------------------------------------------------

  ALTER TABLE "DSV_GVP" ADD CONSTRAINT "FKGVPBEARBEITER" FOREIGN KEY ("BEARBEITER") REFERENCES "DSV_BENUTZERPROFIL" ("USER_ID") ENABLE
  ALTER TABLE "DSV_GVP" ADD CONSTRAINT "FKGVPRECHT" FOREIGN KEY ("RECHT") REFERENCES "DSV_LOV_RECHTE" ("RECHT") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_KONFIGURATION
--------------------------------------------------------

  ALTER TABLE "DSV_KONFIGURATION" ADD CONSTRAINT "FKKONFFORMNR" FOREIGN KEY ("FORMNR") REFERENCES "DSV_FORMS" ("FORMNR") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_MELDUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_MELDUNGEN" ADD CONSTRAINT "FKMELDART" FOREIGN KEY ("ART") REFERENCES "DSV_LOV_MELDART" ("MELDART") ENABLE
  ALTER TABLE "DSV_MELDUNGEN" ADD CONSTRAINT "FKPROTEINAUS" FOREIGN KEY ("EINAUS") REFERENCES "DSV_LOV_EINAUS" ("EINAUS") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_PROTOKOLL
--------------------------------------------------------

  ALTER TABLE "DSV_PROTOKOLL" ADD CONSTRAINT "FKPROTOKOLLART" FOREIGN KEY ("ART") REFERENCES "DSV_LOV_MELDART" ("MELDART") ENABLE
  ALTER TABLE "DSV_PROTOKOLL" ADD CONSTRAINT "FKPROTOKOLLMELDUNGEN" FOREIGN KEY ("NUMMER") REFERENCES "DSV_MELDUNGEN" ("NUMMER") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_STWSYNO
--------------------------------------------------------

  ALTER TABLE "DSV_STWSYNO" ADD CONSTRAINT "FKSTICHWORT" FOREIGN KEY ("STICHWNR") REFERENCES "DSV_STICHWORTE" ("STWNR") ENABLE
  ALTER TABLE "DSV_STWSYNO" ADD CONSTRAINT "FKSYNONYM" FOREIGN KEY ("SYNONR") REFERENCES "DSV_STICHWORTE" ("STWNR") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_STWZUO
--------------------------------------------------------

  ALTER TABLE "DSV_STWZUO" ADD CONSTRAINT "FKSTWZUO" FOREIGN KEY ("STWNR") REFERENCES "DSV_STICHWORTE" ("STWNR") ENABLE
  ALTER TABLE "DSV_STWZUO" ADD CONSTRAINT "FKSTWZUOART" FOREIGN KEY ("SCHRIFTGUTLAPART") REFERENCES "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_SYSTEMPROFIL
--------------------------------------------------------

  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "FKBC_SPENDER_JN" FOREIGN KEY ("BC_SPENDER_JN") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "FKGZ_GROSS_JN" FOREIGN KEY ("GZ_GROSS_JN") REFERENCES "DSV_LOV_JN" ("JN") ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "FKSYSEAI" FOREIGN KEY ("SYS_PROFIL_EAI") REFERENCES "DSV_LOV_EAI" ("EAI") ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "FKSYSKLASSE" FOREIGN KEY ("SYS_PROFIL_KLASSE") REFERENCES "DSV_LOV_KLASSE" ("KLASSE") ENABLE
  ALTER TABLE "DSV_SYSTEMPROFIL" ADD CONSTRAINT "FKSYSUMFANG" FOREIGN KEY ("SYS_PROFIL_UMFANG") REFERENCES "DSV_LOV_SCHRIFTGUTLAPART" ("SCHRIFTGUTLAPART") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_UMREGISTRIERUNGEN
--------------------------------------------------------

  ALTER TABLE "DSV_UMREGISTRIERUNGEN" ADD CONSTRAINT "FKUMREGSCHRIFTGUTART" FOREIGN KEY ("SCHRIFTGUTART") REFERENCES "DSV_LOV_SCHRIFTGUTART" ("SCHRIFTGUTART") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_VERTEILER
--------------------------------------------------------

  ALTER TABLE "DSV_VERTEILER" ADD CONSTRAINT "FKVERTADR" FOREIGN KEY ("ADR_NR") REFERENCES "DSV_ADRESSEN" ("ADR_NR") ENABLE
  ALTER TABLE "DSV_VERTEILER" ADD CONSTRAINT "FKVERTVERTNAMEN" FOREIGN KEY ("VERT_NR") REFERENCES "DSV_VERTNAMEN" ("VERT_NR") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_VERTRETUNG
--------------------------------------------------------

  ALTER TABLE "DSV_VERTRETUNG" ADD CONSTRAINT "FKVERTREG" FOREIGN KEY ("REGISTRATOR") REFERENCES "DSV_BENUTZERPROFIL" ("USER_ID") ENABLE
  ALTER TABLE "DSV_VERTRETUNG" ADD CONSTRAINT "FKVERTRVERTR" FOREIGN KEY ("VERTRETER") REFERENCES "DSV_BENUTZERPROFIL" ("USER_ID") ENABLE
--------------------------------------------------------
--  Ref Constraints for Table DSV_VORG
--------------------------------------------------------

  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "FKVORG" FOREIGN KEY ("ORG") REFERENCES "DSV_LOV_ORG" ("ORG") ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "FKVORGAKTE2" FOREIGN KEY ("ORG", "AKTE") REFERENCES "DSV_AKTE" ("ORG", "AKTE") ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "FKVORGAKTENR" FOREIGN KEY ("LFD_AKTENR") REFERENCES "DSV_AKTE" ("LFD_AKTENR") ENABLE
  ALTER TABLE "DSV_VORG" ADD CONSTRAINT "FKVSTATUS" FOREIGN KEY ("STATUS") REFERENCES "DSV_LOV_STATUS" ("STATUS") ENABLE
