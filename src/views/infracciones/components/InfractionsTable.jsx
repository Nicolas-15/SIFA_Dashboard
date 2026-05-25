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
    key: 'date',
    label: 'F. Emisión',
    tdClass: 'whitespace-nowrap',
    render: (inf) => (
      <span className="text-sm text-slate-600 font-semibold">
        {parseISODateTime(inf.fecha)}
      </span>
    ),
  },
  {
    key: 'fiscalizador',
    label: 'Fiscalizador',
    render: (inf) => (
      <span className="text-sm text-slate-600 font-medium max-w-[140px] truncate block" title={inf.idFiscalizador}>
        {inf.idFiscalizador || '-'}
      </span>
    ),
  },
  {
    key: 'status',
    label: 'Estado',
    render: (inf) => <StatusBadge status={inf.status} />,
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
