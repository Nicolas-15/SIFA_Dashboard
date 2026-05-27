import { CheckCircle2, XCircle, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

export function TipoInfraccionesTable({ loading, filteredTipoInfracciones, search, handleEditClick, handleDeleteClick, isAdmin }) {
  return (
    <div className="flex-1">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 z-10">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Nombre</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Creado el</th>
              {isAdmin && <th className="px-6 py-4 text-center">Acciones</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr><td colSpan={isAdmin ? 6 : 5} className="px-6 py-24 text-center text-slate-400">Cargando tipos de infracciones...</td></tr>
            ) : filteredTipoInfracciones.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 6 : 5}>
                  <EmptyState query={search} resource="tipos de infracciones" />
                </td>
              </tr>
            ) : (
              filteredTipoInfracciones.map(item => (
                <tr 
                  key={item.id} 
                  className={`hover:bg-slate-50/50 transition-colors group ${isAdmin ? 'cursor-pointer' : ''}`}
                  onClick={isAdmin ? () => handleEditClick(item) : undefined}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-bold text-slate-600">#{item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">{item.nombre}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-600 max-w-xs truncate">{item.descripcion || 'Sin descripción'}</p>
                  </td>
                  <td className="px-6 py-4">
                    {item.habilitado ? (
                      <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm"><CheckCircle2 size={16} /> Habilitado</div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-red-500 font-bold text-sm"><XCircle size={16} /> Deshabilitado</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-400 font-mono">
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-'}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(item); }}
                          title="Eliminar tipo de infracción"
                        >
                          <Trash2 size={16} />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                          title="Editar tipo de infracción"
                        >
                          <Edit2 size={16} />
                        </Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
  );
}