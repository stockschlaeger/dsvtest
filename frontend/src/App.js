import React, { useCallback, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import api, { allesVergessen, fehlertext } from './api';
import { abmelden, anmeldeModus } from './anmeldung';
import { IchKontext } from './ich';
import Layout from './components/Layout';
import { Fehler, Laden } from './components/ui';
import Adressen from './pages/Adressen';
import Akten from './pages/Akten';
import Anmelden from './pages/Anmelden';
import PasswortAendern, { StartpasswortAendern } from './pages/Passwort';
import Benutzerverwaltung from './pages/Benutzerverwaltung';
import ObjektSeite from './pages/ObjektSeite';
import Recherche from './pages/Recherche';
import Stichworte from './pages/Stichworte';
import Wiedervorlagen from './pages/Wiedervorlagen';

function KeinZugang({ ich }) {
  return (
    <div className="mx-auto mt-16 max-w-lg rounded-lg border border-slate-200 bg-white p-6">
      <h1 className="mb-2 text-xl font-semibold">{ich.gesperrt ? 'Zugang gesperrt' : 'Noch kein Zugang'}</h1>
      <p className="mb-4 text-sm text-slate-600">
        {ich.gesperrt
          ? 'Ihr Zugang zur Schriftgutverwaltung ist gesperrt.'
          : 'Ihre Anmeldung ist noch keiner Kennung der Schriftgutverwaltung zugeordnet. Die Administration wurde über Ihre Anmeldung informiert und kann Sie zuordnen.'}
      </p>
      <p className="mb-4 text-sm">
        Angemeldet als <span className="font-mono">{ich.login}</span>
      </p>
      <button className="btn btn-sekundaer" onClick={abmelden}>
        Abmelden
      </button>
    </div>
  );
}

function App() {
  const [ich, setIch] = useState(null);
  const [anmelden, setAnmelden] = useState(false);
  const [fehler, setFehler] = useState('');
  const lokal = anmeldeModus() === 'lokal';

  const laden = useCallback(() => {
    allesVergessen();
    api
      .get('/ich')
      .then(({ data }) => {
        setIch(data);
        setAnmelden(false);
      })
      // 401 bei lokaler Anmeldung: Anmeldemaske (über das Ereignis dsv:abgemeldet)
      .catch((error) => !(lokal && error.response?.status === 401) && setFehler(fehlertext(error)));
  }, [lokal]);

  useEffect(() => {
    laden();
    const abgemeldet = () => {
      if (!lokal) return;
      setIch(null);
      setAnmelden(true);
    };
    window.addEventListener('dsv:abgemeldet', abgemeldet);
    return () => window.removeEventListener('dsv:abgemeldet', abgemeldet);
  }, [laden, lokal]);

  if (anmelden) return <Anmelden onAngemeldet={laden} />;
  if (fehler) return <div className="mx-auto mt-16 max-w-lg"><Fehler text={fehler} /></div>;
  if (!ich) return <Laden />;
  if (ich.passwortAendern) return <StartpasswortAendern ich={ich} onGeaendert={laden} />;
  if (ich.gesperrt || (!ich.userId && !ich.admin)) return <KeinZugang ich={ich} />;

  return (
    <IchKontext.Provider value={ich}>
      <Router>
        <Layout>
          <Routes>
            {ich.userId && (
              <>
                <Route path="/" element={<Akten />} />
                <Route path="/akten/:id" element={<ObjektSeite typ="akte" />} />
                <Route path="/vorgaenge/:id" element={<ObjektSeite typ="vorgang" />} />
                <Route path="/dokumente/:id" element={<ObjektSeite typ="dokument" />} />
                <Route path="/recherche" element={<Recherche />} />
                <Route path="/wiedervorlagen" element={<Wiedervorlagen />} />
                <Route path="/adressen" element={<Adressen />} />
                <Route path="/stichworte" element={<Stichworte />} />
              </>
            )}
            {ich.admin && <Route path="/benutzer" element={<Benutzerverwaltung />} />}
            {lokal && <Route path="/passwort" element={<PasswortAendern />} />}
            <Route path="*" element={<Navigate to={ich.userId ? '/' : '/benutzer'} replace />} />
          </Routes>
        </Layout>
      </Router>
    </IchKontext.Provider>
  );
}

export default App;
