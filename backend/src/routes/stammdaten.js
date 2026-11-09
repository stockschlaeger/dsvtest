// Wertelisten und Kennungen für Auswahlfelder (auch für die Administration ohne eigene Altkennung)
const express = require('express');
const { asyncHandler: h } = require('../fehler');
const { zeilen } = require('../db');
const config = require('../config');
const lov = require('../lov');

const router = express.Router();

// Wertelisten; dazu, welche Status nur über Fachfunktionen gesetzt werden und mit welchem neues Schriftgut startet
router.get('/lov', h(async (req, res) => res.json({ ...(await lov.alle()), status_neu: config.status.neu, status_gg: config.status.geschaeftsgang, status_system: config.status.system })));

// Kennungen (Bearbeiter, Empfänger, Vertretungen)
router.get('/kennungen', h(async (req, res) => {
  res.json(await zeilen('SELECT user_id, kennung FROM dsv_benutzerprofil ORDER BY user_id'));
}));

module.exports = router;
