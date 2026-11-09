// Express-App: API unter /api, optional das gebaute Frontend
const fs = require('fs');
const path = require('path');
const express = require('express');
const config = require('./config');
const { authentifizierung, eigeneOberflaeche, erfordertEigenesPasswort, erfordertAltkennung, erfordertAdmin } = require('./auth');
const lokal = require('./lokaleAnmeldung');
const benutzer = require('./benutzer');
const { systemprofil } = require('./systemprofil');
const { asyncHandler } = require('./fehler');
const { HttpFehler } = require('./fehler');

const app = express();
app.use(express.json({ limit: '1mb' }));

// Öffentlich: Name, Version und wie sich die Oberfläche anmelden soll
app.get('/api', (req, res) => {
  const { modus } = config.anmeldung;
  const { url, realm, clientId } = config.keycloak;
  res.json({ name: 'DSV – Dokumenten- und Schriftgutverwaltung', version: '4.0.0', anmeldung: modus, keycloak: modus === 'keycloak' ? { url, realm, clientId } : undefined });
});

app.use('/api', eigeneOberflaeche);

// Lokale Anmeldung: Login/Passwort → Sitzungs-Cookie
if (config.anmeldung.modus === 'lokal') {
  app.post('/api/anmeldung', asyncHandler(async (req, res) => {
    lokal.cookieSetzen(res, await lokal.anmelden(req.body));
    res.status(204).end();
  }));
  app.post('/api/abmeldung', asyncHandler(async (req, res) => {
    await lokal.abmelden(req);
    lokal.cookieLoeschen(res);
    res.status(204).end();
  }));
}

app.use('/api', authentifizierung);

// Wer bin ich? Auch ohne zugeordnete Altkennung abrufbar (für die Anzeige „kein Zugang“)
app.get('/api/ich', asyncHandler(async (req, res) => {
  const u = req.user;
  const profil = await systemprofil();
  res.json({
    login: u.login, name: u.name, userId: u.userId, kennung: u.profil?.kennung ?? null,
    klassen: u.klassen, admin: u.admin, gesperrt: u.gesperrt, registratur: u.registratur, sachbearbeitung: u.sachbearbeitung, stammdaten: u.stammdaten, kannSchreiben: u.kannSchreiben,
    zustaendigkeiten: u.zustaendigkeiten,
    // Vertretung (nur Registratur): wen der Benutzer vertreten kann und ob gerade eine Vertretung übernommen ist
    vertretungen: u.vertretungen, vertretungAktiv: u.vertretungAktiv, handelnAls: u.handelnAls,
    // Anmeldung: Modus, ob das Startpasswort noch zu ändern ist, Mindestlänge
    anmeldeModus: config.anmeldung.modus, passwortAendern: u.passwortAendern, passwortMin: config.anmeldung.passwortMin,
    // Vorbelegungen: Benutzerprofil vor Systemprofil
    vorbelegung: u.profil ? {
      org: u.profil.voreinst_org,
      eai_kennung: u.profil.ben_eai ?? profil.sys_profil_eai ?? null,
      klasse: u.profil.ben_klasse ?? profil.sys_profil_klasse ?? null,
      umfang: u.profil.ben_umfang ?? profil.sys_profil_umfang ?? null
    } : null
  });
}));

// Eigenes Passwort ändern (lokale Anmeldung)
app.put('/api/ich/passwort', asyncHandler(async (req, res) => {
  if (config.anmeldung.modus !== 'lokal') throw new HttpFehler(400, 'Das Passwort wird im Keycloak der Organisation verwaltet');
  await lokal.passwortAendern(req, req.body);
  res.status(204).end();
}));

app.use('/api', erfordertEigenesPasswort);

// Vertretung übernehmen ({ registrator }) oder abwählen ({ registrator: null })
app.put('/api/ich/vertretung', asyncHandler(async (req, res) => {
  if (!(await benutzer.vertretungWaehlen(req.user, req.body?.registrator))) {
    throw new HttpFehler(403, 'Diese Vertretung ist für Sie nicht eingetragen');
  }
  res.status(204).end();
}));

app.use('/api/verwaltung', erfordertAdmin, require('./routes/verwaltung'));
app.use('/api', (req, res, next) => (req.user.admin && !req.user.gesperrt ? next() : erfordertAltkennung(req, res, next)), require('./routes/stammdaten'));
app.use('/api', erfordertAltkennung, require('./routes/schriftgut'));

app.use('/api', (req, res) => res.status(404).json({ fehler: 'Route nicht gefunden' }));

// Gebautes Frontend ausliefern (cd frontend && npm run build), falls vorhanden
const frontendBuild = path.resolve(__dirname, '..', '..', 'frontend', 'build');
if (fs.existsSync(frontendBuild)) {
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => res.sendFile(path.join(frontendBuild, 'index.html')));
}

// Fehlercodes von PostgreSQL in verständliche Meldungen übersetzen
const PG_FEHLER = {
  23505: [409, 'Eintrag existiert bereits'],
  23503: [400, 'Ungültiger Wert: Bezug auf einen nicht vorhandenen Eintrag (z. B. Status, Referat oder Klasse nicht in der Werteliste)'],
  23514: [400, 'Wert verletzt eine Prüfregel der Datenbank'],
  23502: [400, 'Pflichtfeld fehlt'],
  22001: [400, 'Wert ist zu lang'],
  '22P02': [400, 'Ungültiges Format'],
  22007: [400, 'Ungültiges Datum'],
  22008: [400, 'Ungültiges Datum']
};

app.use((error, req, res, next) => {
  if (error instanceof HttpFehler) return res.status(error.status).json({ fehler: error.message, code: error.code });
  if (error.type === 'entity.parse.failed') return res.status(400).json({ fehler: 'Ungültiges JSON' });
  if (PG_FEHLER[error.code]) {
    const [status, text] = PG_FEHLER[error.code];
    return res.status(status).json({ fehler: text, details: config.isDev ? `${error.constraint || ''} ${error.detail || error.message}`.trim() : undefined });
  }
  console.error('Serverfehler:', error);
  res.status(500).json({ fehler: 'Interner Serverfehler', details: config.isDev ? error.message : undefined });
});

module.exports = app;
