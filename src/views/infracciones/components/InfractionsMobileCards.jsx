import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';

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
          <p className="text-sm font-semibold text-slate-700 mb-1">{inf.infractionDescription}</p>
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-slate-400">Citación: {inf.tramitacion?.fechaCitacion}</p>
            <span className="text-xs font-bold text-primary">Ver detalle →</span>
          </div>
        </button>
      ))}
    </>
  );
}
