import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/ui/DataTable";
import { parseISODateTime } from "@/views/infracciones/utils/infractionFormatters";
import { CalendarClock } from "lucide-react";

function formatFechaCitacion(fecha) {
  if (!fecha) return "No definida";
  return parseISODateTime(fecha);
}

function isFuture(fecha) {
  if (!fecha) return false;
  return new Date(fecha) >= new Date();
}

const columns = [
  {
    key: 'idCitacion',
    label: 'ID',
    render: (row) => (
      <span className="text-sm text-slate-600 font-bold">{row.idCitacion}</span>
    ),
  },
  {
    key: 'plate',
    label: 'Patente',
    render: (row) => (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700 text-white font-mono text-sm font-bold tracking-widest uppercase">
        {row.infraccion?.vehicle?.plate || '-'}
      </span>
    ),
  },
  {
    key: 'infractor',
    label: 'Infractor',
    render: (row) => {
      const prop = row.infraccion?.propietario;
      return (
        <div className="max-w-[200px]">
          <p className="text-sm font-bold text-slate-800 truncate">
            {prop?.nombreCompleto || '-'}
          </p>
          <p className="text-xs text-slate-400 font-medium">
            {prop?.rut || '-'}
          </p>
        </div>
      );
    },
  },
  {
    key: 'tipoInfraccion',
    label: 'Infracción',
    render: (row) => {
      const tipo = row.infraccion?.tipoInfraccion;
      return (
        <div className="max-w-[250px]">
          <p className="text-sm font-bold text-slate-800 truncate">
            {tipo ? `${tipo.id} - ${tipo.nombre}` : '-'}
          </p>
        </div>
      );
    },
  },
  {
    key: 'fechaCitacion',
    label: 'Fecha Citación',
    tdClass: 'whitespace-nowrap',
    render: (row) => {
      const upcoming = isFuture(row.fecha);
      return (
        <div className="flex items-center gap-2">
          <CalendarClock size={14} className={upcoming ? 'text-primary' : 'text-slate-400'} />
          <span className={`text-sm font-semibold ${upcoming ? 'text-primary' : 'text-slate-500'}`}>
            {formatFechaCitacion(row.fecha)}
          </span>
        </div>
      );
    },
  },
  {
    key: 'status',
    label: 'Estado Infracción',
    render: (row) => <StatusBadge status={row.infraccion?.status} />,
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

export function CitacionesTable({ filtered, searchQuery, activeFilter, onSelectCitacion }) {
  return (
    <DataTable
      columns={columns}
      data={filtered}
      onRowClick={(row) => onSelectCitacion(row)}
      emptyQuery={searchQuery}
      emptyFilter={activeFilter}
      resourceLabel="citaciones"
    />
  );
}
