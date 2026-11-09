// Angemeldeter Benutzer mit Altkennung, Rollen und Zuständigkeiten (aus /api/ich)
import { createContext, useContext } from 'react';

export const KLASSEN = {
  REG: 'Registratur',
  SB: 'Sachbearbeitung',
  NS: 'Nur Lesen',
  SY: 'Systemverwaltung',
  ST: 'Stammdatenverwaltung',
  DS: 'Datenschutz'
};

// Was die Rollen dürfen (Handbuch der Altanwendung); geschrieben wird nur mit Recht „S“ laut GVP
export const KLASSEN_HILFE = {
  REG: 'registriert und ändert Schriftgut, Geschäftsgang, Bereitstellen, private Adressen',
  SB: 'liest; pflegt Stichworte und Wiedervorlagen',
  NS: 'liest nur',
  SY: 'Benutzerverwaltung',
  ST: 'Synonyme und öffentliche Adressen',
  DS: 'sieht geheime Dokumente'
};

export const IchKontext = createContext(null);
export const useIch = () => useContext(IchKontext);

export const hatKlasse = (ich, ...klassen) => klassen.some((klasse) => ich?.klassen.includes(klasse));

// Referate, in denen die handelnde Kennung laut GVP schreiben darf (genaue Prüfung je Aktenplanposition im Backend)
export const schreibReferate = (ich) =>
  [...new Set((ich?.zustaendigkeiten || []).filter((z) => !z.vertreten && z.recht !== 'L').map((z) => z.org))].sort();
