// Zugriffsregeln der Altanwendung (Views DSV_AKTE_, DSV_VORG_, DSV_DOKU_, DSV_LESE_GVP; Handbuch Kap. 7.3, 5.1, 5.2)
//
// Lesen:     irgendein passender GVP-Eintrag (DSV_GVP) des Benutzers oder einer Person, die er vertreten darf
//            (DSV_VERTRETUNG) – gleiches Referat (ORG); HGRUPPE/GRUPPE/UGRUPPE/TGLIEDER schränken ein, wenn gesetzt.
//            Das Recht (L/S) spielt fürs Lesen keine Rolle.
// Geheim:    Dokumente mit GEHEIM = 'J' nur für Registratur/Datenschutz oder eingetragene Sachbearbeiter.
// Schreiben: der spezifischste passende GVP-Eintrag der handelnden Kennung hat ein anderes Recht als „nur Lesen“
//            (S auf Hauptgruppe 02, L auf Gruppe 027 → in 027 nur lesen). Bei aktiver Vertretung handelt der
//            Benutzer mit der Kennung und den Rechten der vertretenen Person.
// Was mit dem Schreibrecht erlaubt ist, hängt von der Rolle ab (siehe rechte()).
// Alle Funktionen liefern SQL-Bedingungen (für SELECT-Listen mit dialekt.zahl() umschließen).
const config = require('./config');
const { dialekt } = require('./db');

const passt = (g, a) => `${g}.org = ${a}.org
    AND (${g}.hgruppe IS NULL OR ${g}.hgruppe = ${a}.hgruppe)
    AND (${g}.gruppe IS NULL OR ${g}.gruppe = ${a}.gruppe)
    AND (${g}.ugruppe IS NULL OR ${g}.ugruppe = ${a}.ugruppe)
    AND (${g}.tglieder IS NULL OR ${g}.tglieder = ${a}.tglieder)`;

// a = Alias einer Zeile mit org, hgruppe, gruppe, ugruppe, tglieder (Akte, Vorgang, Dokument, Anforderung, …)
function lesen(q, user, a) {
  if (!user.userId) return dialekt.falsch;
  const u = q.p(user.userId);
  return `EXISTS (SELECT 1 FROM dsv_gvp g
    WHERE (g.bearbeiter = ${u} OR g.bearbeiter IN (SELECT v.registrator FROM dsv_vertretung v WHERE v.vertreter = ${u}))
    AND ${passt('g', a)})`;
}

function geheim(q, user, d) {
  if (user.siehtGeheim) return dialekt.wahr;
  return `(${d}.geheim = 'N' OR EXISTS (SELECT 1 FROM dsv_berechtigte_sb b WHERE b.lfd_doknr = ${d}.lfd_doknr AND b.user_id = ${q.p(user.userId)}))`;
}

const lesenDokument = (q, user, d) => `(${lesen(q, user, d)} AND ${geheim(q, user, d)})`;

// Wie genau ein GVP-Eintrag ist: Anzahl der gesetzten Aktenplan-Ebenen
const genauigkeit = (g) => ['hgruppe', 'gruppe', 'ugruppe', 'tglieder'].map((ebene) => `CASE WHEN ${g}.${ebene} IS NULL THEN 0 ELSE 1 END`).join(' + ');

// Schreibrecht laut GVP: ein schreibender Eintrag unter den genauesten passenden Einträgen der handelnden Kennung
function schreiben(q, user, a) {
  if (!user.handelnAls) return dialekt.falsch;
  const kennung = q.p(user.handelnAls);
  return `EXISTS (SELECT 1 FROM dsv_gvp g
    WHERE g.bearbeiter = ${kennung} AND ${passt('g', a)} AND g.recht <> ${q.p(config.rechtLesen)}
    AND ${genauigkeit('g')} = (SELECT MAX(${genauigkeit('g2')}) FROM dsv_gvp g2 WHERE g2.bearbeiter = ${kennung} AND ${passt('g2', a)}))`;
}

const lesenTyp = (q, user, typ, a) => (typ === 'dokument' ? lesenDokument(q, user, a) : lesen(q, user, a));

// Was der Benutzer an einem Schriftgutstück darf (Handbuch Kap. 4.1, 7.3):
//   Registratur mit Schreibrecht: registrieren, ändern, Status, Adressen, Zugriffsschutz, Wiedervorlagen
//   Sachbearbeitung mit Schreibrecht: nur Stichworte und Wiedervorlagen
//   Nur Lesen: nichts
function rechte(user, gvpSchreiben) {
  const schreibrecht = Boolean(gvpSchreiben);
  const reg = user.registratur && schreibrecht;
  const sb = user.sachbearbeitung && schreibrecht;
  return { bearbeiten: reg, stichworte: reg || sb, wiedervorlage: reg || sb, gvpSchreiben: schreibrecht };
}

module.exports = { lesen, lesenDokument, lesenTyp, schreiben, geheim, rechte };
