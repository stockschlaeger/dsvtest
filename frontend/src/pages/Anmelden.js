// Anmeldung mit Login und Passwort der App (AUTH_MODUS=lokal)
import React, { useState } from 'react';
import { anmelden } from '../anmeldung';
import { Fehler } from '../components/ui';

export default function Anmelden({ onAngemeldet }) {
  const [login, setLogin] = useState('');
  const [passwort, setPasswort] = useState('');
  const [fehler, setFehler] = useState('');
  const [laeuft, setLaeuft] = useState(false);

  const absenden = async (event) => {
    event.preventDefault();
    setFehler('');
    setLaeuft(true);
    try {
      await anmelden(login.trim(), passwort);
      onAngemeldet();
    } catch (error) {
      setFehler(error.message);
      setPasswort('');
      setLaeuft(false);
    }
  };

  return (
    <div className="flex min-h-screen items-start justify-center px-4 pt-24">
      <form onSubmit={absenden} className="karte w-full max-w-sm space-y-4">
        <div>
          <h1 className="text-xl font-semibold">DSV</h1>
          <p className="text-sm text-slate-500">Schriftgutverwaltung – Anmeldung</p>
        </div>
        <Fehler text={fehler} />
        <label className="block">
          <span className="label">Login</span>
          <input id="login" className="input" autoComplete="username" autoFocus required value={login} onChange={(event) => setLogin(event.target.value)} />
        </label>
        <label className="block">
          <span className="label">Passwort</span>
          <input id="passwort" type="password" className="input" autoComplete="current-password" required value={passwort} onChange={(event) => setPasswort(event.target.value)} />
        </label>
        <button type="submit" className="btn btn-primaer w-full justify-center" disabled={laeuft}>
          {laeuft ? 'Anmelden …' : 'Anmelden'}
        </button>
        <p className="text-xs text-slate-400">Der Login ist in der Regel Ihre bisherige DSV-Kennung. Passwort vergessen? Die Administration setzt ein neues Startpasswort.</p>
      </form>
    </div>
  );
}
