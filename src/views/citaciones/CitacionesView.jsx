import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Pagination } from '@/components/ui/Pagination';
import { TableCard } from '@/components/ui/TableCard';
import { ListView } from '@/components/ui/ListView';

import { useCitaciones } from '@/core/useCitaciones';
import { CitacionesFilters } from './components/CitacionesFilters';
import { CitacionesTable } from './components/CitacionesTable';
import { CitacionesMobileCards } from './components/CitacionesMobileCards';
import { CitacionModal } from './CitacionModal';

export function CitacionesView() {
  const { showToast, currentUser } = useOutletContext();
  const {
    citaciones, loading, error, fetchCitaciones, reprogramar,
    page, totalPages, totalElements, size, first, last,
    goToPage, nextPage, prevPage,
    dateRange, setDateRange, searchQuery, setSearchQuery,
    activeFilter, setActiveFilter, clearFilters,
  } = useCitaciones();

  const [selectedCitacion, setSelectedCitacion] = useState(null);

  const mobilePagination = (
    <div className="pt-2 text-center">
      <p className="text-xs text-slate-500 font-medium pb-1">
        {totalElements > 0
          ? `${totalElements} citaciones registradas${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
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
    showToast("Reintentando conexión con el servidor de citaciones...", "info");
    fetchCitaciones();
  };

  return (
    <ListView
      loadingLabel="citaciones"
      title="Citaciones JPL"
      error={error}
      onRetry={handleRetry}
      filters={
        <CitacionesFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          activeFilter={activeFilter}
          setActiveFilter={setActiveFilter}
          onRefresh={fetchCitaciones}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          onClearFilters={clearFilters}
          totalElements={totalElements}
        />
      }
      loading={loading}
      hasExistingData={citaciones.length > 0}
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
          resourceLabel="citaciones registradas"
        >
          <CitacionesTable
            filtered={citaciones}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onSelectCitacion={setSelectedCitacion}
          />
        </TableCard>
      }
      mobile={
        <>
          <CitacionesMobileCards
            filtered={citaciones}
            searchQuery={searchQuery}
            activeFilter={activeFilter}
            onSelectCitacion={setSelectedCitacion}
          />
          {mobilePagination}
        </>
      }
    >
      {selectedCitacion && (
        <CitacionModal
          citacion={selectedCitacion}
          onClose={() => setSelectedCitacion(null)}
          onReprogramar={reprogramar}
          showToast={showToast}
          currentUser={currentUser}
        />
      )}
    </ListView>
  );
}
