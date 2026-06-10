import { Search, Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function UsersHeader({ search, setSearch, onNewUser, onRefresh, loading }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800">Gestión de Usuarios</h2>
        <p className="text-sm text-slate-500">Administra los accesos y roles del sistema.</p>
      </div>
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar usuario..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          icon={Search}
          className="w-64 !py-2"
        />
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="!w-auto px-4 py-2 flex items-center gap-1.5"
          title="Actualizar usuarios"
        >
          <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </Button>
        <Button onClick={onNewUser} className="!w-auto px-4 !py-2.5">
          <Plus size={18} /> Nuevo Usuario
        </Button>
      </div>
    </div>
  );
}
