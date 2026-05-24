import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';

export function TokenHeader({ search, setSearch }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Tokens de Acceso</h2>
        <p className="text-sm text-slate-500">Administra los tokens JWT activos del sistema.</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Input
            placeholder="Buscar por usuario, RUT o email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            icon={Search}
            className="w-64 !py-2"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
