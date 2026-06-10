import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pagination } from '@/components/ui/Pagination';
import { TableCard } from '@/components/ui/TableCard';
import { ListView } from '@/components/ui/ListView';

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
    infractions, stats, updateStatus, saveInfractionEdit: updateInfraction, showToast,
    headerSearch, onClearHeaderSearch, fetchInfractions: onRefresh, currentUser,
    loading, error, page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange, userFilter, setUserFilter, clearFilters,
    activeFilter, setActiveFilter, searchQuery, setSearchQuery,
  } = useOutletContext();

  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (headerSearch !== undefined && headerSearch !== searchQuery) {
      setSearchQuery(headerSearch);
    }
  }, [headerSearch, searchQuery, setSearchQuery]);

  const selectedInfraction = infractions.find(i => i.id === selectedId) ?? null;

  const filters = FILTERS.map(f => {
    let count = 0;
    if (f.key === 'all') {
      count = stats?.totalInfracciones ?? 0;
    } else {
      count = stats?.cantidadPorEstado?.[f.key] ?? 0;
    }
    return { ...f, count };
  });

  // Los registros ya vienen filtrados del backend
  const filtered = infractions;

  const mobilePagination = (
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
        size={size}
      />
    </div>
  );

  const handleRetry = () => {
    showToast("Reintentando conexión con el servidor de infracciones...", "info");
    onRefresh();
  };

  return (
    <ListView
      loadingLabel="infracciones"
      title="Registro de Infracciones"
      error={error}
      onRetry={handleRetry}
      filters={
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
      }
      loading={loading}
      hasExistingData={infractions.length > 0}
      table={
        <TableCard
          totalElements={totalElements}
          totalPages={totalPages}
          page={page}
          first={first}
          last={last}
          loading={loading}
          onPageChange={goToPage}
          size={size}
          resourceLabel="infracciones registradas"
        >
          <InfractionsTable
            filtered={filtered}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            setSelectedId={setSelectedId}
          />
        </TableCard>
      }
      mobile={
        <>
          <InfractionsMobileCards
            filtered={filtered}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            setSelectedId={setSelectedId}
          />
          {mobilePagination}
        </>
      }
    >
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
    </ListView>
  );
}
