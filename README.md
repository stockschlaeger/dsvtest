# DSV – Dokumenten- und Schriftgutverwaltung

Ablösung der Oracle-Altanwendung „DSV“ per **Lift & Shift**: Der bestehende Datenbestand wird 1:1 nach PostgreSQL übernommen und bleibt unverändert nutzbar. Eine neue Weboberfläche mit Node-Backend arbeitet direkt auf den Alttabellen (`DSV_AKTE`, `DSV_VORG`, `DSV_DOKU`, …).

Neu sind nur zwei Dinge:
- **Anmeldung in der App statt über Oracle-Benutzer.** Übergangsweise mit Login und Passwort der App (`AUTH_MODUS=lokal`); umschaltbar auf den Keycloak der Organisation (`AUTH_MODUS=keycloak`). Rollen und Rechte verwaltet in beiden Fällen die App.
- **Die Logik der Oracle-Views und des PL/SQL-Packages steckt im Backend.** In Postgres liegen nur Tabellen, Schlüssel, Indizes und Sequenzen.

Das Schema der Altanwendung liegt in [history/DSV.sql](history/DSV.sql), das alte Benutzerhandbuch in [history/DSV-Handbuch.pdf](history/DSV-Handbuch.pdf).

## Fachliches Modell (wie in der Altanwendung)

| Ebene | Tabelle | Aktenzeichen | Schlüssel |
|---|---|---|---|
| Aktenplan | `DSV_HG` (Hauptgruppen), `DSV_LAP` (Positionen) | Kennzeichen = HGRUPPE‖GRUPPE‖UGRUPPE[.TGLIEDER], z. B. `0022.NB` | `LFD_APNR` |
| Akte | `DSV_AKTE` | `ORG-AKTE`, z. B. `72c-0022.NB` (je Referat eine Akte pro Aktenplanposition) | `LFD_AKTENR` (Sequenz `dsv_seq_akte`) |
| Vorgang | `DSV_VORG` | `ORG-AKTE/VORG`, VORG frei oder nächste `VORG_NR` | `LFD_VORGNR` (`dsv_seq_vorg`) |
| Dokument | `DSV_DOKU` | `ORG-AKTE/VORG/DOKUNR` | `LFD_DOKNR` (`dsv_seq_doku`) |

- **Dateien** liegen außerhalb; das Dokument verweist über `DATEIPFAD` + `DATEINAME` darauf.
- **Anlagen** (`DSV_ANLA`): Freitext oder Verweis auf ein anderes registriertes Dokument.
- **Einsender/Empfänger** (`DSV_DOKU_ADR` → `DSV_ADRESSEN`) mit Eingangsdatum und Geschäftszeichen.
- **Stichworte** (`DSV_STICHWORTE`, Großbuchstaben) an Dokumenten (`DSV_STWZUO`, Art `D`) und Aktenplanpositionen (Art `P`); Synonyme (`DSV_STWSYNO`) werden in der Recherche in beide Richtungen ausgewertet; Stoppworte (`DSV_STOPWORTE`) sind gesperrt.
- **Wiedervorlagen** = Anforderungen (`DSV_ANFORDERUNGEN`, Umfang A/V/D, Schlüssel `LFD_SCHRNR` + `WV_DATUM`); „erledigt“ trägt die Anforderung aus.
- **Wertelisten** kommen aus `DSV_LOV_*` (Referate, Status, E/A/I, Dokumentenklasse, Form, Rechte …).

## Benutzer, Rollen und Rechte

**Anmeldung.** In der Altanwendung war jeder Benutzer ein Oracle-Datenbankbenutzer mit Oracle-Passwort. Ein AD war nicht angebunden. Die neue App meldet auf zwei Arten an; beide liefern nur den Login:

| `AUTH_MODUS` | Anmeldung | Passwörter |
|---|---|---|
| `lokal` (Standard, Übergang) | Anmeldemaske der App, Sitzung als httpOnly-Cookie (SameSite=Strict) | scrypt-Hash in `dsv_app.anmeldung`; die Administration vergibt Startpasswörter |
| `keycloak` | Keycloak der Organisation (PKCE); dort nur ein Client, keine Rollen/Gruppen | im Keycloak bzw. dessen AD |

