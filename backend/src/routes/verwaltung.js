// Benutzerverwaltung (nur Administration)
const express = require('express');
const { asyncHandler: h } = require('../fehler');
const verwaltung = require('../verwaltung');

const router = express.Router();

router.get('/anmeldungen', h(async (req, res) => res.json(await verwaltung.anmeldungen())));
router.post('/anmeldungen', h(async (req, res) => res.status(201).json(await verwaltung.anmeldungAnlegen(req.user, req.body || {}))));
router.put('/anmeldungen/:login', h(async (req, res) => {
  await verwaltung.anmeldungAendern(req.user, req.params.login, req.body || {});
  res.status(204).end();
}));
// Lokale Anmeldung: Passwort setzen (leer = Startpasswort erzeugen); Antwort enthält das Passwort einmalig
router.put('/anmeldungen/:login/passwort', h(async (req, res) => res.json(await verwaltung.passwortZuruecksetzen(req.user, req.params.login, req.body))));
router.delete('/anmeldungen/:login', h(async (req, res) => {
  await verwaltung.anmeldungEntfernen(req.user, req.params.login);
  res.status(204).end();
}));

router.get('/profile', h(async (req, res) => res.json(await verwaltung.profile(req.query.q))));
router.post('/profile', h(async (req, res) => res.status(201).json(await verwaltung.profil(await verwaltung.profilAnlegen(req.user, req.body)))));
router.get('/profile/:id', h(async (req, res) => res.json(await verwaltung.profil(req.params.id))));
router.put('/profile/:id', h(async (req, res) => {
  await verwaltung.profilAendern(req.user, req.params.id, req.body || {});
  res.json(await verwaltung.profil(req.params.id));
}));
router.post('/profile/:id/gvp', h(async (req, res) => {
  await verwaltung.gvpHinzufuegen(req.user, req.params.id, req.body || {});
  res.json(await verwaltung.profil(req.params.id));
}));
router.post('/profile/:id/gvp/entfernen', h(async (req, res) => {
  await verwaltung.gvpEntfernen(req.user, req.params.id, req.body || {});
  res.json(await verwaltung.profil(req.params.id));
}));

router.post('/vertretungen', h(async (req, res) => {
  await verwaltung.vertretung(req.user, req.body, false);
  res.status(204).end();
}));
router.post('/vertretungen/entfernen', h(async (req, res) => {
  await verwaltung.vertretung(req.user, req.body, true);
  res.status(204).end();
}));

module.exports = router;
