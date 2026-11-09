// Änderungsprotokoll der neuen Anwendung (dsv_app.protokoll)
import React, { useEffect, useState } from 'react';
import api from '../api';
import { feldLabel } from '../schema';
import { datum, zeitpunkt } from '../format';

const AKTIONEN = {
  angelegt: 'angelegt',
  geaendert: 'geändert',
  wiedervorlage: 'Wiedervorlage angelegt',
  wiedervorlage_geaendert: 'Wiedervorlage geändert',
  wiedervorlage_erledigt: 'Wiedervorlage erledigt',
  gvp_hinzugefuegt: 'Zuständigkeit hinzugefügt',
  gvp_entfernt: 'Zuständigkeit entfernt',
  vertretung_hinzugefuegt: 'Vertretung hinzugefügt',
  vertretung_entfernt: 'Vertretung entfernt'
};

function wert(inhalt) {
  if (inhalt === null || inhalt === undefined || inhalt === '') return '–';
  if (Array.isArray(inhalt)) return inhalt.join(', ') || '–';
  if (typeof inhalt === 'object') return JSON.stringify(inhalt);
  if (/^\d{4}-\d{2}-\d{2}T00:00:00$/.test(inhalt)) return datum(inhalt);
  return String(inhalt);
}

function Details({ eintrag }) {
  const { aktion, details } = eintrag;
  if (!details) return null;
  if (aktion === 'geaendert') {
    return (
      <ul className="mt-1 space-y-0.5 break-all text-xs text-slate-600">
        {Object.entries(details).map(([feld, [alt, neu]]) => (
          <li key={feld}>
            <span className="text-slate-500">{feldLabel(feld)}:</span> <span className="line-through">{wert(alt)}</span> → {wert(neu)}
          </li>
        ))}
      </ul>
    );
  }
  if (aktion.startsWith('wiedervorlage')) {
    return <div className="mt-1 text-xs text-slate-600">{[details.wv_datum && datum(details.wv_datum), details.bearbeiter && `an ${details.bearbeiter}`, details.bemerkung].filter(Boolean).join(' · ')}</div>;
  }
  return null;
}

export default function Protokoll({ typ, id, version }) {
  const [eintraege, setEintraege] = useState(null);
  useEffect(() => {
    api.get(`/protokoll/${typ}/${id}`).then(({ data }) => setEintraege(data)).catch(() => setEintraege([]));
  }, [typ, id, version]);
  if (!eintraege) return null;
  if (!eintraege.length) return <p className="text-sm text-slate-400">Noch keine Änderungen über die neue Anwendung.</p>;
  return (
    <ol className="space-y-3 text-sm">
      {eintraege.map((eintrag) => (
        <li key={eintrag.id} className="border-l-2 border-slate-200 pl-3">
          <div>
            <span className="font-medium">{AKTIONEN[eintrag.aktion] || eintrag.aktion}</span>{' '}
            <span className="text-slate-500">
              von {eintrag.login}
              {eintrag.user_id && eintrag.user_id.toLowerCase() !== eintrag.login ? ` (${eintrag.user_id})` : ''}
            </span>
          </div>
          <div className="text-xs text-slate-400">{zeitpunkt(eintrag.zeitpunkt)}</div>
          <Details eintrag={eintrag} />
        </li>
      ))}
    </ol>
  );
}