Bei der lokalen Anmeldung gilt:
- Der Login ist in der Regel die Altkennung (früher der Oracle-Benutzername).
- Die alten Oracle-Passwörter lassen sich nicht übernehmen; alle bekommen ein Startpasswort.
- Startpasswörter vergibt die Administration in der Benutzerverwaltung („+ Neuer Login“, „Passwort zurücksetzen“) oder per Konsole: `npm run passwort -- <login> [--altkennung KENNUNG]`. Sie müssen bei der ersten Anmeldung geändert werden; bis dahin ist nichts anderes möglich.
- Nach 5 Fehlversuchen ist der Login 15 Minuten gesperrt.
- Zurücksetzen und Sperren beenden laufende Sitzungen.
- Ändernde Anfragen müssen den Header `X-DSV-Anfrage` tragen (Schutz gegen Anfragen fremder Seiten).

**Zuordnung:** Jeder Login wird einer **Altkennung** (`DSV_BENUTZERPROFIL.USER_ID`) zugeordnet; gespeichert in der App-Tabelle `dsv_app.anmeldung`.
- Entspricht der Login (in Großbuchstaben) einer Altkennung, geschieht das automatisch.
- Sonst erscheint die Anmeldung in der Benutzerverwaltung unter „Anmeldungen“ und wird dort zugeordnet. Bis dahin sieht der Benutzer „Noch kein Zugang“.
- Mehrere Logins dürfen dieselbe Altkennung nutzen; sie erben deren Rollen, Zuständigkeiten und Vertretungen.

**Die Altkennung bestimmt alle Rechte – genau wie früher der Oracle-Benutzer (`USER`) in den Views:**

| Was | Tabelle | Wirkung |
|---|---|---|
| Rollen | `DSV_BENUTZERPROFIL.KLASSE_REG/SB/NS/SY/ST/DS` | Registratur, Sachbearbeitung, Nur Lesen, Systemverwaltung, Stammdatenverwaltung, Datenschutz |
| Zuständigkeiten | `DSV_GVP` | Referat (`ORG`) und optional Aktenplan-Teilbaum; Recht `L` = nur lesen, sonst schreiben |
| Vertretungen | `DSV_VERTRETUNG` | nur zwischen Registratoren; Vertreter liest wie die vertretene Person (wie `DSV_LESE_GVP`) und kann in ihrem Namen handeln |
| Geheime Dokumente | `DSV_DOKU.GEHEIM`, `DSV_BERECHTIGTE_SB` | nur Registratur, Datenschutz und eingetragene Sachbearbeiter (wie `DSV_DOKU_`) |
| Vorbelegungen | `VOREINST_ORG`, `BEN_EAI`, `BEN_KLASSE`, `BEN_UMFANG` | Vorbelegung beim Registrieren |

- **Lesen:** irgendein passender GVP-Eintrag (gleiches Referat; HGRUPPE/GRUPPE/UGRUPPE/TGLIEDER schränken ein, wenn gesetzt) – eigener oder einer vertretenen Person.
- **Schreibrecht laut GVP:** Es zählt der *spezifischste* passende eigene Eintrag; ist dessen Recht `L`, darf nicht geschrieben werden (z. B. 72c `S`, aber 72c/HG 20 `L`).
- **Benutzerverwaltung:** Rolle Systemverwaltung (`KLASSE_SY`) oder Login in `DSV_ADMINS` (für den Erstbetrieb, bevor jemand zugeordnet ist).

**Was die Rollen dürfen** (nach dem Handbuch; immer zusätzlich Schreibrecht laut GVP):

| Rolle | darf |
|---|---|
| Registratur (REG) | Akten, Vorgänge, Dokumente registrieren und ändern; Geschäftsgang (ausleihen/zurückgeben), Bereitstellen von Anforderungen; Einsender/Empfänger, berechtigte Sachbearbeiter; private Adressen (ohne Kürzel); sieht geheime Dokumente |
| Sachbearbeitung (SB) | lesen; Stichworte an Dokumenten und Wiedervorlagen pflegen |
| Nur Lesen (NS) | nur lesen |
| Stammdatenverwaltung (ST) | Synonyme, öffentliche Adressen (mit Kürzel) |
| Datenschutz (DS) | sieht geheime Dokumente |
| Systemverwaltung (SY) | Benutzerverwaltung |

