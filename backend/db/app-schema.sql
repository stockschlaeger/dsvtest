-- Tabellen der neuen Anwendung in einem eigenen Schema; die Alttabellen bleiben unverändert
CREATE SCHEMA IF NOT EXISTS dsv_app;

-- Anmeldungen (Logins) und ihre Zuordnung zu einer Altkennung (DSV_BENUTZERPROFIL.USER_ID).
-- Mehrere Anmeldungen dürfen dieselbe Altkennung nutzen; user_id NULL = noch nicht zugeordnet.
CREATE TABLE IF NOT EXISTS dsv_app.anmeldung (
  login varchar(255) PRIMARY KEY,
  user_id varchar(30),
  name varchar(255),
  email varchar(255),
  gesperrt boolean NOT NULL DEFAULT false,
  erste_anmeldung timestamptz NOT NULL DEFAULT now(),
  letzte_anmeldung timestamptz NOT NULL DEFAULT now(),
  zugeordnet_von varchar(255),
  zugeordnet_am timestamptz,
  -- aktive Vertretung (Handbuch 5.1 „Vertretung übernehmen“): Kennung der vertretenen Person
  vertretung_aktiv varchar(30)
);
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS vertretung_aktiv varchar(30);
-- vorab angelegte Logins waren noch nie angemeldet
ALTER TABLE dsv_app.anmeldung ALTER COLUMN letzte_anmeldung DROP NOT NULL;

-- Lokale Anmeldung (AUTH_MODUS=lokal): Passwort als scrypt-Hash, Startpasswort muss geändert werden,
-- vorübergehende Sperre nach zu vielen Fehlversuchen
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS passwort_hash text;
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS passwort_aendern boolean NOT NULL DEFAULT false;
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS passwort_gesetzt_am timestamptz;
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS fehlversuche smallint NOT NULL DEFAULT 0;
ALTER TABLE dsv_app.anmeldung ADD COLUMN IF NOT EXISTS gesperrt_bis timestamptz;

-- Sitzungen der lokalen Anmeldung; gespeichert wird nur der SHA-256 des Cookie-Werts
CREATE TABLE IF NOT EXISTS dsv_app.sitzung (
  token_hash char(64) PRIMARY KEY,
  login varchar(255) NOT NULL REFERENCES dsv_app.anmeldung (login) ON DELETE CASCADE,
  erstellt timestamptz NOT NULL DEFAULT now(),
  ablauf timestamptz NOT NULL
);
CREATE INDEX IF NOT EXISTS sitzung_login ON dsv_app.sitzung (login);

-- Änderungsprotokoll der neuen Anwendung (wer hat wann was geändert)
CREATE TABLE IF NOT EXISTS dsv_app.protokoll (
  id bigserial PRIMARY KEY,
  zeitpunkt timestamptz NOT NULL DEFAULT now(),
  login varchar(255) NOT NULL,
  user_id varchar(30),
  objekt_typ varchar(30) NOT NULL,
  objekt_id varchar(100) NOT NULL,
  aktion varchar(40) NOT NULL,
  details jsonb
);
CREATE INDEX IF NOT EXISTS protokoll_objekt ON dsv_app.protokoll (objekt_typ, objekt_id);
