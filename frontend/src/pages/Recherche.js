// Recherche über Akten, Vorgänge und Dokumente; alle Filter und die Sortierung stehen in der URL
import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api, { fehlertext, lovText, useKennungen, useLov } from '../api';
import { useIch } from '../ich';
import { objektPfad } from '../schema';
import { datum, isoDatum } from '../format';
import { Fehler, Karte, Laden, MehrfachAuswahl, StatusBadge, Umschalter, Vorschlaege } from '../components/ui';

const EBENEN = [
  ['akte', 'Akten'],
  ['vorgang', 'Vorgänge'],
  ['dokument', 'Dokumente']
];
const FILTER = ['q', 'org', 'abteilung', 'aktenplan', 'stichwort', 'bearbeiter', 'status', 'eai', 'klasse', 'adresse', 'gz', 'datumsfeld', 'von', 'bis'];
const DATUMSFELDER = [
  ['erst_regdatum', 'Registriert'],
  ['aend_regdatum', 'Zuletzt geändert'],
  ['datum_letzteverf', 'Letzte Verfügung'],
  ['erstdatum', 'Dokumentdatum']
];

function zeitraumVorlagen() {
  const jahr = new Date().getFullYear();
  return [
    ['Letzte 30 Tage', isoDatum(-30), isoDatum()],
    ['Dieses Jahr', `${jahr}-01-01`, `${jahr}-12-31`],
    ['Vorjahr', `${jahr - 1}-01-01`, `${jahr - 1}-12-31`]
  ];
}

function Feld({ label, children }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      {children}
    </label>
  );
}

