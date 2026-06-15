import { useState, Fragment } from "react";
import {
  ChevronDown,
  ChevronUp,
  LogIn,
  LogOut,
  Activity,
  UserPlus,
  UserCheck,
  UserX,
  UserCog,
  ShieldCheck,
  Database,
  Hash,
  FileCheck,
  Key,
  Unlock,
} from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Spinner } from "@/components/ui/Spinner";

// Función para formatear fecha y hora
function formatDateTime(dateString) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date.toLocaleString("es-CL", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

// Componente para mostrar el badge de acción
function ActionBadge({ action }) {
  const config = {
    LOGIN: {
      icon: LogIn,
      label: "LOGIN",
      bg: "bg-emerald-100",
      text: "text-emerald-700",
      border: "border-emerald-200",
    },
    LOGOUT: {
      icon: LogOut,
      label: "LOGOUT",
      bg: "bg-amber-100",
      text: "text-amber-700",
      border: "border-amber-200",
    },
    USUARIO_CREADO: {
      icon: UserPlus,
      label: "USUARIO_CREADO",
      bg: "bg-cyan-100",
      text: "text-cyan-700",
      border: "border-cyan-200",
    },
    USUARIO_ACTIVADO: {
      icon: UserCheck,
      label: "USUARIO_ACTIVADO",
      bg: "bg-teal-100",
      text: "text-teal-700",
      border: "border-teal-200",
    },
    USUARIO_DESACTIVADO: {
      icon: UserX,
      label: "USUARIO_DESACTIVADO",
      bg: "bg-red-100",
      text: "text-red-700",
      border: "border-red-200",
    },
    USUARIO_ACTUALIZADO: {
      icon: UserCog,
      label: "USUARIO_ACTUALIZADO",
      bg: "bg-blue-100",
      text: "text-blue-700",
      border: "border-blue-200",
    },
    ROL_ACTUALIZADO: {
      icon: ShieldCheck,
      label: "ROL_ACTUALIZADO",
      bg: "bg-indigo-100",
      text: "text-indigo-700",
      border: "border-indigo-200",
    },
    PROCESAR_INFRACCION: {
      icon: FileCheck,
      label: "PROCESAR_INFRACCION",
      bg: "bg-orange-100",
      text: "text-orange-700",
      border: "border-orange-200",
    },
    CAMBIO_CLAVE: {
      icon: Key,
      label: "CAMBIO_CLAVE",
      bg: "bg-violet-100",
      text: "text-violet-700",
      border: "border-violet-200",
    },
    SOLICITUD_RECUPERACION_CLAVE: {
      icon: Unlock,
      label: "SOLICITUD_RECUPERACION_CLAVE",
      bg: "bg-pink-100",
      text: "text-pink-700",
      border: "border-pink-200",
    },
    DEFAULT: {
      icon: Activity,
      label: action || "OTRO",
      bg: "bg-slate-100",
      text: "text-slate-700",
      border: "border-slate-200",
    },
  };

  const {
    icon: Icon,
    label,
    bg,
    text,
    border,
  } = config[action] || config.DEFAULT;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border whitespace-nowrap ${bg} ${text} ${border}`}
    >
      <Icon size={12} />
      {label}
    </div>
  );
}

// Componente para mostrar la tabla afectada
function TableBadge({ tabla }) {
  if (!tabla) {
    return <span className="text-xs text-slate-400 italic">No aplica</span>;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <Database size={12} />
      {tabla}
    </div>
  );
}

// Componente para mostrar el ID del registro
function RecordId({ id }) {
  if (!id) {
    return <span className="text-xs text-slate-400 italic">No aplica</span>;
  }

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
      <Hash size={12} />
      {id}
    </div>
  );
}

// Componente para mostrar los detalles expandidos
function AuditDetails({
  detalles,
  accion,
  tabla_afectada,
  id_registro_afectado,
}) {
  if (!detalles || typeof detalles !== "object") {
    return (
      <div className="text-sm text-slate-500 italic">
        Sin detalles disponibles
      </div>
    );
  }

  const entries = Object.entries(detalles);

  return (
    <div className="space-y-4">
      {/* Detalles de la acción */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
        {entries.map(([key, value]) => (
          <div key={key} className="flex flex-col">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
              {key}
            </span>
            <span className="text-sm font-medium text-slate-800 mt-0.5">
              {typeof value === "boolean"
                ? value
                  ? "Sí"
                  : "No"
                : String(value)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function AuditoriasTable({
  loading,
  audits,
  searchQuery,
  userFilter,
  dateRange,
}) {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (index) => {
    setExpandedRows((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const isExpanded = (index) => expandedRows.has(index);

  if (loading && (!audits || audits.length === 0)) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center flex flex-col items-center justify-center gap-3">
          <Spinner size="lg" />
          <p className="text-slate-400 font-medium">Cargando auditorías...</p>
        </div>
      </div>
    );
  }

  if (!loading && (!audits || audits.length === 0)) {
    return (
      <EmptyState
        query={searchQuery}
        filter={userFilter || dateRange?.startDate}
        resource="auditorías"
      />
    );
  }

  return (
    <div className="overflow-auto flex-1">
      <table className="w-full text-left border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
            <th className="px-4 py-4">Usuario</th>
            <th className="px-4 py-4">Acción</th>
            <th className="px-4 py-4">Tabla Afectada</th>
            <th className="px-4 py-4">ID Registro</th>
            <th className="px-4 py-4">Fecha y Hora</th>
            <th className="px-4 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {audits.map((audit, index) => {
            const rowExpanded = isExpanded(index);

            return (
              <Fragment key={index}>
                {/* Fila Principal */}
                <tr className="group hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">
                          {audit.email_usuario?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate max-w-[180px]">
                          {audit.email_usuario || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <ActionBadge action={audit.accion} />
                  </td>
                  <td className="px-4 py-4">
                    <TableBadge tabla={audit.tabla_afectada} />
                  </td>
                  <td className="px-4 py-4">
                    <RecordId id={audit.id_registro_afectado} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 font-medium whitespace-nowrap">
                        {formatDateTime(audit.fecha_hora)}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button
                      onClick={() => toggleRow(index)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        rowExpanded
                          ? "bg-primary text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                      title={rowExpanded ? "Ocultar detalles" : "Ver detalles"}
                    >
                      {rowExpanded ? (
                        <>
                          <ChevronUp size={14} />
                          Ocultar
                        </>
                      ) : (
                        <>
                          <ChevronDown size={14} />
                          Ver detalles
                        </>
                      )}
                    </button>
                  </td>
                </tr>

                {/* Fila de Detalles (solo si está expandida) */}
                {rowExpanded && (
                  <tr>
                    <td colSpan={6} className="p-0 border-0">
                      <div className="px-4 py-3 bg-slate-50/50">
                        <div className="pl-14 pr-4">
                          <AuditDetails
                            detalles={audit.detalles}
                            accion={audit.accion}
                            tabla_afectada={audit.tabla_afectada}
                            id_registro_afectado={audit.id_registro_afectado}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
