// Benutzerverwaltung: Logins → Altkennung (lokal mit Passwort), Profile mit Rollen, Zuständigkeiten (GVP), Vertretungen
import React, { useCallback, useEffect, useState } from 'react';
import api, { fehlertext, lovText, useKennungen, useLov, vergessen } from '../api';
import { anmeldeModus } from '../anmeldung';
import { KLASSEN, KLASSEN_HILFE } from '../ich';
import { zeitpunkt } from '../format';
import { Fehler, Karte, Laden, Umschalter, Vorschlaege } from '../components/ui';

// Einmalige Anzeige eines gesetzten Startpassworts zum Weitergeben
function StartpasswortHinweis({ ergebnis, onSchliessen }) {
  const [kopiert, setKopiert] = useState(false);
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <span>
        Startpasswort für <span className="font-mono">{ergebnis.login}</span>: <span id="startpasswort" className="rounded bg-white px-2 py-0.5 font-mono ring-1 ring-amber-200">{ergebnis.passwort}</span> – jetzt weitergeben,
        es wird nicht noch einmal angezeigt und muss bei der ersten Anmeldung geändert werden.
      </span>
      <span className="flex gap-2">
        <button
          className="btn btn-sekundaer py-1"
          onClick={async () => {
            await navigator.clipboard.writeText(ergebnis.passwort);
            setKopiert(true);
          }}
        >
          {kopiert ? 'Kopiert ✓' : 'Kopieren'}
        </button>
        <button className="btn btn-sekundaer py-1" onClick={onSchliessen}>
          Schließen
        </button>
      </span>
    </div>
  );
}

const LOGIN_LEER = { login: '', user_id: '', name: '', passwort: '' };

