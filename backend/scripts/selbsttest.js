// Selbsttest gegen die konfigurierte Datenbank (Oracle oder PostgreSQL): ruft jede Abfrage der App einmal auf –
// Lesen, Recherche, Anlegen/Ändern, Wiedervorlagen, Adressen, Stichworte, lokale Anmeldung, Benutzerverwaltung.
// Alles läuft in einer Transaktion, die am Ende zurückgerollt wird: es bleiben keine Daten zurück.
// (Nur Sequenzen zählen ein paar Nummern weiter.)
//   npm run db:selbsttest                 Testbenutzer: erste Altkennung mit Registratur und Schreibrecht
//   npm run db:selbsttest -- KENNUNG      bestimmte Altkennung
// Ergebnis: ✔ läuft, ⚠ fachlich abgelehnt (Rechte/Daten, kein SQL-Fehler), ✘ Fehler (bitte melden, inkl. Meldung)
const path = require('path');

try {
  process.loadEnvFile(path.join(__dirname, '..', '.env'));
} catch (error) {
  // keine .env vorhanden
}

const config = require('../src/config');
const db = require('../src/db');
const benutzer = require('../src/benutzer');
const aktenplan = require('../src/aktenplan');
const schriftgut = require('../src/schriftgut');
const { recherche } = require('../src/recherche');
const wiedervorlagen = require('../src/wiedervorlagen');
const adressen = require('../src/adressen');
const stichworte = require('../src/stichworte');
const verwaltung = require('../src/verwaltung');
const lokal = require('../src/lokaleAnmeldung');
const protokoll = require('../src/protokoll');
const lov = require('../src/lov');
const { systemprofil } = require('../src/systemprofil');

const ergebnis = { ok: 0, fachlich: 0, fehler: 0 };
const ZURUECK = new Error('Selbsttest beendet – Transaktion wird zurückgerollt');

// Jeder Schritt mit Sicherungspunkt: ein Fehler macht nur diesen Schritt rückgängig (PostgreSQL bricht sonst die Transaktion ab)
async function pruefe(name, fn) {
  await db.query('SAVEPOINT selbsttest');
  try {
    const wert = await fn();
    ergebnis.ok += 1;
    console.log(`✔ ${name}${wert !== undefined && typeof wert !== 'object' ? ` – ${wert}` : ''}`);
    return wert;
  } catch (error) {
    await db.query('ROLLBACK TO SAVEPOINT selbsttest');
    if (error.status && error.status < 500) {
      ergebnis.fachlich += 1;
      console.log(`⚠ ${name} – ${error.message}`);
    } else {
      ergebnis.fehler += 1;
      console.log(`✘ ${name}\n    ${String(error.message).replace(/\n/g, '\n    ')}`);
    }
    return undefined;
  }
}

const erste = (liste) => (Array.isArray(liste) && liste.length ? liste[0] : null);

