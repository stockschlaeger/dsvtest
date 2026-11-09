// Akten (DSV_AKTE), Vorgänge (DSV_VORG) und Dokumente (DSV_DOKU) der Altanwendung – Regeln laut Handbuch Kap. 5.2–5.4
const config = require('./config');
const { zeile, zeilen, transaktion, Sql, dialekt: d, likeMuster, naechsteNummer } = require('./db');
const zugriff = require('./zugriff');
const { stempel } = require('./benutzer');
const { systemprofil, aktiv } = require('./systemprofil');
const { pruefe, name, grossWieOracle } = require('./pruefung');
const { protokolliere, unterschiede } = require('./protokoll');
const { JETZT, einfuegen, aendern } = require('./tabellen');
const { unterhalb } = require('./aktenplan');
const { HttpFehler } = require('./fehler');

const TABELLE = { akte: 'dsv_akte', vorgang: 'dsv_vorg', dokument: 'dsv_doku' };
const SCHLUESSEL = { akte: 'lfd_aktenr', vorgang: 'lfd_vorgnr', dokument: 'lfd_doknr' };
const LABEL = { akte: 'Akte', vorgang: 'Vorgang', dokument: 'Dokument' };

// Änderbare Felder; Referat, Aktenplankennzeichen, Vorgangsbezeichnung und Dokumentnummer sind nach der Anlage fest
const FELDER = {
  akte: ['betreff', 'bemerkung', 'status', 'bearbeiter'],
  vorgang: ['betreff', 'bemerkung', 'status', 'bearbeiter', 'vorschl_beh', 'entsch_archiv'],
  dokument: ['betreff', 'bemerkung', 'eai_kennung', 'status', 'klasse', 'autor', 'bearbeiter', 'erstdatum', 'ende_aufbfrist',
    'form_pe', 'dateiname', 'dateipfad', 'fremdnr', 'geheim', 'orig_vern']
};

// Pflichtfelder (NOT NULL in den Alttabellen), die beim Ändern nicht geleert werden dürfen
const PFLICHT = { akte: ['status'], vorgang: ['status'], dokument: ['betreff', 'eai_kennung', 'status'] };

// Bei Eingang und Ausgang ist mindestens ein Einsender/Empfänger anzugeben (Handbuch 5.2.2)
const MIT_ADRESSE = ['E', 'A'];

// Aktenzeichen wie in der Altanwendung: ORG-AKTE[/VORG[/DOKUNR]]
function aktenzeichen(typ, r) {
  if (typ === 'akte') return `${r.org}-${r.akte}`;
  if (typ === 'vorgang') return `${r.org}-${r.akte}/${r.vorg}`;
  return `${r.org}-${r.akte}/${r.vorg}/${r.dokunr}`;
}

const mitAz = (typ) => (r) => ({ ...r, aktenzeichen: aktenzeichen(typ, r) });

// Zeile mit Rechten laden; ohne Leserecht wie nicht vorhanden
async function laden(user, typ, id) {
  const nummer = Number(id);
  if (!Number.isFinite(nummer)) throw new HttpFehler(404, `${LABEL[typ]} nicht gefunden`);
  const q = new Sql();
  const row = await zeile(`
    SELECT x.*, ${d.zahl(zugriff.schreiben(q, user, 'x'))} AS darf_schreiben
    FROM ${TABELLE[typ]} x
    WHERE x.${SCHLUESSEL[typ]} = ${q.p(nummer)} AND ${zugriff.lesenTyp(q, user, typ, 'x')}
  `, q.werte);
  if (!row) throw new HttpFehler(404, `${LABEL[typ]} nicht gefunden`);
  return { ...mitAz(typ)(row), rechte: zugriff.rechte(user, row.darf_schreiben) };
}

const VERWEIGERT = {
  bearbeiten: 'Registrieren und Ändern ist der Registratur mit Schreibrecht vorbehalten',
  stichworte: 'Stichworte pflegen Registratur und Sachbearbeitung mit Schreibrecht',
  wiedervorlage: 'Wiedervorlagen pflegen Registratur und Sachbearbeitung mit Schreibrecht'
};