**Vertretung (Registratur):** Ist A als Vertreter von B eingetragen (beide Registratur), wählt A im Kopf „handeln als B“. Dann gelten Bs Zuständigkeiten, und Registrierungen tragen `*_REGISTRATOR = B` und `*_REG_VERTRETER = A`.

**Status und Geschäftsgang** (Handbuch 5.2):
- Neues Schriftgut erhält den Status `DSV_STATUS_NEU` (Standard `neu`, ohne Verfügung).
- „Im Geschäftsgang bei“ (`BEARBEITER`) eintragen = Ausleihe, Status wird `GG`. Es gibt höchstens eine Ausleihe; Austragen = Rückgabe, Status wird wieder `neu`. Ein anderer Status entlastet den Bearbeiter.
- `GG`, `WV`, `umreg.`, `Archiv`, `g` setzen nur Fachfunktionen, nicht die Statusauswahl (`DSV_STATUS_SYSTEM`).
- Jede Statusänderung setzt `DATUM_LETZTEVERF`, beim Dokument auch am Vorgang.
- **Bereitstellen** einer Anforderung (Registratur) leiht das Schriftgut an den Empfänger aus (Status `GG`) und trägt die Anforderung aus.

**Registrieren eines Dokuments:**
- Vorbelegungen: Benutzerprofil vor Systemprofil, der Betreff kommt vom Vorgang.
- Bei Eingang/Ausgang ist mindestens ein Einsender/Empfänger Pflicht; der letzte lässt sich nicht entfernen.
- Ohne eigene Stichworte werden sie aus dem Betreff vorgeschlagen: Trennung an Leerzeichen und `SONDERZEICHEN` des Systemprofils, ohne Stoppworte, je nach `STW_OPTION_ZAHLEN`/`STW_OPTION_WORTENDE`.
- Bei geheimen Dokumenten beginnt die Bemerkung einer Wiedervorlage mit „X “.

**Benutzerverwaltung in der App** (Menü „Benutzerverwaltung“):
- *Anmeldungen:* Logins anlegen, einer Altkennung zuordnen, sperren, entfernen; lokal: Startpasswort setzen.
- *Profile:* Altkennungen anlegen, Rollen per Haken, Vorbelegungen.
- *Zuständigkeiten (GVP):* Einträge je Profil hinzufügen/entfernen.
- *Vertretungen:* je Profil eintragen.

Alle Änderungen über die neue App werden in `dsv_app.protokoll` festgehalten (wer, wann, alt → neu). In die Alttabellen schreibt die App wie bisher die Altkennung in `ERST_REGISTRATOR`/`AEND_REGISTRATOR`.

## Lokal starten

Voraussetzungen: Node.js ≥ 20.12 (getestet mit 24) und Docker.

```bash
npm run install:alle   # Abhängigkeiten
npm run infra:up       # PostgreSQL (:5433)
npm run db:beispiele   # Altschema + Beispieldaten + Test-Logins (löscht vorhandene Daten in dsv und dsv_app!)
npm run dev            # API :5001, Oberfläche :3000
```

Mit Keycloak testen: `npm run infra:keycloak` startet zusätzlich einen lokalen Keycloak (:8180) als Nachbildung des zentralen; dann `AUTH_MODUS=keycloak` in `backend/.env` setzen.

**Testbenutzer** (Passwort = Login, lokal wie im lokalen Keycloak); die Rechte stehen in den Beispieldaten:

| Login | Altkennung | Rollen | Zuständigkeit (GVP) |
|---|---|---|---|
| `leser` | LESER | SB | 72c lesen |
| `bearbeiter` | BEARBEITER | SB | 72c schreiben, 77 (nur HG 20) lesen |
| `referat77` | REFERAT77 | SB | 77 schreiben |
| `referat12` | REFERAT12 | SB | 12 schreiben |
| `abteilung7` | ABTEILUNG7 | SB | 72c und 77 lesen |
| `registratur` | REGISTRATUR | REG, SB | 11, 12, 72c, 77 schreiben; sieht geheime Dokumente |
| `admin` | ADMIN | REG, ST, DS | 11 schreiben; Benutzerverwaltung über `DSV_ADMINS`; vertritt REGISTRATUR |
| `m.neumann` | – | – | nicht zugeordnet → in der Benutzerverwaltung zuordnen |

