import { MapPin, Clock, Wifi } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

function formatLastConnection(dateString) {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return 'Ahora';
  if (diffMin < 60) return `Hace ${diffMin} min`;
  return date.toLocaleString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    day: 'numeric',
    month: 'short',
  });
}

export function FiscalizadoresMobileCards({ filtered, search }) {
  if (filtered.length === 0) {
    return <EmptyState query={search} resource="fiscalizadores activos" />;
  }

  return (
    <div className="grid grid-cols-1 gap-3">
      {filtered.map((f) => (
        <div
          key={f.email}
          className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-slate-800 truncate flex-1 mr-2">
              {f.email}
            </p>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs shrink-0">
              <Wifi size={12} />
              En terreno
            </div>
          </div>

          <div className="space-y-2 text-xs text-slate-600">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400 shrink-0" />
              <span>{formatLastConnection(f.ultimaConexion)}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={13} className="text-slate-400 shrink-0" />
              <span className="font-mono">
                {f.latitud?.toFixed(4)}, {f.longitud?.toFixed(4)}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 text-[10px] text-slate-400 flex justify-between">
            <span>Último reporte</span>
            <span className="font-mono">
              {f.ultimaConexion
                ? new Date(f.ultimaConexion).toLocaleString('es-CL')
                : '-'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}