async function mitRecht(user, typ, id, recht = 'bearbeiten') {
  const row = await laden(user, typ, id);
  if (!row.rechte[recht]) {
    throw new HttpFehler(403, row.rechte.gvpSchreiben ? VERWEIGERT[recht] : `Kein Schreibrecht für ${LABEL[typ]} ${row.aktenzeichen} (Geschäftsverteilungsplan)`);
  }
  return row;
}

// Schreibrecht laut GVP für eine noch nicht vorhandene Akte (Referat + Aktenplanposition)
async function darfSchreibenAuf(user, w) {
  const q = new Sql();
  const { ok } = await zeile(`
    SELECT ${d.zahl(zugriff.schreiben(q, user, 'n'))} AS ok
    FROM (SELECT ${d.text(q.p(w.org), 30)} AS org, ${d.text(q.p(w.hgruppe), 30)} AS hgruppe, ${d.text(q.p(w.gruppe), 30)} AS gruppe,
                 ${d.text(q.p(w.ugruppe), 30)} AS ugruppe, ${d.text(q.p(w.tglieder), 30)} AS tglieder${d.dual}) n
  `, q.werte);
  return ok;
}

const orgName = async (org) => (await zeile('SELECT name FROM dsv_lov_org WHERE org = $1', [org]))?.name || null;

async function pruefeKennung(kennung) {
  if (kennung && !(await zeile('SELECT 1 FROM dsv_benutzerprofil WHERE user_id = $1', [kennung]))) {
    throw new HttpFehler(400, `Unbekannte Kennung ${kennung}`);
  }
}

// ---------- Verfügungen: Status und Geschäftsgang (Handbuch 5.2.1, 5.2.5) ----------
//   - GG (Geschäftsgang) gilt genau dann, wenn ein Bearbeiter eingetragen ist („ausgeliehen“); höchstens eine Ausleihe.
//   - Bearbeiter austragen = Rückgabe (Status danach: ohne Verfügung); anderen Status setzen entlastet den Bearbeiter.
//   - GG, WV, umregistriert, Archiv, gelöscht setzen nur Fachfunktionen, nicht die Statusauswahl.
function verfuegung(alt, werte) {
  const GG = config.status.geschaeftsgang;
  const neu = { ...werte };
  if (neu.status !== undefined && neu.status !== alt.status && config.status.system.includes(neu.status)) {
    throw new HttpFehler(400, `Der Status „${neu.status}“ wird nur über Fachfunktionen gesetzt${neu.status === GG ? ' (Geschäftsgang: Bearbeiter eintragen)' : ''}`);
  }
  const bearbeiterNeu = neu.bearbeiter !== undefined && (neu.bearbeiter ?? null) !== (alt.bearbeiter ?? null);
  if (bearbeiterNeu && neu.bearbeiter) {
    if (alt.status === GG && alt.bearbeiter) throw new HttpFehler(409, `Bereits im Geschäftsgang bei ${alt.bearbeiter} – zuerst zurückgeben`);
    neu.status = GG;
  } else if (bearbeiterNeu && alt.status === GG) {
    if (!neu.status || neu.status === GG) neu.status = config.status.neu;
  } else if (neu.status !== undefined && neu.status !== alt.status && alt.status === GG) {
    neu.bearbeiter = null;
  }
  return neu;
}

// Stichwortvorschlag aus dem Betreff (Handbuch 5.2.4, 6.6): Leerzeichen und Sonderzeichen trennen,
// Satzzeichen am Wortende und reine Zahlen optional weglassen, Stoppworte ausschließen, Großbuchstaben
async function stichwortVorschlag(betreff) {
  const profil = await systemprofil();
  let text = grossWieOracle(betreff || '');
  for (const zeichen of profil.sonderzeichen ?? '-/()"\'') text = text.split(zeichen).join(' ');
  let worte = text.split(/\s+/).filter(Boolean);
  if (profil.stw_option_wortende == null || aktiv(profil.stw_option_wortende)) worte = worte.map((w) => w.replace(/[.,;:!?]+$/, ''));
  if (profil.stw_option_zahlen == null || aktiv(profil.stw_option_zahlen)) worte = worte.filter((w) => !/^\d+$/.test(w));
  worte = [...new Set(worte.filter((w) => w && w.length <= 50))];
  if (!worte.length) return [];
  const sq = new Sql();
  const stopp = new Set((await zeilen(`SELECT stopwort FROM dsv_stopworte WHERE ${sq.in('stopwort', worte)}`, sq.werte)).map((r) => r.stopwort));
  return worte.filter((w) => !stopp.has(w));
}

