// Stichwortbestand (DSV_STICHWORTE) mit Synonymen (DSV_STWSYNO)
import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { fehlertext } from '../api';
import { useIch } from '../ich';
import { Fehler, Laden } from '../components/ui';

function SynonymEingabe({ onHinzufuegen }) {
  const [wort, setWort] = useState('');
  return (
    <form
      className="inline-flex"
      onSubmit={(event) => {
        event.preventDefault();
        if (wort.trim()) onHinzufuegen(wort.trim()).then(() => setWort(''));
      }}
    >
      <input className="input w-36 py-0.5 text-xs uppercase" placeholder="+ Synonym" value={wort} onChange={(event) => setWort(event.target.value)} />
    </form>
  );
}

export default function Stichworte() {
  const ich = useIch();
  // Synonyme pflegt die Stammdatenverwaltung (Handbuch)
  const darf = ich.stammdaten;
  const [q, setQ] = useState('');
  const [liste, setListe] = useState(null);
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api.get('/stichworte', { params: { q, limit: 200 } }).then(({ data }) => setListe(data)).catch((error) => setFehler(fehlertext(error)));
  }, [q]);

  useEffect(() => {
    const zeitgeber = setTimeout(laden, 200);
    return () => clearTimeout(zeitgeber);
  }, [laden]);

  const ausfuehren = async (anfrage) => {
    setFehler('');
    try {
      await anfrage();
      laden();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };

  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Stichworte</h1>
      <p className="mb-4 text-sm text-slate-500">Synonyme werden bei der Recherche mitgesucht. Angezeigt werden bis zu 200 Stichworte mit dem eingegebenen Anfang.</p>
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      <input className="input mb-4 max-w-xs uppercase" placeholder="Anfang des Stichworts …" value={q} onChange={(event) => setQ(event.target.value)} />
      {!liste ? (
        <Laden />
      ) : (
        <div className="karte overflow-x-auto p-0">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Stichwort</th>
                <th className="text-right">Verwendet</th>
                <th>Synonyme</th>
              </tr>
            </thead>
            <tbody>
              {liste.map((s) => (
                <tr key={s.stwnr}>
                  <td>
                    <Link to={`/recherche?stichwort=${encodeURIComponent(s.stichwort)}&ebene=dokument`} className="link">
                      {s.stichwort}
                    </Link>
                  </td>
                  <td className="text-right tabular-nums">{s.anzahl}</td>
                  <td>
                    <div className="flex flex-wrap items-center gap-1">
                      {s.synonyme.map((y) => (
                        <span key={y.stwnr} className="chip">
                          {y.stichwort}
                          {darf && (
                            <button className="text-blue-500 hover:text-blue-900" aria-label={`Synonym ${y.stichwort} entfernen`} onClick={() => ausfuehren(() => api.delete(`/stichworte/${s.stwnr}/synonyme/${y.stwnr}`))}>
                              ×
                            </button>
                          )}
                        </span>
                      ))}
                      {darf && <SynonymEingabe onHinzufuegen={(wort) => ausfuehren(() => api.post(`/stichworte/${s.stwnr}/synonyme`, { wort }))} />}
                      {!darf && !s.synonyme.length && <span className="text-slate-400">–</span>}
                    </div>
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
