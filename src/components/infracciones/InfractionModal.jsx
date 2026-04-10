import { useRef, useState, useEffect } from 'react';
import { X, MapPin, Clock, Car, Download, CheckCircle, Pencil, Save, RotateCcw, AlertTriangle, User } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { StatusBadge, STATUS_MAP } from '../ui/StatusBadge';

const VEHICLE_TYPES = ['Automóvil', 'Camioneta', 'Furgón', 'Motocicleta', 'Camión', 'Bus'];
const VEHICLE_COLORS = ['Blanco', 'Negro', 'Gris', 'Rojo', 'Azul', 'Verde', 'Amarillo', 'Plateado', 'Café', 'Naranja'];

function EditableField({ editing, value, onChange, label, type = 'text', options, mono = false }) {
  const base = 'w-full text-sm rounded-lg border px-2.5 py-1.5 outline-none transition-all';
  const active = 'border-primary/60 bg-primary/5 ring-1 ring-primary/20 shadow-sm';
  const inactive = 'border-transparent bg-transparent cursor-default';
  
  // Safe default for undefined
  const safeVal = value || '';

  if (!editing) return <span className={`text-sm font-semibold text-slate-800 ${mono ? 'font-mono tracking-widest' : ''}`}>{safeVal || '-'}</span>;
  if (options) return <select value={safeVal} onChange={e => onChange(e.target.value)} className={`${base} ${active} font-medium text-slate-800`}><option value="">- Seleccione -</option>{options.map(o => <option key={o} value={o}>{o}</option>)}</select>;
  return <input type={type} value={safeVal} onChange={e => onChange(e.target.value)} className={`${base} ${active} font-semibold text-slate-800 ${mono ? 'font-mono tracking-wider' : ''}`} />;
}