Die Codes in den Beispiel-Wertelisten (`DSV_LOV_*`) entsprechen dem Bestand (Status `neu`, `zdA`, `wegl.`, `Sperre`, `Altreg.`, `GG`, `WV`, `umreg.`, `Archiv`, `g`; Form `P`/`EL`). Weichen sie im Bestand ab, die `DSV_STATUS_*`-Variablen anpassen.

## Übernahme des Bestands (ora2pg)

[backend/db/altschema.sql](backend/db/altschema.sql) bildet das Oracle-Schema aus `history/DSV.sql` 1:1 nach. Geprüft wurde Spalte für Spalte: 58 Tabellen, 429 Spalten, Typen, Längen, NOT NULL, Defaults, Spaltenreihenfolge, alle Primär-, Fremd- und Unique-Schlüssel, 11 Prüfregeln, Indizes und Sequenzen. Bewusste Abweichungen:
- `DSV_VORG.LFD_VORGNR`: Der Primärschlüssel ist in Oracle deaktiviert, der eindeutige Index `PKVORG` erzwingt die Eindeutigkeit aber weiter. In Postgres ist er genauso als eindeutiger Index angelegt.
- Grenzen der Sequenzen: 28 Stellen in Oracle, `bigint` in Postgres; ohne praktische Bedeutung.
- `NUMBER(*,0)` → `bigint` in den Hilfstabellen `DSV_DOC_NAME_LIST`/`DSV_TMP_STW_LIST`.
- `CHKLAPAKTE`: `decode`/`||` sind als `CASE`/`concat` mit gleicher Wirkung nachgebildet.
- `UQGVP`, `UQLAPAKTE2`: `UNIQUE NULLS NOT DISTINCT`. Oracle wertet bei zusammengesetzten Schlüsseln leere Spalten als gleich; doppelte GVP-Einträge ohne Aktenplan-Teil sind also auch in Postgres verboten.
- Nicht übernommen: 94 Views, das Package und die Prozedur, wie vereinbart. Trigger gibt es im Export keine.

`history/DSV.sql` enthält nur die Struktur, keine Daten. Was die Daten mitbringen, zeigt [backend/db/oracle-vorpruefung.sql](backend/db/oracle-vorpruefung.sql). Das Skript liest nur und läuft in der Oracle-Datenbank. Es prüft:
- ob die Produktion dem Export entspricht und ob es Trigger gibt
- nicht geprüfte Prüfregeln, an denen der Import scheitern würde
- Zeichensatz, Windows-Sonderzeichen, Sortierung
- Status-Codes, Registrator-Inhalt (USER_ID oder KENNUNG), GVP-Rechte
- Sequenzen gegen die vergebenen Nummern, Dateipfade, Datenmenge und genutzte Funktionen

**Ablauf** (Schema aus `altschema.sql`, ora2pg nur für die Daten):
0. `backend/db/oracle-vorpruefung.sql` in Oracle ausführen und Auffälligkeiten klären.
1. Datenbank anlegen (PostgreSQL ≥ 17):
   `CREATE DATABASE dsv TEMPLATE template0 ENCODING 'UTF8' LOCALE_PROVIDER builtin BUILTIN_LOCALE 'C.UTF-8';`
   Mit dieser Locale lässt `upper()` ein „ß“ unverändert, wie Oracle `UPPER`. Bei anderen Locales wird „ß“ zu „ẞ“ oder „SS“, und Altdaten wie das Stichwort „MAßNAHME“ verletzen die Prüfregeln `stichwort = upper(stichwort)`. Die API warnt beim Start, wenn das so ist.
2. In `backend/.env` `DATABASE_URL`, `DB_SCHEMA`, `DB_ZEITZONE`, `AUTH_MODUS` (bei Keycloak auch dessen Werte) und `DSV_ADMINS` setzen.
3. `npm run db:init` legt das Schema `dsv` aus `altschema.sql` und die App-Tabellen in `dsv_app` an (ohne Beispieldaten).
4. ora2pg nur für die Daten: `TYPE COPY`, `PG_SCHEMA dsv`, `NLS_LANG AMERICAN_AMERICA.AL32UTF8` (wandelt ISO-8859 beim Lesen nach UTF-8), `DROP_FKEY 1` (Fremdschlüssel während des Ladens aus, danach wieder an).
5. Sequenzen auf den aktuellen Oracle-Stand setzen. In Oracle `SELECT sequence_name, last_number FROM user_sequences;` abfragen, dann je Sequenz in Postgres `SELECT setval('dsv_seq_akte', <LAST_NUMBER>, false);`. Das gilt auch für die absteigenden Sequenzen (Akte, Vorgang, Aktenplan, Umregistrierung).
6. Lokale Anmeldung: ersten Admin anlegen, z. B. `npm run passwort -- admin`. Der Login muss in `DSV_ADMINS` stehen oder einer Altkennung mit Rolle SY zugeordnet sein. Das ausgegebene Startpasswort gilt für die erste Anmeldung; die übrigen Logins legt der Admin in der Benutzerverwaltung an.

