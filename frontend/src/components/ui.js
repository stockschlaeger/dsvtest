// Kleine, wiederverwendbare Anzeige-Bausteine
import React from 'react';
import { Link } from 'react-router-dom';

// Status der Altanwendung (Code + Name aus DSV_LOV_STATUS); zdA/Altreg. grau, sonst grün
export function StatusBadge({ status, name }) {
  if (!status) return null;
  const abgelegt = ['zdA', 'Altreg.', 'g'].includes(status);
  return (
    <span
      title={name || status}
      className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ${
        abgelegt ? 'bg-slate-100 text-slate-600 ring-slate-200' : 'bg-emerald-50 text-emerald-700 ring-emerald-200'
      }`}
    >
      {name || status}
    </span>
  );
}

export function Fehler({ text, onSchliessen }) {
  if (!text) return null;
  return (
    <div className="mb-4 flex items-start justify-between gap-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <span>{text}</span>
      {onSchliessen && (
        <button onClick={onSchliessen} className="text-red-600 hover:text-red-800" aria-label="Schließen">
          ✕
        </button>
      )}
    </div>
  );
}

export function Stichworte({ worte, verlinkt = false }) {
  if (!worte?.length) return <span className="text-slate-400">–</span>;
  return (
    <div className="flex flex-wrap gap-1">
      {worte.map((wort) =>
        verlinkt ? (
          <Link key={wort} to={`/recherche?stichwort=${encodeURIComponent(wort)}&ebene=dokument`} className="chip hover:bg-blue-100">
            {wort}
          </Link>
        ) : (
          <span key={wort} className="chip">
            {wort}
          </span>
        )
      )}
    </div>
  );
}

// Pfad Aktenplan › Akte › Vorgang
export function Brotkrumen({ teile }) {
  return (
    <nav className="mb-3 flex flex-wrap items-center gap-1 text-sm text-slate-500">
      {teile.map((teil, index) => (
        <React.Fragment key={teil.to}>
          {index > 0 && <span>›</span>}
          <Link to={teil.to} className="hover:text-blue-700 hover:underline">
            {teil.kennung && <span className="font-mono">{teil.kennung}</span>} {teil.text}
          </Link>
        </React.Fragment>
      ))}
    </nav>
  );
}

export function Laden() {
  return <p className="py-8 text-center text-sm text-slate-500">Wird geladen …</p>;
}

// Segmentierte Auswahl, optionen: [[wert, label], …]
export function Umschalter({ optionen, wert, onChange }) {
  return (
    <div className="inline-flex flex-wrap rounded-md border border-slate-300 bg-white p-0.5 text-sm">
      {optionen.map(([option, label]) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          className={`rounded px-3 py-1 ${wert === option ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

// Vorschlagsliste für <input list="…">
export function Vorschlaege({ id, werte }) {
  return (
    <datalist id={id}>
      {werte.map((wert) => (
        <option key={wert.wert ?? wert} value={wert.wert ?? wert}>
          {wert.label}
        </option>
      ))}
    </datalist>
  );
}

export function Karte({ titel, aktion, children, className = '' }) {
  return (
    <section className={`karte ${className}`}>
      {(titel || aktion) && (
        <div className="mb-4 flex items-center justify-between gap-4">
          <h2 className="karte-titel mb-0">{titel}</h2>
          {aktion}
        </div>
      )}
      {children}
    </section>
  );
}

// Mehrfachauswahl als Chips; optionen: [{ wert, label }]
export function MehrfachAuswahl({ optionen, werte, onChange, platzhalter }) {
  const offen = optionen.filter((option) => !werte.includes(option.wert));
  const label = (wert) => optionen.find((option) => option.wert === wert)?.label || wert;
  return (
    <div className="input flex min-h-[2.125rem] flex-wrap items-center gap-1 py-1">
      {werte.map((wert) => (
        <span key={wert} className="chip">
          {label(wert)}
          <button type="button" onClick={() => onChange(werte.filter((w) => w !== wert))} aria-label={`${wert} entfernen`} className="text-blue-500 hover:text-blue-900">
            ×
          </button>
        </span>
      ))}
      {offen.length > 0 && (
        <select
          className="min-w-[8rem] flex-1 border-0 bg-transparent p-0 text-sm text-slate-500 focus:outline-none focus:ring-0"
          value=""
          onChange={(event) => event.target.value && onChange([...werte, event.target.value])}
        >
          <option value="">{werte.length ? '+ weitere …' : platzhalter}</option>
          {offen.map((option) => (
            <option key={option.wert} value={option.wert}>
              {option.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
