import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { parseISODateTime } from "@/views/infracciones/utils/infractionFormatters";

const columns = [
  {
    key: 'id',
    label: 'ID',
    render: (inf) => <span className="text-sm text-slate-600 font-bold">{inf.id}</span>,
  },
  {
    key: 'plate',
    label: 'Patente',
    render: (inf) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
        {inf.vehicle?.plate}
      </span>
    ),
  },
  {
    key: 'infraction',
    label: 'Infracción',
    render: (inf) => (
      <div className="max-w-[300px]">
        <p className="text-sm font-bold text-slate-800">
          {inf.tipoInfraccion.id} - {inf.tipoInfraccion.nombre}
        </p>
        <p
          className="text-xs text-slate-400 font-medium truncate"
          title={inf.tipoInfraccion.disposicionInfringida}
        >
          {inf.tipoInfraccion.disposicionInfringida}
        </p>
      </div>
    ),
  },
  {
    key: 'emision',
    label: 'F. Emisión / Fiscalizador',
    tdClass: 'whitespace-nowrap',
    render: (inf) => (
      <div className="flex flex-col">
        <span className="text-sm text-slate-600 font-semibold leading-tight">
          {parseISODateTime(inf.fecha)}
        </span>
        <span className="text-xs text-slate-400 font-medium leading-tight mt-0.5">
          {inf.idFiscalizador || '-'}
        </span>
      </div>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    render: (inf) => <StatusBadge status={inf.status} />,
  },
  {
    key: 'fotos',
    label: 'Fotos',
    render: (inf) => {
      const count = inf.evidenceUrls?.length || (inf.photoUrl ? 1 : 0);
      return (
        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${
          count > 0
            ? 'bg-sky-100 text-sky-700'
            : 'bg-slate-100 text-slate-400'
        }`}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            <circle cx="8.5" cy="8.5" r="1.5"/>
            <polyline points="21 15 16 10 5 21"/>
          </svg>
          {count}
        </span>
      );
    },
  },
  {
    key: 'actions',
    label: '',
    tdClass: 'text-right',
    render: () => (
      <Button size="sm" variant="primary">
        Ver Detalle
      </Button>
    ),
  },
];

export function InfractionsTable({
  filtered,
  searchQuery,
  activeFilter,
  setSelectedId,
}) {
  return (
    <DataTable
      columns={columns}
      data={filtered}
      onRowClick={(inf) => setSelectedId(inf.id)}
      emptyQuery={searchQuery}
      emptyFilter={activeFilter}
      resourceLabel="infracciones"
    />
  );
}