**Schema von ora2pg selbst angelegt** (statt `altschema.sql`): danach
- `npm run db:app` – App-Tabellen im Schema `dsv_app`
- `npm run db:nach-ora2pg` – zeigt Abweichungen zu `altschema.sql`; `-- --ausfuehren` behebt sie in einer Transaktion: Prüfregeln mit `upper()` erhalten `COLLATE pg_c_utf8` (ab PostgreSQL 17; „ß“ bleibt wie bei Oracle), fehlende Schlüssel und Indizes (z. B. `PKVORG`, `NULLS NOT DISTINCT`), Sequenzen hinter den vergebenen Nummern
- `npm run logins:uebernehmen` – Logins (mit Passwort-Hashes) und Protokoll aus den mitübertragenen Tabellen `dsv_app_anmeldung`/`dsv_app_protokoll`; gab es unter Oracle keine App-Logins: `-- --aus-kennungen` legt je Altkennung einen Login mit Startpasswort an
- Testzugang ohne Passwortregeln: `npm run passwort -- test --testzugang --altkennung KENNUNG` (Passwort = Login)
- `npm run db:selbsttest`

Später nur die App-Tabellen ergänzen: `npm run db:app` (legt fehlende Tabellen und Spalten an; vorhandene Logins bleiben erhalten).

Worauf beim Import zu achten ist:
- **Stand des Exports:** `history/DSV.sql` mit der Produktion abgleichen. Das Produktivschema sollte ebenfalls 58 Tabellen und 429 Spalten haben (`SELECT COUNT(*) FROM user_tab_columns WHERE table_name IN (…)`).
- **Zeitzone:** Oracle-`DATE` und `SYSDATE` sind Ortszeit. Die App rechnet in der Sitzung mit `DB_ZEITZONE` (Standard `Europe/Berlin`), damit neue Einträge zur Ortszeit der Altdaten passen.
- **Großschreibung:** Die App schreibt Stichworte und Vorgangskennungen wie Oracle `UPPER` groß („ß“ bleibt).
- **Leere Texte:** Oracle speichert `''` als NULL; die App schreibt für „nicht gesetzt“ ebenfalls NULL (z. B. HGRUPPE … in `DSV_GVP`).
- **Sortierung:** Postgres sortiert hier nach Zeichencode (Umlaute nach Z). Sortierte die Altanwendung deutsch (`NLS_SORT=GERMAN`), lässt sich das je Abfrage mit `COLLATE "de-DE-x-icu"` nachbilden.
- **Klartext-Passwort:** `DSV_SYSTEMPROFIL.UE_PASSWORD` enthält ein Klartext-Passwort – nicht weiterverwenden.

## Konfiguration (`backend/.env`, Vorlage `backend/.env.example`)

