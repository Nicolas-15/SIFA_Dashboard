import { User } from 'lucide-react';
import { EditableField } from './EditableField';
import { formatRUT } from '../utils/infractionFormatters';

const ESTADO_CIVIL = ['Soltero/a', 'Casado/a', 'Divorciado/a', 'Viudo/a'];

/**
 * Box de datos del denunciado / infractor.
 */
export function InfractionInfractorSection({ editing, data, setNested }) {
  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-colors ${editing ? 'border-blue-200 bg-white shadow-sm ring-1 ring-blue-50' : 'border-slate-200 bg-slate-50'}`}>
      <h4 className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
        <User size={13} /> Denunciado / Infractor
      </h4>
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
          <EditableField editing={editing} value={data.denunciado?.estadoCivil} onChange={v => setNested('denunciado', 'estadoCivil', v)} options={ESTADO_CIVIL} />
        </div>
        <div className="col-span-2">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Profesión u Oficio</p>
          <EditableField editing={editing} value={data.denunciado?.profesion} onChange={v => setNested('denunciado', 'profesion', v)} />
        </div>
      </div>
    </div>
  );
}
