import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/Button';

export function InfractionsTable({ filtered, searchQuery, activeFilter, setSelectedId }) {
  if (filtered.length === 0) {
    return <EmptyState query={searchQuery} filter={activeFilter} />;
  }

  return (
    <table className="w-full text-left border-collapse min-w-[640px]">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
          <th className="px-5 py-4">Parte/Boleta</th>
          <th className="px-5 py-4">Patente</th>
          <th className="px-5 py-4">Infracción</th>
          <th className="px-5 py-4">F. Citación</th>
          <th className="px-5 py-4">Estado</th>
          <th className="px-5 py-4"></th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {filtered.map(inf => (
          <tr
            key={inf.id}
            className="hover:bg-slate-50 transition-colors cursor-pointer"
            onClick={() => setSelectedId(inf.id)}
          >
            <td className="px-5 py-4 text-sm text-slate-600 font-bold">
              P: {inf.numeroParte}<br />
              <span className="text-xs text-slate-400 font-normal">B: {inf.numeroBoleta}</span>
            </td>
            <td className="px-5 py-4">
              <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
                {inf.vehicle?.plate}
              </span>
            </td>
            <td className="px-5 py-4">
              <div className="max-w-[300px]">
                <p className="text-xs font-bold text-primary">Cod {inf.infractionCode}</p>
                <p className="text-sm font-medium text-slate-700 truncate" title={inf.infractionDescription}>{inf.infractionDescription}</p>
              </div>
            </td>
            <td className="px-5 py-4 text-sm text-slate-600 font-semibold">
              {inf.tramitacion?.fechaCitacion}
            </td>
            <td className="px-5 py-4"><StatusBadge status={inf.status} /></td>
            <td className="px-5 py-4 text-right">
              <Button size="sm" variant="primary">
                Ver Detalle
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
