import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { parseISODateTime } from '@/views/infracciones/utils/infractionFormatters';

export function InfractionsMobileCards({ filtered, searchQuery, activeFilter, setSelectedId }) {
  if (filtered.length === 0) {
    return <EmptyState query={searchQuery} filter={activeFilter} />;
  }

  return (
    <>
      {filtered.map(inf => (
        <button
          key={inf.id}
          onClick={() => setSelectedId(inf.id)}
          className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
              {inf.vehicle?.plate}
            </span>
            <StatusBadge status={inf.status} />
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1.5">
            <span className="font-mono font-bold text-slate-500">#{inf.id}</span>
            <span className="text-slate-300">|</span>
            <span>{parseISODateTime(inf.fecha)}</span>
          </div>

          <p className="text-sm font-bold text-slate-800 mb-1">
            {inf.tipoInfraccion?.id} - {inf.tipoInfraccion?.nombre}
          </p>
          {inf.tipoInfraccion?.disposicionInfringida && (
            <p className="text-xs text-slate-400 mb-1 line-clamp-2">
              {inf.tipoInfraccion.disposicionInfringida}
            </p>
          )}

          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">
              {inf.idFiscalizador ? `Fiscalizador: ${inf.idFiscalizador}` : ''}
            </p>
            <span className="text-xs font-bold text-primary">Ver detalle →</span>
          </div>
        </button>
      ))}
    </>
  );
}
