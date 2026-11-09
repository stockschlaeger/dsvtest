// Aktenplan (DSV_HG/DSV_LAP) als Baum, der ebenenweise nachgeladen wird; Zahl = lesbare Akten darunter
import React, { useEffect, useState } from 'react';
import api from '../api';

export const knotenSchluessel = (k) => [k.hgruppe, k.gruppe, k.ugruppe, k.tglieder].map((t) => t ?? '').join('|');

function Knoten({ knoten, tiefe, ausgewaehlt, onAuswahl }) {
  const [offen, setOffen] = useState(false);
  const [kinder, setKinder] = useState(null);
  const schluessel = knotenSchluessel(knoten);

  const umschalten = async () => {
    if (!offen && !kinder) {
      const { data } = await api.get('/aktenplan', { params: { hgruppe: knoten.hgruppe, gruppe: knoten.gruppe ?? undefined, ugruppe: knoten.ugruppe ?? undefined } });
      setKinder(data);
    }
    setOffen(!offen);
  };

  return (
    <li>
      <div className={`flex items-baseline gap-1 rounded text-sm ${ausgewaehlt === schluessel ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200' : 'hover:bg-slate-100'}`} style={{ paddingLeft: `${tiefe * 0.9}rem` }}>
        <button type="button" className="w-4 shrink-0 text-slate-400" onClick={umschalten} disabled={!knoten.hat_kinder} aria-label={offen ? 'zuklappen' : 'aufklappen'}>
          {knoten.hat_kinder ? (offen ? '▾' : '▸') : ''}
        </button>
        <button type="button" className="flex flex-1 items-baseline gap-2 py-1 pr-2 text-left" onClick={() => onAuswahl(knoten)}>
          <span className="font-mono text-xs">{knoten.kennzeichen}</span>
          <span className="flex-1">{knoten.betreff}</span>
          {knoten.anzahl_akten > 0 && <span className="text-xs tabular-nums text-slate-400">{knoten.anzahl_akten}</span>}
        </button>
      </div>
      {offen && kinder && (
        <ul>
          {kinder.map((kind) => (
            <Knoten key={knotenSchluessel(kind)} knoten={kind} tiefe={tiefe + 1} ausgewaehlt={ausgewaehlt} onAuswahl={onAuswahl} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default function AktenplanBaum({ ausgewaehlt, onAuswahl }) {
  const [wurzel, setWurzel] = useState(null);
  useEffect(() => {
    api.get('/aktenplan').then(({ data }) => setWurzel(data)).catch(() => setWurzel([]));
  }, []);
  if (!wurzel) return <p className="text-sm text-slate-400">Wird geladen …</p>;
  return (
    <ul className="space-y-0.5">
      <li>
        <button
          type="button"
          onClick={() => onAuswahl(null)}
          className={`w-full rounded px-2 py-1 text-left text-sm ${!ausgewaehlt ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200' : 'hover:bg-slate-100'}`}
        >
          Alle lesbaren Akten
        </button>
      </li>
      {wurzel.map((knoten) => (
        <Knoten key={knotenSchluessel(knoten)} knoten={knoten} tiefe={0} ausgewaehlt={ausgewaehlt} onAuswahl={onAuswahl} />
      ))}
    </ul>
  );
}
