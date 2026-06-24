import { Button } from "@/components/ui/Button";
import { HardDrive, Loader, Upload } from "lucide-react";

export function BackupsHeader({ onCreateBackup, onUploadRestore, loading, hasJob, currentJob, onOpenJob }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 my-0 pt-0">
          Backups
        </h2>
        {hasJob && currentJob && (
          <button
            onClick={onOpenJob}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 rounded-full hover:bg-primary/15 transition-all"
          >
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {currentJob.status === "PENDING" ? "En cola" : `${currentJob.progress}%`}
          </button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onUploadRestore}
          disabled={loading || hasJob}
          className="!px-2.5 sm:!px-4 !py-2"
        >
          <Upload size={15} />
          <span className="hidden sm:inline">Subir y restaurar</span>
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={onCreateBackup}
          disabled={loading || hasJob}
          className="!px-2.5 sm:!px-4 !py-2"
        >
          {loading ? <Loader size={15} className="animate-spin" /> : <HardDrive size={15} />}
          <span className="hidden sm:inline">Crear Backup Completo</span>
        </Button>
      </div>
    </div>
  );
}
