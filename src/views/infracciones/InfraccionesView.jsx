import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pagination } from '@/components/ui/Pagination';

import { InfractionsFilters } from './components/InfractionsFilters';
import { InfractionsTable } from './components/InfractionsTable';
import { InfractionsMobileCards } from './components/InfractionsMobileCards';
import { InfractionModal } from './InfractionModal';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'pending', label: 'Pendiente' },
  { key: 'accepted', label: 'Aceptada' },
  { key: 'exported', label: 'Exportada' },
  { key: 'rejected', label: 'Rechazada' },
];

export function InfraccionesView() {
  const {
    infractions, updateStatus, saveInfractionEdit: updateInfraction, showToast,
    headerSearch, onClearHeaderSearch, fetchInfractions: onRefresh, currentUser,
    loading, page, totalPages, totalElements, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange, userFilter, setUserFilter, clearFilters,
  } = useOutletContext();

  const [selectedId, setSelectedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState(headerSearch);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => {
    setSearchQuery(headerSearch);
  }, [headerSearch]);

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
      <h2 className="text-xl md:text-2xl font-bold text-slate-800">Registro de Infracciones</h2>

      <InfractionsFilters
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        filters={filters}
        activeFilter={activeFilter}
        setActiveFilter={setActiveFilter}
        onClearHeaderSearch={onClearHeaderSearch}
        onRefresh={onRefresh}
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        userFilter={userFilter}
        onUserFilterChange={setUserFilter}
        onClearFilters={clearFilters}
        infractions={infractions}
      />

      {/* Overlay de carga para cambios de página/filtro */}
      <div className="relative">
        {loading && infractions.length > 0 && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {/* Tabla — solo md+ */}
        <div className="hidden md:block bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
          <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
            <InfractionsTable
              filtered={filtered}
              searchQuery={searchQuery}
              activeFilter={activeFilter}
              setSelectedId={setSelectedId}
            />
          </div>

          {/* Paginación en escritorio */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
            <p className="text-sm text-slate-500">
              {totalElements > 0
                ? `${totalElements} infracciones registradas${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
                : ''
              }
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              first={first}
              last={last}
              onPageChange={goToPage}
              loading={loading}
              noBorder
            />
          </div>
        </div>

        {/* Tarjetas — solo móvil */}
        <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
          <InfractionsMobileCards
            filtered={filtered}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            setSelectedId={setSelectedId}
          />

          {/* Paginación en móvil */}
          <div className="pt-2 text-center">
            <p className="text-xs text-slate-500 font-medium pb-1">
              {totalElements > 0
                ? `${totalElements} infracciones registradas${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
                : ''
              }
            </p>
            <Pagination
              page={page}
              totalPages={totalPages}
              totalElements={totalElements}
              first={first}
              last={last}
              onPageChange={goToPage}
              loading={loading}
            />
          </div>
        </div>
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
