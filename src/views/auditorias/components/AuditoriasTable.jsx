import { useState, Fragment } from "react";
import { ChevronDown, ChevronUp, LogIn, LogOut, Activity } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";

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
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${bg} ${text} ${border}`}
    >
      <Icon size={12} />
      {label}
    </div>
  );
}

// Componente para mostrar los detalles expandidos
function AuditDetails({ detalles }) {
  if (!detalles || typeof detalles !== "object") {
    return (
      <div className="text-sm text-slate-500 italic">
        Sin detalles disponibles
      </div>
    );
  }

  const entries = Object.entries(detalles);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
      {entries.map(([key, value]) => (
        <div key={key} className="flex flex-col">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            {key}
          </span>
          <span className="text-sm font-medium text-slate-800 mt-0.5">
            {typeof value === "boolean" ? (value ? "Sí" : "No") : String(value)}
          </span>
        </div>
      ))}
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
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-slate-200 border-t-primary rounded-full animate-spin mx-auto mb-4" />
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
      <table className="w-full text-left border-collapse min-w-[700px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider sticky top-0 z-10">
            <th className="px-6 py-4">Usuario</th>
            <th className="px-6 py-4">Acción</th>
            <th className="px-6 py-4">Fecha y Hora</th>
            <th className="px-6 py-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {audits.map((audit, index) => {
            const rowExpanded = isExpanded(index);

            return (
              <Fragment key={index}>
                {/* Fila Principal */}
                <tr className="group hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold text-slate-600">
                          {audit.email_usuario?.charAt(0).toUpperCase() || "U"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {audit.email_usuario || "-"}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ActionBadge action={audit.accion} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm text-slate-600 font-medium">
                        {formatDateTime(audit.fecha_hora)}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
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
                    <td colSpan={4} className="p-0 border-0">
                      <div className="px-6 py-3 bg-slate-50/50">
                        <div className="pl-12 pr-4">
                          <AuditDetails detalles={audit.detalles} />
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