async function stichworteZuordnen(lfdDoknr, worte) {
  await zeile(`DELETE FROM dsv_stwzuo WHERE lfd_schrnr = $1 AND schriftgutlapart = 'D'`, [lfdDoknr]);
  for (const wort of worte) {
    let stichwort = await zeile('SELECT stwnr FROM dsv_stichworte WHERE stichwort = $1', [wort]);
    if (!stichwort) {
      stichwort = { stwnr: await naechsteNummer('dsv_seq_stwt') };
      await zeile('INSERT INTO dsv_stichworte (stwnr, stichwort) VALUES ($1, $2)', [stichwort.stwnr, wort]);
    }
    // die Liste ist bereits eindeutig, alte Zuordnungen sind oben gelöscht
    await zeile(`INSERT INTO dsv_stwzuo (stwnr, lfd_schrnr, schriftgutlapart) VALUES ($1, $2, 'D')`, [stichwort.stwnr, lfdDoknr]);
  }
}

async function pruefeStichworte(worte) {
  if (!Array.isArray(worte) || worte.some((wort) => typeof wort !== 'string')) throw new HttpFehler(400, 'Liste von Stichworten erwartet');
  const liste = [...new Set(worte.map((wort) => grossWieOracle(wort.trim())).filter(Boolean))];
  const zuLang = liste.find((wort) => wort.length > 50);
  if (zuLang) throw new HttpFehler(400, `Stichwort „${zuLang.slice(0, 20)}…“ ist länger als 50 Zeichen`);
  const sq = new Sql();
  const stopp = await zeilen(`SELECT stopwort FROM dsv_stopworte WHERE ${sq.in('stopwort', liste)}`, sq.werte);
  if (stopp.length) throw new HttpFehler(400, `Stoppwort nicht erlaubt: ${stopp.map((s) => s.stopwort).join(', ')}`);
  return liste;
}

// Einsender/Empfänger prüfen: [{ adr_nr, eingdatum, eins_gz }]; Geschäftszeichen ggf. groß (Systemprofil GZ_GROSS_JN)
async function pruefeAdressen(liste) {
  if (!Array.isArray(liste)) throw new HttpFehler(400, 'Liste von Adressen erwartet');
  const gross = (await systemprofil()).gz_gross_jn === 'J';
  const eintraege = [];
  for (const eintrag of liste) {
    const werte = await pruefe('dsv_doku_adr', eintrag, ['adr_nr', 'eingdatum', 'eins_gz'], { pflicht: ['adr_nr'], gross: gross ? ['eins_gz'] : [] });
    if (!(await zeile('SELECT 1 FROM dsv_adressen WHERE adr_nr = $1', [werte.adr_nr]))) throw new HttpFehler(400, `Adresse ${werte.adr_nr} gibt es nicht`);
    if (!eintraege.some((e) => e.adr_nr === werte.adr_nr)) eintraege.push(werte);
  }
  return eintraege;
}

async function adressenSpeichern(lfdDoknr, eintraege) {
  await zeile('DELETE FROM dsv_doku_adr WHERE lfd_doknr = $1', [lfdDoknr]);
  for (const werte of eintraege) await einfuegen('dsv_doku_adr', { lfd_doknr: lfdDoknr, eingdatum: JETZT, ...werte });
}

