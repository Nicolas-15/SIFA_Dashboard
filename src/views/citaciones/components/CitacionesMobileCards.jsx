import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { parseISODateTime } from '@/views/infracciones/utils/infractionFormatters';
import { CalendarClock } from 'lucide-react';

function isFuture(fecha) {
  if (!fecha) return false;
  return new Date(fecha) >= new Date();
}

export function CitacionesMobileCards({ filtered, searchQuery, activeFilter, onSelectCitacion }) {
  if (filtered.length === 0) {
    return <EmptyState query={searchQuery} filter={activeFilter} resource="citaciones" />;
  }

  return (
    <>
      {filtered.map(row => {
        const upcoming = isFuture(row.fecha);
        const prop = row.infraccion?.propietario;
        const tipo = row.infraccion?.tipoInfraccion;

        return (
          <button
            key={row.idCitacion}
            onClick={() => onSelectCitacion(row)}
            className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
                  {row.infraccion?.vehicle?.plate || '-'}
                </span>
              </div>
              <StatusBadge status={row.infraccion?.status} />
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
              <span className="font-mono font-bold text-slate-500">#{row.idCitacion}</span>
              <span className="text-slate-300">|</span>
              <span>Infracción #{row.infraccion?.id}</span>
            </div>

            {prop && (
              <p className="text-sm font-bold text-slate-800 mb-0.5">
                {prop.nombreCompleto}
              </p>
            )}
            {prop?.rut && (
              <p className="text-xs text-slate-400 mb-1.5">
                RUT: {prop.rut}
              </p>
            )}

            {tipo && (
              <p className="text-xs text-slate-500 mb-2 line-clamp-1">
                {tipo.id} - {tipo.nombre}
              </p>
            )}

            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-1.5">
                <CalendarClock size={13} className={upcoming ? 'text-primary' : 'text-slate-400'} />
                <span className={`text-xs font-bold ${upcoming ? 'text-primary' : 'text-slate-400'}`}>
                  {row.fecha ? parseISODateTime(row.fecha) : 'No definida'}
                </span>
              </div>
              <span className="text-xs font-bold text-primary">Ver detalle →</span>
            </div>
          </button>
        );
      })}
    </>
  );
}
