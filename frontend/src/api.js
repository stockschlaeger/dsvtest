// Axios-Instanz für das Backend; Anmeldedaten je nach Modus (siehe anmeldung.js)
import { useEffect, useState } from 'react';
import axios from 'axios';
import { anfrageKopf } from './anmeldung';

const api = axios.create({ baseURL: '/api' });

api.interceptors.request.use(async (config) => {
  for (const [name, wert] of Object.entries(await anfrageKopf())) config.headers[name] = wert;
  return config;
});

// Sitzung abgelaufen oder beendet: die App zeigt wieder die Anmeldung
api.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401) window.dispatchEvent(new Event('dsv:abgemeldet'));
  return Promise.reject(error);
});

export const fehlertext = (error) => error.response?.data?.fehler || error.message || 'Unbekannter Fehler';

// Kopfzeile über geänderte Wiedervorlagen informieren (aktualisiert den Fällig-Zähler)
export const wiedervorlagenGeaendert = () => window.dispatchEvent(new Event('dsv:wiedervorlagen'));

// Einmal geladene Nachschlagelisten für Auswahlfelder
const zwischenspeicher = {};
function useNachschlagen(pfad, leer) {
  const [daten, setDaten] = useState(leer);
  useEffect(() => {
    zwischenspeicher[pfad] ||= api.get(pfad).then(({ data }) => data).catch(() => leer);
    zwischenspeicher[pfad].then(setDaten);
  }, [pfad, leer]);
  return daten;
}

export const vergessen = (pfad) => delete zwischenspeicher[pfad];
// Nach einer (erneuten) Anmeldung alles neu laden
export const allesVergessen = () => Object.keys(zwischenspeicher).forEach(vergessen);

const LEERE_LOV = { org: [], status: [], eai: [], klasse: [], form: [], jn: [], rechte: [], schriftgutart: [], konfiguration: [], umfang: [] };
const LEERE_LISTE = [];

// Wertelisten der Altanwendung (DSV_LOV_*)
export const useLov = () => useNachschlagen('/lov', LEERE_LOV);
// Kennungen (DSV_BENUTZERPROFIL) für Bearbeiter, Autor, Empfänger
export const useKennungen = () => useNachschlagen('/kennungen', LEERE_LISTE);

// Anzeigetext zu einem Code aus einer Werteliste
export const lovText = (liste, code) => {
  if (code === null || code === undefined || code === '') return null;
  const eintrag = liste.find((e) => e.code === code);
  return eintrag ? eintrag.name : code;
};

export default api;
