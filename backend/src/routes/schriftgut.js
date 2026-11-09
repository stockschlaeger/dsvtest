// Aktenplan, Akten, Vorgänge, Dokumente, Wiedervorlagen, Adressen, Stichworte, Recherche, Wertelisten, Protokoll
const express = require('express');
const { asyncHandler: h } = require('../fehler');
const aktenplan = require('../aktenplan');
const adressen = require('../adressen');
const protokoll = require('../protokoll');
const { recherche } = require('../recherche');
const schriftgut = require('../schriftgut');
const stichworte = require('../stichworte');
const wiedervorlagen = require('../wiedervorlagen');

const router = express.Router();

// GET /api/aktenplan?hgruppe=&gruppe=&ugruppe=  → Kinder des Knotens (ohne Angabe: Hauptgruppen)
router.get('/aktenplan', h(async (req, res) => res.json(await aktenplan.kinder(req.user, req.query))));
router.get('/aktenplan/suche', h(async (req, res) => res.json(await aktenplan.suche(req.query.q || ''))));

// Akten
router.get('/akten', h(async (req, res) => res.json(await schriftgut.listeAkten(req.user, req.query))));
router.post('/akten', h(async (req, res) => res.status(201).json(await schriftgut.akteDetail(req.user, await schriftgut.akteAnlegen(req.user, req.body)))));
router.get('/akten/:id', h(async (req, res) => res.json(await schriftgut.akteDetail(req.user, req.params.id))));
router.put('/akten/:id', h(async (req, res) => {
  await schriftgut.aendernObjekt(req.user, 'akte', req.params.id, req.body);
  res.json(await schriftgut.akteDetail(req.user, req.params.id));
}));
router.post('/akten/:id/vorgaenge', h(async (req, res) => {
  res.status(201).json(await schriftgut.vorgangDetail(req.user, await schriftgut.vorgangAnlegen(req.user, req.params.id, req.body)));
}));

// Vorgänge
router.get('/vorgaenge/:id', h(async (req, res) => res.json(await schriftgut.vorgangDetail(req.user, req.params.id))));
router.put('/vorgaenge/:id', h(async (req, res) => {
  await schriftgut.aendernObjekt(req.user, 'vorgang', req.params.id, req.body);
  res.json(await schriftgut.vorgangDetail(req.user, req.params.id));
}));
router.post('/vorgaenge/:id/dokumente', h(async (req, res) => {
  res.status(201).json(await schriftgut.dokumentDetail(req.user, await schriftgut.dokumentAnlegen(req.user, req.params.id, req.body)));
}));

// Dokumente
router.get('/dokumente/:id', h(async (req, res) => res.json(await schriftgut.dokumentDetail(req.user, req.params.id))));
router.put('/dokumente/:id', h(async (req, res) => {
  await schriftgut.aendernObjekt(req.user, 'dokument', req.params.id, req.body);
  res.json(await schriftgut.dokumentDetail(req.user, req.params.id));
}));
router.put('/dokumente/:id/stichworte', h(async (req, res) => {
  await schriftgut.dokumentStichworte(req.user, req.params.id, req.body?.stichworte);
  res.json(await schriftgut.dokumentDetail(req.user, req.params.id));
}));
router.put('/dokumente/:id/adressen', h(async (req, res) => {
  await schriftgut.dokumentAdressen(req.user, req.params.id, req.body?.adressen);
  res.json(await schriftgut.dokumentDetail(req.user, req.params.id));
}));
router.put('/dokumente/:id/berechtigte', h(async (req, res) => {
  await schriftgut.dokumentBerechtigte(req.user, req.params.id, req.body?.berechtigte);
  res.json(await schriftgut.dokumentDetail(req.user, req.params.id));
}));

// Wiedervorlagen (DSV_ANFORDERUNGEN); Schlüssel: lfd_schrnr + wv_datum
router.get('/wiedervorlagen', h(async (req, res) => res.json(await wiedervorlagen.liste(req.user, req.query))));
router.get('/wiedervorlagen/faellig', h(async (req, res) => res.json({ anzahl: await wiedervorlagen.anzahlFaellig(req.user) })));
router.post('/wiedervorlagen', h(async (req, res) => res.status(201).json(await wiedervorlagen.anlegen(req.user, req.body))));
router.put('/wiedervorlagen/:schrnr/:datum', h(async (req, res) => {
  await wiedervorlagen.aendernWv(req.user, req.params.schrnr, req.params.datum, req.body);
  res.status(204).end();
}));
router.post('/wiedervorlagen/:schrnr/:datum/bereitstellen', h(async (req, res) => {
  await wiedervorlagen.bereitstellen(req.user, req.params.schrnr, req.params.datum);
  res.status(204).end();
}));
router.delete('/wiedervorlagen/:schrnr/:datum', h(async (req, res) => {
  await wiedervorlagen.erledigen(req.user, req.params.schrnr, req.params.datum);
  res.status(204).end();
}));

// Adressen
router.get('/adressen', h(async (req, res) => res.json(await adressen.liste(req.user, { q: req.query.q, mitObsoleten: req.query.obsolete === 'true' }))));
router.post('/adressen', h(async (req, res) => res.status(201).json(await adressen.anlegen(req.user, req.body))));
router.put('/adressen/:id', h(async (req, res) => res.json(await adressen.aendernAdresse(req.user, req.params.id, req.body))));

// Stichworte
router.get('/stichworte', h(async (req, res) => res.json(await stichworte.suche(req.query.q, Math.min(Number(req.query.limit) || 100, 500)))));
router.post('/stichworte/:stwnr/synonyme', h(async (req, res) => {
  await stichworte.synonymHinzufuegen(req.user, req.params.stwnr, req.body?.wort);
  res.status(204).end();
}));
router.delete('/stichworte/:stwnr/synonyme/:synonr', h(async (req, res) => {
  await stichworte.synonymEntfernen(req.user, req.params.stwnr, req.params.synonr);
  res.status(204).end();
}));

router.get('/recherche', h(async (req, res) => res.json(await recherche(req.user, req.query))));

// Protokoll der neuen Anwendung zu einem Schriftgutstück (Leserecht wird über das Objekt geprüft)
router.get('/protokoll/:typ/:id', h(async (req, res) => {
  if (['akte', 'vorgang', 'dokument'].includes(req.params.typ)) await schriftgut.laden(req.user, req.params.typ, req.params.id);
  else if (!req.user.admin) return res.status(403).json({ fehler: 'Nur für die Administration' });
  res.json(await protokoll.liste(req.params.typ, req.params.id));
}));

module.exports = router;
