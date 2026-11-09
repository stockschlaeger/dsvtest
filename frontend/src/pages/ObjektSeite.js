// Detailseite für Akte, Vorgang und Dokument der Altanwendung
import React, { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { fehlertext, lovText, useLov } from '../api';
import { useIch } from '../ich';
import { TYPEN } from '../schema';
import { datum, isoDatum, zeitpunkt } from '../format';
import Ansicht from '../components/Ansicht';
import Formular from '../components/Formular';
import Protokoll from '../components/Protokoll';
import { WiedervorlagenKarte } from '../components/Wiedervorlagen';
import { AdressKarte, AdressListe, AnlagenKarte, BerechtigteKarte, DateiKarte, StichwortKarte, adressenFuerApi, dateiVerweis } from '../components/Dokument';
import { Brotkrumen, Fehler, Karte, Laden, StatusBadge, Stichworte } from '../components/ui';

const UMFANG = { akte: 'A', vorgang: 'V', dokument: 'D' };
const SCHLUESSEL = { akte: 'lfd_aktenr', vorgang: 'lfd_vorgnr', dokument: 'lfd_doknr' };

function ZeilenLink({ to, children }) {
  return (
    <Link to={to} className="link" onClick={(event) => event.stopPropagation()}>
      {children}
    </Link>
  );
}

function VorgangTabelle({ vorgaenge, lov }) {
  const navigate = useNavigate();
  return (
    <table className="tabelle">
      <thead>
        <tr>
          <th>Aktenzeichen</th>
          <th>Betreff</th>
          <th>Bearbeiter</th>
          <th className="text-right">Dokumente</th>
          <th>Status</th>
          <th>Letzte Verfügung</th>
        </tr>
      </thead>
      <tbody>
        {vorgaenge.map((v) => (
          <tr key={v.lfd_vorgnr} className="cursor-pointer" onClick={() => navigate(`/vorgaenge/${v.lfd_vorgnr}`)}>
            <td className="az whitespace-nowrap">{v.aktenzeichen}</td>
            <td>
              <ZeilenLink to={`/vorgaenge/${v.lfd_vorgnr}`}>{v.betreff || '(ohne Betreff)'}</ZeilenLink>
            </td>
            <td>{v.bearbeiter || '–'}</td>
            <td className="text-right tabular-nums">{v.anzahl_dokumente}</td>
            <td>
              <StatusBadge status={v.status} name={lovText(lov.status, v.status)} />
            </td>
            <td className="whitespace-nowrap text-slate-500">{datum(v.datum_letzteverf)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DokumentTabelle({ dokumente, lov }) {
  const navigate = useNavigate();
  return (
    <table className="tabelle">
      <thead>
        <tr>
          <th>Aktenzeichen</th>
          <th>Betreff</th>
          <th>E/A/I</th>
          <th>Datum</th>
          <th>Status</th>
          <th>Datei</th>
        </tr>
      </thead>
      <tbody>
        {dokumente.map((d) => (
          <tr key={d.lfd_doknr} className="cursor-pointer" onClick={() => navigate(`/dokumente/${d.lfd_doknr}`)}>
            <td className="az whitespace-nowrap">
              {d.aktenzeichen}
              {d.geheim === 'J' && <div className="text-red-700">geheim</div>}
            </td>
            <td>
              <ZeilenLink to={`/dokumente/${d.lfd_doknr}`}>{d.betreff}</ZeilenLink>
            </td>
            <td>{lovText(lov.eai, d.eai_kennung)}</td>
            <td className="whitespace-nowrap">{datum(d.erstdatum)}</td>
            <td>
              <StatusBadge status={d.status} name={lovText(lov.status, d.status)} />
            </td>
            <td className="max-w-[14rem] truncate font-mono text-xs text-slate-500" title={dateiVerweis(d.dateipfad, d.dateiname) || ''}>
              {d.dateiname || (d.form_pe === 'P' ? 'Papier' : '–')}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Verwaltungsdaten({ typ, objekt }) {
  const zeilen = [
    ['Registriert', `${zeitpunkt(objekt.erst_regdatum)} · ${objekt.erst_registrator || '–'}${objekt.erst_reg_vertreter ? ` (Vertretung: ${objekt.erst_reg_vertreter})` : ''}`],
    ['Geändert', objekt.aend_regdatum ? `${zeitpunkt(objekt.aend_regdatum)} · ${objekt.aend_registrator || '–'}${objekt.aend_reg_vertreter ? ` (Vertretung: ${objekt.aend_reg_vertreter})` : ''}` : '–']
  ];
  if (typ !== 'akte') zeilen.push(['Letzte Verfügung', datum(objekt.datum_letzteverf)]);
  if (typ === 'akte' && objekt.aktenplan) {
    zeilen.push(['Aktenplan', `${objekt.aktenplan.kennzeichen} ${objekt.aktenplan.betreff}`]);
    if (objekt.aktenplan.aufbfrist != null) zeilen.push(['Aufbewahrungsfrist', `${objekt.aktenplan.aufbfrist} Jahre`]);
  }
  if (objekt.umregistriert_nach) zeilen.push(['Umregistriert nach', objekt.umregistriert_nach]);
  return (
    <dl className="space-y-3 text-sm">
      {zeilen.map(([label, wert]) => (
        <div key={label}>
          <dt className="label">{label}</dt>
          <dd>{wert}</dd>
        </div>
      ))}
    </dl>
  );
}

// Registrieren eines Dokuments: Felder, Einsender/Empfänger (Pflicht bei Eingang/Ausgang) und Stichworte
function DokumentRegistrieren({ vorbelegung, onAnlegen, onAbbrechen }) {
  const [adressen, setAdressen] = useState([]);
  const [stichworte, setStichworte] = useState('');
  const zusatz = (werte) => (
    <div className="space-y-4 border-t border-slate-100 pt-4">
      <div>
        <span className="label">Einsender / Empfänger{['E', 'A'].includes(werte.eai_kennung) && ' *'}</span>
        <AdressListe eintraege={adressen} onChange={setAdressen} />
      </div>
      <label className="block">
        <span className="label">Stichworte</span>
        <input className="input uppercase placeholder:normal-case" value={stichworte} onChange={(event) => setStichworte(event.target.value)} placeholder="kommagetrennt" />
        <p className="mt-1 text-xs text-slate-400">Leer lassen: Stichworte werden aus dem Betreff vorgeschlagen (ohne Stoppworte).</p>
      </label>
    </div>
  );
  const anlegen = (werte) => {
    const worte = stichworte.split(',').map((w) => w.trim()).filter(Boolean);
    return onAnlegen({ ...werte, adressen: adressenFuerApi(adressen), ...(worte.length ? { stichworte: worte } : {}) });
  };
  return <Formular felder={TYPEN.dokument.felder} objekt={vorbelegung} neu zusatz={zusatz} onSpeichern={anlegen} onAbbrechen={onAbbrechen} />;
}

// Hinweis, was die Rolle am Objekt darf (Handbuch: nur Registratur ändert, Sachbearbeitung nur Stichworte/Wiedervorlagen)
function rechteHinweis(rechte) {
  if (rechte.bearbeiten) return null;
  if (rechte.stichworte) return '(Sachbearbeitung: nur Stichworte und Wiedervorlagen)';
  return '(nur lesen)';
}

function ObjektInhalt({ typ, id }) {
  const def = TYPEN[typ];
  const ich = useIch();
  const lov = useLov();
  const navigate = useNavigate();
  const [objekt, setObjekt] = useState(null);
  const [fehler, setFehler] = useState('');
  const [modus, setModus] = useState('ansicht'); // ansicht | bearbeiten | neu
  const [version, setVersion] = useState(0);

  const laden = useCallback(async () => {
    try {
      const { data } = await api.get(`/${def.api}/${id}`);
      setObjekt(data);
      setVersion((alt) => alt + 1);
    } catch (error) {
      setFehler(fehlertext(error));
    }
  }, [def.api, id]);

  useEffect(() => {
    laden();
  }, [laden]);

  if (!objekt) return fehler ? <Fehler text={fehler} /> : <Laden />;

  const speichern = async (werte) => {
    await api.put(`/${def.api}/${id}`, werte);
    setModus('ansicht');
    await laden();
  };

  const kindAnlegen = async (werte) => {
    if (typ === 'akte') {
      const { data } = await api.post(`/akten/${id}/vorgaenge`, werte);
      navigate(`/vorgaenge/${data.lfd_vorgnr}`);
    } else {
      const { data } = await api.post(`/vorgaenge/${id}/dokumente`, werte);
      navigate(`/dokumente/${data.lfd_doknr}`);
    }
  };

  const brotkrumen = [];
  if (objekt.akte) brotkrumen.push({ to: `/akten/${objekt.akte.id}`, kennung: objekt.akte.aktenzeichen, text: objekt.akte.betreff });
  if (objekt.vorgang) brotkrumen.push({ to: `/vorgaenge/${objekt.vorgang.id}`, kennung: objekt.vorgang.aktenzeichen, text: objekt.vorgang.betreff });
  const anzeigeFelder = def.felder.filter((feld) => feld !== 'org' && feld !== 'vorg' && feld !== 'betreff');
  const kinder = typ === 'akte' ? objekt.vorgaenge : typ === 'vorgang' ? objekt.dokumente : null;
  const vorbelegungDokument = { status: lov.status_neu, eai_kennung: ich.vorbelegung?.eai_kennung, klasse: ich.vorbelegung?.klasse, form_pe: 'EL', geheim: 'N', erstdatum: isoDatum() };
  const hinweis = rechteHinweis(objekt.rechte);

  return (
    <>
      <Brotkrumen teile={[{ to: '/', text: 'Akten' }, ...brotkrumen]} />

      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>{def.label}</span>
            <span className="font-mono text-slate-700">{objekt.aktenzeichen}</span>
            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-xs text-slate-600 ring-1 ring-slate-200" title={objekt.org_name}>
              Referat {objekt.org}
            </span>
            <StatusBadge status={objekt.status} name={lovText(lov.status, objekt.status)} />
            {objekt.geheim === 'J' && <span className="rounded bg-red-50 px-1.5 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-200">geheim</span>}
            {hinweis && <span className="text-xs">{hinweis}</span>}
            {objekt.status === lov.status_gg && objekt.bearbeiter && (
              <span className="rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-800 ring-1 ring-amber-200">im Geschäftsgang bei {objekt.bearbeiter}</span>
            )}
          </div>
          <h1 className="text-2xl font-semibold">{objekt.betreff || '(ohne Betreff)'}</h1>
        </div>
        {modus === 'ansicht' && objekt.rechte.bearbeiten && (
          <button className="btn btn-sekundaer" onClick={() => setModus('bearbeiten')}>
            Bearbeiten
          </button>
        )}
      </div>

      <Fehler text={fehler} onSchliessen={() => setFehler('')} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Karte titel="Verwaltungsdaten">
            {modus === 'bearbeiten' ? (
              <Formular felder={def.felder} objekt={objekt} onSpeichern={speichern} onAbbrechen={() => setModus('ansicht')} />
            ) : (
              <Ansicht felder={anzeigeFelder} objekt={objekt} />
            )}
          </Karte>

          {typ === 'dokument' && (
            <>
              <DateiKarte dokument={objekt} />
              <AdressKarte dokument={objekt} onGeaendert={laden} />
              <StichwortKarte dokument={objekt} onGeaendert={laden} />
              <AnlagenKarte dokument={objekt} />
              <BerechtigteKarte dokument={objekt} onGeaendert={laden} />
            </>
          )}

          {typ !== 'dokument' && objekt.stichworte.length > 0 && (
            <Karte titel="Stichworte der Dokumente">
              <Stichworte worte={objekt.stichworte} verlinkt />
            </Karte>
          )}

          {kinder && (
            <Karte
              titel={
                <>
                  {typ === 'akte' ? 'Vorgänge' : 'Dokumente'} <span className="font-normal text-slate-400">({kinder.length})</span>
                </>
              }
              aktion={
                objekt.rechte.bearbeiten &&
                modus !== 'neu' && (
                  <button className="btn btn-primaer" onClick={() => setModus('neu')}>
                    {typ === 'akte' ? '+ Neuer Vorgang' : '+ Dokument registrieren'}
                  </button>
                )
              }
            >
              {modus === 'neu' && (
                <div className="mb-6 rounded-md border border-blue-100 bg-blue-50/40 p-4">
                  {typ === 'akte' ? (
                    <Formular felder={TYPEN.vorgang.felder} objekt={{ status: lov.status_neu }} neu onSpeichern={kindAnlegen} onAbbrechen={() => setModus('ansicht')} />
                  ) : (
                    <DokumentRegistrieren vorbelegung={vorbelegungDokument} onAnlegen={kindAnlegen} onAbbrechen={() => setModus('ansicht')} />
                  )}
                </div>
              )}
              {kinder.length === 0 ? (
                <p className="text-sm text-slate-500">{typ === 'akte' ? 'Keine lesbaren Vorgänge.' : 'Keine lesbaren Dokumente.'}</p>
              ) : (
                <div className="-mx-5 overflow-x-auto">
                  {typ === 'akte' ? <VorgangTabelle vorgaenge={kinder} lov={lov} /> : <DokumentTabelle dokumente={kinder} lov={lov} />}
                </div>
              )}
            </Karte>
          )}
        </div>

        <aside className="space-y-6">
          <WiedervorlagenKarte umfang={UMFANG[typ]} id={objekt[SCHLUESSEL[typ]]} darf={objekt.rechte.wiedervorlage} registratur={objekt.rechte.bearbeiten} onGeaendert={laden} />
          <Karte titel="Registrierung">
            <Verwaltungsdaten typ={typ} objekt={objekt} />
          </Karte>
          <Karte titel="Protokoll (neue Anwendung)">
            <Protokoll typ={typ} id={objekt[SCHLUESSEL[typ]]} version={version} />
          </Karte>
        </aside>
      </div>
    </>
  );
}

export default function ObjektSeite({ typ }) {
  const { id } = useParams();
  return <ObjektInhalt key={`${typ}-${id}`} typ={typ} id={id} />;
}
