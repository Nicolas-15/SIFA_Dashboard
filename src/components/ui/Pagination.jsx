import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './Button';

export function Pagination({ page, totalPages, totalElements, first, last, onPageChange, loading, noBorder }) {
  if (totalPages <= 1 && totalElements === 0) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(0, page - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible);

    if (end - start < maxVisible) {
      start = Math.max(0, end - maxVisible);
    }

    for (let i = start; i < end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className={`flex items-center justify-between px-2 py-3 ${noBorder ? '' : 'border-t border-slate-200'}`}>
      <p className="text-xs text-slate-500 font-medium">
        {totalElements === 0
          ? 'Sin resultados'
          : `${page * 10 + 1}-${Math.min((page + 1) * 10, totalElements)} de ${totalElements} resultados`
        }
      </p>

      <div className="flex items-center gap-1.5">
        <Button
          size="sm"
          variant="outline"
          disabled={first || loading}
          onClick={() => onPageChange(page - 1)}
          className="!px-2.5"
        >
          <ChevronLeft size={15} />
          <span className="hidden sm:inline ml-1">Anterior</span>
        </Button>

        {getPageNumbers().map((p) => (
          <Button
            key={p}
            size="sm"
            variant={p === page ? 'primary' : 'outline'}
            disabled={loading}
            onClick={() => onPageChange(p)}
            className="!px-3 min-w-[32px]"
          >
            {p + 1}
          </Button>
        ))}

        <Button
          size="sm"
          variant="outline"
          disabled={last || loading}
          onClick={() => onPageChange(page + 1)}
          className="!px-2.5"
        >
          <span className="hidden sm:inline mr-1">Siguiente</span>
          <ChevronRight size={15} />
        </Button>
      </div>
    </div>
  );
}
