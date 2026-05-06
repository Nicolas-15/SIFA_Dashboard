import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

import { InfractionsFilters }     from './components/InfractionsFilters';
import { InfractionsTable }       from './components/InfractionsTable';
import { InfractionsMobileCards } from './components/InfractionsMobileCards';
import { InfractionModal }        from './InfractionModal';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'accepted', label: 'Aceptada' },
  { key: 'exported', label: 'Exportada' },
  { key: 'rejected', label: 'Rechazada' },
];

export function InfraccionesView() {
  const { infractions, updateStatus, saveInfractionEdit: updateInfraction, showToast, headerSearch, onClearHeaderSearch, fetchInfractions: onRefresh, currentUser } = useOutletContext();
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

      <InfractionsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onClearHeaderSearch={onClearHeaderSearch}
        onRefresh={onRefresh}
      />

      {/* ── Tabla — solo md+ ── */}
      <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
        <div className="overflow-auto h-full">
          <InfractionsTable
            filtered={filtered}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            setSelectedId={setSelectedId}
          />
        </div>
      </div>

      {/* ── Tarjetas — solo móvil ── */}
      <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
        <InfractionsMobileCards
          filtered={filtered}
          searchQuery={searchQuery}
          activeFilter={activeFilter}
          setSelectedId={setSelectedId}
        />
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