// Stichworte eines Dokuments bzw. (abgeleitet aus den lesbaren Dokumenten) einer Akte oder eines Vorgangs
async function stichworteVon(user, typ, row) {
  const q = new Sql();
  const auswahl = typ === 'dokument'
    ? `z.lfd_schrnr = ${q.p(row.lfd_doknr)}`
    : `EXISTS (SELECT 1 FROM dsv_doku d WHERE d.lfd_doknr = z.lfd_schrnr AND d.org = ${q.p(row.org)} AND d.akte = ${q.p(row.akte)}
         ${typ === 'vorgang' ? `AND d.vorg = ${q.p(row.vorg)}` : ''} AND ${zugriff.lesenDokument(q, user, 'd')})`;
  return (await zeilen(`
    SELECT DISTINCT s.stichwort FROM dsv_stwzuo z JOIN dsv_stichworte s ON s.stwnr = z.stwnr
    WHERE z.schriftgutlapart = 'D' AND ${auswahl} ORDER BY s.stichwort FETCH FIRST 200 ROWS ONLY
  `, q.werte)).map((r) => r.stichwort);
}

const kurz = (typ, r) => r && { id: r[SCHLUESSEL[typ]], aktenzeichen: aktenzeichen(typ, r), betreff: r.betreff, status: r.status };

// ---------- Lesen ----------

async function listeAkten(user, { hgruppe, gruppe, ugruppe, tglieder, org, status, q: text } = {}) {
  const q = new Sql();
  const bedingungen = [zugriff.lesen(q, user, 'a')];
  // Aktenplanknoten n: Akten dieser Position und aller Unterpositionen
  let knoten = '';
  if (hgruppe) {
    knoten = `CROSS JOIN (SELECT ${d.text(q.p(hgruppe), 30)} AS hgruppe, ${d.text(q.p(gruppe || null), 30)} AS gruppe,
      ${d.text(q.p(ugruppe || null), 30)} AS ugruppe, ${d.text(q.p(tglieder || null), 30)} AS tglieder${d.dual}) n`;
    bedingungen.push(unterhalb('a', 'n'));
  }
  if (org) bedingungen.push(`a.org = ${q.p(org)}`);
  if (status) bedingungen.push(`a.status = ${q.p(status)}`);
  if (text) {
    const muster = q.p(likeMuster(text));
    bedingungen.push(`(${d.ilike(`a.org || '-' || a.akte`, muster)} OR ${d.ilike('a.betreff', muster)} OR ${d.ilike('a.bemerkung', muster)})`);
  }
  return (await zeilen(`
    SELECT a.*, o.name AS org_name,
      (SELECT COUNT(*) FROM dsv_vorg v WHERE v.org = a.org AND v.akte = a.akte) AS anzahl_vorgaenge
    FROM dsv_akte a LEFT JOIN dsv_lov_org o ON o.org = a.org ${knoten}
    WHERE ${bedingungen.join(' AND ')}
    ORDER BY a.akte, a.org
    FETCH FIRST 500 ROWS ONLY
  `, q.werte)).map(mitAz('akte'));
}

async function akteDetail(user, id) {
  const akte = await laden(user, 'akte', id);
  // Sortierung der Vorgänge laut Systemprofil: A = Bezeichnung aufsteigend, N = Vorgangsnummer absteigend
  const ordnung = (await systemprofil()).vorg_sort_num === 'N' ? 'v.vorg_nr DESC' : 'v.vorg';
  const q = new Sql();
  const vorgaenge = await zeilen(`
    SELECT v.*, (SELECT COUNT(*) FROM dsv_doku d WHERE d.org = v.org AND d.akte = v.akte AND d.vorg = v.vorg
                 AND ${zugriff.lesenDokument(q, user, 'd')}) AS anzahl_dokumente
    FROM dsv_vorg v WHERE v.org = ${q.p(akte.org)} AND v.akte = ${q.p(akte.akte)} AND ${zugriff.lesen(q, user, 'v')}
    ORDER BY ${ordnung}
  `, q.werte);
  return {
    ...akte,
    org_name: await orgName(akte.org),
    aktenplan: await zeile('SELECT lfd_apnr, akte AS kennzeichen, betreff, aufbfrist, hinweis FROM dsv_lap WHERE akte = $1', [akte.akte]),
    vorgaenge: vorgaenge.map(mitAz('vorgang')),
    stichworte: await stichworteVon(user, 'akte', akte)
  };
}

