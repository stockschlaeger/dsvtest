// Wiedervorlagen (DSV_ANFORDERUNGEN): Karte am Schriftgut, Formular, Erledigen, Bereitstellen (Registratur)
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fehlertext, useKennungen, wiedervorlagenGeaendert } from '../api';
import { useIch } from '../ich';
import { objektPfad } from '../schema';
import { datum, isoDatum } from '../format';
import { Fehler, Karte, Vorschlaege } from './ui';

const pfadVon = (w) => `/wiedervorlagen/${w.lfd_schrnr}/${encodeURIComponent(w.wv_datum)}`;

export function WiedervorlageFormular({ umfang, id, onFertig, onAbbrechen }) {
  const ich = useIch();
  const kennungen = useKennungen();
  const [werte, setWerte] = useState({ wv_datum: isoDatum(7), bearbeiter: ich.handelnAls || ich.userId, bemerkung: '', feste_wv: 'N' });
  const [fehler, setFehler] = useState('');
  const setze = (feld) => (event) => setWerte({ ...werte, [feld]: feld === 'bearbeiter' ? event.target.value.toUpperCase() : event.target.value });

  const speichern = async (event) => {
    event.preventDefault();
    try {
      await api.post('/wiedervorlagen', { ...werte, umfang, id });
      wiedervorlagenGeaendert();
      onFertig();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };

  return (
    <form onSubmit={speichern} className="mb-4 space-y-3 rounded-md border border-blue-100 bg-blue-50/40 p-3">
      <Fehler text={fehler} />
      <label className="block">
        <span className="label">Wiedervorlage am *</span>
        <input type="date" required className="input" value={werte.wv_datum} onChange={setze('wv_datum')} />
      </label>
      <label className="block">
        <span className="label">An (Kennung) *</span>
        <input required list="wv-kennungen" autoComplete="off" className="input" value={werte.bearbeiter} onChange={setze('bearbeiter')} />
        <Vorschlaege id="wv-kennungen" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
      </label>
      <label className="block">
        <span className="label">Bemerkung</span>
        <textarea rows={2} className="input" value={werte.bemerkung} onChange={setze('bemerkung')} />
      </label>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={werte.feste_wv === 'J'} onChange={(event) => setWerte({ ...werte, feste_wv: event.target.checked ? 'J' : 'N' })} />
        Feste Wiedervorlage
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primaer">
          Anlegen
        </button>
        <button type="button" className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export function FaelligkeitsBadge({ wiedervorlage }) {
  const heute = isoDatum();
  const tag = wiedervorlage.wv_datum.slice(0, 10);
  if (tag < heute) return <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">überfällig</span>;
  if (tag === heute) return <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-amber-800 ring-1 ring-amber-200">heute</span>;
  return null;
}

export function ErledigenKnopf({ wiedervorlage, onFertig, onFehler }) {
  const erledigen = async () => {
    if (!window.confirm('Wiedervorlage als erledigt austragen?')) return;
    try {
      await api.delete(pfadVon(wiedervorlage));
      wiedervorlagenGeaendert();
      onFertig();
    } catch (error) {
      onFehler(fehlertext(error));
    }
  };
  return (
    <button className="btn btn-sekundaer" onClick={erledigen}>
      Erledigt ✓
    </button>
  );
}

// Bereitstellen (Registratur): Schriftgut an den Empfänger in den Geschäftsgang geben, Anforderung erledigt
export function BereitstellenKnopf({ wiedervorlage, onFertig, onFehler }) {
  const bereitstellen = async () => {
    if (!window.confirm(`${wiedervorlage.aktenzeichen} an ${wiedervorlage.bearbeiter} bereitstellen (Geschäftsgang)?`)) return;
    try {
      await api.post(`${pfadVon(wiedervorlage)}/bereitstellen`);
      wiedervorlagenGeaendert();
      onFertig();
    } catch (error) {
      onFehler(fehlertext(error));
    }
  };
  return (
    <button className="btn btn-sekundaer" onClick={bereitstellen} title="Ausleihe an den Empfänger (Status Geschäftsgang)">
      Bereitstellen
    </button>
  );
}

export const ObjektLink = ({ wiedervorlage }) => (
  <Link to={objektPfad(wiedervorlage.typ, wiedervorlage.lfd_schrnr)} className="link">
    <span className="az mr-1">{wiedervorlage.aktenzeichen}</span> {wiedervorlage.betreff}
  </Link>
);

export function WiedervorlagenKarte({ umfang, id, darf, registratur, onGeaendert }) {
  const [liste, setListe] = useState([]);
  const [neu, setNeu] = useState(false);
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api
      .get('/wiedervorlagen', { params: { ansicht: 'alle', umfang, id } })
      .then(({ data }) => setListe(data))
      .catch((error) => setFehler(fehlertext(error)));
  }, [umfang, id]);

  useEffect(() => {
    laden();
  }, [laden]);

  return (
    <Karte
      titel="Wiedervorlagen"
      aktion={
        darf &&
        !neu && (
          <button className="btn btn-sekundaer" onClick={() => setNeu(true)}>
            + Wiedervorlage
          </button>
        )
      }
    >
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      {neu && (
        <WiedervorlageFormular
          umfang={umfang}
          id={id}
          onAbbrechen={() => setNeu(false)}
          onFertig={() => {
            setNeu(false);
            laden();
          }}
        />
      )}
      {liste.length === 0 ? (
        <p className="text-sm text-slate-400">Keine Wiedervorlagen.</p>
      ) : (
        <ul className="space-y-3 text-sm">
          {liste.map((w) => (
            <li key={w.schluessel} className="border-l-2 border-blue-300 pl-3">
              <div className="flex items-center gap-2">
                <span className="font-medium">{datum(w.wv_datum)}</span>
                <FaelligkeitsBadge wiedervorlage={w} />
                {w.feste_wv === 'J' && <span className="text-xs text-slate-500">fest</span>}
              </div>
              <div className="text-xs text-slate-500">an {w.bearbeiter} · angefordert von {w.registrator}</div>
              {w.bemerkung && <div className="mt-1 whitespace-pre-line">{w.bemerkung}</div>}
              {darf && (
                <div className="mt-2 flex gap-2">
                  <ErledigenKnopf wiedervorlage={w} onFertig={laden} onFehler={setFehler} />
                  {registratur && (
                    <BereitstellenKnopf
                      wiedervorlage={w}
                      onFehler={setFehler}
                      onFertig={() => {
                        laden();
                        onGeaendert?.();
                      }}
                    />
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </Karte>
  );
}
