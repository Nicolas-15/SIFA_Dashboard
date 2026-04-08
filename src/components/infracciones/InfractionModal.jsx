import { useRef, useState, useEffect } from 'react';
import { X, MapPin, Clock, Car, Download, CheckCircle, Pencil, Save, RotateCcw, AlertTriangle } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { StatusBadge, STATUS_MAP } from '../ui/StatusBadge';
import { DetailCard } from '../ui/DetailCard';

/* ── Tipos de infracción (Ley de Tránsito 18.290 — El Quisco) ── */
const INFRACTION_TYPES = [
  'Estacionamiento donde señal oficial lo prohíbe (Art. 154 Nº1 Ley 18.290)',
  'Estacionamiento en doble fila (Art. 154 Nº3 Ley 18.290)',
  'Estacionamiento sobre la vereda o paso peatonal (Art. 154 Nº2 Ley 18.290)',
  'Estacionamiento frente a puerta cochera o entrada vehicular (Art. 155 Nº6 Ley 18.290)',
  'Estacionamiento en zona de carga y descarga (Art. 159 Ley 18.290)',
  'Estacionamiento en paradero de locomoción colectiva (Art. 155 Nº4 Ley 18.290)',
  'Estacionamiento dentro de cruce o intersección (Art. 154 Nº7 Ley 18.290)',
  'Estacionamiento en paso peatonal o cebra (Art. 154 Nº2 Ley 18.290)',
  'Estacionamiento en zona de discapacitados sin credencial SENADIS (Art. 153 bis Ley 18.290)',
  'Estacionamiento obstruyendo salida de vehículos (Art. 155 Nº6 Ley 18.290)',
  'Estacionamiento en ciclovía o pista exclusiva (Art. 154 Nº9 Ley 18.290)',
  'Estacionamiento frente a cuartel de bomberos o grifo (Art. 155 Nº1 Ley 18.290)',
  'Estacionamiento en acceso a playa de uso público (Art. 159 Ley 18.290)',
  'Estacionamiento en puente, túnel o paso bajo nivel (Art. 154 Nº6 Ley 18.290)',
];

const VEHICLE_TYPES = ['Automóvil', 'Camioneta', 'Furgón', 'Motocicleta', 'Camión', 'Bus'];
const VEHICLE_COLORS = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Plateado', 'Café', 'Naranja'];

/* ── Campo editable genérico ── */
function EditableField({ editing, value, onChange, label, type = 'text', options, mono = false }) {
  const base = 'w-full text-sm rounded-lg border px-2.5 py-1.5 outline-none transition-all';
  const active = 'border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-sm';
  const inactive = 'border-transparent bg-transparent cursor-default';

  if (!editing) {
    return (
      <span className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono tracking-widest uppercase' : ''}`}>
        {value}
      </span>
    );
  }

  if (options) {
    return (
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className={`${base} ${active} font-medium text-slate-800 cursor-pointer`}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    );
  }

  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      className={`${base} ${active} font-semibold text-slate-800 ${mono ? 'font-mono tracking-widest uppercase' : ''}`}
    />
  );
}