async function vorgangDetail(user, id) {
  const vorgang = await laden(user, 'vorgang', id);
  const q = new Sql();
  const dokumente = await zeilen(`
    SELECT d.* FROM dsv_doku d
    WHERE d.org = ${q.p(vorgang.org)} AND d.akte = ${q.p(vorgang.akte)} AND d.vorg = ${q.p(vorgang.vorg)} AND ${zugriff.lesenDokument(q, user, 'd')}
    ORDER BY d.dokunr
  `, q.werte);
  const akte = await zeile('SELECT * FROM dsv_akte WHERE org = $1 AND akte = $2', [vorgang.org, vorgang.akte]);
  return {
    ...vorgang,
    org_name: await orgName(vorgang.org),
    akte: kurz('akte', akte),
    dokumente: dokumente.map(mitAz('dokument')),
    stichworte: await stichworteVon(user, 'vorgang', vorgang)
  };
}

async function dokumentDetail(user, id) {
  const dokument = await laden(user, 'dokument', id);
  const [akte, vorgang] = await Promise.all([
    zeile('SELECT * FROM dsv_akte WHERE org = $1 AND akte = $2', [dokument.org, dokument.akte]),
    zeile('SELECT * FROM dsv_vorg WHERE org = $1 AND akte = $2 AND vorg = $3', [dokument.org, dokument.akte, dokument.vorg])
  ]);
  const q = new Sql();
  const anlagen = await zeilen(`
    SELECT an.*, ${d.zahl(`an.lfd_dokanlnr IS NOT NULL AND EXISTS (SELECT 1 FROM dsv_doku d WHERE d.lfd_doknr = an.lfd_dokanlnr
      AND ${zugriff.lesenDokument(q, user, 'd')})`)} AS verweis_lesbar
    FROM dsv_anla an WHERE an.lfd_doknr = ${q.p(dokument.lfd_doknr)} ORDER BY an.anlanr
  `, q.werte);
  const adressen = await zeilen(`
    SELECT z.adr_nr, z.eingdatum, z.eins_gz, a.kuerzel, a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3, a.plz, a.ort, a.oeffentlich
    FROM dsv_doku_adr z JOIN dsv_adressen a ON a.adr_nr = z.adr_nr WHERE z.lfd_doknr = $1 ORDER BY z.eingdatum, a.bezeichnung_1
  `, [dokument.lfd_doknr]);
  // Zugriffsschutz und berechtigte Sachbearbeiter sind nur für die Registratur sichtbar (Handbuch 5.2.1)
  const berechtigte = user.registratur && dokument.geheim === 'J'
    ? (await zeilen('SELECT user_id FROM dsv_berechtigte_sb WHERE lfd_doknr = $1 ORDER BY user_id', [dokument.lfd_doknr])).map((r) => r.user_id)
    : null;
  return {
    ...dokument,
    org_name: await orgName(dokument.org),
    akte: kurz('akte', akte),
    vorgang: kurz('vorgang', vorgang),
    stichworte: await stichworteVon(user, 'dokument', dokument),
    adressen,
    anlagen: anlagen.map((an) => ({
      ...an,
      verweis: an.akte_o ? `${an.org}-${an.akte_o}/${an.vorg_o}/${an.dokunr_o}` : null
    })),
    berechtigte,
    umregistriert_nach: dokument.u_org ? `${dokument.u_org}-${dokument.u_akte}/${dokument.u_vorg}/${dokument.u_dokunr}` : null
  };
}

// ---------- Anlegen ----------

