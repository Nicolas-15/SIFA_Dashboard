import { MapPin, Clock, Wifi } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

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

export function FiscalizadoresTable({ loading, filtered, search }) {
  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 z-10">
            <th className="px-6 py-4">Email</th>
            <th className="px-6 py-4">Última Conexión</th>
            <th className="px-6 py-4">Ubicación</th>
            <th className="px-6 py-4">Estado</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading && filtered.length === 0 ? (
            <tr>
              <td colSpan="4" className="px-6 py-24">
                <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Spinner />
                  <span className="text-sm font-medium">Cargando fiscalizadores activos...</span>
                </div>
              </td>
            </tr>
          ) : filtered.length === 0 ? (
            <tr>
              <td colSpan="4">
                <EmptyState query={search} resource="fiscalizadores activos" />
              </td>
            </tr>
          ) : (
            filtered.map((f) => (
              <tr
                key={f.email}
                className="hover:bg-slate-50/50 transition-colors group"
              >
                <td className="px-6 py-4">
                  <p className="text-sm font-bold text-slate-800">{f.email}</p>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Clock size={14} className="text-slate-400" />
                    {formatLastConnection(f.ultimaConexion)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin size={14} className="text-slate-400" />
                    {f.latitud?.toFixed(4)}, {f.longitud?.toFixed(4)}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                    <Wifi size={14} />
                    En terreno
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}