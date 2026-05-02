import { Clock, MapPin } from 'lucide-react';
import { EditableField } from './EditableField';
import { parseToDatetimeLocal, parseFromDatetimeLocal } from '../utils/infractionFormatters';

/**
 * Fila superior del modal: Boleta, Parte, Fecha de Citación y Agente.
 */
export function InfractionNumeraciones({ editing, data, setField, setNested }) {
  return (
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
        <EditableField
          editing={editing}
          type="datetime-local"
          value={editing ? parseToDatetimeLocal(data.tramitacion?.fechaCitacion) : data.tramitacion?.fechaCitacion}
          onChange={v => setNested('tramitacion', 'fechaCitacion', parseFromDatetimeLocal(v))}
        />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Agente / Fiscalizador</p>
        <EditableField editing={editing} value={data.agentId} onChange={v => setField('agentId', v)} />
      </div>
    </div>
  );
}