| Variable | Standard | Bedeutung |
|---|---|---|
| `AUTH_MODUS` | `lokal` | `lokal` = Login/Passwort der App, `keycloak` = Keycloak der Organisation |
| `AUTH_SITZUNG_MINUTEN` | `480` | lokal: Sitzung endet nach so vielen Minuten ohne Anfrage |
| `AUTH_PASSWORT_MIN` | `10` | lokal: Mindestlänge Passwort |
| `AUTH_MAX_FEHLVERSUCHE`, `AUTH_SPERR_MINUTEN` | `5`, `15` | lokal: vorübergehende Sperre nach Fehlversuchen |
| `AUTH_COOKIE_SECURE` | `true` bei `NODE_ENV=production` | lokal: Cookie nur über HTTPS (produktiv immer HTTPS!) |
| `KEYCLOAK_SERVER_URL`, `KEYCLOAK_REALM` | `http://localhost:8180`, `dsv` | Keycloak der Organisation |
| `KEYCLOAK_CLIENT_ID` | `dsv-web` | Client der App (Token muss dafür ausgestellt sein: `azp` oder `aud`) |
| `DATABASE_URL` | `postgres://dsv:dsv@localhost:5433/dsv` | PostgreSQL |
| `DB_SCHEMA` | `dsv` | Schema der `DSV_*`-Tabellen |
| `DB_ZEITZONE` | `Europe/Berlin` | Zeitzone der Datenbanksitzung (Ortszeit wie Oracle-`SYSDATE`) |
| `DSV_ADMINS` | – | Logins mit Zugriff auf die Benutzerverwaltung auch ohne Altkennung (kommagetrennt) |
| `DSV_ADMIN_KLASSE` | `SY` | Rolle der Altanwendung für die Benutzerverwaltung |
| `DSV_RECHT_LESEN` | `L` | GVP-Recht „nur lesen“ |
| `DSV_STATUS_NEU` | `neu` | Status für neues Schriftgut und nach Rückgabe |
| `DSV_STATUS_GG` | `GG` | Status „im Geschäftsgang“ |
| `DSV_STATUS_SYSTEM` | `GG,WV,umreg.,Archiv,g` | Status, die nur Fachfunktionen setzen |
| `PORT` | `5001` | API-Port |

Die Oberfläche fragt den Anmeldemodus beim Start vom Backend ab (`GET /api`); ein Build passt für beide Modi. Optional (`frontend/.env`): `REACT_APP_KEYCLOAK_URL`, `REACT_APP_KEYCLOAK_REALM`, `REACT_APP_KEYCLOAK_CLIENT_ID`, falls der Browser Keycloak unter einer anderen Adresse erreicht als das Backend.

**Später auf Keycloak umstellen:**
- Im Keycloak der Organisation einen Client anlegen: öffentlich, Standard-Flow mit PKCE (S256), Redirect-URIs und Web-Origins der App.
- `AUTH_MODUS=keycloak` und die `KEYCLOAK_*`-Werte setzen.
- Die Logins in `dsv_app.anmeldung` müssen den Keycloak-Benutzernamen entsprechen (sonst einmalig in der Benutzerverwaltung zuordnen). Rollen, GVP und Vertretungen bleiben unverändert; die gespeicherten Passwörter werden dann nicht mehr benutzt.

## API (Auszug)

| Methode | Pfad | Zweck |
|---|---|---|
| GET | `/api` | öffentlich: Version, Anmeldemodus (bei Keycloak dessen Adresse) |
| POST | `/api/anmeldung`, `/api/abmeldung` | lokal: `{ login, passwort }` → Sitzungs-Cookie / Sitzung beenden |
| GET | `/api/ich` | Login, Altkennung, Rollen, Zuständigkeiten, Vertretungen, Vorbelegungen, Anmeldemodus |
| PUT | `/api/ich/passwort` | lokal: `{ alt, neu }` eigenes Passwort ändern |
| PUT | `/api/ich/vertretung` | `{ registrator }` als vertretene Person handeln, `null` = selbst |
| GET | `/api/lov`, `/api/kennungen` | Wertelisten, Altkennungen |
| GET | `/api/aktenplan?hgruppe=&gruppe=&ugruppe=` | Aktenplan ebenenweise (mit Zahl lesbarer Akten) |
| GET/POST | `/api/akten` | Akten auflisten (Aktenplan-Teilbaum, Referat, Status, Text) / anlegen (`org`, `lfd_apnr`, …) |
| GET/PUT | `/api/akten/:lfd_aktenr`, `/api/vorgaenge/:lfd_vorgnr`, `/api/dokumente/:lfd_doknr` | lesen / ändern |
| POST | `/api/akten/:id/vorgaenge`, `/api/vorgaenge/:id/dokumente` | Vorgang anlegen / Dokument registrieren |
| PUT | `/api/dokumente/:id/stichworte`, `…/adressen`, `…/berechtigte` | Stichworte, Einsender/Empfänger, berechtigte Sachbearbeiter |
| GET/POST/PUT/DELETE | `/api/wiedervorlagen[/:lfd_schrnr/:wv_datum]` | Anforderungen; DELETE = erledigt |
| POST | `/api/wiedervorlagen/:lfd_schrnr/:wv_datum/bereitstellen` | an den Empfänger ausleihen (Registratur) |
| GET | `/api/wiedervorlagen/faellig` | Anzahl fälliger Wiedervorlagen an mich (inkl. Vertretung) |
| GET/POST/PUT | `/api/adressen` | Adressen (öffentliche + an lesbaren Dokumenten) |
| GET/POST/DELETE | `/api/stichworte[/:stwnr/synonyme/:synonr]` | Stichwortbestand, Synonyme |
| GET | `/api/recherche?ebene=&q=&org=&abteilung=&aktenplan=&stichwort=&eai=&klasse=&adresse=&gz=&datumsfeld=&von=&bis=&sortierung=&reihenfolge=` | Recherche |
| GET/POST/PUT/DELETE | `/api/verwaltung/anmeldungen[/:login]` | Logins anlegen, zuordnen, sperren, entfernen (Administration) |
| PUT | `/api/verwaltung/anmeldungen/:login/passwort` | lokal: Startpasswort setzen (leer = erzeugen, Antwort enthält es einmalig) |
| GET/POST/PUT | `/api/verwaltung/profile[/:user_id]`, `…/gvp`, `…/gvp/entfernen`, `/api/verwaltung/vertretungen[/entfernen]` | Profile, Rollen, GVP, Vertretungen |

