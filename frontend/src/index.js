import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { starten } from './anmeldung';
import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

// Anmeldemodus vom Backend holen und ggf. Keycloak einmalig vor dem Rendern initialisieren
// (StrictMode würde sonst doppelt initialisieren)
starten()
  .then(() => {
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  })
  .catch((error) => {
    console.error('Start fehlgeschlagen:', error);
    root.render(
      <div className="mx-auto mt-10 max-w-md rounded bg-white p-6 shadow">
        <h2 className="mb-2 text-xl font-bold">Anmeldung nicht möglich</h2>
        <p>Der Server oder der Anmeldedienst ist nicht erreichbar.</p>
      </div>
    );
  });
