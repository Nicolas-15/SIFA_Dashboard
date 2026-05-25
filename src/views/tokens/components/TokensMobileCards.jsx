import { Shield, ShieldOff, Clock } from 'lucide-react';
import { EmptyState } from '@/components/ui/EmptyState';

const statusConfig = {
  active:  { icon: Shield,   label: 'Activo',   bg: 'bg-emerald-100', text: 'text-emerald-700' },
  revoked: { icon: ShieldOff,label: 'Revocado', bg: 'bg-red-100',     text: 'text-red-700'     },
  expired: { icon: Clock,    label: 'Expirado', bg: 'bg-amber-100',   text: 'text-amber-700'   },
};

function StatusBadge({ status }) {
  const cfg = statusConfig[status] || statusConfig.expired;
  const Icon = cfg.icon;
  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${cfg.bg} ${cfg.text}`}>
      <Icon size={11} />
      {cfg.label}
    </div>
  );
}

function maskToken(token) {
  if (!token) return '-';
  return `${token.slice(0, 5)}*****`;
}

export function TokensMobileCards({ filtered, searchQuery, activeFilter, setSelectedItem }) {
  if (filtered.length === 0) {
    return <EmptyState query={searchQuery} filter={activeFilter} resource="tokens" />;
  }

  return (
    <>
      {filtered.map(item => {
        return (
          <button
            key={item.id}
            onClick={() => setSelectedItem(item)}
            className="w-full text-left bg-white border border-slate-200 rounded-xl p-4 shadow-sm active:bg-slate-50 transition-colors"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-mono font-bold text-slate-600">#{item.id}</span>
              <StatusBadge status={item.status} />
            </div>

            <p className="text-sm font-bold text-slate-800">
              {item.userName && item.userLastName
                ? `${item.userName} ${item.userLastName}`
                : item.userName || '-'}
            </p>

            {item.userEmail && (
              <p className="text-xs text-slate-400 mt-0.5">{item.userEmail}</p>
            )}

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="font-mono">{item.userRut || '-'}</span>
              <span className="text-slate-300">|</span>
              <span className="uppercase">{item.tokenType || 'Bearer'}</span>
              <span className="text-slate-300">|</span>
              <span className="font-mono tracking-widest">{maskToken(item.token)}</span>
            </div>

            <span className="text-xs font-bold text-primary mt-2 block">Ver detalle →</span>
          </button>
        );
      })}
    </>
  );
}
