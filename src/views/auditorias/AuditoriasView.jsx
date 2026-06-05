import { TableCard } from "@/components/ui/TableCard";
import { ListView } from "@/components/ui/ListView";
import { Pagination } from "@/components/ui/Pagination";
import { useAudits } from "@/core/useAudits";

import { AuditoriasFilters } from "./components/AuditoriasFilters";
import { AuditoriasTable } from "./components/AuditoriasTable";

export function AuditoriasView() {
  const {
    audits,
    loading,
    fetchAudits,
    page,
    totalPages,
    totalElements,
    size,
    first,
    last,
    goToPage,
    dateRange,
    setDateRange,
    userFilter,
    setUserFilter,
    searchQuery,
    setSearchQuery,
    clearFilters,
  } = useAudits();

  const mobilePagination = (
    <div className="pt-2 text-center">
      <p className="text-xs text-slate-500 font-medium pb-1">
        {totalElements > 0
          ? `${totalElements} auditorías registradas${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ""}`
          : ""}
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

  return (
    <ListView
      title="Registro de Auditorías"
      filters={
        <AuditoriasFilters
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onRefresh={fetchAudits}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
          userFilter={userFilter}
          onUserFilterChange={setUserFilter}
          onClearFilters={clearFilters}
          audits={audits}
        />
      }
      loading={loading}
      hasExistingData={audits.length > 0 || totalElements > 0}
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
          resourceLabel="auditorías registradas"
        >
          <AuditoriasTable
            loading={loading}
            audits={audits}
            searchQuery={searchQuery}
            userFilter={userFilter}
            dateRange={dateRange}
          />
        </TableCard>
      }
      mobile={
        <>
          <AuditoriasTable
            loading={loading}
            audits={audits}
            searchQuery={searchQuery}
            userFilter={userFilter}
            dateRange={dateRange}
          />
          {mobilePagination}
        </>
      }
    />
  );
}