async function akteAnlegen(user, eingabe) {
  if (!user.registratur) throw new HttpFehler(403, VERWEIGERT.bearbeiten);
  const werte = verfuegung({}, await pruefe('dsv_akte', eingabe, ['org', ...FELDER.akte], { pflicht: ['org'], gross: ['bearbeiter'] }));
  await pruefeKennung(werte.bearbeiter);
  const lap = await zeile('SELECT * FROM dsv_lap WHERE lfd_apnr = $1', [Number(eingabe.lfd_apnr)]);
  if (!lap) throw new HttpFehler(400, 'Bitte eine Aktenplanposition wählen');
  const position = { org: werte.org, hgruppe: lap.hgruppe, gruppe: lap.gruppe, ugruppe: lap.ugruppe, tglieder: lap.tglieder };
  if (!(await darfSchreibenAuf(user, position))) {
    throw new HttpFehler(403, `Kein Schreibrecht für Referat ${werte.org} in Aktenplanposition ${lap.akte}`);
  }
  const { registrator, vertreter } = stempel(user);

  return transaktion(async () => {
    const vorhanden = await zeile('SELECT lfd_aktenr FROM dsv_akte WHERE org = $1 AND akte = $2', [werte.org, lap.akte]);
    if (vorhanden) throw new HttpFehler(409, `Die Akte ${werte.org}-${lap.akte} gibt es bereits`, `AKTE:${vorhanden.lfd_aktenr}`);
    const id = await naechsteNummer('dsv_seq_akte');
    const neu = await einfuegen('dsv_akte', {
      lfd_aktenr: id,
      lfd_apnr: lap.lfd_apnr,
      ...position,
      akte: lap.akte,
      ...werte,
      status: werte.status ?? config.status.neu,
      betreff: werte.betreff ?? lap.betreff,
      erst_registrator: registrator,
      erst_reg_vertreter: vertreter,
      erst_regdatum: JETZT
    });
    await protokolliere(user, 'akte', id, 'angelegt', { aktenzeichen: aktenzeichen('akte', neu) });
    return id;
  });
}

async function vorgangAnlegen(user, akteId, eingabe) {
  const akte = await mitRecht(user, 'akte', akteId);
  const werte = verfuegung({}, await pruefe('dsv_vorg', eingabe, ['vorg', ...FELDER.vorgang], { gross: ['vorg', 'bearbeiter'] }));
  await pruefeKennung(werte.bearbeiter);
  const { registrator, vertreter } = stempel(user);

  return transaktion(async () => {
    const { nr } = await zeile('SELECT COALESCE(MAX(vorg_nr), 0) + 1 AS nr FROM dsv_vorg WHERE org = $1 AND akte = $2', [akte.org, akte.akte]);
    const vorg = werte.vorg ?? String(nr);
    if (await zeile('SELECT 1 FROM dsv_vorg WHERE org = $1 AND akte = $2 AND vorg = $3', [akte.org, akte.akte, vorg])) {
      throw new HttpFehler(409, `Den Vorgang ${akte.aktenzeichen}/${vorg} gibt es bereits`);
    }
    const id = await naechsteNummer('dsv_seq_vorg');
    const neu = await einfuegen('dsv_vorg', {
      lfd_vorgnr: id,
      lfd_aktenr: akte.lfd_aktenr,
      org: akte.org, hgruppe: akte.hgruppe, gruppe: akte.gruppe, ugruppe: akte.ugruppe, tglieder: akte.tglieder, akte: akte.akte,
      ...werte,
      vorg,
      vorg_nr: nr,
      status: werte.status ?? config.status.neu,
      betreff: werte.betreff ?? akte.betreff,
      datum_letzteverf: JETZT,
      erst_registrator: registrator,
      erst_reg_vertreter: vertreter,
      erst_regdatum: JETZT
    });
    await protokolliere(user, 'vorgang', id, 'angelegt', { aktenzeichen: aktenzeichen('vorgang', neu) });
    return id;
  });
}

