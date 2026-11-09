// Eigenes Passwort ändern (lokale Anmeldung); ein Startpasswort muss vor allem anderen geändert werden
import React, { useState } from 'react';
import api, { fehlertext } from '../api';
import { abmelden } from '../anmeldung';
import { useIch } from '../ich';
import { Fehler, Karte } from '../components/ui';

const LEER = { alt: '', neu: '', wiederholung: '' };

function Formular({ passwortMin, pflicht, onGeaendert }) {
  const [werte, setWerte] = useState(LEER);
  const [fehler, setFehler] = useState('');
  const [geaendert, setGeaendert] = useState(false);
  const setze = (feld) => (event) => setWerte({ ...werte, [feld]: event.target.value });

  const absenden = async (event) => {
    event.preventDefault();
    setFehler('');
    setGeaendert(false);
    if (werte.neu !== werte.wiederholung) return setFehler('Die Wiederholung stimmt nicht mit dem neuen Passwort überein');
    try {
      await api.put('/ich/passwort', { alt: werte.alt, neu: werte.neu });
      setWerte(LEER);
      setGeaendert(true);
      onGeaendert?.();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };

  return (
    <form onSubmit={absenden} className="space-y-4">
      <Fehler text={fehler} />
      {geaendert && <p className="rounded-md bg-green-50 px-4 py-3 text-sm text-green-800">Passwort geändert. Andere Sitzungen wurden beendet.</p>}
      <label className="block">
        <span className="label">{pflicht ? 'Startpasswort' : 'Bisheriges Passwort'}</span>
        <input id="pw-alt" type="password" className="input" autoComplete="current-password" required value={werte.alt} onChange={setze('alt')} />
      </label>
      <label className="block">
        <span className="label">Neues Passwort</span>
        <input id="pw-neu" type="password" className="input" autoComplete="new-password" required minLength={passwortMin} value={werte.neu} onChange={setze('neu')} />
        <span className="mt-1 block text-xs text-slate-400">Mindestens {passwortMin} Zeichen, darf den Login nicht enthalten.</span>
      </label>
      <label className="block">
        <span className="label">Neues Passwort wiederholen</span>
        <input id="pw-wiederholung" type="password" className="input" autoComplete="new-password" required value={werte.wiederholung} onChange={setze('wiederholung')} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primaer">
          Passwort ändern
        </button>
        {pflicht && (
          <button type="button" className="btn btn-sekundaer" onClick={abmelden}>
            Abmelden
          </button>
        )}
      </div>
    </form>
  );
}

// Startpasswort ändern, bevor die Anwendung nutzbar ist (ohne Layout)
export function StartpasswortAendern({ ich, onGeaendert }) {
  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-24">
      <div className="karte w-full max-w-sm">
        <h1 className="mb-1 text-xl font-semibold">Neues Passwort festlegen</h1>
        <p className="mb-4 text-sm text-slate-500">
          Angemeldet als <span className="font-mono">{ich.login}</span> mit einem Startpasswort. Bitte legen Sie jetzt Ihr eigenes Passwort fest.
        </p>
        <Formular passwortMin={ich.passwortMin} pflicht onGeaendert={onGeaendert} />
      </div>
    </div>
  );
}

export default function PasswortAendern() {
  const ich = useIch();
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Passwort ändern</h1>
      <Karte className="max-w-md">
        <Formular passwortMin={ich.passwortMin} />
      </Karte>
    </>
  );
}
