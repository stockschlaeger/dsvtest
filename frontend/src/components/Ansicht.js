// Lesende Darstellung der Felder eines Schriftgutstücks
import React from 'react';
import { lovText, useLov } from '../api';
import { FELDER } from '../schema';
import { datum } from '../format';

export function wertText(feld, wert, lov) {
  const def = FELDER[feld];
  if (wert === null || wert === undefined || wert === '') return null;
  if (def.typ === 'lov') return def.lov === 'org' ? `${wert} – ${lovText(lov.org, wert)}` : lovText(lov[def.lov], wert);
  if (def.typ === 'jn') return wert === 'J' ? 'Ja' : 'Nein';
  if (def.typ === 'select') return def.optionen[wert] || wert;
  if (def.typ === 'date') return datum(wert);
  return wert;
}

export default function Ansicht({ felder, objekt }) {
  const lov = useLov();
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-4 text-sm sm:grid-cols-2">
      {felder.map((feld) => {
        const text = wertText(feld, objekt[feld], lov);
        return (
          <div key={feld} className={FELDER[feld].typ === 'textarea' || feld === 'dateipfad' ? 'sm:col-span-2' : ''}>
            <dt className="label">{FELDER[feld].label}</dt>
            <dd className={FELDER[feld].typ === 'textarea' ? 'whitespace-pre-line' : 'break-words'}>{text ?? <span className="text-slate-400">–</span>}</dd>
          </div>
        );
      })}
    </dl>
  );
}