async function dokumentAnlegen(user, vorgangId, eingabe) {
  const vorgang = await mitRecht(user, 'vorgang', vorgangId);
  const werte = verfuegung({}, await pruefe('dsv_doku', eingabe, FELDER.dokument, { gross: ['bearbeiter', 'autor'] }));
  await pruefeKennung(werte.bearbeiter);
  // Vorbelegungen: Benutzerprofil vor Systemprofil; Betreff vom Vorgang
  const profil = await systemprofil();
  werte.eai_kennung ??= user.profil?.ben_eai ?? profil.sys_profil_eai ?? null;
  werte.klasse ??= user.profil?.ben_klasse ?? profil.sys_profil_klasse ?? null;
  werte.betreff ??= vorgang.betreff;
  if (!werte.betreff) throw new HttpFehler(400, 'Betreff ist ein Pflichtfeld');
  if (!werte.eai_kennung) throw new HttpFehler(400, `${name('eai_kennung')} ist ein Pflichtfeld`);
  const adressen = await pruefeAdressen(eingabe.adressen ?? []);
  if (MIT_ADRESSE.includes(werte.eai_kennung) && !adressen.length) {
    throw new HttpFehler(400, 'Bei Eingang und Ausgang ist mindestens ein Einsender/Empfänger anzugeben');
  }
  const worte = eingabe.stichworte !== undefined ? await pruefeStichworte(eingabe.stichworte) : await stichwortVorschlag(werte.betreff);
  const { registrator, vertreter } = stempel(user);

  return transaktion(async () => {
    const { nr } = await zeile('SELECT COALESCE(MAX(dokunr), 0) + 1 AS nr FROM dsv_doku WHERE org = $1 AND akte = $2 AND vorg = $3',
      [vorgang.org, vorgang.akte, vorgang.vorg]);
    const id = await naechsteNummer('dsv_seq_doku');
    const neu = await einfuegen('dsv_doku', {
      lfd_doknr: id,
      lfd_aktenr: vorgang.lfd_aktenr,
      lfd_vorgnr: vorgang.lfd_vorgnr,
      org: vorgang.org, hgruppe: vorgang.hgruppe, gruppe: vorgang.gruppe, ugruppe: vorgang.ugruppe, tglieder: vorgang.tglieder,
      akte: vorgang.akte, vorg: vorgang.vorg, vorg_nr: vorgang.vorg_nr,
      dokunr: nr,
      ...werte,
      status: werte.status ?? config.status.neu,
      datum_letzteverf: JETZT,
      erst_registrator: registrator,
      erst_reg_vertreter: vertreter,
      erst_regdatum: JETZT
    });
    await adressenSpeichern(id, adressen);
    await stichworteZuordnen(id, worte);
    // Neue Verfügung im Vorgang
    await aendern('dsv_vorg', 'org = $1 AND akte = $2 AND vorg = $3', [vorgang.org, vorgang.akte, vorgang.vorg], { datum_letzteverf: JETZT });
    await protokolliere(user, 'dokument', id, 'angelegt', { aktenzeichen: aktenzeichen('dokument', neu), stichworte: worte });
    return id;
  });
}

// ---------- Ändern ----------

async function aendernObjekt(user, typ, id, eingabe) {
  const alt = await mitRecht(user, typ, id);
  const werte = verfuegung(alt, await pruefe(TABELLE[typ], eingabe, FELDER[typ], { gross: ['bearbeiter', 'autor'] }));
  const geleert = PFLICHT[typ].find((feld) => werte[feld] === null);
  if (geleert) throw new HttpFehler(400, `${name(geleert)} ist ein Pflichtfeld`);
  await pruefeKennung(werte.bearbeiter);
  if (typ === 'dokument' && MIT_ADRESSE.includes(werte.eai_kennung) && werte.eai_kennung !== alt.eai_kennung) {
    const { anzahl } = await zeile('SELECT COUNT(*) AS anzahl FROM dsv_doku_adr WHERE lfd_doknr = $1', [alt.lfd_doknr]);
    if (!anzahl) throw new HttpFehler(400, 'Bei Eingang und Ausgang ist zuerst ein Einsender/Empfänger einzutragen');
  }
  const geaendert = unterschiede(alt, werte);
  if (!Object.keys(geaendert).length) return;
  const { registrator, vertreter } = stempel(user);

  await transaktion(async () => {
    const neu = Object.fromEntries(Object.keys(geaendert).map((feld) => [feld, werte[feld]]));
    // Jede Verfügung (Statusänderung) setzt das Datum der letzten Verfügung, beim Dokument auch am Vorgang
    if ('status' in neu && typ !== 'akte') neu.datum_letzteverf = JETZT;
    await aendern(TABELLE[typ], `${SCHLUESSEL[typ]} = $1`, [alt[SCHLUESSEL[typ]]], {
      ...neu,
      aend_registrator: registrator,
      aend_reg_vertreter: vertreter,
      aend_regdatum: JETZT
    });
    if (typ === 'dokument' && 'status' in neu) {
      await aendern('dsv_vorg', 'org = $1 AND akte = $2 AND vorg = $3', [alt.org, alt.akte, alt.vorg], { datum_letzteverf: JETZT });
    }
    await protokolliere(user, typ, alt[SCHLUESSEL[typ]], 'geaendert', geaendert);
  });
}

