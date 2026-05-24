import { Shield, ShieldOff, Clock, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';

const statusConfig = {
  active:  { icon: Shield,   label: 'Activo',   bg: 'bg-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  revoked: { icon: ShieldOff,label: 'Revocado', bg: 'bg-red-100',     text: 'text-red-700',     dot: 'bg-red-500' },
  expired: { icon: Clock,    label: 'Expirado', bg: 'bg-amber-100',   text: 'text-amber-700',   dot: 'bg-amber-500' },
};

function StatusPill({ status }) {
  const cfg = statusConfig[status] || statusConfig.expired;
  const Icon = cfg.icon;
  return (
    <div className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold min-w-[88px] ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      <Icon size={12} />
      {cfg.label}
    </div>
  );
}

function maskToken(token) {
  if (!token) return '-';
  return `${token.slice(0, 5)}*****`;
}

export function TokenTable({ loading, filteredTokens, search, onSelect }) {
  return (
    <div className="flex-1 bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col shadow-sm">
      <div className="overflow-auto flex-1">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-bold sticky top-0 z-10">
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">RUT</th>
              <th className="px-6 py-4">Token</th>
              <th className="px-6 py-4">Tipo</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={7} className="px-6 py-24 text-center text-slate-400">
                  Cargando tokens...
                </td>
              </tr>
            ) : filteredTokens.length === 0 ? (
              <tr>
                <td colSpan={7}>
                  <EmptyState query={search} resource="tokens" />
                </td>
              </tr>
            ) : (
              filteredTokens.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50/50 transition-colors group cursor-pointer"
                  onClick={() => onSelect(item)}
                >
                  <td className="px-6 py-4">
                    <p className="text-sm font-mono font-bold text-slate-600">#{item.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-800">
                      {item.userName && item.userLastName
                        ? `${item.userName} ${item.userLastName}`
                        : item.userName || '-'}
                    </p>
                    {item.userEmail && (
                      <p className="text-xs text-slate-400">{item.userEmail}</p>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-slate-600">
                      {item.userRut || '-'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-mono font-bold text-slate-600 tracking-widest">
                      {maskToken(item.token)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-slate-500 uppercase">
                      {item.tokenType || 'Bearer'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusPill status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={(e) => { e.stopPropagation(); onSelect(item); }}
                    >
                      <Eye size={15} />
                      <span className="ml-1.5">Ver Detalle</span>
                    </Button>
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
