// Formular für die Felder der Altanwendung (Wertelisten aus DSV_LOV_*, Kennungen aus DSV_BENUTZERPROFIL)
import React, { useState } from 'react';
import { fehlertext, useKennungen, useLov } from '../api';
import { FELDER } from '../schema';
import { Fehler, Vorschlaege } from './ui';

function Feld({ name, wert, startwert, onChange, lov, optionenFilter }) {
  const def = FELDER[name];
  const eigenschaften = {
    id: `feld-${name}`,
    value: wert ?? '',
    onChange: (event) => onChange(event.target.value),
    required: def.pflicht,
    className: 'input'
  };

  let eingabe;
  if (def.typ === 'textarea') {
    eingabe = <textarea rows={name === 'betreff' ? 2 : 3} {...eigenschaften} />;
  } else if (def.typ === 'lov' || def.typ === 'select' || def.typ === 'jn') {
    const optionen =
      def.typ === 'lov'
        ? lov[def.lov]
            .filter((e) => !optionenFilter || optionenFilter(e.code) || e.code === startwert)
            .filter((e) => def.lov !== 'status' || !(lov.status_system || []).includes(e.code) || e.code === startwert)
            .map((e) => [e.code, def.lov === 'org' ? `${e.code} – ${e.name}` : e.name])
        : def.typ === 'jn'
          ? [['N', 'Nein'], ['J', 'Ja']]
          : Object.entries(def.optionen);
    eingabe = (
      <select {...eigenschaften}>
        {def.typ !== 'jn' && <option value="">–</option>}
        {optionen.map(([code, label]) => (
          <option key={code} value={code}>
            {label}
          </option>
        ))}
      </select>
    );
  } else if (def.typ === 'kennung') {
    eingabe = <input type="text" list="dsv-kennungen" autoComplete="off" {...eigenschaften} onChange={(event) => onChange(event.target.value.toUpperCase())} />;
  } else {
    eingabe = <input type={def.typ === 'date' ? 'date' : 'text'} {...eigenschaften} />;
  }

  return (
    <div className={def.typ === 'textarea' || name === 'dateipfad' ? 'sm:col-span-2' : ''}>
      <label htmlFor={eigenschaften.id} className="label">
        {def.label}
        {def.pflicht && ' *'}
      </label>
      {eingabe}
      {def.hilfe && <p className="mt-1 text-xs text-slate-400">{def.hilfe}</p>}
    </div>
  );
}

// Datumswerte der API (JJJJ-MM-TTThh:mm:ss) für <input type="date"> kürzen
const startwert = (def, wert) => (def.typ === 'date' && wert ? String(wert).slice(0, 10) : wert ?? (def.typ === 'jn' ? 'N' : ''));

// zusatz: (werte) => weitere Eingaben unter den Feldern (z. B. Einsender/Empfänger beim Registrieren)
export default function Formular({ felder, objekt = {}, neu = false, onSpeichern, onAbbrechen, kopf, zusatz, optionenFilter = {} }) {
  const lov = useLov();
  const kennungen = useKennungen();
  const sichtbar = felder.filter((feld) => neu || !FELDER[feld].nurNeu);
  const [werte, setWerte] = useState(() => Object.fromEntries(sichtbar.map((feld) => [feld, startwert(FELDER[feld], objekt[feld])])));
  const [fehler, setFehler] = useState('');
  const [speichert, setSpeichert] = useState(false);

  const absenden = async (event) => {
    event.preventDefault();
    setFehler('');
    setSpeichert(true);
    try {
      await onSpeichern(werte);
    } catch (error) {
      setFehler(fehlertext(error));
      setSpeichert(false);
    }
  };

  return (
    <form onSubmit={absenden} className="space-y-5">
      <Fehler text={fehler} />
      {kopf}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {sichtbar.map((feld) => (
          <Feld key={feld} name={feld} wert={werte[feld]} startwert={objekt[feld]} lov={lov} optionenFilter={optionenFilter[feld]} onChange={(wert) => setWerte((alt) => ({ ...alt, [feld]: wert }))} />
        ))}
      </div>
      {zusatz && zusatz(werte)}
      <Vorschlaege id="dsv-kennungen" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
      <div className="flex gap-2 border-t border-slate-100 pt-4">
        <button type="submit" className="btn btn-primaer" disabled={speichert}>
          {speichert ? 'Speichert …' : neu ? 'Anlegen' : 'Speichern'}
        </button>
        <button type="button" className="btn btn-sekundaer" onClick={onAbbrechen} disabled={speichert}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}
