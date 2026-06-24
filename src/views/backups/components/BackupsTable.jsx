import { Download, Trash2, ShieldCheck, CalendarDays, Clock, Weight, FileText, Upload, User, HardDrive } from "lucide-react";
import { EmptyState } from "@/components/ui/EmptyState";
import { Card } from "@/components/ui/Card";
import { mapDbName, formatSize, formatSource, formatDate } from "../utils";

export function BackupsTable({ backups, downloading, onDownload, onRestoreSafe, onDelete }) {
  if (backups.length === 0) {
    return <EmptyState resource="backups" />;
  }

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              <th className="px-6 py-4">Fecha / Hora</th>
              <th className="px-6 py-4">Contenido</th>
              <th className="px-6 py-4">Detalles</th>
              <th className="px-6 py-4">Descripción</th>
              <th className="px-6 py-4 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {backups.map((backup) => {
              const parts = formatDate(backup.createdAt);

              return (
                <tr key={backup.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                        <CalendarDays size={13} className="text-slate-400 shrink-0" />
                        {parts?.date || backup.id}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={11} className="text-slate-400 shrink-0" />
                        {parts?.time || "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center flex-wrap gap-1.5">
                      {backup.databases?.length
                        ? backup.databases.map((db) => (
                          <span key={db} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                            {mapDbName(db)}
                          </span>
                        ))
                        : <span className="text-sm text-slate-400">—</span>
                      }
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                        Storage
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <User size={11} className="text-slate-400 shrink-0" />
                        {backup.createdBy || "—"}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        {backup.source ? (
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            backup.source === "uploaded" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                          }`}>
                            {backup.source === "uploaded" ? <Upload size={12} /> : <HardDrive size={12} />}
                            {formatSource(backup.source)}
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                          <Weight size={11} className="shrink-0" />
                          {formatSize(backup.totalSizeBytes)}
                        </span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 max-w-[200px]">
                    <span className="inline-flex items-center gap-1.5 text-sm text-slate-600 truncate block" title={backup.description || ""}>
                      {backup.description ? <><FileText size={13} className="text-slate-400 shrink-0" />{backup.description}</> : "—"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        title={downloading === backup.id ? "Descargando..." : "Descargar"}
                        onClick={() => onDownload(backup.id)}
                        disabled={downloading === backup.id}
                        className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all ${downloading === backup.id
                            ? "text-primary animate-pulse bg-primary/5 cursor-wait"
                            : "text-slate-400 hover:text-primary hover:bg-primary/5"
                          }`}
                      >
                        {downloading === backup.id ? (
                          <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                        ) : (
                          <Download size={16} />
                        )}
                      </button>
                      <button
                        title="Restaurar (seguro)"
                        onClick={() => onRestoreSafe(backup)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-all"
                      >
                        <ShieldCheck size={16} />
                      </button>
                      <button
                        title="Eliminar"
                        onClick={() => onDelete(backup)}
                        className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