export function InfractionModal({ infraction, updateStatus, updateInfraction, showToast, onClose, currentUser }) {
  const citationRef = useRef();
  const [isExporting, setIsExporting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  const [confirmAccept, setConfirmAccept] = useState(false);

  // RBAC flags
  const userRole = currentUser?.role;
  const canEdit = userRole === 'Administrativo JPL';
  const canAccept = userRole === 'Administrativo JPL';
  const canExport = userRole === 'Administrativo JPL';

  useEffect(() => {
    const handleKeyDown = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const startEdit = () => {
    setDraft(JSON.parse(JSON.stringify(infraction))); // Deep copy for nested objects
    setEditing(true);
  };

  const cancelEdit = () => { setDraft(null); setEditing(false); };

  const saveEdit = () => {
    updateInfraction(infraction.id, draft);
    showToast(`✏️ Infracción Boleta ${draft.numeroBoleta || draft.id} actualizada`);
    setEditing(false);
    setDraft(null);
  };

  const setField = (key, val) => setDraft(d => ({ ...d, [key]: val }));
  const setNested = (parent, key, val) => setDraft(d => ({ ...d, [parent]: { ...d[parent], [key]: val } }));

  const formatRUT = (val) => {
    let cleanVal = val.replace(/[^0-9kK]/g, '').toUpperCase();
    if (cleanVal.length === 0) return '';
    if (cleanVal.length <= 1) return cleanVal;
    const body = cleanVal.slice(0, -1);
    const dv = cleanVal.slice(-1);
    let formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${formattedBody}-${dv}`;
  };

  const formatPlate = (val) => {
    let cleaned = val.toUpperCase().replace(/[^A-Z0-9-]/g, '');
    let noHyphen = cleaned.replace(/-/g, '');
    if (noHyphen.length === 6) {
       if (/^[A-Z]{4}\d{2}$/.test(noHyphen)) return noHyphen.substring(0,4) + '-' + noHyphen.substring(4);
       if (/^[A-Z]{2}\d{4}$/.test(noHyphen)) return noHyphen.substring(0,2) + '-' + noHyphen.substring(2);
    }
    return cleaned;
  };

  const data = editing ? draft : infraction;

  const handleAccept = () => {
    updateStatus(infraction.id, 'accepted');
    showToast(`✓ Infracción ${infraction.numeroBoleta || infraction.id} aceptada`);
    setConfirmAccept(false);
    onClose();
  };

  const exportPDF = async () => {
    try {
      setIsExporting(true);
      const canvas = await html2canvas(citationRef.current, { scale: 2, useCORS: true });
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      pdf.save(`empadronado-${infraction.numeroBoleta || infraction.id}.pdf`);
      updateStatus(infraction.id, 'exported');
      showToast(`↓ Citación PDF exportada exitosamente`);
    } catch (e) {
      showToast('Error al generar el PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // Generate date formats for PDF
  const infDate = new Date(infraction.timestamp);
  const formattedDay = infDate.toLocaleDateString('es-CL');
  const formattedTime = infDate.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  const docDate = new Date(); // El Quisco, DIA de MES de AÑO
  
  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  // Safeguard against missing nested properties in old data
  const vehicle = infraction.vehicle || {};
  const denunciado = infraction.denunciado || {};
  const location = infraction.location || {};
  const tramitacion = infraction.tramitacion || {};

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[93vh] animate-in slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b rounded-t-2xl shrink-0 transition-colors ${editing ? 'bg-amber-50 border-amber-200' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <StatusBadge status={infraction.status} />
            <div>
              <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                Infracción {infraction.numeroBoleta ? `Boleta N°${infraction.numeroBoleta}` : ''}
              </h3>
              <p className="text-xs text-slate-500 font-mono">ID: {infraction.id.split('-')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing ? (
              canEdit && (
                <button onClick={startEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 rounded-lg border border-amber-200 hover:bg-amber-100">
                  <Pencil size={13} /> Editar Documento
                </button>
              )
            ) : (
              <button onClick={cancelEdit} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-lg hover:bg-slate-200">
                <RotateCcw size={13} /> Descartar
              </button>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"><X size={20} /></button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-5">
          
          {/* Fila superior numeraciones */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">N° Boleta (Física)</p>
               <EditableField editing={editing} value={data.numeroBoleta} onChange={v => setField('numeroBoleta', v)} mono />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">N° Parte (Seg.Pública)</p>
               <EditableField editing={editing} value={data.numeroParte} onChange={v => setField('numeroParte', v)} mono />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Fecha de Citación</p>
               <EditableField editing={editing} value={data.tramitacion?.fechaCitacion} onChange={v => setNested('tramitacion', 'fechaCitacion', v)} />
             </div>
             <div>
               <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Agente / Fiscalizador</p>
               <EditableField editing={editing} value={data.agentId} onChange={v => setField('agentId', v)} />
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Foto referenciada limpia */}
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative h-48 md:h-56">
              <img src={infraction.photoUrl} className="w-full h-full object-cover" crossOrigin="anonymous" alt="Evidencia de infracción" />
              <div className="absolute top-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded flex items-center justify-between text-xs font-bold text-slate-700">
                <span className="flex items-center gap-1"><Clock size={12}/> {new Date(infraction.timestamp).toLocaleString('es-CL')}</span>
                <span className="flex items-center gap-1 truncate max-w-[50%]"><MapPin size={12}/> {location.address}</span>
              </div>
              <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1.5 text-white font-mono rounded shadow-lg backdrop-blur-sm">
                PATENTE: <EditableField editing={editing} value={data.vehicle?.plate} onChange={v => setNested('vehicle', 'plate', formatPlate(v))} mono />
              </div>
            </div>

            {/* Infracción Detallada */}
            <div className={`rounded-xl border p-4 space-y-3 ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
              <h4 className="text-[11px] font-bold uppercase text-slate-500">Motivo e Infracción Cometida</h4>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Cód. Infracción</p>
                <div className="w-24"><EditableField editing={editing} value={data.infractionCode} onChange={v => setField('infractionCode', v)} mono /></div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Descripción formal del hecho</p>
                <EditableField editing={editing} value={data.infractionDescription} onChange={v => setField('infractionDescription', v)} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Disposición Infringida (ej. Ley de Tránsito)</p>
                <EditableField editing={editing} value={data.disposicionInfringida} onChange={v => setField('disposicionInfringida', v)} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Box 1: Infractor */}
            <div className={`rounded-xl border p-4 space-y-3 ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
              <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1"><User size={13}/> Denunciado / Infractor</h4>
              <div className="grid grid-cols-2 gap-3">
                 <div className="col-span-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Nombre Completo</p>
                   <EditableField editing={editing} value={data.denunciado?.nombre} onChange={v => setNested('denunciado', 'nombre', v)} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">RUT</p>
                   <EditableField editing={editing} value={data.denunciado?.rut} onChange={v => setNested('denunciado', 'rut', formatRUT(v))} mono />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Edad</p>
                   <EditableField editing={editing} value={data.denunciado?.edad} onChange={v => setNested('denunciado', 'edad', v)} type="number" />
                 </div>
                 <div className="col-span-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Dirección (Calle y N°)</p>
                   <EditableField editing={editing} value={data.denunciado?.direccion} onChange={v => setNested('denunciado', 'direccion', v)} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Comuna / Ciudad</p>
                   <EditableField editing={editing} value={data.denunciado?.comuna} onChange={v => setNested('denunciado', 'comuna', v)} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Estado Civil</p>
                   <EditableField editing={editing} value={data.denunciado?.estadoCivil} onChange={v => setNested('denunciado', 'estadoCivil', v)} options={['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a']} />
                 </div>
                 <div className="col-span-2">
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Profesión u Oficio</p>
                   <EditableField editing={editing} value={data.denunciado?.profesion} onChange={v => setNested('denunciado', 'profesion', v)} />
                 </div>
              </div>
            </div>

            {/* Box 2: Vehiculo y GPS */}
            <div className={`rounded-xl border p-4 space-y-3 flex flex-col ${editing ? 'border-amber-200 bg-amber-50/40' : 'border-slate-200 bg-slate-50'}`}>
              <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1"><Car size={13}/> Vehículo Interviniente</h4>
              <div className="grid grid-cols-2 gap-3">
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Marca</p>
                   <EditableField editing={editing} value={data.vehicle?.brand} onChange={v => setNested('vehicle', 'brand', v)} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Modelo</p>
                   <EditableField editing={editing} value={data.vehicle?.model} onChange={v => setNested('vehicle', 'model', v)} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Color</p>
                   <EditableField editing={editing} value={data.vehicle?.color} onChange={v => setNested('vehicle', 'color', v)} options={VEHICLE_COLORS} />
                 </div>
                 <div>
                   <p className="text-[10px] font-bold text-slate-400 uppercase">Tipo</p>
                   <EditableField editing={editing} value={data.vehicle?.type} onChange={v => setNested('vehicle', 'type', v)} options={VEHICLE_TYPES} />
                 </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-200">
                <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1 mb-2"><MapPin size={13}/> Origen / Coordenadas</h4>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Latitud</p>
                    <EditableField editing={editing} value={data.location?.lat} onChange={v => setNested('location', 'lat', parseFloat(v))} type="number" mono />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Longitud</p>
                    <EditableField editing={editing} value={data.location?.lng} onChange={v => setNested('location', 'lng', parseFloat(v))} type="number" mono />
                  </div>
                </div>
                {/* Mini Mapa OpenStreetMap */}
                <div className="w-full h-40 rounded-lg overflow-hidden border border-slate-200 mt-2 shadow-sm">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${(data.location?.lng || -71.696) - 0.005},${(data.location?.lat || -33.393) - 0.005},${(data.location?.lng || -71.696) + 0.005},${(data.location?.lat || -33.393) + 0.005}&layer=mapnik&marker=${data.location?.lat || -33.393},${data.location?.lng || -71.696}`}
                  ></iframe>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-3 bg-slate-50">
          {editing ? (
            <>
              <button onClick={saveEdit} className="flex items-center gap-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl"><Save size={16} /> Guardar Cambios</button>
            </>
          ) : (
            <>
              {infraction.status === 'pending' && !confirmAccept && canAccept && (
                <div className="flex gap-2">
                  <button onClick={() => { updateStatus(infraction.id, 'rejected'); showToast(`❌ Infracción rechazada y anulada`); onClose(); }} className="px-5 py-2.5 bg-red-50 text-red-600 font-bold rounded-xl flex items-center gap-2 border border-red-200 hover:bg-red-100 transition-colors"><X size={16}/> Rechazar</button>
                  <button onClick={() => setConfirmAccept(true)} className="px-5 py-2.5 bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-2 hover:bg-emerald-600 transition-colors"><CheckCircle size={16}/> Revisar / Aceptar</button>
                </div>
              )}
              {infraction.status === 'pending' && confirmAccept && canAccept && (
                <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300">
                  <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-200 px-3 py-2 rounded-xl">¿Confirmar validez Legal?</span>
                  <button onClick={() => setConfirmAccept(false)} className="px-3 py-2 bg-slate-200 font-bold rounded-xl hover:bg-slate-300 text-slate-600">Cancelar</button>
                  <button onClick={handleAccept} className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700">Sí, Aceptar</button>
                </div>
              )}
              {infraction.status === 'accepted' && canExport && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(infraction.id, 'pending')} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-2">
                    <RotateCcw size={16}/> Reabrir a Pendiente
                  </button>
                  <button onClick={exportPDF} disabled={isExporting} className="px-5 py-2.5 bg-primary text-white font-bold rounded-xl flex items-center gap-2 hover:bg-primary-dark transition-colors disabled:opacity-50">
                    <Download size={16}/> {isExporting ? 'Generando PDF...' : 'Generar Empadronado JPL'}
                  </button>
                </div>
              )}
              {infraction.status === 'exported' && (
                <div className="flex items-center gap-2">
                  {canAccept && (
                    <button onClick={() => updateStatus(infraction.id, 'pending')} className="p-2.5 bg-slate-100 text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors" title="Deshacer y Reabrir">
                      <RotateCcw size={18}/>
                    </button>
                  )}
                  <span className="px-5 py-2.5 bg-slate-100 text-emerald-600 font-bold text-sm rounded-xl flex items-center gap-2 border border-slate-200">
                    <CheckCircle size={17} /> PDF Generado Exitosamente
                  </span>
                </div>
              )}
              {infraction.status === 'rejected' && (
                <div className="flex items-center gap-2">
                  {canAccept && (
                    <button onClick={() => updateStatus(infraction.id, 'pending')} className="px-5 py-2.5 bg-slate-100 text-slate-600 font-bold rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors flex items-center gap-2" title="Deshacer y Reabrir">
                      <RotateCcw size={16}/> Reabrir a Pendiente
                    </button>
                  )}
                  <span className="px-5 py-2.5 bg-red-50 text-red-600 font-bold text-sm rounded-xl flex items-center gap-2 border border-red-200">
                    <X size={17} /> Infracción Rechazada Devuelta
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* PLANTILLA INVISIBLE HTML2CANVAS CON FORMATO EXACTO JPL */}
      <div className="fixed left-[-9999px] top-[-9999px]">
        <div ref={citationRef} className="w-[800px] bg-white text-black p-12 pr-16 font-serif text-lg leading-relaxed" style={{ minHeight: '1100px' }}>
          
          <div className="mb-10 font-bold text-lg">
            <p>PARTE N°   {infraction.numeroParte || '________'}</p>
            <p>BOLETA N°  {infraction.numeroBoleta || '________'}</p>
            <p className="mt-4 font-black">EMPADRONADO</p>
            <br />
            <br />
            <p className="text-right">El Quisco, {docDate.getDate()} de {monthNames[docDate.getMonth()]} de {docDate.getFullYear()}</p>
          </div>

          <h2 className="font-bold underline mb-8">SEÑOR JUEZ DE POLICIA LOCAL:</h2>

          <div className="space-y-8 text-justify">
            <p>
              <span className="font-bold underline">Datos de la Infracción:</span><br />
              Doy cuenta que el día {formattedDay}, a las {formattedTime}, en calle {location.address}, se sorprendió la siguiente infracción: {infraction.infractionDescription}.
            </p>

            <p>
              <span className="font-bold underline">Datos del Vehículo:</span><br />
              El vehículo patente N° <span className="font-bold uppercase tracking-widest">{vehicle.plate}</span>, tipo {vehicle.type || '________'}.
            </p>

            <p>
              <span className="font-bold underline">Datos del Infractor:</span><br />
              Infractor {denunciado.nombre || '____________________'}, Cédula de Identidad {denunciado.rut || '___________'}, profesión {denunciado.profesion || '___________'}, estado civil {denunciado.estadoCivil || '___________'}, Edad {denunciado.edad || '___'}. <br/>
              Domicilio: Ciudad de {denunciado.comuna || '________'}, Calle {denunciado.direccion || '____________________'}.
            </p>

            <p className="font-bold uppercase tracking-wide mt-6">
              EL INFRACTOR QUEDÓ CITADO PARA LA AUDIENCIA DEL DÍA:<br/>
              {tramitacion.fechaCitacion || '_________________'}, a las 09:00 hrs.
            </p>

            <p>
              Disposición infringida {infraction.disposicionInfringida || '__________________________'}.<br/>
              Testigo inspector municipal {infraction.agentId} ({infraction.denunciante}).
            </p>
          </div>

          <div className="mt-32 w-full flex flex-col items-center">
             <div className="w-64 border-b border-black mb-2"></div>
             <p className="font-bold uppercase">{infraction.agentId}</p>
             <p className="uppercase text-sm">Inspector Municipal / Seguridad Pública</p>
          </div>
        </div>
      </div>
    </div>
  );
}