## Offene Punkte für den Lift & Shift

Am echten Bestand zu klären:
- **Codes der Wertelisten:** Stimmen Status, Form und E/A/I mit `DSV_LOV_*` überein? Sonst `DSV_STATUS_*` anpassen.
- **Registrator-Felder:** Steht im Bestand die `USER_ID` (wie die App schreibt) oder die `KENNUNG` in `ERST_REGISTRATOR`/`AEND_REGISTRATOR`?
- **Status nach Rückgabe** aus dem Geschäftsgang: Die App setzt `neu`. War es früher der Status vor der Ausleihe?

Noch nicht umgesetzt (laut Handbuch vorhanden):
- Umregistrieren (`DSV_UMREG`); die Herkunft wird nur angezeigt.
- Aussonderung/Archiv (Vorschlag Behörde, Entscheidung Archiv sind nur Felder).
- Statusänderung für viele Objekte auf einmal.
- Löschen (Status `g`).
- Vorlagewege.
- Das alte `DSV_PROTOKOLL`; die App protokolliert in `dsv_app.protokoll`.

## Projektstruktur

```
├── docker-compose.yml          PostgreSQL; Keycloak (Nachbildung des zentralen) nur mit --profile keycloak
├── keycloak/realm-dsv.json     nur Client + Testlogins, keine Rollen (für AUTH_MODUS=keycloak)
├── history/                    Altschema (DSV.sql) und Benutzerhandbuch
├── backend/
│   ├── db/altschema.sql        Altschema für PostgreSQL (lokale Entwicklung)
│   ├── db/app-schema.sql       App-Tabellen (dsv_app: Anmeldungen inkl. Passwort-Hash, Sitzungen, Protokoll)
│   ├── db/beispieldaten.sql    Beispieldaten im Altformat
│   ├── scripts/db-init.js      Schema/Beispieldaten einspielen
│   ├── scripts/passwort.js     Startpasswort per Konsole (erster Admin)
│   └── src/
│       ├── auth.js, benutzer.js  Sitzung bzw. Keycloak-Token → Login → Altkennung → Rollen/Zuständigkeiten
│       ├── lokaleAnmeldung.js, passwort.js  lokale Anmeldung: Sitzungen, Sperre, scrypt-Hashes
│       ├── zugriff.js          Zugriffsregeln der alten Views (GVP, Vertretung, geheim)
│       ├── schriftgut.js       Akten, Vorgänge, Dokumente
│       ├── aktenplan.js, recherche.js, wiedervorlagen.js, adressen.js, stichworte.js
│       ├── verwaltung.js       Benutzerverwaltung
│       └── routes/             API
└── frontend/src/
    ├── anmeldung.js            Anmeldemodus vom Backend; lokal (Cookie) oder Keycloak (Token)
    ├── pages/                  Anmelden, Passwort, Akten, Detailseite, Recherche, Wiedervorlagen, Adressen, Stichworte, Benutzerverwaltung
    └── components/             Formular, Ansicht, Aktenplanbaum, Dokument-Bausteine, Wiedervorlagen, Protokoll
```
