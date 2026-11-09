// Bausteine der Dokumentseite: Dateiverweis, Stichworte, Einsender/Empfänger, Anlagen, berechtigte Sachbearbeiter
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fehlertext, useKennungen } from '../api';
import { datum, grossWieOracle, isoDatum, istUrl } from '../format';
import { Fehler, Karte, Stichworte, Vorschlaege } from './ui';

// DATEIPFAD + DATEINAME → vollständiger Verweis (die Datei selbst liegt außerhalb der Anwendung)
export function dateiVerweis(pfad, name) {
  if (!pfad) return name || null;
  if (!name || pfad.endsWith(name)) return pfad;
  const trenner = istUrl(pfad) || pfad.includes('/') ? '/' : '\\';
  return `${pfad.replace(/[\\/]+$/, '')}${trenner}${name}`;
}

export function DateiKarte({ dokument }) {
  const verweis = dateiVerweis(dokument.dateipfad, dokument.dateiname);
  const [kopiert, setKopiert] = useState(false);
  if (!verweis) return null;
  const kopieren = async () => {
    await navigator.clipboard.writeText(verweis);
    setKopiert(true);
    setTimeout(() => setKopiert(false), 1500);
  };
  return (
    <Karte titel="Datei">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 break-all font-mono text-xs text-slate-700">{verweis}</div>
        <div className="flex gap-2">
          {istUrl(verweis) && (
            <a className="btn btn-sekundaer" href={verweis} target="_blank" rel="noopener noreferrer">
              Öffnen
            </a>
          )}
          <button className="btn btn-sekundaer" onClick={kopieren}>
            {kopiert ? 'Kopiert ✓' : 'Pfad kopieren'}
          </button>
        </div>
      </div>
    </Karte>
  );
}

// Bearbeiten-Rahmen für die Karten unten
function Bearbeitbar({ titel, darf, ansicht, formular }) {
  const [aktiv, setAktiv] = useState(false);
  return (
    <Karte
      titel={titel}
      aktion={
        darf &&
        !aktiv && (
          <button className="btn btn-sekundaer" onClick={() => setAktiv(true)}>
            Bearbeiten
          </button>
        )
      }
    >
      {aktiv ? formular(() => setAktiv(false)) : ansicht}
    </Karte>
  );
}