async function ablauf() {
  const { zeile, spaltenInfo } = db;
  console.log(`Datenbank: ${db.dialekt.oracle ? `Oracle ${config.datenbank.oracle.user}@${config.datenbank.oracle.connectString}` : 'PostgreSQL'}\n`);

  // ---------- Grundlagen ----------
  await pruefe('Spalten der Alttabellen lesen', async () => {
    const spalten = await spaltenInfo();
    const fehlt = ['dsv_akte', 'dsv_vorg', 'dsv_doku', 'dsv_gvp', 'dsv_benutzerprofil'].filter((t) => !spalten.has(t));
    if (db.dialekt.oracle && !spalten.has('dsv_app_anmeldung')) fehlt.push('dsv_app_anmeldung (npm run db:app)');
    if (fehlt.length) throw new Error(`Tabellen fehlen: ${fehlt.join(', ')}`);
    return `${spalten.size} Tabellen`;
  });
  await pruefe('Systemprofil', async () => `${Object.keys(await systemprofil()).length} Felder`);
  await pruefe('Wertelisten', async () => `${(await lov.alle()).status.length} Status`);
  await pruefe('Datum lesen/rechnen', async () => {
    const { jetzt } = await zeile(`SELECT ${db.dialekt.jetzt} AS jetzt${db.dialekt.dual}`);
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/.test(jetzt)) throw new Error(`unerwartetes Format: ${jetzt}`);
    return jetzt;
  });

  // ---------- Testbenutzer ----------
  const gewuenscht = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2].toUpperCase() : null;
  const kennung = gewuenscht || (await zeile(`
    SELECT p.user_id FROM dsv_benutzerprofil p
    WHERE p.klasse_reg = 'X' AND EXISTS (SELECT 1 FROM dsv_gvp g WHERE g.bearbeiter = p.user_id AND g.recht <> $1)
    ORDER BY p.user_id FETCH FIRST 1 ROWS ONLY`, [config.rechtLesen]))?.user_id;
  if (!kennung) throw new Error('Keine Altkennung mit Registratur und Schreibrecht gefunden – Kennung als Argument angeben');
  const user = await pruefe(`Benutzerkontext für ${kennung}`, () => benutzer.kontext({ login: kennung.toLowerCase(), name: 'Selbsttest', email: null }));
  if (!user?.userId) throw new Error(`Kennung ${kennung} ließ sich nicht zuordnen`);
  console.log(`    Rollen ${user.klassen.join(', ') || '–'}, ${user.zustaendigkeiten.length} GVP-Einträge\n`);

  // ---------- Lesen ----------
  const hauptgruppen = await pruefe('Aktenplan: Hauptgruppen', () => aktenplan.kinder(user, {}));
  const hg = erste(hauptgruppen?.filter((k) => k.hat_kinder));
  if (hg) await pruefe(`Aktenplan: Gruppen in ${hg.hgruppe}`, () => aktenplan.kinder(user, { hgruppe: hg.hgruppe }));
  await pruefe('Aktenplan: Suche', async () => `${(await aktenplan.suche('0')).length} Treffer`);
  const akten = await pruefe('Akten: Liste', () => schriftgut.listeAkten(user, {}));
  await pruefe('Akten: Liste mit Text und Aktenplan', () => schriftgut.listeAkten(user, { q: 'a', hgruppe: hg?.hgruppe }));
  const akte = erste(akten);
  const akteVoll = akte && (await pruefe(`Akte ${akte.aktenzeichen}`, () => schriftgut.akteDetail(user, akte.lfd_aktenr)));
  const vorgang = erste(akteVoll?.vorgaenge);
  const vorgangVoll = vorgang && (await pruefe(`Vorgang ${vorgang.aktenzeichen}`, () => schriftgut.vorgangDetail(user, vorgang.lfd_vorgnr)));
  const dokument = erste(vorgangVoll?.dokumente)
    || (await zeile('SELECT lfd_doknr FROM dsv_doku FETCH FIRST 1 ROWS ONLY'));
  if (dokument) await pruefe(`Dokument ${dokument.lfd_doknr}`, () => schriftgut.dokumentDetail(user, dokument.lfd_doknr));

  for (const ebene of ['akte', 'vorgang', 'dokument']) {
    await pruefe(`Recherche ${ebene}: Text`, async () => `${(await recherche(user, { ebene, q: 'a' })).anzahl[ebene]} Treffer`);
  }
  const org = user.zustaendigkeiten[0]?.org;
  await pruefe('Recherche: Referat, Abteilung, Zeitraum, Sortierung', async () => (await recherche(user, {
    ebene: 'dokument', org, abteilung: org?.[0], datumsfeld: 'erst_regdatum', von: '2000-01-01', bis: '2099-12-31', sortierung: 'erst_regdatum', reihenfolge: 'ab'
  })).anzahl.dokument);
  await pruefe('Recherche: Dokumentdatum auf Aktenebene, E/A/I, Adresse, Geschäftszeichen', async () => (await recherche(user, {
    ebene: 'akte', datumsfeld: 'erstdatum', von: '2000-01-01', eai: 'E', adresse: 'a', gz: 'a'
  })).anzahl.akte);
  await pruefe('Recherche: letzte Verfügung auf Aktenebene', async () => (await recherche(user, { ebene: 'akte', datumsfeld: 'datum_letzteverf', bis: '2099-12-31' })).anzahl.akte);
  const einStichwort = await zeile('SELECT stichwort FROM dsv_stichworte FETCH FIRST 1 ROWS ONLY');
  if (einStichwort) await pruefe(`Recherche: Stichwort ${einStichwort.stichwort}`, async () => (await recherche(user, { ebene: 'vorgang', stichwort: einStichwort.stichwort })).anzahl.vorgang);
  await pruefe('Stichworte: Suche', async () => `${(await stichworte.suche('A', 20)).length} Treffer`);
  for (const ansicht of ['meine', 'erstellt', 'alle']) await pruefe(`Wiedervorlagen: ${ansicht}`, async () => (await wiedervorlagen.liste(user, { ansicht })).length);
  await pruefe('Wiedervorlagen: fällig', () => wiedervorlagen.anzahlFaellig(user));
  await pruefe('Adressen: Liste mit Suche', async () => (await adressen.liste(user, { q: 'a' })).length);
  await pruefe('Benutzerverwaltung: Anmeldungen', async () => (await verwaltung.anmeldungen()).length);
  await pruefe('Benutzerverwaltung: Profile', async () => (await verwaltung.profile('a')).length);
  await pruefe(`Benutzerverwaltung: Profil ${kennung}`, async () => `${(await verwaltung.profil(kennung)).gvp.length} GVP-Einträge`);

  // ---------- Anlegen und Ändern (wird zurückgerollt) ----------
  console.log('\nAnlegen und Ändern (wird zurückgerollt):');
  const gvp = user.zustaendigkeiten.find((z) => !z.vertreten && z.recht !== config.rechtLesen);
  const lap = gvp && (await zeile(`
    SELECT l.lfd_apnr, l.akte FROM dsv_lap l
    WHERE (l.hgruppe = $2 OR $2 IS NULL) AND (l.gruppe = $3 OR $3 IS NULL) AND (l.ugruppe = $4 OR $4 IS NULL) AND (l.tglieder = $5 OR $5 IS NULL)
      AND NOT EXISTS (SELECT 1 FROM dsv_akte a WHERE a.org = $1 AND a.akte = l.akte)
    ORDER BY l.akte FETCH FIRST 1 ROWS ONLY`, [gvp.org, gvp.hgruppe, gvp.gruppe, gvp.ugruppe, gvp.tglieder]));
  const neueAkte = lap && (await pruefe(`Akte anlegen (${gvp.org}-${lap.akte})`, () => schriftgut.akteAnlegen(user, { org: gvp.org, lfd_apnr: lap.lfd_apnr, betreff: 'Selbsttest' })));
  const akteId = neueAkte || akte?.lfd_aktenr;
  const vorgangId = akteId && (await pruefe('Vorgang anlegen', () => schriftgut.vorgangAnlegen(user, akteId, { betreff: 'Selbsttest Vorgang' })));
  const adresse = await zeile('SELECT adr_nr FROM dsv_adressen FETCH FIRST 1 ROWS ONLY');
  const dokId = vorgangId && (await pruefe('Dokument anlegen (Eingang, Einsender, Stichwortvorschlag)', () => schriftgut.dokumentAnlegen(user, vorgangId, {
    betreff: 'Selbsttest Maßnahme Prüfung', eai_kennung: 'E', erstdatum: '2026-01-15', adressen: adresse ? [{ adr_nr: adresse.adr_nr, eingdatum: '2026-01-16', eins_gz: 'gz-1' }] : []
  })));
  if (dokId) {
    await pruefe('Dokument: Datum und Stichworte unverändert gelesen', async () => {
      const d = await schriftgut.dokumentDetail(user, dokId);
      if (d.erstdatum !== '2026-01-15T00:00:00') throw new Error(`Dokumentdatum ${d.erstdatum} statt 2026-01-15T00:00:00`);
      if (!d.stichworte.includes('MAßNAHME')) throw new Error(`Stichworte ${d.stichworte.join(', ')} ohne MAßNAHME`);
      return d.aktenzeichen;
    });
    await pruefe('Dokument ändern (Betreff, Status)', () => schriftgut.aendernObjekt(user, 'dokument', dokId, { betreff: 'Selbsttest geändert', status: config.status.neu }));
    await pruefe('Dokument: Stichworte setzen', () => schriftgut.dokumentStichworte(user, dokId, ['SELBSTTEST', 'STRAßE']));
    if (adresse) await pruefe('Dokument: Einsender ändern', () => schriftgut.dokumentAdressen(user, dokId, [{ adr_nr: adresse.adr_nr, eins_gz: 'gz-2' }]));
    await pruefe('Dokument: berechtigte Sachbearbeiter', () => schriftgut.dokumentBerechtigte(user, dokId, []));
  }
  if (vorgangId) {
    await pruefe('Vorgang: Geschäftsgang (Bearbeiter eintragen)', () => schriftgut.aendernObjekt(user, 'vorgang', vorgangId, { bearbeiter: kennung }));
    await pruefe('Vorgang: Rückgabe', () => schriftgut.aendernObjekt(user, 'vorgang', vorgangId, { bearbeiter: '' }));
    const wv = await pruefe('Wiedervorlage anlegen', () => wiedervorlagen.anlegen(user, { umfang: 'V', id: vorgangId, wv_datum: '2030-01-02', bemerkung: 'Selbsttest' }));
    if (wv) {
      await pruefe('Wiedervorlage ändern', () => wiedervorlagen.aendernWv(user, wv.lfd_schrnr, wv.wv_datum, { bemerkung: 'geändert' }));
      await pruefe('Wiedervorlage bereitstellen', () => wiedervorlagen.bereitstellen(user, wv.lfd_schrnr, wv.wv_datum));
    }
    const wv2 = await pruefe('Wiedervorlage anlegen (2)', () => wiedervorlagen.anlegen(user, { umfang: 'V', id: vorgangId, wv_datum: '2030-02-03' }));
    if (wv2) await pruefe('Wiedervorlage erledigen', () => wiedervorlagen.erledigen(user, wv2.lfd_schrnr, wv2.wv_datum));
    await pruefe('Protokoll lesen', async () => (await protokoll.liste('vorgang', vorgangId)).length);
  }
  const neueAdresse = await pruefe('Adresse anlegen (privat)', () => adressen.anlegen(user, { bezeichnung_1: 'Selbsttest', oeffentlich: 'N' }));
  if (neueAdresse) await pruefe('Adresse ändern', () => adressen.aendernAdresse(user, neueAdresse.adr_nr, { ort: 'Teststadt' }));

  // ---------- Lokale Anmeldung und Benutzerverwaltung ----------
  console.log('\nAnmeldung und Benutzerverwaltung (wird zurückgerollt):');
  const admin = { ...user, login: 'selbsttest-admin' };
  const neu = await pruefe('Login anlegen mit Startpasswort', () => verwaltung.anmeldungAnlegen(admin, { login: 'selbsttest.login', user_id: kennung }));
  if (neu?.passwort) {
    const token = await pruefe('Anmelden', () => lokal.anmelden({ login: 'selbsttest.login', passwort: neu.passwort }));
    const req = { headers: { cookie: `dsv_sitzung=${token}` } };
    await pruefe('Sitzung prüfen', async () => {
      const sitzung = await lokal.sitzung(req);
      if (!sitzung || !sitzung.passwort_aendern) throw new Error('Sitzung fehlt oder Startpasswort nicht markiert');
      return sitzung.login;
    });
    await pruefe('Falsches Passwort zählt Fehlversuch', async () => {
      await lokal.anmelden({ login: 'selbsttest.login', passwort: 'falsch' }).catch((error) => error);
      return (await zeile('SELECT fehlversuche FROM dsv_app.anmeldung WHERE login = $1', ['selbsttest.login'])).fehlversuche;
    });
    await pruefe('Passwort ändern', () => lokal.passwortAendern({ ...req, user: { login: 'selbsttest.login' } }, { alt: neu.passwort, neu: 'Selbsttest-Passwort-123' }));
    await pruefe('Login sperren', () => verwaltung.anmeldungAendern(admin, 'selbsttest.login', { gesperrt: true }));
    await pruefe('Passwort zurücksetzen', async () => (await verwaltung.passwortZuruecksetzen(admin, 'selbsttest.login', {})).passwort.length);
    await pruefe('Abmelden', () => lokal.abmelden(req));
    await pruefe('Login entfernen', () => verwaltung.anmeldungEntfernen(admin, 'selbsttest.login'));
  }
  if (gvp) {
    await pruefe('GVP-Eintrag doppelt anlegen wird abgelehnt', async () => {
      const fehler = await verwaltung.gvpHinzufuegen(admin, kennung, { org: gvp.org, hgruppe: gvp.hgruppe, gruppe: gvp.gruppe, ugruppe: gvp.ugruppe, tglieder: gvp.tglieder, recht: gvp.recht })
        .then(() => null, (error) => error);
      if (!fehler || fehler.status !== 409) throw new Error(`erwartet 409, erhalten: ${fehler ? fehler.message : 'angelegt'}`);
      return 'abgelehnt';
    });
  }
}

db.transaktion(async () => {
  await ablauf();
  throw ZURUECK;
})
  .catch((error) => {
    if (error !== ZURUECK) {
      ergebnis.fehler += 1;
      console.log(`✘ Abbruch: ${error.message}`);
    }
  })
  .finally(async () => {
    console.log(`\n${ergebnis.ok} ✔   ${ergebnis.fachlich} ⚠   ${ergebnis.fehler} ✘   (alle Änderungen zurückgerollt)`);
    await db.beenden();
    process.exitCode = ergebnis.fehler ? 1 : 0;
  });