// Stichworte eines Dokuments ersetzen (Registratur und Sachbearbeitung mit Schreibrecht)
async function dokumentStichworte(user, id, worte) {
  const dokument = await mitRecht(user, 'dokument', id, 'stichworte');
  const liste = await pruefeStichworte(worte);
  await transaktion(async () => {
    const bisher = await stichworteVon(user, 'dokument', dokument);
    await stichworteZuordnen(dokument.lfd_doknr, liste);
    await protokolliere(user, 'dokument', dokument.lfd_doknr, 'geaendert', { stichworte: [bisher, liste] });
  });
}

// Einsender/Empfänger ersetzen; bei Eingang/Ausgang muss mindestens einer bleiben
async function dokumentAdressen(user, id, liste) {
  const dokument = await mitRecht(user, 'dokument', id);
  const eintraege = await pruefeAdressen(liste);
  if (MIT_ADRESSE.includes(dokument.eai_kennung) && !eintraege.length) {
    throw new HttpFehler(400, 'Die letzte Adresse eines Eingangs oder Ausgangs kann nicht entfernt werden');
  }
  await transaktion(async () => {
    const bisher = (await zeilen('SELECT adr_nr FROM dsv_doku_adr WHERE lfd_doknr = $1 ORDER BY adr_nr', [dokument.lfd_doknr])).map((r) => r.adr_nr);
    await adressenSpeichern(dokument.lfd_doknr, eintraege);
    await protokolliere(user, 'dokument', dokument.lfd_doknr, 'geaendert', { adressen: [bisher, eintraege.map((e) => e.adr_nr)] });
  });
}

// Berechtigte Sachbearbeiter eines geschützten Dokuments (nur Registratur; eintragbar nur Sachbearbeitung/Nur Lesen)
async function dokumentBerechtigte(user, id, userIds) {
  const dokument = await mitRecht(user, 'dokument', id);
  if (!Array.isArray(userIds)) throw new HttpFehler(400, 'Liste von Kennungen erwartet');
  const liste = [...new Set(userIds.map((u) => String(u).trim().toUpperCase()).filter(Boolean))];
  const sq = new Sql();
  const passend = await zeilen(`SELECT user_id FROM dsv_benutzerprofil WHERE ${sq.in('user_id', liste)} AND (klasse_sb = 'X' OR klasse_ns = 'X')`, sq.werte);
  const falsch = liste.filter((u) => !passend.some((p) => p.user_id === u));
  if (falsch.length) throw new HttpFehler(400, `Nur Kennungen mit Rolle Sachbearbeitung oder Nur Lesen: ${falsch.join(', ')}`);
  await transaktion(async () => {
    await zeile('DELETE FROM dsv_berechtigte_sb WHERE lfd_doknr = $1', [dokument.lfd_doknr]);
    for (const userId of liste) await zeile('INSERT INTO dsv_berechtigte_sb (lfd_doknr, user_id) VALUES ($1, $2)', [dokument.lfd_doknr, userId]);
    await protokolliere(user, 'dokument', dokument.lfd_doknr, 'geaendert', { berechtigte: [null, liste] });
  });
}

module.exports = {
  LABEL,
  SCHLUESSEL,
  aktenzeichen,
  laden,
  mitRecht,
  verfuegung,
  listeAkten,
  akteDetail,
  vorgangDetail,
  dokumentDetail,
  akteAnlegen,
  vorgangAnlegen,
  dokumentAnlegen,
  aendernObjekt,
  dokumentStichworte,
  dokumentAdressen,
  dokumentBerechtigte
};
