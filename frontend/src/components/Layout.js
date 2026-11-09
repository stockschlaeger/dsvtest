import React, { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import { abmelden } from '../anmeldung';
import { KLASSEN, useIch } from '../ich';

function Navigation({ faellig, ich }) {
  const klasse = ({ isActive }) => `rounded px-2 py-1 ${isActive ? 'bg-slate-700 text-white' : 'text-slate-300 hover:text-white'}`;
  const daten = Boolean(ich.userId);
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {daten && (
        <>
          <NavLink to="/" end className={klasse}>
            Akten
          </NavLink>
          <NavLink to="/recherche" className={klasse}>
            Recherche
          </NavLink>
          <NavLink to="/wiedervorlagen" className={klasse}>
            Wiedervorlagen
            {faellig > 0 && <span className="ml-1.5 rounded-full bg-red-500 px-1.5 text-xs font-semibold text-white">{faellig}</span>}
          </NavLink>
          <NavLink to="/adressen" className={klasse}>
            Adressen
          </NavLink>
          <NavLink to="/stichworte" className={klasse}>
            Stichworte
          </NavLink>
        </>
      )}
      {ich.admin && (
        <NavLink to="/benutzer" className={klasse}>
          Benutzerverwaltung
        </NavLink>
      )}
    </nav>
  );
}

// Vertretung (nur Registratur, Handbuch 7.6): als vertretene Person handeln; Registrierungen tragen dann
// die vertretene Person als Registrator und den Handelnden als Vertreter
function VertretungsAuswahl({ ich }) {
  if (!ich.vertretungen?.length) return null;
  const waehlen = async (event) => {
    await api.put('/ich/vertretung', { registrator: event.target.value || null });
    window.location.reload();
  };
  return (
    <label className="flex items-center gap-1.5 text-xs">
      <span className="text-slate-400">handeln als</span>
      <select
        value={ich.vertretungAktiv || ''}
        onChange={waehlen}
        className={`rounded border-0 py-0.5 pl-2 pr-7 text-xs ${ich.vertretungAktiv ? 'bg-amber-400 text-slate-900' : 'bg-slate-800 text-white'}`}
      >
        <option value="">{ich.userId} (selbst)</option>
        {ich.vertretungen.map((registrator) => (
          <option key={registrator} value={registrator}>
            {registrator} (Vertretung)
          </option>
        ))}
      </select>
    </label>
  );
}

export default function Layout({ children }) {
  const ich = useIch();
  const navigate = useNavigate();
  const location = useLocation();
  const [suche, setSuche] = useState('');
  const [faellig, setFaellig] = useState(0);

  // Fällige Wiedervorlagen bei jedem Seitenwechsel und nach Änderungen aktualisieren
  useEffect(() => {
    if (!ich.userId) return undefined;
    const aktualisieren = () => api.get('/wiedervorlagen/faellig').then(({ data }) => setFaellig(data.anzahl)).catch(() => {});
    aktualisieren();
    window.addEventListener('dsv:wiedervorlagen', aktualisieren);
    return () => window.removeEventListener('dsv:wiedervorlagen', aktualisieren);
  }, [location, ich.userId]);

  const suchen = (event) => {
    event.preventDefault();
    if (suche.trim()) navigate(`/recherche?q=${encodeURIComponent(suche.trim())}`);
  };

  return (
    <div className="min-h-screen">
      <header className="bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-5 gap-y-2 px-4 py-3">
          <Link to="/" className="text-lg font-semibold tracking-tight">
            DSV <span className="hidden font-normal text-slate-400 lg:inline">Schriftgutverwaltung</span>
          </Link>
          <Navigation faellig={faellig} ich={ich} />
          {ich.userId && (
            <form onSubmit={suchen} className="order-last w-full md:order-none md:w-auto md:flex-1">
              <input
                type="search"
                value={suche}
                onChange={(event) => setSuche(event.target.value)}
                placeholder="Schnellsuche (Aktenzeichen, Betreff, Stichwort) …"
                className="w-full rounded-md border-0 bg-slate-800 px-3 py-1.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>
          )}
          <div className="ml-auto flex items-center gap-3 text-sm">
            <VertretungsAuswahl ich={ich} />
            <span title={ich.klassen.map((k) => KLASSEN[k]).join(', ') || 'keine Rolle'}>
              {ich.login}
              {ich.userId && ich.userId.toLowerCase() !== ich.login && <span className="ml-1 text-slate-400">({ich.userId})</span>}
            </span>
            {ich.klassen.length > 0 && <span className="rounded bg-slate-700 px-2 py-0.5 text-xs text-slate-200">{ich.klassen.map((k) => KLASSEN[k]).join(' · ')}</span>}
            {ich.anmeldeModus === 'lokal' && (
              <Link to="/passwort" className="text-slate-300 hover:text-white">
                Passwort
              </Link>
            )}
            <button onClick={abmelden} className="text-slate-300 hover:text-white">
              Abmelden
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