function NeuerLogin({ lokal, onAngelegt, onAbbrechen }) {
  const [werte, setWerte] = useState(LOGIN_LEER);
  const [fehler, setFehler] = useState('');
  const setze = (feld, gross) => (event) => setWerte({ ...werte, [feld]: gross ? event.target.value.toUpperCase() : event.target.value });
  const anlegen = async (event) => {
    event.preventDefault();
    setFehler('');
    try {
      const { data } = await api.post('/verwaltung/anmeldungen', werte);
      setWerte(LOGIN_LEER);
      onAngelegt(data);
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };
  return (
    <Karte titel="Neuer Login" className="mb-4">
      <form onSubmit={anlegen} className="space-y-4">
        <Fehler text={fehler} />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <label className="block">
            <span className="label">Login *</span>
            <input id="neu-login" className="input font-mono" required value={werte.login} onChange={(event) => setWerte({ ...werte, login: event.target.value.toLowerCase() })} />
          </label>
          <label className="block">
            <span className="label">Altkennung</span>
            <input id="neu-altkennung" list="verw-kennungen" className="input font-mono uppercase placeholder:normal-case" placeholder="leer = wie Login" value={werte.user_id} onChange={setze('user_id', true)} />
          </label>
          <label className="block">
            <span className="label">Name</span>
            <input className="input" value={werte.name} onChange={setze('name')} />
          </label>
          {lokal && (
            <label className="block">
              <span className="label">Startpasswort</span>
              <input className="input font-mono" placeholder="leer = erzeugen" autoComplete="off" value={werte.passwort} onChange={setze('passwort')} />
            </label>
          )}
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primaer">
            Anlegen
          </button>
          <button type="button" className="btn btn-sekundaer" onClick={onAbbrechen}>
            Abbrechen
          </button>
        </div>
      </form>
    </Karte>
  );
}

function PasswortStatus({ anmeldung: a }) {
  if (a.gesperrt_bis) return <span className="text-red-700">Fehlversuche – gesperrt bis {zeitpunkt(a.gesperrt_bis)}</span>;
  if (!a.hat_passwort) return <span className="text-slate-400">keins</span>;
  if (a.passwort_aendern) return <span className="text-amber-700">Startpasswort</span>;
  return <span className="text-slate-500">geändert {zeitpunkt(a.passwort_gesetzt_am)}</span>;
}

function Anmeldungen() {
  const kennungen = useKennungen();
  const lokal = anmeldeModus() === 'lokal';
  const [liste, setListe] = useState(null);
  const [entwurf, setEntwurf] = useState({});
  const [neu, setNeu] = useState(false);
  const [startpasswort, setStartpasswort] = useState(null);
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api.get('/verwaltung/anmeldungen').then(({ data }) => setListe(data)).catch((error) => setFehler(fehlertext(error)));
  }, []);
  useEffect(() => {
    laden();
  }, [laden]);

  const ausfuehren = async (anfrage) => {
    setFehler('');
    try {
      const { data } = await anfrage();
      if (data?.passwort) setStartpasswort(data);
      laden();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };
  const pfad = (login) => `/verwaltung/anmeldungen/${encodeURIComponent(login)}`;
  const speichern = (login, aenderung) =>
    ausfuehren(async () => {
      await api.put(pfad(login), aenderung);
      setEntwurf((alt) => ({ ...alt, [login]: undefined }));
      return {};
    });

  if (!liste) return <Laden />;
  return (
    <>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
        <p className="max-w-3xl text-sm text-slate-500">
          {lokal
            ? 'Logins mit Passwort der App (Übergang bis zum Keycloak der Organisation). Der Login ist in der Regel die Altkennung; dann wird er automatisch zugeordnet. Neue und zurückgesetzte Passwörter sind Startpasswörter und müssen bei der ersten Anmeldung geändert werden.'
            : 'Jede Anmeldung über Keycloak erscheint hier. Entspricht der Login einer Altkennung, wird er automatisch zugeordnet.'}{' '}
          Mehrere Logins dürfen dieselbe Altkennung nutzen; sie erben deren Rollen, Zuständigkeiten und Vertretungen.
        </p>
        {!neu && (
          <button className="btn btn-primaer" onClick={() => setNeu(true)}>
            + Neuer Login
          </button>
        )}
      </div>
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      {startpasswort && <StartpasswortHinweis ergebnis={startpasswort} onSchliessen={() => setStartpasswort(null)} />}
      {neu && (
        <NeuerLogin
          lokal={lokal}
          onAbbrechen={() => setNeu(false)}
          onAngelegt={(data) => {
            setNeu(false);
            if (data.passwort) setStartpasswort(data);
            laden();
          }}
        />
      )}
      <Vorschlaege id="verw-kennungen" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
      <div className="karte overflow-x-auto p-0">
        <table className="tabelle">
          <thead>
            <tr>
              <th>Login</th>
              <th>Name</th>
              <th>Altkennung</th>
              <th>Zugeordnet</th>
              {lokal && <th>Passwort</th>}
              <th>Letzte Anmeldung</th>
              <th>Gesperrt</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {liste.map((a) => {
              const wert = entwurf[a.login] ?? a.user_id ?? '';
              return (
                <tr key={a.login} className={!a.user_id ? 'bg-amber-50/60' : ''}>
                  <td className="font-mono text-xs">{a.login}</td>
                  <td>
                    {a.name || '–'}
                    <div className="text-xs text-slate-400">{a.email}</div>
                  </td>
                  <td>
                    <form
                      className="flex gap-1"
                      onSubmit={(event) => {
                        event.preventDefault();
                        speichern(a.login, { user_id: wert || null });
                      }}
                    >
                      <input list="verw-kennungen" className="input w-36 py-1 font-mono text-xs uppercase placeholder:normal-case" placeholder="nicht zugeordnet" value={wert} onChange={(event) => setEntwurf({ ...entwurf, [a.login]: event.target.value.toUpperCase() })} />
                      {entwurf[a.login] !== undefined && entwurf[a.login] !== (a.user_id ?? '') && (
                        <button type="submit" className="btn btn-primaer py-1">
                          Zuordnen
                        </button>
                      )}
                    </form>
                  </td>
                  <td className="text-xs text-slate-500">
                    {a.zugeordnet_von || '–'}
                    {a.zugeordnet_am && <div>{zeitpunkt(a.zugeordnet_am)}</div>}
                  </td>
                  {lokal && (
                    <td className="whitespace-nowrap text-xs">
                      <PasswortStatus anmeldung={a} />
                    </td>
                  )}
                  <td className="whitespace-nowrap text-xs text-slate-500">{a.letzte_anmeldung ? zeitpunkt(a.letzte_anmeldung) : 'noch nie'}</td>
                  <td>
                    <input type="checkbox" checked={a.gesperrt} onChange={(event) => speichern(a.login, { gesperrt: event.target.checked })} aria-label={`${a.login} sperren`} />
                  </td>
                  <td className="whitespace-nowrap text-right">
                    {lokal && (
                      <button
                        className="btn btn-sekundaer mr-2 py-1 text-xs"
                        onClick={() => window.confirm(`Neues Startpasswort für ${a.login} erzeugen? Laufende Sitzungen enden.`) && ausfuehren(() => api.put(`${pfad(a.login)}/passwort`, {}))}
                      >
                        Passwort zurücksetzen
                      </button>
                    )}
                    <button
                      className="btn btn-sekundaer py-1 text-xs"
                      onClick={() => window.confirm(`Login ${a.login} entfernen? Die Altkennung und ihre Rechte bleiben erhalten.`) && ausfuehren(() => api.delete(pfad(a.login)))}
                    >
                      Entfernen
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}

const GVP_LEER = { org: '', hgruppe: '', gruppe: '', ugruppe: '', tglieder: '', recht: 'L', bemerkung: '' };

function ProfilDetail({ userId, onGeaendert }) {
  const lov = useLov();
  const kennungen = useKennungen();
  const [profil, setProfil] = useState(null);
  const [stamm, setStamm] = useState(null);
  const [gvp, setGvp] = useState(GVP_LEER);
  const [vertreter, setVertreter] = useState('');
  const [fehler, setFehler] = useState('');

  const laden = useCallback(() => {
    api.get(`/verwaltung/profile/${encodeURIComponent(userId)}`).then(({ data }) => {
      setProfil(data);
      setStamm({ kennung: data.kennung, voreinst_org: data.voreinst_org || '', ben_eai: data.ben_eai || '', ben_klasse: data.ben_klasse || '', ben_umfang: data.ben_umfang || '', konfiguration: data.konfiguration || '', klassen: data.klassen });
    }).catch((error) => setFehler(fehlertext(error)));
  }, [userId]);
  useEffect(() => {
    laden();
  }, [laden]);

  const ausfuehren = async (anfrage) => {
    setFehler('');
    try {
      await anfrage();
      laden();
      onGeaendert();
    } catch (error) {
      setFehler(fehlertext(error));
    }
  };

  if (!profil || !stamm) return fehler ? <Fehler text={fehler} /> : <Laden />;
  const auswahl = (feld, liste) => (
    <select className="input" value={stamm[feld]} onChange={(event) => setStamm({ ...stamm, [feld]: event.target.value })}>
      <option value="">–</option>
      {liste.map((e) => (
        <option key={e.code} value={e.code}>
          {e.code} – {e.name}
        </option>
      ))}
    </select>
  );

  return (
    <div className="space-y-6">
      <Fehler text={fehler} onSchliessen={() => setFehler('')} />
      <Karte titel={<>Profil <span className="font-mono">{profil.user_id}</span></>}>
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            ausfuehren(() => api.put(`/verwaltung/profile/${encodeURIComponent(userId)}`, stamm));
          }}
        >
          <div>
            <span className="label">Rollen</span>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
              {Object.entries(KLASSEN).map(([code, label]) => (
                <label key={code} className="flex items-center gap-2" title={KLASSEN_HILFE[code]}>
                  <input
                    type="checkbox"
                    checked={stamm.klassen.includes(code)}
                    onChange={(event) => setStamm({ ...stamm, klassen: event.target.checked ? [...stamm.klassen, code] : stamm.klassen.filter((k) => k !== code) })}
                  />
                  {label} <span className="text-xs text-slate-400">({code})</span>
                </label>
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-400">
              {Object.entries(KLASSEN_HILFE).map(([code, text]) => `${code}: ${text}`).join(' · ')}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <label className="block">
              <span className="label">Kennung *</span>
              <input className="input uppercase" required value={stamm.kennung} onChange={(event) => setStamm({ ...stamm, kennung: event.target.value })} />
            </label>
            <label className="block">
              <span className="label">Voreingestelltes Referat</span>
              {auswahl('voreinst_org', lov.org)}
            </label>
            <label className="block">
              <span className="label">Konfiguration</span>
              {auswahl('konfiguration', lov.konfiguration)}
            </label>
            <label className="block">
              <span className="label">Vorbelegung E/A/I</span>
              {auswahl('ben_eai', lov.eai)}
            </label>
            <label className="block">
              <span className="label">Vorbelegung Klasse</span>
              {auswahl('ben_klasse', lov.klasse)}
            </label>
            <label className="block">
              <span className="label">Vorbelegung Umfang</span>
              {auswahl('ben_umfang', lov.umfang)}
            </label>
          </div>
          <button type="submit" className="btn btn-primaer">
            Speichern
          </button>
        </form>
      </Karte>

      <Karte titel="Zuständigkeiten (Geschäftsverteilungsplan)">
        <p className="mb-3 text-xs text-slate-500">Referat und optional ein Teilbaum des Aktenplans (leer = alles). Recht „L“ erlaubt nur Lesen.</p>
        <table className="tabelle mb-4">
          <thead>
            <tr>
              <th>Referat</th>
              <th>HG</th>
              <th>Gr.</th>
              <th>UGr.</th>
              <th>Tgl.</th>
              <th>Recht</th>
              <th>Bemerkung</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {profil.gvp.map((g) => (
              <tr key={[g.org, g.hgruppe, g.gruppe, g.ugruppe, g.tglieder].join('|')}>
                <td title={g.org_name}>{g.org}</td>
                <td>{g.hgruppe || '*'}</td>
                <td>{g.gruppe || '*'}</td>
                <td>{g.ugruppe || '*'}</td>
                <td>{g.tglieder || '*'}</td>
                <td>{g.recht_name || g.recht}</td>
                <td className="text-slate-500">{g.bemerkung || ''}</td>
                <td className="text-right">
                  <button className="btn btn-gefahr py-0.5" onClick={() => ausfuehren(() => api.post(`/verwaltung/profile/${encodeURIComponent(userId)}/gvp/entfernen`, g))}>
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
            {!profil.gvp.length && (
              <tr>
                <td colSpan={8} className="text-slate-400">
                  Keine Zuständigkeiten – dieses Profil sieht kein Schriftgut.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <form
          className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[10rem_4rem_4rem_4rem_6rem_8rem_1fr_auto]"
          onSubmit={(event) => {
            event.preventDefault();
            ausfuehren(async () => {
              await api.post(`/verwaltung/profile/${encodeURIComponent(userId)}/gvp`, gvp);
              setGvp(GVP_LEER);
            });
          }}
        >
          <select className="input" required value={gvp.org} onChange={(event) => setGvp({ ...gvp, org: event.target.value })} aria-label="Referat">
            <option value="">Referat …</option>
            {lov.org.map((o) => (
              <option key={o.code} value={o.code}>
                {o.code} – {o.name}
              </option>
            ))}
          </select>
          {['hgruppe', 'gruppe', 'ugruppe', 'tglieder'].map((feld) => (
            <input key={feld} className="input" placeholder={{ hgruppe: 'HG', gruppe: 'Gr.', ugruppe: 'UGr.', tglieder: 'Tgl.' }[feld]} value={gvp[feld]} onChange={(event) => setGvp({ ...gvp, [feld]: event.target.value })} />
          ))}
          <select className="input" value={gvp.recht} onChange={(event) => setGvp({ ...gvp, recht: event.target.value })} aria-label="Recht">
            {lov.rechte.map((r) => (
              <option key={r.code} value={r.code}>
                {r.name}
              </option>
            ))}
          </select>
          <input className="input" placeholder="Bemerkung" value={gvp.bemerkung} onChange={(event) => setGvp({ ...gvp, bemerkung: event.target.value })} />
          <button type="submit" className="btn btn-sekundaer">
            Hinzufügen
          </button>
        </form>
      </Karte>

      <Karte titel="Vertretungen">
        <p className="mb-3 text-xs text-slate-400">Nur zwischen Registratoren. Der Vertreter kann im Kopf „handeln als“ wählen und registriert dann im Namen der vertretenen Person.</p>
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <span className="label">{profil.user_id} wird vertreten von</span>
            <div className="mb-2 flex flex-wrap gap-1">
              {profil.vertreten_von.map((v) => (
                <span key={v} className="chip">
                  {v}
                  <button className="text-blue-500 hover:text-blue-900" aria-label={`${v} entfernen`} onClick={() => ausfuehren(() => api.post('/verwaltung/vertretungen/entfernen', { registrator: profil.user_id, vertreter: v }))}>
                    ×
                  </button>
                </span>
              ))}
              {!profil.vertreten_von.length && <span className="text-slate-400">–</span>}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                ausfuehren(async () => {
                  await api.post('/verwaltung/vertretungen', { registrator: profil.user_id, vertreter });
                  setVertreter('');
                });
              }}
            >
              <input list="verw-kennungen-v" className="input uppercase" placeholder="Kennung des Vertreters" value={vertreter} onChange={(event) => setVertreter(event.target.value.toUpperCase())} />
              <Vorschlaege id="verw-kennungen-v" werte={kennungen.map((k) => ({ wert: k.user_id, label: k.kennung }))} />
              <button type="submit" className="btn btn-sekundaer">
                Hinzufügen
              </button>
            </form>
          </div>
          <div>
            <span className="label">{profil.user_id} vertritt</span>
            <div className="flex flex-wrap gap-1">{profil.vertritt.length ? profil.vertritt.map((v) => <span key={v} className="chip">{v}</span>) : <span className="text-slate-400">–</span>}</div>
            <span className="label mt-4">Zugeordnete Anmeldungen</span>
            <div className="text-xs">{profil.anmeldungen.length ? profil.anmeldungen.map((a) => a.login + (a.gesperrt ? ' (gesperrt)' : '')).join(', ') : <span className="text-slate-400">–</span>}</div>
          </div>
        </div>
      </Karte>
    </div>
  );
}

function NeuesProfil({ onAngelegt, onAbbrechen }) {
  const [werte, setWerte] = useState({ user_id: '', kennung: '', klassen: ['SB'] });
  const [fehler, setFehler] = useState('');
  return (
    <form
      className="space-y-3"
      onSubmit={async (event) => {
        event.preventDefault();
        try {
          const { data } = await api.post('/verwaltung/profile', werte);
          vergessen('/kennungen');
          onAngelegt(data.user_id);
        } catch (error) {
          setFehler(fehlertext(error));
        }
      }}
    >
      <Fehler text={fehler} />
      <label className="block">
        <span className="label">Altkennung (USER_ID) *</span>
        <input className="input font-mono uppercase" required maxLength={30} value={werte.user_id} onChange={(event) => setWerte({ ...werte, user_id: event.target.value.toUpperCase() })} />
      </label>
      <label className="block">
        <span className="label">Kennung (Kurzzeichen) *</span>
        <input className="input uppercase" required maxLength={30} value={werte.kennung} onChange={(event) => setWerte({ ...werte, kennung: event.target.value.toUpperCase() })} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="btn btn-primaer">
          Anlegen
        </button>
        <button type="button" className="btn btn-sekundaer" onClick={onAbbrechen}>
          Abbrechen
        </button>
      </div>
    </form>
  );
}

function Profile() {
  const lov = useLov();
  const [liste, setListe] = useState(null);
  const [q, setQ] = useState('');
  const [auswahl, setAuswahl] = useState(null);
  const [neu, setNeu] = useState(false);

  const laden = useCallback(() => {
    api.get('/verwaltung/profile', { params: { q: q || undefined } }).then(({ data }) => setListe(data)).catch(() => setListe([]));
  }, [q]);
  useEffect(() => {
    const zeitgeber = setTimeout(laden, 200);
    return () => clearTimeout(zeitgeber);
  }, [laden]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[22rem_1fr]">
      <Karte
        titel="Profile (Altkennungen)"
        className="self-start"
        aktion={
          !neu && (
            <button className="btn btn-sekundaer" onClick={() => setNeu(true)}>
              + Neu
            </button>
          )
        }
      >
        {neu && (
          <div className="mb-4">
            <NeuesProfil
              onAbbrechen={() => setNeu(false)}
              onAngelegt={(id) => {
                setNeu(false);
                setAuswahl(id);
                laden();
              }}
            />
          </div>
        )}
        <input className="input mb-3" placeholder="Suchen …" value={q} onChange={(event) => setQ(event.target.value)} />
        {!liste ? (
          <Laden />
        ) : (
          <ul className="max-h-[32rem] space-y-0.5 overflow-y-auto">
            {liste.map((p) => (
              <li key={p.user_id}>
                <button
                  className={`w-full rounded px-2 py-1 text-left text-sm ${auswahl === p.user_id ? 'bg-blue-50 text-blue-900 ring-1 ring-blue-200' : 'hover:bg-slate-100'}`}
                  onClick={() => {
                    setNeu(false);
                    setAuswahl(p.user_id);
                  }}
                >
                  <span className="font-mono text-xs">{p.user_id}</span>
                  <span className="ml-2 text-xs text-slate-500">
                    {Object.keys(KLASSEN).filter((k) => p[`klasse_${k.toLowerCase()}`] === 'X').join(' ')} · {p.anzahl_gvp} GVP · {lovText(lov.org, p.voreinst_org) || '–'}
                  </span>
                  {p.anmeldungen && <div className="truncate text-xs text-slate-400">{p.anmeldungen}</div>}
                </button>
              </li>
            ))}
          </ul>
        )}
      </Karte>
      <div>{auswahl ? <ProfilDetail key={auswahl} userId={auswahl} onGeaendert={laden} /> : <p className="text-sm text-slate-500">Profil links auswählen.</p>}</div>
    </div>
  );
}

export default function Benutzerverwaltung() {
  const [bereich, setBereich] = useState('anmeldungen');
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Benutzerverwaltung</h1>
      <p className="mb-4 text-sm text-slate-500">
        {anmeldeModus() === 'lokal' ? 'Die Anmeldung erfolgt mit Login und Passwort der App.' : 'Keycloak meldet nur an.'} Rollen, Zuständigkeiten und Vertretungen werden hier gepflegt und stehen in den Tabellen der Altanwendung.
      </p>
      <div className="mb-6">
        <Umschalter optionen={[['anmeldungen', 'Anmeldungen'], ['profile', 'Profile, Rollen & Zuständigkeiten']]} wert={bereich} onChange={setBereich} />
      </div>
      {bereich === 'anmeldungen' ? <Anmeldungen /> : <Profile />}
    </>
  );
}