function Suchformular({ start, onSuchen }) {
  const ich = useIch();
  const lov = useLov();
  const kennungen = useKennungen();
  const [werte, setWerte] = useState({ datumsfeld: 'erst_regdatum', ...start });
  const [erweitert, setErweitert] = useState(() => ['aktenplan', 'stichwort', 'bearbeiter', 'status', 'eai', 'klasse', 'adresse', 'gz'].some((n) => start[n]));
  const setze = (name) => (event) => setWerte({ ...werte, [name]: event.target.value });
  const eingabe = (name, extra = {}) => <input className="input" value={werte[name] || ''} onChange={setze(name)} {...extra} />;
  const liste = (name) => (werte[name] ? werte[name].split(',') : []);
  const setzeListe = (name) => (neu) => setWerte({ ...werte, [name]: neu.join(',') });
  const auswahl = (name, eintraege) => (
    <select className="input" value={werte[name] || ''} onChange={setze(name)}>
      <option value="">alle</option>
      {eintraege.map((e) => (
        <option key={e.code} value={e.code}>
          {e.name}
        </option>
      ))}
    </select>
  );

  // Nur Referate, die der Benutzer lesen darf; Abteilung = erstes Zeichen des Referats
  const referate = [...new Set(ich.zustaendigkeiten.map((z) => z.org))].sort();
  const abteilungen = [...new Set(referate.map((r) => r.charAt(0)))].sort();
  const gewaehlteAbteilungen = liste('abteilung');

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSuchen(werte);
      }}
      className="space-y-4"
    >
      <div className="flex gap-2">
        <input className="input" autoFocus placeholder="Aktenzeichen, Betreff, Bemerkung, Stichwort (inkl. Synonyme), Fremdnummer, Dateiname …" value={werte.q || ''} onChange={setze('q')} />
        <button type="submit" className="btn btn-primaer">
          Suchen
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Feld label="Abteilungen">
          <MehrfachAuswahl platzhalter="alle" optionen={abteilungen.map((a) => ({ wert: a, label: `Abteilung ${a}` }))} werte={gewaehlteAbteilungen} onChange={setzeListe('abteilung')} />
        </Feld>
        <Feld label="Referate">
          <MehrfachAuswahl
            platzhalter="alle"
            optionen={referate
              .filter((r) => !gewaehlteAbteilungen.length || gewaehlteAbteilungen.includes(r.charAt(0)))
              .map((r) => ({ wert: r, label: `${r} – ${lovText(lov.org, r)}` }))}
            werte={liste('org')}
            onChange={setzeListe('org')}
          />
        </Feld>
        <Feld label="Zeitraum bezogen auf">
          <select className="input" value={werte.datumsfeld} onChange={setze('datumsfeld')}>
            {DATUMSFELDER.map(([wert, label]) => (
              <option key={wert} value={wert}>
                {label}
              </option>
            ))}
          </select>
        </Feld>
        <div>
          <span className="label">von – bis</span>
          <div className="flex gap-1">
            {eingabe('von', { type: 'date', 'aria-label': 'von' })}
            {eingabe('bis', { type: 'date', 'aria-label': 'bis' })}
          </div>
          <div className="mt-1 flex flex-wrap gap-x-3 text-xs">
            {zeitraumVorlagen().map(([label, von, bis]) => (
              <button key={label} type="button" className="text-blue-700 hover:underline" onClick={() => setWerte({ ...werte, von, bis })}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button type="button" className="text-sm text-blue-700 hover:underline" onClick={() => setErweitert(!erweitert)}>
        {erweitert ? '− Weniger Filter' : '+ Weitere Filter'}
      </button>
      {erweitert && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Feld label="Aktenplankennzeichen (inkl. Unterpositionen)">{eingabe('aktenplan', { placeholder: 'z. B. 0022' })}</Feld>
          <Feld label="Stichwort (inkl. Synonyme)">{eingabe('stichwort')}</Feld>
          <Feld label="Bearbeiter">
            {eingabe('bearbeiter', { list: 'r-kennungen', autoComplete: 'off' })}
            <Vorschlaege id="r-kennungen" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
          </Feld>
          <Feld label="Status">{auswahl('status', lov.status)}</Feld>
          <Feld label="Eingang / Ausgang / Intern">{auswahl('eai', lov.eai)}</Feld>
          <Feld label="Dokumentenklasse">{auswahl('klasse', lov.klasse)}</Feld>
          <Feld label="Einsender / Empfänger">{eingabe('adresse', { placeholder: 'Kürzel oder Bezeichnung' })}</Feld>
          <Feld label="Geschäftszeichen des Einsenders">{eingabe('gz')}</Feld>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-slate-400">Dokumentfilter (E/A/I, Klasse, Einsender, Geschäftszeichen, Dokumentdatum) liefern auf Akten- und Vorgangsebene die Objekte, die solche Dokumente enthalten.</p>
        <button type="button" className="btn btn-sekundaer" onClick={() => setWerte({ datumsfeld: 'erst_regdatum' })}>
          Filter zurücksetzen
        </button>
      </div>
    </form>
  );
}

// Spalten je Ebene: [Sortierfeld, Überschrift, Inhalt, CSV-Wert]
function spalten(ebene, lov) {
  const kontext = ebene === 'akte' ? null : ebene === 'vorgang' ? 'Akte' : 'Vorgang';
  const kontextAz = (t) => (ebene === 'vorgang' ? `${t.org}-${t.akte}` : `${t.org}-${t.akte}/${t.vorg}`);
  return [
    ['aktenzeichen', 'Aktenzeichen', (t) => <span className="az whitespace-nowrap">{t.aktenzeichen}</span>, (t) => t.aktenzeichen],
    ['betreff', 'Betreff', (t) => (
      <Link to={objektPfad(ebene, t.id)} className="link">
        {t.betreff || '(ohne Betreff)'}
      </Link>
    ), (t) => t.betreff],
    ['org', 'Referat', (t) => <span title={t.org_name}>{t.org}</span>, (t) => t.org],
    ...(kontext ? [[null, kontext, (t) => <span className="az">{kontextAz(t)}</span>, kontextAz]] : []),
    ...(ebene === 'dokument' ? [[null, 'E/A/I', (t) => lovText(lov.eai, t.eai_kennung), (t) => t.eai_kennung]] : []),
    ['bearbeiter', 'Bearbeiter', (t) => t.bearbeiter || '–', (t) => t.bearbeiter || ''],
    ...(ebene === 'dokument' ? [['erstdatum', 'Dokumentdatum', (t) => datum(t.erstdatum), (t) => datum(t.erstdatum)]] : []),
    ['erst_regdatum', 'Registriert', (t) => datum(t.erst_regdatum), (t) => datum(t.erst_regdatum)],
    ['aend_regdatum', 'Geändert', (t) => datum(t.aend_regdatum), (t) => (t.aend_regdatum ? datum(t.aend_regdatum) : '')],
    ...(ebene !== 'akte' ? [['datum_letzteverf', 'Letzte Verfügung', (t) => datum(t.datum_letzteverf), (t) => datum(t.datum_letzteverf)]] : []),
    ['status', 'Status', (t) => <StatusBadge status={t.status} name={lovText(lov.status, t.status)} />, (t) => lovText(lov.status, t.status)]
  ];
}

// Trefferliste als CSV (Semikolon, UTF-8 mit BOM – öffnet direkt in Excel)
function csvExport(ebene, treffer, lov) {
  const felder = spalten(ebene, lov);
  const zelle = (wert) => `"${String(wert ?? '').replace(/"/g, '""')}"`;
  const zeilen = [felder.map(([, kopf]) => zelle(kopf)).join(';'), ...treffer.map((t) => felder.map(([, , , csv]) => zelle(csv(t))).join(';'))];
  const url = URL.createObjectURL(new Blob([`﻿${zeilen.join('\r\n')}`], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = `recherche-${ebene}-${isoDatum()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

const DATUMSKOPF = ['Registriert', 'Geändert', 'Letzte Verfügung', 'Dokumentdatum'];

function Treffer({ ebene, treffer, sortierung, reihenfolge, onSortieren, lov }) {
  const felder = spalten(ebene, lov);
  return (
    <table className="tabelle">
      <thead>
        <tr>
          {felder.map(([feld, kopf]) => (
            <th key={kopf} className="whitespace-nowrap">
              {feld ? (
                <button type="button" className="inline-flex items-center gap-1 hover:text-slate-900" onClick={() => onSortieren(feld)}>
                  {kopf}
                  <span className="text-slate-400">{sortierung === feld ? (reihenfolge === 'ab' ? '▼' : '▲') : '↕'}</span>
                </button>
              ) : (
                kopf
              )}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {treffer.map((t) => (
          <tr key={t.id}>
            {felder.map(([, kopf, inhalt]) => (
              <td key={kopf} className={DATUMSKOPF.includes(kopf) ? 'whitespace-nowrap' : ''}>
                {inhalt(t)}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function Recherche() {
  const lov = useLov();
  const [parameter, setParameter] = useSearchParams();
  const filter = Object.fromEntries(FILTER.map((name) => [name, parameter.get(name) || '']).filter(([, wert]) => wert));
  const hatFilter = Object.keys(filter).some((name) => name !== 'datumsfeld');
  const ebene = parameter.get('ebene') || 'akte';
  const sortierung = parameter.get('sortierung') || 'aktenzeichen';
  const reihenfolge = parameter.get('reihenfolge') || 'auf';
  const schluessel = parameter.toString();
  const [ergebnis, setErgebnis] = useState(null);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    if (!hatFilter) return;
    api
      .get(`/recherche?${schluessel}`)
      .then(({ data }) => setErgebnis({ schluessel, ...data }))
      .catch((error) => setFehler(fehlertext(error)));
  }, [schluessel, hatFilter]);

  const setze = (neu) => setParameter(Object.fromEntries(Object.entries(neu).filter(([, wert]) => String(wert ?? '').trim())));
  const suchen = (werte) => setze({ ...Object.fromEntries(FILTER.map((name) => [name, werte[name]])), ebene, sortierung, reihenfolge });
  const sortieren = (feld) => setze({ ...filter, ebene, sortierung: feld, reihenfolge: sortierung === feld && reihenfolge === 'auf' ? 'ab' : 'auf' });
  const aktualisiert = ergebnis && ergebnis.schluessel !== schluessel;

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Recherche</h1>
      <Karte className="mb-6">
        <Suchformular key={schluessel} start={filter} onSuchen={suchen} />
      </Karte>
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      {!hatFilter ? (
        <p className="text-sm text-slate-500">Suchbegriff eingeben oder Filter setzen.</p>
      ) : !ergebnis ? (
        <Laden />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <Umschalter
              optionen={EBENEN.map(([wert, label]) => [wert, `${label} (${ergebnis.anzahl[wert]})`])}
              wert={ergebnis.ebene}
              onChange={(neu) => setze({ ...filter, ebene: neu, sortierung: neu !== 'dokument' && sortierung === 'erstdatum' ? 'aktenzeichen' : sortierung, reihenfolge })}
            />
            {aktualisiert && <span className="text-xs text-slate-400">wird aktualisiert …</span>}
            {ergebnis.treffer.length > 0 && (
              <button className="btn btn-sekundaer ml-auto" onClick={() => csvExport(ergebnis.ebene, ergebnis.treffer, lov)}>
                Als CSV exportieren
              </button>
            )}
          </div>
          {ergebnis.treffer.length === 0 ? (
            <div className="karte text-center text-sm text-slate-500">Keine Treffer auf dieser Ebene.</div>
          ) : (
            <div className={`karte overflow-x-auto p-0 ${aktualisiert ? 'opacity-60' : ''}`}>
              <Treffer ebene={ergebnis.ebene} treffer={ergebnis.treffer} sortierung={ergebnis.sortierung} reihenfolge={ergebnis.reihenfolge} onSortieren={sortieren} lov={lov} />
              {ergebnis.begrenzt && <p className="px-3 py-2 text-xs text-slate-500">Es werden die ersten 500 Treffer angezeigt. Bitte die Suche eingrenzen.</p>}
            </div>
          )}
        </>
      )}
    </>
  );
}
