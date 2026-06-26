import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';

export function DataTable({
  columns,
  data,
  loading,
  onRowClick,
  emptyQuery,
  emptyFilter,
  resourceLabel = 'elementos',
}) {
  if (!loading && data.length === 0) {
    return <EmptyState query={emptyQuery} filter={emptyFilter} resource={resourceLabel} />;
  }

  return (
    <table className="w-full text-left border-collapse min-w-[640px]">
      <thead>
        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0">
          {columns.map((col) => (
            <th key={col.key} className={`px-5 py-4 ${col.className || ''}`}>
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {loading ? (
          <tr>
            <td colSpan={columns.length} className="px-5 py-24">
              <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                <Spinner />
                <span className="text-sm font-medium">Cargando...</span>
              </div>
            </td>
          </tr>
        ) : (
          data.map((row, i) => (
            <tr
              key={row.id ?? i}
              className={`hover:bg-slate-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={`px-5 py-4 ${col.tdClass || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
