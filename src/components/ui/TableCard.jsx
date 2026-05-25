import { Pagination } from '@/components/ui/Pagination';

export function TableCard({
  children,
  totalElements,
  totalPages,
  page,
  first,
  last,
  loading,
  onPageChange,
  resourceLabel = 'elementos',
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1">
      <div className="overflow-auto" style={{ maxHeight: 'calc(100vh - 320px)' }}>
        {children}
      </div>

      <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200">
        <p className="text-sm text-slate-500">
          {totalElements > 0
            ? `${totalElements} ${resourceLabel}${totalPages > 1 ? ` (pág. ${page + 1} de ${totalPages})` : ''}`
            : ''
          }
        </p>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalElements={totalElements}
          first={first}
          last={last}
          onPageChange={onPageChange}
          loading={loading}
          noBorder
        />
      </div>
    </div>
  );
}
