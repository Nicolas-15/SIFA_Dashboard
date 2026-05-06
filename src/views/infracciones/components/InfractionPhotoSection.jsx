import { Clock, MapPin } from 'lucide-react';
import { EditableField } from './EditableField';
import { formatPlate } from '../utils/infractionFormatters';

/**
 * Foto de la infracción con overlay de timestamp/dirección
 * y campo editable de patente superpuesto.
 */
export function InfractionPhotoSection({ editing, data, infraction, location, setNested }) {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 relative h-48 md:h-56">
      <img
        src={infraction.photoUrl}
        className="w-full h-full object-cover"
        crossOrigin="anonymous"
        alt="Evidencia de infracción"
      />
      {/* Overlay superior: timestamp + dirección */}
      <div className="absolute top-2 left-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded flex items-center justify-between text-xs font-bold text-slate-700">
        <span className="flex items-center gap-1">
          <Clock size={12} /> {new Date(infraction.timestamp).toLocaleString('es-CL')}
        </span>
        <span className="flex items-center gap-1 truncate max-w-[50%]">
          <MapPin size={12} /> {location.address}
        </span>
      </div>
      {/* Overlay inferior: patente editable */}
      <div className="absolute bottom-3 right-3 bg-black/80 pl-3 pr-2 py-1 flex items-center rounded-lg shadow-xl backdrop-blur-md border border-white/20">
        <span className="text-[10px] text-white/70 font-bold uppercase tracking-widest mr-2">Patente</span>
        <div className="w-[100px]">
          <EditableField
            editing={editing}
            value={data.vehicle?.plate}
            onChange={v => setNested('vehicle', 'plate', formatPlate(v))}
            mono
            textColor="text-white"
            align="text-center"
          />
        </div>
      </div>
    </div>
  );
}

/**
 * Card con el código y descripción de la infracción cometida.
 */
export function InfractionDetailCard({ editing, data, setField }) {
  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-blue-200 bg-white shadow-sm ring-1 ring-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <h4 className="text-[11px] font-bold uppercase text-slate-500">Motivo e Infracción Cometida</h4>
      <div>
        <p className="text-[10px] font-bold text-slate-400 uppercase">Cód. Infracción</p>
        <div className="w-24">
          <EditableField editing={editing} value={data.infractionCode} onChange={v => setField('infractionCode', v)} mono />
        </div>
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
  );
}
