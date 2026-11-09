// Adressen (DSV_ADRESSEN): öffentliche und an lesbaren Dokumenten hängende Adressen
// Rechte (Handbuch): Stammdatenverwaltung pflegt alle, Registratur nur nicht öffentliche Adressen (ohne Kürzel)
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fehlertext } from '../api';
import { useIch } from '../ich';
import { datum } from '../format';
import { Fehler, Karte, Laden } from '../components/ui';

const FELDER = [
  ['kuerzel', 'Kürzel'],
  ['anrede', 'Anrede'],
  ['bezeichnung_1', 'Bezeichnung 1 *'],
  ['bezeichnung_2', 'Bezeichnung 2'],
  ['bezeichnung_3', 'Bezeichnung 3'],
  ['strasse', 'Straße'],
  ['hausnummer', 'Hausnummer'],
  ['plz', 'PLZ'],
  ['ort', 'Ort'],
  ['land', 'Land'],
  ['telnr', 'Telefon']
];

function AdressFormular({ adresse, nurPrivat, onGespeichert, onAbbrechen }) {
  const [werte, setWerte] = useState(() => ({ ...Object.fromEntries(FELDER.map(([feld]) => [feld, adresse?.[feld] ?? ''])), oeffentlich: adresse?.oeffentlich ?? (nurPrivat ? 'N' : 'J'), obsolet: adresse?.obsolet ?? 'N' }));
  const [fehler, setFehler] = useState('');
  const speichern = async (event) => {
    event.preventDefault();
    try {
      if (adresse) await api.put(`/adressen/${adresse.adr_nr}`, werte);
      else await api.post('/adressen', werte);
      onGespeichert();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };
  return (
    <form onSubmit={speichern} className="space-y-4">
      <Fehler text={fehler} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {FELDER.filter(([feld]) => !(nurPrivat && feld === 'kuerzel')).map(([feld, label]) => (
          <label key={feld} className="block">
            <span className="label">{label}</span>
            <input className="input" required={feld === 'bezeichnung_1'} value={werte[feld]} onChange={(event) => setWerte({ ...werte, [feld]: event.target.value })} />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-6 text-sm">
        <label className={`flex items-center gap-2 ${nurPrivat ? 'text-slate-400' : ''}`}>
          <input type="checkbox" disabled={nurPrivat} checked={werte.oeffentlich === 'J'} onChange={(event) => setWerte({ ...werte, oeffentlich: event.target.checked ? 'J' : 'N' })} />
          Öffentlich (für alle sichtbar; sonst nur über ihre Dokumente)
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={werte.obsolet === 'J'} onChange={(event) => setWerte({ ...werte, obsolet: event.target.checked ? 'J' : 'N' })} />
          Obsolet
        </label>
      </div>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primaer">
          Speichern
        </button>
        <button type="button" className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default function Adressen() {
  const ich = useIch();
  const darf = ich.stammdaten || ich.registratur;
  const nurPrivat = !ich.stammdaten;
  const darfAdresse = (a) => ich.stammdaten || (ich.registratur && a.oeffentlich !== 'J');
  const [liste, setListe] = useState(null);
  const [q, setQ] = useState('');
  const [obsolete, setObsolete] = useState(false);
  const [bearbeitet, setBearbeitet] = useState(null);
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api
      .get('/adressen', { params: { q: q.trim() || undefined, obsolete } })
      .then(({ data }) => setListe(data))
      .catch((error) => setFehler(fehlertext(error)));
  }, [q, obsolete]);

  useEffect(() => {
    const zeitgeber = setTimeout(laden, 200);
    return () => clearTimeout(zeitgeber);
  }, [laden]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Adressen</h1>
        {darf && !bearbeitet && (
          <button className="btn btn-primaer" onClick={() => setBearbeitet('neu')}>
            + Neue Adresse
          </button>
        )}
      </div>
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      {bearbeitet && (
        <Karte titel={bearbeitet === 'neu' ? 'Neue Adresse' : `Adresse bearbeiten: ${bearbeitet.bezeichnung_1}`} className="mb-6">
          <AdressFormular
            key={bearbeitet === 'neu' ? 'neu' : bearbeitet.adr_nr}
            adresse={bearbeitet === 'neu' ? null : bearbeitet}
            nurPrivat={nurPrivat}
            onAbbrechen={() => setBearbeitet(null)}
            onGespeichert={() => {
              setBearbeitet(null);
              laden();
            }}
          />
        </Karte>
      )}
      <div className="mb-4 flex flex-wrap items-center gap-4">
        <input className="input max-w-sm" placeholder="Kürzel, Name, Ort, PLZ …" value={q} onChange={(event) => setQ(event.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={obsolete} onChange={(event) => setObsolete(event.target.checked)} /> auch obsolete
        </label>
      </div>
      {!liste ? (
        <Laden />
      ) : (
        <div className="karte overflow-x-auto p-0">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Kürzel</th>
                <th>Bezeichnung</th>
                <th>Anschrift</th>
                <th>Öffentlich</th>
                <th>Gültig ab</th>
                <th className="text-right">Dokumente</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((a) => (
                <tr key={a.adr_nr} className={a.obsolet === 'J' ? 'text-slate-400' : ''}>
                  <td className="font-mono text-xs">{a.kuerzel || '–'}</td>
                  <td>
                    {[a.anrede, a.bezeichnung_1, a.bezeichnung_2, a.bezeichnung_3].filter(Boolean).join(' ')}
                    {a.obsolet === 'J' && <span className="ml-2 text-xs">(obsolet)</span>}
                  </td>
                  <td className="text-slate-600">{[[a.strasse, a.hausnummer].filter(Boolean).join(' '), [a.plz, a.ort].filter(Boolean).join(' ')].filter(Boolean).join(', ') || '–'}</td>
                  <td>{a.oeffentlich === 'J' ? 'ja' : 'nein'}</td>
                  <td className="whitespace-nowrap">{datum(a.gueltig_ab)}</td>
                  <td className="text-right tabular-nums">
                    {a.anzahl_dokumente > 0 ? (
                      <Link to={`/recherche?adresse=${encodeURIComponent(a.kuerzel || a.bezeichnung_1)}&ebene=dokument`} className="link">
                        {a.anzahl_dokumente}
                      </Link>
                    ) : (
                      0
                    )}
                  </td>
                  <td className="text-right">
                    {darfAdresse(a) && (
                      <button className="btn btn-sekundaer" onClick={() => setBearbeitet(a)}>
                        Bearbeiten
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
