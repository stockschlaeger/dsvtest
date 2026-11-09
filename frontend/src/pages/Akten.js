// Einstieg über den Aktenplan: Position wählen, Akten der lesbaren Referate sehen, neue Akte anlegen
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { fehlertext, lovText, useLov } from '../api';
import { schreibReferate, useIch } from '../ich';
import { datum, zeitpunkt } from '../format';
import AktenplanBaum, { knotenSchluessel } from '../components/AktenplanBaum';
import Formular from '../components/Formular';
import { Fehler, Karte, Laden, StatusBadge } from '../components/ui';

export default function Akten() {
  const ich = useIch();
  const lov = useLov();
  const navigate = useNavigate();
  const [knoten, setKnoten] = useState(null);
  const [akten, setAkten] = useState(null);
  const [org, setOrg] = useState('');
  const [status, setStatus] = useState('');
  const [filter, setFilter] = useState('');
  const [neu, setNeu] = useState(false);
  const [fehler, setFehler] = useState('');

  const lesbareReferate = [...new Set(ich.zustaendigkeiten.map((z) => z.org))].sort();
  const schreibbar = schreibReferate(ich);

  useEffect(() => {
    setAkten(null);
    const zeitgeber = setTimeout(() => {
      api
        .get('/akten', {
          params: {
            hgruppe: knoten?.hgruppe || undefined,
            gruppe: knoten?.gruppe || undefined,
            ugruppe: knoten?.ugruppe || undefined,
            tglieder: knoten?.tglieder || undefined,
            org: org || undefined,
            status: status || undefined,
            q: filter.trim() || undefined
          }
        })
        .then(({ data }) => setAkten(data))
        .catch((error) => setFehler(fehlertext(error)));
    }, 150);
    return () => clearTimeout(zeitgeber);
  }, [knoten, org, status, filter]);

  const anlegen = async (werte) => {
    const { data } = await api.post('/akten', { ...werte, lfd_apnr: knoten.lfd_apnr });
    navigate(`/akten/${data.lfd_aktenr}`);
  };

  // Eine Akte entsteht je Referat auf einer Aktenplanposition (DSV_LAP); registrieren darf nur die Registratur
  const kannAnlegen = ich.registratur && knoten?.lfd_apnr && schreibbar.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
      <Karte titel="Aktenplan" className="self-start">
        <AktenplanBaum
          ausgewaehlt={knoten && knotenSchluessel(knoten)}
          onAuswahl={(k) => {
            setNeu(false);
            setKnoten(k);
          }}
        />
      </Karte>

      <div>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
          <div>
            {knoten ? (
              <>
                <div className="text-sm text-slate-500">
                  Aktenplan <span className="font-mono text-slate-700">{knoten.kennzeichen}</span>
                  {knoten.aufbfrist != null && <span className="ml-3 text-xs">Aufbewahrung {knoten.aufbfrist} Jahre</span>}
                </div>
                <h1 className="text-2xl font-semibold">{knoten.betreff}</h1>
                {knoten.hinweis && <p className="mt-1 text-sm text-slate-600">{knoten.hinweis}</p>}
              </>
            ) : (
              <h1 className="text-2xl font-semibold">Alle lesbaren Akten</h1>
            )}
          </div>
          {kannAnlegen && !neu && (
            <button className="btn btn-primaer" onClick={() => setNeu(true)}>
              + Neue Akte
            </button>
          )}
        </div>

        <Fehler text={fehler} onSchliessen={() => setFehler('')} />

        {neu && (
          <Karte titel={`Neue Akte auf ${knoten.kennzeichen} ${knoten.betreff}`} className="mb-6">
            <p className="mb-4 text-sm text-slate-500">
              Aktenzeichen: &lt;Referat&gt;-{knoten.kennzeichen}. Je Referat gibt es auf einer Aktenplanposition genau eine Akte. Ohne Betreff wird der Betreff der Aktenplanposition übernommen.
            </p>
            <Formular
              felder={['org', 'betreff', 'bemerkung', 'status', 'bearbeiter']}
              objekt={{ org: schreibbar.includes(ich.vorbelegung?.org) ? ich.vorbelegung.org : schreibbar[0], status: lov.status_neu }}
              neu
              optionenFilter={{ org: (code) => schreibbar.includes(code) }}
              onSpeichern={anlegen}
              onAbbrechen={() => setNeu(false)}
            />
          </Karte>
        )}

        <div className="mb-4 flex flex-wrap items-center gap-3">
          {lesbareReferate.length > 1 && (
            <select className="input max-w-[16rem]" value={org} onChange={(event) => setOrg(event.target.value)}>
              <option value="">Alle Referate</option>
              {lesbareReferate.map((code) => (
                <option key={code} value={code}>
                  {code} – {lovText(lov.org, code)}
                </option>
              ))}
            </select>
          )}
          <select className="input max-w-[12rem]" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">Jeder Status</option>
            {lov.status.map((s) => (
              <option key={s.code} value={s.code}>
                {s.name}
              </option>
            ))}
          </select>
          <input className="input max-w-xs" placeholder="Aktenzeichen oder Betreff …" value={filter} onChange={(event) => setFilter(event.target.value)} />
        </div>

        {!akten ? (
          <Laden />
        ) : akten.length === 0 ? (
          <div className="karte text-center text-sm text-slate-500">Keine lesbaren Akten.</div>
        ) : (
          <div className="karte overflow-x-auto p-0">
            <table className="tabelle">
              <thead>
                <tr>
                  <th>Aktenzeichen</th>
                  <th>Betreff</th>
                  <th>Bearbeiter</th>
                  <th className="text-right">Vorgänge</th>
                  <th>Status</th>
                  <th>Registriert</th>
                  <th>Geändert</th>
                </tr>
              </thead>
              <tbody>
                {akten.map((akte) => (
                  <tr key={akte.lfd_aktenr} className="cursor-pointer" onClick={() => navigate(`/akten/${akte.lfd_aktenr}`)}>
                    <td className="az whitespace-nowrap">{akte.aktenzeichen}</td>
                    <td>
                      <Link to={`/akten/${akte.lfd_aktenr}`} className="link" onClick={(event) => event.stopPropagation()}>
                        {akte.betreff || '(ohne Betreff)'}
                      </Link>
                      <div className="text-xs text-slate-400">{akte.org_name}</div>
                    </td>
                    <td>{akte.bearbeiter || '–'}</td>
                    <td className="text-right tabular-nums">{akte.anzahl_vorgaenge}</td>
                    <td>
                      <StatusBadge status={akte.status} name={lovText(lov.status, akte.status)} />
                    </td>
                    <td className="whitespace-nowrap text-slate-500">{datum(akte.erst_regdatum)}</td>
                    <td className="whitespace-nowrap text-slate-500">{akte.aend_regdatum ? zeitpunkt(akte.aend_regdatum) : '–'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {akten.length === 500 && <p className="px-3 py-2 text-xs text-slate-500">Es werden die ersten 500 Akten angezeigt. Bitte eingrenzen.</p>}
          </div>
        )}
      </div>
    </div>
  );
}