function StichwortEditor({ dokument, onFertig, onAbbrechen }) {
  const [worte, setWorte] = useState(dokument.stichworte);
  const [eingabe, setEingabe] = useState('');
  const [vorschlaege, setVorschlaege] = useState([]);
  const [fehler, setFehler] = useState('');

  useEffect(() => {
    if (eingabe.trim().length < 2) return undefined;
    const zeitgeber = setTimeout(() => {
      api.get('/stichworte', { params: { q: eingabe.trim(), limit: 20 } }).then(({ data }) => setVorschlaege(data.map((s) => s.stichwort))).catch(() => {});
    }, 200);
    return () => clearTimeout(zeitgeber);
  }, [eingabe]);

  const uebernehmen = () => {
    const neu = eingabe.split(',').map((w) => grossWieOracle(w.trim())).filter(Boolean);
    setWorte([...new Set([...worte, ...neu])]);
    setEingabe('');
  };

  const speichern = async () => {
    try {
      await api.put(`/dokumente/${dokument.lfd_doknr}/stichworte`, { stichworte: [...worte, ...eingabe.split(',').map((w) => w.trim()).filter(Boolean)] });
      onFertig();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };

  return (
    <div className="space-y-3">
      <Fehler text={fehler} />
      <div className="input flex flex-wrap items-center gap-1 py-1">
        {worte.map((wort) => (
          <span key={wort} className="chip">
            {wort}
            <button type="button" onClick={() => setWorte(worte.filter((w) => w !== wort))} aria-label={`${wort} entfernen`} className="text-blue-500 hover:text-blue-900">
              ×
            </button>
          </span>
        ))}
        <input
          list="dok-stichworte"
          className="min-w-[10rem] flex-1 border-0 p-0.5 text-sm uppercase focus:outline-none focus:ring-0"
          placeholder="Stichwort, Enter zum Übernehmen"
          value={eingabe}
          onChange={(event) => setEingabe(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ',') {
              event.preventDefault();
              uebernehmen();
            }
          }}
        />
        <Vorschlaege id="dok-stichworte" werte={vorschlaege} />
      </div>
      <p className="text-xs text-slate-400">Stichworte werden in Großbuchstaben gespeichert; Stoppworte sind nicht erlaubt.</p>
      <div className="flex gap-2">
        <button className="btn btn-primaer" onClick={speichern}>
          Speichern
        </button>
        <button className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export function StichwortKarte({ dokument, onGeaendert }) {
  return (
    <Bearbeitbar
      titel="Stichworte"
      darf={dokument.rechte.stichworte}
      ansicht={<Stichworte worte={dokument.stichworte} verlinkt />}
      formular={(schliessen) => (
        <StichwortEditor
          dokument={dokument}
          onAbbrechen={schliessen}
          onFertig={() => {
            schliessen();
            onGeaendert();
          }}
        />
      )}
    />
  );
}

const adressText = (a) => [a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3].filter(Boolean).join(' ');

// Einsender/Empfänger auswählen (Suche im Adressbestand) mit Eingangsdatum und Geschäftszeichen
export function AdressListe({ eintraege, onChange }) {
  const [suche, setSuche] = useState('');
  const [treffer, setTreffer] = useState([]);

  useEffect(() => {
    if (suche.trim().length < 2) return setTreffer([]);
    const zeitgeber = setTimeout(() => api.get('/adressen', { params: { q: suche.trim() } }).then(({ data }) => setTreffer(data.slice(0, 10))).catch(() => {}), 200);
    return () => clearTimeout(zeitgeber);
  }, [suche]);

  const setze = (index, feld, wert) => onChange(eintraege.map((e, i) => (i === index ? { ...e, [feld]: wert } : e)));

  return (
    <div className="space-y-3">
      {eintraege.map((e, index) => (
        <div key={e.adr_nr} className="grid grid-cols-1 items-end gap-2 sm:grid-cols-[1fr_9rem_10rem_auto]">
          <div className="text-sm">
            <span className="font-mono text-xs text-slate-500">{e.kuerzel}</span> {adressText(e)}
            <div className="text-xs text-slate-500">{[e.plz, e.ort].filter(Boolean).join(' ')}</div>
          </div>
          <label className="block">
            <span className="label">Ein-/Ausgangsdatum</span>
            <input type="date" className="input" value={e.eingdatum || ''} onChange={(event) => setze(index, 'eingdatum', event.target.value)} />
          </label>
          <label className="block">
            <span className="label">Geschäftszeichen</span>
            <input className="input" value={e.eins_gz || ''} onChange={(event) => setze(index, 'eins_gz', event.target.value)} />
          </label>
          <button type="button" className="btn btn-sekundaer" onClick={() => onChange(eintraege.filter((_, i) => i !== index))} aria-label="entfernen">
            ✕
          </button>
        </div>
      ))}
      <div>
        <input className="input" placeholder="Einsender/Empfänger suchen (Kürzel, Name, Ort) …" value={suche} onChange={(event) => setSuche(event.target.value)} />
        {treffer.length > 0 && (
          <ul className="mt-1 divide-y divide-slate-100 rounded-md border border-slate-200 bg-white text-sm">
            {treffer
              .filter((t) => !eintraege.some((e) => e.adr_nr === t.adr_nr))
              .map((t) => (
                <li key={t.adr_nr}>
                  <button
                    type="button"
                    className="w-full px-3 py-1.5 text-left hover:bg-slate-50"
                    onClick={() => {
                      onChange([...eintraege, { ...t, eingdatum: isoDatum(), eins_gz: '' }]);
                      setSuche('');
                    }}
                  >
                    <span className="font-mono text-xs text-slate-500">{t.kuerzel}</span> {adressText(t)} <span className="text-slate-500">{t.ort}</span>
                  </button>
                </li>
              ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export const adressenFuerApi = (eintraege) => eintraege.map(({ adr_nr, eingdatum, eins_gz }) => ({ adr_nr, eingdatum: eingdatum || null, eins_gz: eins_gz || null }));

function AdressEditor({ dokument, onFertig, onAbbrechen }) {
  const [eintraege, setEintraege] = useState(dokument.adressen.map((a) => ({ ...a, eingdatum: a.eingdatum?.slice(0, 10) || '' })));
  const [fehler, setFehler] = useState('');
  const speichern = async () => {
    try {
      await api.put(`/dokumente/${dokument.lfd_doknr}/adressen`, { adressen: adressenFuerApi(eintraege) });
      onFertig();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };
  return (
    <div className="space-y-3">
      <Fehler text={fehler} />
      <AdressListe eintraege={eintraege} onChange={setEintraege} />
      <div className="flex gap-2">
        <button className="btn btn-primaer" onClick={speichern}>
          Speichern
        </button>
        <button className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export function AdressKarte({ dokument, onGeaendert }) {
  const ansicht = dokument.adressen.length ? (
    <table className="w-full text-sm">
      <tbody>
        {dokument.adressen.map((a) => (
          <tr key={a.adr_nr} className="border-b border-slate-100 last:border-0">
            <td className="py-1 pr-3">
              <span className="font-mono text-xs text-slate-500">{a.kuerzel}</span> {adressText(a)}
              <div className="text-xs text-slate-500">{[a.plz, a.ort].filter(Boolean).join(' ')}</div>
            </td>
            <td className="whitespace-nowrap py-1 pr-3 text-slate-600">{datum(a.eingdatum)}</td>
            <td className="py-1 font-mono text-xs">{a.eins_gz || ''}</td>
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <span className="text-sm text-slate-400">–</span>
  );
  return (
    <Bearbeitbar
      titel="Einsender / Empfänger"
      darf={dokument.rechte.bearbeiten}
      ansicht={ansicht}
      formular={(schliessen) => (
        <AdressEditor
          dokument={dokument}
          onAbbrechen={schliessen}
          onFertig={() => {
            schliessen();
            onGeaendert();
          }}
        />
      )}
    />
  );
}

export function AnlagenKarte({ dokument }) {
  if (!dokument.anlagen.length) return null;
  return (
    <Karte titel="Anlagen">
      <ol className="space-y-1 text-sm">
        {dokument.anlagen.map((a) => (
          <li key={a.anlanr}>
            <span className="mr-2 text-slate-400">{a.anlanr}.</span>
            {a.text}
            {a.verweis &&
              (a.verweis_lesbar ? (
                <Link to={`/dokumente/${a.lfd_dokanlnr}`} className="link ml-2 font-mono text-xs">
                  {a.verweis}
                </Link>
              ) : (
                <span className="ml-2 font-mono text-xs text-slate-400">{a.verweis}</span>
              ))}
          </li>
        ))}
      </ol>
    </Karte>
  );
}

function BerechtigteEditor({ dokument, onFertig, onAbbrechen }) {
  const kennungen = useKennungen();
  const [liste, setListe] = useState(dokument.berechtigte);
  const [neu, setNeu] = useState('');
  const [fehler, setFehler] = useState('');
  const speichern = async () => {
    try {
      await api.put(`/dokumente/${dokument.lfd_doknr}/berechtigte`, { berechtigte: liste });
      onFertig();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };
  return (
    <div className="space-y-3">
      <Fehler text={fehler} />
      <div className="flex flex-wrap gap-1">
        {liste.map((k) => (
          <span key={k} className="chip">
            {k}
            <button type="button" onClick={() => setListe(liste.filter((x) => x !== k))} className="text-blue-500 hover:text-blue-900" aria-label={`${k} entfernen`}>
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input list="ber-kennungen" className="input" placeholder="Kennung hinzufügen" value={neu} onChange={(event) => setNeu(event.target.value.toUpperCase())} />
        <Vorschlaege id="ber-kennungen" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
        <button
          className="btn btn-sekundaer"
          onClick={() => {
            if (neu && !liste.includes(neu)) setListe([...liste, neu]);
            setNeu('');
          }}
        >
          Hinzufügen
        </button>
      </div>
      <div className="flex gap-2">
        <button className="btn btn-primaer" onClick={speichern}>
          Speichern
        </button>
        <button className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </div>
  );
}

export function BerechtigteKarte({ dokument, onGeaendert }) {
  if (!dokument.berechtigte) return null;
  return (
    <Bearbeitbar
      titel="Berechtigte Sachbearbeiter (Zugriffsschutz)"
      darf={dokument.rechte.bearbeiten}
      ansicht={dokument.berechtigte.length ? <div className="flex flex-wrap gap-1">{dokument.berechtigte.map((k) => <span key={k} className="chip">{k}</span>)}</div> : <span className="text-sm text-slate-400">–</span>}
      formular={(schliessen) => (
        <BerechtigteEditor
          dokument={dokument}
          onAbbrechen={schliessen}
          onFertig={() => {
            schliessen();
            onGeaendert();
          }}
        />
      )}
    />
  );
}
