import { Shield, ShieldOff, Clock, Eye } from 'lucide-react';
import { DataTable } from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";

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

const columns = [
  {
    key: 'id',
    label: 'ID',
    render: (item) => <span className="text-sm font-mono font-bold text-slate-600">#{item.id}</span>,
  },
  {
    key: 'user',
    label: 'Usuario',
    render: (item) => (
      <>
        <p className="text-sm font-bold text-slate-800">
          {item.userName && item.userLastName
            ? `${item.userName} ${item.userLastName}`
            : item.userName || '-'}
        </p>
        {item.userEmail && (
          <p className="text-xs text-slate-400">{item.userEmail}</p>
        )}
      </>
    ),
  },
  {
    key: 'rut',
    label: 'RUT',
    render: (item) => (
      <span className="text-sm font-mono font-bold text-slate-600">
        {item.userRut || '-'}
      </span>
    ),
  },
  {
    key: 'token',
    label: 'Token',
    render: (item) => (
      <span className="text-sm font-mono font-bold text-slate-600 tracking-widest">
        {maskToken(item.token)}
      </span>
    ),
  },
  {
    key: 'type',
    label: 'Tipo',
    render: (item) => (
      <span className="text-xs font-semibold text-slate-500 uppercase">
        {item.tokenType || 'Bearer'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    render: (item) => <StatusPill status={item.status} />,
  },
  {
    key: 'actions',
    label: 'Acciones',
    className: 'text-center',
    tdClass: 'text-center',
    render: () => (
      <Button size="sm" variant="primary">
        <Eye size={15} />
        <span className="ml-1.5">Ver Detalle</span>
      </Button>
    ),
  },
];

export function TokensTable({
  filtered,
  searchQuery,
  activeFilter,
  setSelectedItem,
}) {
  return (
    <DataTable
      columns={columns}
      data={filtered}
      onRowClick={(item) => setSelectedItem(item)}
      emptyQuery={searchQuery}
      emptyFilter={activeFilter}
      resourceLabel="tokens"
    />
  );
}
