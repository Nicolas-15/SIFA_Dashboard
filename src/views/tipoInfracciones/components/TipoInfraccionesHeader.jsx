import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function TipoInfraccionesHeader({ search, setSearch, onNew, isAdmin }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Tipos de Infracciones</h2>
        <p className="text-sm text-slate-500">Administra los tipos de infracciones del sistema.</p>
      </div>
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar tipo de infracción..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={Search}
          className="w-64 !py-2"
        />
        {isAdmin && (
          <Button onClick={onNew} className="!w-auto px-4 !py-2.5">
            <Plus size={18} /> Nuevo Tipo
          </Button>
        )}
      </div>
    </div>
  );
}