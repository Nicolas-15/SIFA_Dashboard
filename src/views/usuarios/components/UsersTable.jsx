import { User, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Spinner } from '@/components/ui/Spinner';
import { SYSTEM_ROLES } from '@/constants/roles';

export function UsersTable({ loading, filteredUsers, search, currentUser, toggleStatus, handleEditClick }) {
  const getRoleBadgeStyles = (role) => {
    const styles = {
      [SYSTEM_ROLES.ADMIN]:      'bg-purple-100 text-purple-700',
      [SYSTEM_ROLES.SUPERVISOR]: 'bg-blue-100 text-blue-700',
      [SYSTEM_ROLES.USER_APP]:   'bg-emerald-100 text-emerald-700',
    };
    return styles[role] || 'bg-amber-100 text-amber-700';
  };

  return (
    <div className="flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 z-10">
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">RUT</th>
              <th className="px-6 py-4">Contacto</th>
              <th className="px-6 py-4">Rol</th>
              <th className="px-6 py-4">Creado el</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-24">
                  <div className="flex flex-col items-center justify-center gap-3 text-slate-400">
                    <Spinner />
                    <span className="text-sm font-medium">Cargando usuarios...</span>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState query={search} resource="usuarios" />
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group cursor-pointer" onClick={() => handleEditClick(user)}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <User size={18} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800">{user.name} {user.lastname}</p>
                        <p className="text-[11px] text-slate-500 font-mono">ID: {user.id.split('-')[0]}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-600">{user.rut}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-700">{user.email}</p>
                    <p className="text-xs text-slate-400">{user.phone}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${getRoleBadgeStyles(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Pendiente'}</td>
                  <td className="px-6 py-4">
                    {user.status === 'active' ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm"><CheckCircle2 size={16} /> Activo</div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm"><XCircle size={16} /> Revocado</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        size="sm"
                        variant={user.status === 'active' ? 'warning' : 'success'}
                        onClick={(e) => { e.stopPropagation(); toggleStatus(user.id, user.status); }}
                        disabled={user.email === currentUser?.email}
                        className={user.email === currentUser?.email ? 'opacity-40 cursor-not-allowed' : ''}
                      >
                        {user.status === 'active' ? 'Revocar' : 'Activar'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={(e) => { e.stopPropagation(); handleEditClick(user); }}
                        title="Editar usuario"
                      >
                        <Edit2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}
