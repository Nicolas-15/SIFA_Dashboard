import { useState, useEffect, useRef, useCallback } from "react";
import { AlertTriangle, Trash2, X, Loader, HardDrive, Upload, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/Switch";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function BackupsModals({
  currentJob, jobModalOpen, onHideJob, onCloseJob,
  deleteTarget, onDeleteClose, onDeleteConfirm, submitting,
  uploadOpen, onUploadClose, uploadMode, onUploadModeChange, onUploadSubmit, onBackupSubmit, uploading, uploadProgress,
  uploadDescription, onUploadDescriptionChange, uploadFailed,
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteConfirmed, setDeleteConfirmed] = useState(false);
  const jobRunning = currentJob && (currentJob.status === "PENDING" || currentJob.status === "RUNNING");

  useEffect(() => {
    setDeleteConfirmText("");
    setDeleteConfirmed(false);
  }, [deleteTarget]);

  useEffect(() => {
    if (!uploadOpen) {
      setSelectedFile(null);
      setDragOver(false);
    }
  }, [uploadOpen]);

  const isUploadJob = currentJob?.jobId?.startsWith("upb-");
  const renderJobProgress = () => {
    if (!jobRunning) return null;
    return (
      <div className="space-y-4">
        {isUploadJob && (
          <p className="text-[11px] font-bold text-primary/70 text-center -mb-2">Paso 2/2: Subiendo a S3...</p>
        )}
        <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-xl">
          {currentJob.status === "PENDING" ? (
            <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            <Loader size={20} className="text-primary animate-spin shrink-0" />
          )}
          <div>
            <p className="text-sm font-bold text-slate-700">{currentJob.message}</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {currentJob.status === "PENDING" ? "En cola..." : `Progreso: ${currentJob.progress}%`}
            </p>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${currentJob.progress || 0}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{currentJob.progress || 0}%</span>
          <button onClick={onHideJob} className="text-slate-500 hover:text-slate-700 font-medium">
            Ocultar
          </button>
        </div>
      </div>
    );
  };

  const renderJobDone = () => {
    if (!currentJob || jobRunning) return null;
    const isSuccess = currentJob.status === "SUCCESS";
    return (
      <div className="space-y-4">
        <div className={`flex items-start gap-3 p-4 rounded-xl ${
          isSuccess ? "bg-emerald-50" : "bg-red-50"
        }`}>
          {isSuccess ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
              <HardDrive size={16} className="text-emerald-600" />
            </div>
          ) : (
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          )}
          <div className="flex-1">
            <p className={`text-sm font-bold ${isSuccess ? "text-emerald-700" : "text-red-700"}`}>
              {isSuccess ? "Operación completada" : "Error en la operación"}
            </p>
            <p className={`text-xs mt-0.5 break-words max-h-20 overflow-y-auto ${isSuccess ? "text-emerald-600" : "text-red-600"}`}>
              {currentJob.message}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onCloseJob} className="w-full">
          <X size={16} />
          <span>Cerrar</span>
        </Button>
      </div>
    );
  };

  const renderDeleteContent = () => {
    if (!deleteTarget) return null;
    return (
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
          <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-red-700">¿Eliminar backup?</p>
            <p className="text-xs text-red-600 mt-1">
              Esta acción eliminará permanentemente el backup <strong>{deleteTarget.id}</strong> y todos sus archivos de S3. No se puede deshacer.
            </p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 mb-1.5">
            Escribe <span className="text-red-600">eliminar</span> para confirmar
          </label>
          <input
            type="text"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="eliminar"
            disabled={submitting}
            className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-red-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <Switch
          checked={deleteConfirmed}
          onChange={setDeleteConfirmed}
          disabled={submitting}
          label="Entiendo que esta acción es irreversible"
          className="p-3 bg-slate-50 rounded-xl"
        />
      </div>
    );
  };

  return (
    <>
      <Modal
        isOpen={jobModalOpen && !!currentJob}
        onClose={onCloseJob}
        title="Progreso"
        description={currentJob?.jobId ? `Job: ${currentJob.jobId}` : ""}
        maxWidth="max-w-md"
      >
        {jobRunning ? renderJobProgress() : renderJobDone()}
      </Modal>

      <Modal
        isOpen={!!deleteTarget}
        onClose={() => { setDeleteConfirmText(""); setDeleteConfirmed(false); onDeleteClose(); }}
        title="Eliminar backup"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setDeleteConfirmText(""); setDeleteConfirmed(false); onDeleteClose(); }} disabled={submitting}>
              Cancelar
            </Button>
            <Button variant="danger" size="sm" onClick={onDeleteConfirm} isLoading={submitting} loadingText="Eliminando..." disabled={deleteConfirmText !== "eliminar" || !deleteConfirmed}>
              <Trash2 size={16} />
              <span>Eliminar</span>
            </Button>
          </div>
        }
      >
        {renderDeleteContent()}
      </Modal>

      <Modal
        isOpen={uploadOpen}
        onClose={() => { setSelectedFile(null); setDragOver(false); onUploadClose(); }}
        title="Subir archivo de backup"
        maxWidth="max-w-md"
        footer={
          <div className="flex items-center justify-end gap-3">
            <Button variant="ghost" size="sm" onClick={() => { setSelectedFile(null); setDragOver(false); onUploadClose(); }} disabled={uploading}>
              Cancelar
            </Button>
            <Button variant={uploadFailed ? "danger" : "primary"} size="sm" onClick={() => {
              if (!selectedFile) return;
              if (uploadMode === "upload") onBackupSubmit(selectedFile);
              else onUploadSubmit(selectedFile);
            }} disabled={!selectedFile || uploading}>
              {uploading ? (
                <span>Subiendo... {uploadProgress}%</span>
              ) : uploadFailed ? (
                <><RefreshCw size={16} /><span>Reintentar</span></>
              ) : uploadMode === "upload" ? (
                <><Upload size={16} /><span>Subir backup</span></>
              ) : (
                <><Upload size={16} /><span>Subir y restaurar</span></>
              )}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="flex rounded-xl bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => onUploadModeChange("upload")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                uploadMode === "upload" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Sólo subir backup
            </button>
            <button
              type="button"
              onClick={() => onUploadModeChange("restore")}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${
                uploadMode === "restore" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Subir y restaurar
            </button>
          </div>

          <p className="text-sm text-slate-600">
            Selecciona un archivo ZIP generado desde la descarga de un backup.
          </p>
          {uploadMode === "restore" && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl -mt-2">
              <span className="text-amber-600 text-sm shrink-0 mt-0.5">⚠</span>
              <p className="text-xs text-amber-700">
                El archivo <strong>no se guardará como un backup persistente</strong> en el listado.
                Se restaurará directamente en la base de datos y storage.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-500 -mt-1">
            {uploadMode === "upload"
              ? "El contenido se almacenará como un nuevo backup en S3."
              : "Contenido se aplicará en el entorno activo."}
          </p>
          {uploadMode === "upload" && !uploading && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-500">
                  Descripción (opcional)
                </label>
                <span className="text-[10px] text-slate-400">{(uploadDescription || "").length}/60</span>
              </div>
              <input
                type="text"
                value={uploadDescription || ""}
                onChange={(e) => onUploadDescriptionChange(e.target.value)}
                placeholder="Ej: Backup antes de migración de usuarios"
                maxLength={60}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>
          )}
          {uploading ? (
            <div className="space-y-3 p-8">
              <div className="flex items-center gap-3 justify-center">
                <Loader size={20} className="text-primary animate-spin" />
                <p className="text-sm font-bold text-slate-700">Paso 1/2: Subiendo archivo al servidor...</p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 text-center">{uploadProgress}%</p>
            </div>
          ) : (
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file && file.name.toLowerCase().endsWith(".zip")) {
                  setSelectedFile(file);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                dragOver ? "border-primary bg-primary/5 scale-[1.02]" : "border-slate-200 hover:border-slate-300 bg-slate-50/50"
              } ${selectedFile ? "border-emerald-400 bg-emerald-50/50" : ""}`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".zip"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setSelectedFile(file);
                }}
              />
              {selectedFile ? (
                <div className="flex flex-col items-center gap-2">
                  <Upload size={32} className="text-emerald-500" />
                  <p className="text-sm font-bold text-emerald-700">{selectedFile.name}</p>
                  <p className="text-xs text-emerald-500">{(selectedFile.size / 1024 / 1024).toFixed(1)} MB</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <HardDrive size={32} className="text-slate-300" />
                  <p className="text-sm font-bold text-slate-500">
                    {dragOver ? "Suelta el archivo aquí" : "Arrastra un ZIP o haz clic para seleccionar"}
                  </p>
                  <p className="text-xs text-slate-400">Solo archivos .zip</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