/* ── Modal principal ── */
export function InfractionModal({ infraction, updateStatus, updateInfraction, showToast, onClose }) {
  const citationRef = useRef();
  const [isExporting, setIsExporting] = useState(false);

  /* Estado de edición y confirmación */
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);   // copia editable
  const [confirmAccept, setConfirmAccept] = useState(false);

  /* Cerrar con tecla ESC */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const startEdit = () => {
    setDraft({
      plate: infraction.plate,
      infractionType: infraction.infractionType,
      agentId: infraction.agentId,
      vehicle: { ...infraction.vehicle },
      location: { ...infraction.location },
    });
    setEditing(true);
  };

  const cancelEdit = () => { setDraft(null); setEditing(false); };

  const saveEdit = () => {
    updateInfraction(infraction.id, draft);
    showToast(`✏️ Infracción ${draft.plate} actualizada`);
    setEditing(false);
    setDraft(null);
  };

  /* Helpers para actualizar campos del borrador */
  const setField = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const setVehicle = (key, val) => setDraft(d => ({ ...d, vehicle: { ...d.vehicle, [key]: val } }));
  const setLocation = (key, val) => setDraft(d => ({ ...d, location: { ...d.location, [key]: val } }));

  /* Datos actualmente visibles (draft en edición, original si no) */
  const data = editing ? draft : infraction;

  /* ── Exportar PDF ── */
  const handleAccept = () => {
    updateStatus(infraction.id, 'accepted');
    showToast(`✓ Infracción ${infraction.plate} aceptada exitosamente`);
  };

  const exportPDF = async () => {
    try {
      setIsExporting(true);
      const canvas = await html2canvas(citationRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG', 0, 0,
        pdfWidth,
        (canvas.height * pdfWidth) / canvas.width
      );
      pdf.save(`citacion-${infraction.plate.replace(/\s+/g, '')}.pdf`);
      updateStatus(infraction.id, 'exported');
      showToast(`↓ Citación de ${infraction.plate} exportada exitosamente`);
    } catch (e) {
      console.error('Error exportando PDF', e);
      showToast('Error al generar el PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /* Botón de flujo principal */
  const ActionButton = () => {
    if (editing) return null;

    if (infraction.status === 'pending') {
      if (confirmAccept) {
        return (
          <div className="flex items-center gap-2 animate-in slide-in-from-right-4 duration-300">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1.5 bg-slate-100 px-3 py-2 rounded-xl">
              <AlertTriangle size={14} className="text-amber-500" />
              ¿Confirmar validez legal?
            </span>
            <button
              onClick={() => setConfirmAccept(false)}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-sm rounded-xl transition-all shadow-sm"
            >
              Cancelar
            </button>
            <button
              onClick={handleAccept}
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm flex items-center gap-2"
            >
              <CheckCircle size={17} /> Sí, Aceptar
            </button>
          </div>
        );
      }
      return (
        <button
          onClick={() => setConfirmAccept(true)}
          className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm"
        >
          <CheckCircle size={17} /> Aceptar Infracción
        </button>
      );
    }
    if (infraction.status === 'accepted') {
      return (
        <button
          onClick={exportPDF}
          disabled={isExporting}
          className="px-5 py-2.5 bg-primary hover:bg-primary-dark text-white font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-60"
        >
          <Download size={17} />
          {isExporting ? 'Generando PDF…' : 'Exportar Citación PDF'}
        </button>
      );
    }
    return (
      <span className="px-5 py-2.5 bg-slate-100 text-slate-500 font-bold text-sm rounded-xl flex items-center gap-2 border border-slate-200">
        <CheckCircle size={17} className="text-emerald-500" /> Citación Exportada
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="
        bg-white w-full sm:max-w-3xl
        rounded-t-2xl sm:rounded-2xl
        shadow-2xl border border-slate-200
        flex flex-col max-h-[93vh]
        animate-in slide-in-from-bottom-4 duration-300
      ">

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 md:px-6 py-4 border-b border-slate-200 rounded-t-2xl shrink-0 transition-colors ${editing ? 'bg-amber-50 border-b-amber-200' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <StatusBadge status={infraction.status} />
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                Detalle de Infracción
                {editing && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-300">
                    <Pencil size={10} /> Modo Edición
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-mono">{infraction.id}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Botón editar / cancelar */}
            {!editing ? (
              <button
                onClick={startEdit}
                title="Editar campos"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                <Pencil size={13} /> Editar
              </button>
            ) : (
              <button
                onClick={cancelEdit}
                title="Cancelar edición"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              >
                <RotateCcw size={13} /> Cancelar
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-4 md:space-y-5">

          {editing && (
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
              <Pencil size={13} className="shrink-0" />
              Estás en modo revisión. Modifica los campos necesarios y presiona <strong className="ml-1">Guardar cambios</strong>.
            </div>
          )}

          {/* Foto + Mapa */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative shadow-sm">
              <img
                src={infraction.photoUrl}
                alt="Evidencia fotográfica"
                className="w-full h-48 md:h-56 object-cover"
                crossOrigin="anonymous"
              />
              <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                {editing ? (
                  <input
                    value={draft.plate}
                    onChange={e => setField('plate', e.target.value.toUpperCase())}
                    maxLength={8}
                    className="font-mono text-base font-black tracking-widest uppercase text-white bg-black/60 px-3 py-1 rounded-md backdrop-blur-sm border border-white/40 outline-none w-36 placeholder:text-white/60"
                    placeholder="PATENTE"
                  />
                ) : (
                  <span className="font-mono text-base font-black tracking-widest uppercase text-white bg-black/60 px-3 py-1 rounded-md backdrop-blur-sm border border-white/20">
                    {data.plate}
                  </span>
                )}
              </div>
            </div>

            <div className="rounded-xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height: '192px' }}>
              <iframe
                title="Ubicación"
                width="100%" height="100%"
                frameBorder="0" scrolling="no"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${infraction.location.lng - 0.005},${infraction.location.lat - 0.005},${infraction.location.lng + 0.005},${infraction.location.lat + 0.005}&layer=mapnik&marker=${infraction.location.lat},${infraction.location.lng}`}
              />
              <div className="absolute top-2 left-2 right-2 bg-white/95 backdrop-blur-sm border border-slate-200 py-1.5 px-2.5 rounded-lg shadow-sm pointer-events-none flex items-center gap-1.5">
                <MapPin size={13} className="text-secondary shrink-0" />
                <p className="text-[11px] font-semibold text-slate-700 truncate">{infraction.location.address}</p>
              </div>
            </div>
          </div>

          {/* ── Sección: Datos del Vehículo ── */}
          <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Car size={13} /> Datos del Vehículo
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Marca', key: 'brand', mono: false },
                { label: 'Modelo', key: 'model', mono: false },
                { label: 'Tipo', key: 'type', options: VEHICLE_TYPES },
                { label: 'Color', key: 'color', options: VEHICLE_COLORS },
              ].map(({ label, key, mono, options }) => (
                <div key={key}>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{label}</p>
                  <EditableField
                    editing={editing}
                    value={editing ? draft.vehicle[key] : infraction.vehicle[key]}
                    onChange={val => setVehicle(key, val)}
                    mono={mono}
                    options={options}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* ── Sección: Infracción y Agente ── */}
          <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <CheckCircle size={13} /> Infracción y Agente
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tipo de Infracción</p>
                <EditableField
                  editing={editing}
                  value={editing ? draft.infractionType : infraction.infractionType}
                  onChange={val => setField('infractionType', val)}
                  options={INFRACTION_TYPES}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">ID Agente Inspector</p>
                <EditableField
                  editing={editing}
                  value={editing ? draft.agentId : infraction.agentId}
                  onChange={val => setField('agentId', val)}
                />
              </div>
            </div>
          </div>

          {/* ── Sección: Ubicación ── */}
          <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <MapPin size={13} /> Ubicación
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1 sm:col-start-1 col-span-1">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Dirección</p>
                <EditableField
                  editing={editing}
                  value={editing ? draft.location.address : infraction.location.address}
                  onChange={val => setLocation('address', val)}
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Latitud</p>
                <EditableField
                  editing={editing}
                  value={editing ? draft.location.lat : infraction.location.lat}
                  onChange={val => setLocation('lat', parseFloat(val) || val)}
                  type="number"
                />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Longitud</p>
                <EditableField
                  editing={editing}
                  value={editing ? draft.location.lng : infraction.location.lng}
                  onChange={val => setLocation('lng', parseFloat(val) || val)}
                  type="number"
                />
              </div>
            </div>
          </div>

          {/* ── Timestamp (solo lectura) ── */}
          <div className="flex items-center gap-2 text-xs text-slate-400 px-1">
            <Clock size={12} className="shrink-0" />
            <span>
              Registrado el <strong className="text-slate-600">
                {new Date(infraction.timestamp).toLocaleString('es-CL')}
              </strong>
            </span>
          </div>

          {/* Flujo de estados */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 flex-wrap">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Flujo:</p>
            {['pending', 'accepted', 'exported'].map((s, i, arr) => (
              <div key={s} className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${infraction.status === s
                  ? STATUS_MAP[s].cls + ' ring-2 ring-offset-1 ring-current'
                  : (infraction.status === 'exported' || (infraction.status === 'accepted' && s === 'pending'))
                    ? 'bg-slate-100 text-slate-400 border-slate-200 line-through'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                  }`}>
                  {STATUS_MAP[s].label}
                </span>
                {i < arr.length - 1 && <span className="text-slate-300 text-xs">→</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Footer ── */}
        <div className={`px-5 md:px-6 py-4 border-t rounded-b-2xl flex items-center justify-between gap-3 shrink-0 transition-colors ${editing ? 'bg-amber-50 border-t-amber-200' : 'bg-slate-50 border-t-slate-200'}`}>
          {editing ? (
            /* Controles de edición */
            <>
              <button
                onClick={cancelEdit}
                className="text-xs font-semibold text-slate-500 hover:text-slate-700 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <RotateCcw size={13} /> Cancelar
              </button>
              <button
                onClick={saveEdit}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm rounded-xl transition-all shadow-sm"
              >
                <Save size={16} /> Guardar cambios
              </button>
            </>
          ) : (
            /* Controles normales */
            <>
              {infraction.status !== 'pending' ? (
                <button
                  onClick={() => {
                    updateStatus(infraction.id, 'pending');
                    showToast(`↩ ${infraction.plate} devuelta a Pendiente`);
                  }}
                  className="text-xs font-semibold text-slate-400 hover:text-amber-600 transition-colors flex items-center gap-1.5 px-2 py-1 rounded-lg hover:bg-amber-50"
                >
                  ↩ Devolver a Pendiente
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 border border-slate-300 text-slate-700 font-semibold text-sm rounded-xl hover:bg-slate-100 transition-colors"
                >
                  Cerrar
                </button>
                <ActionButton />
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Plantilla PDF oculta ── */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={citationRef} className="w-[800px] bg-white text-black p-10 font-sans" style={{ minHeight: '1100px' }}>
          <div className="flex justify-between items-start border-b-2 border-gray-800 pb-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">CITACIÓN DE INFRACCIÓN</h1>
              <p className="text-base text-gray-600 font-medium">
                I. Municipalidad de El Quisco — Dirección de Tránsito
              </p>
            </div>
            <div className="text-right">
              <p className="font-bold text-xl text-red-600">ACTA N° {infraction.id.split('-').pop()}</p>
              <p className="text-gray-500 font-medium text-sm">Registro Centralizado SIFA</p>
            </div>
          </div>

          <div className="bg-gray-100 p-6 rounded-lg mb-8 border border-gray-300">
            <h2 className="text-xl font-bold mb-4">Datos del Vehículo Infractor</h2>
            <div className="grid grid-cols-2 gap-y-4">
              <div>
                <span className="text-gray-500 font-semibold block text-sm">Dominio/Patente:</span>
                <span className="font-mono text-2xl font-bold bg-white px-3 py-1 border border-gray-400 rounded inline-block mt-1 uppercase">
                  {infraction.plate}
                </span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-sm">Marca y Modelo:</span>
                <span className="font-bold text-lg">{infraction.vehicle.brand} {infraction.vehicle.model}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-sm">Tipo:</span>
                <span className="font-bold text-lg">{infraction.vehicle.type}</span>
              </div>
              <div>
                <span className="text-gray-500 font-semibold block text-sm">Color:</span>
                <span className="font-bold text-lg">{infraction.vehicle.color}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-3">Detalles del Hecho</h3>
              <div className="space-y-4">
                <div className="border-l-4 border-red-500 pl-4 py-1">
                  <p className="text-sm text-gray-500 font-semibold">Infracción Cometida</p>
                  <p className="font-bold text-red-700 text-lg uppercase">{infraction.infractionType}</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4 py-1">
                  <p className="text-sm text-gray-500 font-semibold">Fecha y Hora</p>
                  <p className="font-bold">{new Date(infraction.timestamp).toLocaleString('es-CL')}</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4 py-1">
                  <p className="text-sm text-gray-500 font-semibold">Lugar</p>
                  <p className="font-bold">{infraction.location.address}</p>
                  <p className="text-sm text-gray-500">Lat: {infraction.location.lat}, Lng: {infraction.location.lng}</p>
                </div>
                <div className="border-l-4 border-gray-400 pl-4 py-1">
                  <p className="text-sm text-gray-500 font-semibold">Agente Interviniente</p>
                  <p className="font-bold">{infraction.agentId}</p>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-500 uppercase tracking-wider text-sm mb-3">Respaldo Fotográfico</h3>
              <div className="bg-gray-200 rounded border-2 border-gray-400 overflow-hidden relative" style={{ height: '240px' }}>
                <img
                  src={infraction.photoUrl}
                  alt="Evidencia"
                  className="w-full h-full object-cover"
                  crossOrigin="anonymous"
                />
                <div className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 text-xs font-mono rounded">
                  EVIDENCIA-{infraction.id}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-100 border border-gray-300 p-6 rounded-lg text-center mt-8">
            <h3 className="font-bold text-2xl mb-2">CITACIÓN VERIFICADA Y CONSTATADA</h3>
            <p className="text-sm font-medium">
              Documento legalmente válido. Evidencia fotográfica respaldada con posicionamiento GPS.
            </p>
          </div>

          <div className="mt-12 text-center border-t border-gray-300 pt-6">
            <p className="text-xs text-gray-500 font-mono">
              Generado: {new Date().toLocaleString('es-CL')} — ID: {infraction.id}-{Date.now()}<br />
              Sistema de Inteligencia para Fiscalización Automática (SIFA) — I. Municipalidad de El Quisco
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
