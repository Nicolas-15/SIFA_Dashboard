import { useState } from 'react';
import { Search, X, RefreshCw } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export function InfractionsFilters({
  searchQuery,
  setSearchQuery,
  filters,
  activeFilter,
  setActiveFilter,
  onClearHeaderSearch,
  onRefresh
}) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="sm:w-72">
        <Input
          icon={Search}
          type="text"
          placeholder="Buscar por patente, tipo o ID…"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className={searchQuery ? '!pr-8' : ''}
        />
      </div>

      {/* Filtros de estado + botón actualizar */}
      <div className="flex gap-2 flex-wrap items-center">
        {filters.map(f => (
          <Button
            key={f.key}
            size="sm"
            variant={activeFilter === f.key ? 'primary' : 'outline'}
            onClick={() => setActiveFilter(f.key)}
            className="flex items-center gap-1.5"
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
              ${activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {f.count}
            </span>
          </Button>
        ))}
        {searchQuery && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => { setSearchQuery(''); onClearHeaderSearch?.(); }}
            title="Limpiar búsqueda"
          >
            <X size={14} />
          </Button>
        )}
        <Button
          size="sm"
          variant="outline"
          onClick={handleRefresh}
          title="Actualizar infracciones"
          className="ml-auto"
        >
          <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </Button>
      </div>
    </div>
  );
}
