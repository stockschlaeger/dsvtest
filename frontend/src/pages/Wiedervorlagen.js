// Wiedervorlagen (Anforderungen) an mich bzw. die von mir vertretenen Personen, von mir angefordert oder alle lesbaren
import React, { useCallback, useEffect, useState } from 'react';
import api, { fehlertext } from '../api';
import { useIch } from '../ich';
import { datum } from '../format';
import { BereitstellenKnopf, ErledigenKnopf, FaelligkeitsBadge, ObjektLink } from '../components/Wiedervorlagen';
import { Fehler, Laden, Umschalter } from '../components/ui';

const TYP = { A: 'Akte', V: 'Vorgang', D: 'Dokument' };

export default function Wiedervorlagen() {
  const ich = useIch();
  const [ansicht, setAnsicht] = useState('meine');
  const [liste, setListe] = useState(null);
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api
      .get('/wiedervorlagen', { params: { ansicht } })
      .then(({ data }) => setListe(data))
      .catch((error) => setFehler(fehlertext(error)));
  }, [ansicht]);

  useEffect(() => {
    laden();
  }, [laden]);

  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Wiedervorlagen</h1>
      <div className="mb-4">
        <Umschalter optionen={[['meine', 'An mich (inkl. Vertretung)'], ['erstellt', 'Von mir angefordert'], ['alle', 'Alle lesbaren']]} wert={ansicht} onChange={setAnsicht} />
      </div>
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      {!liste ? (
        <Laden />
      ) : liste.length === 0 ? (
        <div className="karte text-center text-sm text-slate-500">Keine Wiedervorlagen.</div>
      ) : (
        <div className="karte overflow-x-auto p-0">
          <table className="tabelle">
            <thead>
              <tr>
                <th>Wiedervorlage</th>
                <th>Schriftgut</th>
                <th>An</th>
                <th>Bemerkung</th>
                <th>Angefordert</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {liste.map((w) => (
                <tr key={w.schluessel} className={w.faellig ? 'bg-red-50/40' : ''}>
                  <td className="whitespace-nowrap">
                    <div className="font-medium">{datum(w.wv_datum)}</div>
                    <FaelligkeitsBadge wiedervorlage={w} />
                    {w.feste_wv === 'J' && <span className="ml-1 text-xs text-slate-500">fest</span>}
                  </td>
                  <td>
                    <div className="text-xs text-slate-500">{TYP[w.umfang]}</div>
                    <ObjektLink wiedervorlage={w} />
                  </td>
                  <td>{w.bearbeiter}</td>
                  <td className="max-w-xs whitespace-pre-line">{w.bemerkung || '–'}</td>
                  <td className="whitespace-nowrap text-xs text-slate-500">
                    {w.registrator}
                    <div>{datum(w.anf_datum)}</div>
                  </td>
                  <td>
                    {/* Rechte am Schriftgut prüft das Backend (Schreibrecht laut GVP) */}
                    <div className="flex gap-2">
                      {ich.kannSchreiben && <ErledigenKnopf wiedervorlage={w} onFertig={laden} onFehler={setFehler} />}
                      {ich.registratur && <BereitstellenKnopf wiedervorlage={w} onFertig={laden} onFehler={setFehler} />}
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
