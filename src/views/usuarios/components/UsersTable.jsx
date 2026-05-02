import { User, CheckCircle2, XCircle, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { SYSTEM_ROLES } from '@/constants/roles';

export function UsersTable({ loading, filteredUsers, search, currentUser, toggleStatus, handleEditClick }) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold">
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
              <tr><td colSpan="7" className="px-6 py-24 text-center text-slate-400">Cargando usuarios reales...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="7">
                  <EmptyState query={search} />
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
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
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold ${user.role === SYSTEM_ROLES.ADMIN ? 'bg-purple-100 text-purple-700' :
                      user.role === SYSTEM_ROLES.SUPERVISOR ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                      }`}>{user.role}</span>
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
                        onClick={() => toggleStatus(user.id, user.status)}
                        disabled={user.email === currentUser?.email}
                        className={user.email === currentUser?.email ? 'opacity-40 cursor-not-allowed' : ''}
                      >
                        {user.status === 'active' ? 'Revocar' : 'Activar'}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEditClick(user)}
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
    </div>
  );
}
