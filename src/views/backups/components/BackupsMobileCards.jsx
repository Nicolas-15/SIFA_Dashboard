import { CalendarDays, Clock, Weight, FileText, Upload, User, HardDrive, ShieldCheck, Download, Trash2 } from "lucide-react";
import { mapDbName, formatSize, formatSource, formatDate } from "../utils";

export function BackupsMobileCards({ backups, downloading, onDownload, onRestoreSafe, onDelete }) {
  if (backups.length === 0) return null;

  return (
    <div className="space-y-3 pb-4">
      {backups.map((backup) => {
        const parts = formatDate(backup.createdAt);

        return (
          <div
            key={backup.id}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-3"
          >
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-slate-700">
                  <CalendarDays size={13} className="text-slate-400" />
                  {parts?.date || backup.id}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                  <Clock size={11} className="text-slate-400" />
                  {parts?.time || "—"}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <button
                  title="Descargar"
                  onClick={() => onDownload(backup.id)}
                  disabled={downloading === backup.id}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5 transition-all"
                >
                  <Download size={15} />
                </button>
                <button
                  title="Restaurar (seguro)"
                  onClick={() => onRestoreSafe(backup)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 transition-all"
                >
                  <ShieldCheck size={15} />
                </button>
                <button
                  title="Eliminar"
                  onClick={() => onDelete(backup)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-sm text-slate-600">
              <Weight size={12} className="text-slate-400 shrink-0" />
              {formatSize(backup.totalSizeBytes)}
            </div>

            <div className="flex flex-wrap gap-1.5">
              {backup.databases?.length
                ? backup.databases.map((db) => (
                  <span key={db} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                    {mapDbName(db)}
                  </span>
                ))
                : null
              }
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                Storage
              </span>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1 border-t border-slate-100">
              <div className="flex flex-col gap-0.5">
                <span className="inline-flex items-center gap-1">
                  <User size={11} className="text-slate-400" />
                  {backup.createdBy || "—"}
                </span>
                <span>
                  {backup.source ? (
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      backup.source === "uploaded" ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-700"
                    }`}>
                      {backup.source === "uploaded" ? <Upload size={11} /> : <HardDrive size={11} />}
                      {formatSource(backup.source)}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </span>
              </div>
              {backup.description && (
                <span className="inline-flex items-center gap-1 truncate flex-1" title={backup.description}>
                  <FileText size={11} className="text-slate-400 shrink-0" />
                  <span className="truncate">{backup.description}</span>
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
