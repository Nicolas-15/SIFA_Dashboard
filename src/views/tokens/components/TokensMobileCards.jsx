import { Shield, ShieldOff, Clock, Key, RefreshCw, Lock, Mail, User, CreditCard } from 'lucide-react';
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

            {item.userEmail && (
              <p className="flex items-center gap-1.5 text-sm font-bold text-slate-800">
                <Mail size={14} className="text-slate-400 shrink-0" />
                {item.userEmail}
              </p>
            )}

            <p className="flex items-center gap-1.5 text-xs text-slate-400 mt-0.5">
              <User size={14} className="text-slate-400 shrink-0" />
              {item.userName && item.userLastName
                ? `${item.userName} ${item.userLastName}`
                : item.userName || '-'}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1.5 font-mono">
                <CreditCard size={14} className="text-slate-400 shrink-0" />
                {item.userRut || '-'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 uppercase">
                {(item.tokenType || '').toLowerCase() === 'access' ? <Lock size={13} /> :
                 (item.tokenType || '').toLowerCase() === 'refresh' ? <RefreshCw size={13} /> :
                 <Key size={13} />}
                {(item.tokenType || '').toLowerCase() === 'access' ? 'Access' :
                 (item.tokenType || '').toLowerCase() === 'refresh' ? 'Refresh' :
                 'Bearer'}
              </span>
              <span className="text-slate-300">|</span>
              <span className="font-mono tracking-widest">{maskToken(item.token)}</span>
            </div>

            <span className="mt-2 inline-block text-xs font-semibold border border-slate-200 bg-white text-slate-600 hover:border-primary/40 hover:text-primary rounded-lg px-3 py-1.5 transition-colors">Ver detalle →</span>
          </button>
        );
      })}
    </>
  );
}
