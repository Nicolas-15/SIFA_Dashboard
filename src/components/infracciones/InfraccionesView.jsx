import { useState, useEffect } from 'react';
import { Search, X, Receipt } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { EmptyState } from '../ui/EmptyState';
import { InfractionModal } from './InfractionModal';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'accepted', label: 'Aceptada' },
  { key: 'exported', label: 'Exportada' },
  { key: 'rejected', label: 'Rechazada' },
];

export function InfraccionesView({ infractions, updateStatus, updateInfraction, showToast, headerSearch = '', onClearHeaderSearch, currentUser }) {
  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(headerSearch);
  const [activeFilter, setActiveFilter] = useState('all');

  /* Sincronizar con el buscador del header cuando cambia */
  useEffect(() => {
    setSearchQuery(headerSearch);
  }, [headerSearch]);

  /* La infracción seleccionada siempre refleja el estado más reciente */
  const selectedInfraction = infractions.find(i => i.id === selectedId) ?? null;

  const filters = FILTERS.map(f => ({
    ...f,
    count: f.key === 'all'
      ? infractions.length
      : infractions.filter(i => i.status === f.key).length,
  }));

  const filtered = infractions.filter(inf => {
    const q = searchQuery.toLowerCase();
    const matchSearch = !q
      || (inf.vehicle?.plate || '').toLowerCase().includes(q)
      || (inf.infractionDescription || '').toLowerCase().includes(q)
      || (inf.numeroBoleta || '').toLowerCase().includes(q)
      || (inf.numeroParte || '').toLowerCase().includes(q);
    const matchFilter = activeFilter === 'all' || inf.status === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-800">Registro de Infracciones</h2>
        <p className="text-sm text-slate-500 mt-0.5">{infractions.length} infracciones registradas</p>
      </div>

      {/* Buscador + filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-slate-200 shadow-sm sm:w-72">
          <Search size={15} className="text-slate-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por patente, tipo o ID…"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="bg-transparent border-none outline-none text-sm text-slate-800 w-full placeholder:text-slate-400"
          />
          {searchQuery && (
            <button onClick={() => { setSearchQuery(''); onClearHeaderSearch?.(); }} className="text-slate-400 hover:text-slate-600 ml-1 shrink-0">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filtros de estado */}
        <div className="flex gap-2 flex-wrap">
          {filters.map(f => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-all duration-150
                ${activeFilter === f.key
                  ? 'bg-primary text-white border-primary shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-primary/40 hover:text-primary'
                }`}
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {f.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Tabla — solo md+ ── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-auto h-full">
          {filtered.length === 0
            ? <EmptyState query={searchQuery} filter={activeFilter} />
            : (
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
                        P: {inf.numeroParte}<br/>
                        <span className="text-xs text-slate-400 font-normal">B: {inf.numeroBoleta}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
                          {inf.vehicle?.plate}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="max-w-[150px] truncate" title={inf.infractionDescription}>
                          <span className="text-xs font-bold text-primary mr-1">Cod {inf.infractionCode}</span>
                          <span className="text-sm font-medium text-slate-700">{inf.infractionDescription}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600 font-semibold">
                        {inf.tramitacion?.fechaCitacion}
                      </td>
                      <td className="px-5 py-4"><StatusBadge status={inf.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button className="bg-primary hover:bg-primary-dark text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                          Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )
          }
        </div>
      </div>

      {/* ── Tarjetas — solo móvil ── */}
      <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
        {filtered.length === 0
          ? <EmptyState query={searchQuery} filter={activeFilter} />
          : filtered.map(inf => (
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
          ))
        }
      </div>

      {/* Modal */}
      {selectedInfraction && (
        <InfractionModal
          infraction={selectedInfraction}
          updateStatus={updateStatus}
          updateInfraction={updateInfraction}
          showToast={showToast}
          onClose={() => setSelectedId(null)}
          currentUser={currentUser}
        />
      )}
    </div>
  );
}
