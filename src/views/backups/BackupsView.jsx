import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { HardDrive, ShieldCheck, Database, FolderTree, RefreshCw } from "lucide-react";
import { useBackups } from "@/core/useBackups";
import { BackupsHeader } from "./components/BackupsHeader";
import { BackupsTable } from "./components/BackupsTable";
import { BackupsMobileCards } from "./components/BackupsMobileCards";
import { BackupsModals } from "./components/BackupsModals";
import { Spinner } from "@/components/ui/Spinner";
import { EmptyState } from "@/components/ui/EmptyState";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function BackupsView() {
  const { showToast } = useOutletContext();
  const {
    backups, loading, error, fetchBackups,
    createBackup, handleDownload: handleDownloadCore, handleDelete,
    handleUploadRestore,
    handleUploadBackup,
    currentJob, downloading, stopPolling,
    validationResult, validationLoading, validateBackup, executeRestoreSafe,
  } = useBackups();

  const handleDownload = async (backupId) => {
    showToast("Descarga iniciada", "success");
    await handleDownloadCore(backupId);
  };

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showJobModal, setShowJobModal] = useState(false);

  // Restore safe modal state
  const [restoreSafeTarget, setRestoreSafeTarget] = useState(null);
  const [showSafeModal, setShowSafeModal] = useState(false);
  const [safeStep, setSafeStep] = useState("confirm"); // confirm → validate → result → executing
  const [restoreScope, setRestoreScope] = useState("full"); // full | database | storage

  useEffect(() => {
    if (currentJob) setShowJobModal(true);
  }, [currentJob]);

  useEffect(() => {
    if (currentJob?.status === "FAILED") {
      showToast(currentJob.message || "Error en la operación", "error");
    }
  }, [currentJob]);

  const handleCreateBackup = async () => {
    try {
      await createBackup();
      showToast("Backup iniciado correctamente", "success");
    } catch (err) {
      showToast(err.message || "Error al iniciar backup", "error");
    }
  };

  const handleRestoreSafe = async (backup) => {
    setRestoreSafeTarget(backup);
    setRestoreScope("full");
    setSafeStep("confirm");
    setShowSafeModal(true);
  };

  const handleSafeValidate = async () => {
    if (!restoreSafeTarget) return;
    setSafeStep("validating");
    try {
      await validateBackup(restoreSafeTarget.id);
      setSafeStep("result");
    } catch (err) {
      showToast(err.message || "Error de validación", "error");
      setSafeStep("confirm");
    }
  };

  const handleSafeExecute = async () => {
    if (!restoreSafeTarget) return;
    setSafeStep("executing");
    try {
      await executeRestoreSafe(restoreSafeTarget.id, restoreScope);
      showToast("Restauración iniciada correctamente", "success");
      setShowSafeModal(false);
      setRestoreSafeTarget(null);
      setSafeStep("confirm");
    } catch (err) {
      showToast(err.message || "Error al iniciar restore", "error");
      setSafeStep("result");
    }
  };

  const [uploadMode, setUploadMode] = useState("upload"); // upload | restore
  const [uploadDescription, setUploadDescription] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);

  const handleUploadBackupSubmit = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadFailed(false);
    try {
      await handleUploadBackup(file, setUploadProgress, uploadDescription);
      showToast("Backup subido correctamente", "success");
      setUploadOpen(false);
      setUploadDescription("");
      setUploadFailed(false);
    } catch (err) {
      showToast(err.message || "Error al subir archivo", "error");
      setUploadFailed(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleUploadRestoreSubmit = async (file) => {
    setUploading(true);
    setUploadProgress(0);
    setUploadFailed(false);
    try {
      await handleUploadRestore(file, setUploadProgress);
      showToast("Restauración desde archivo iniciada", "success");
      setUploadOpen(false);
      setUploadFailed(false);
    } catch (err) {
      showToast(err.message || "Error al subir archivo", "error");
      setUploadFailed(true);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setSubmitting(true);
    try {
      await handleDelete(deleteTarget.id);
      showToast("Backup eliminado", "success");
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || "Error al eliminar", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (error && backups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center flex-1 gap-4 py-24">
        <HardDrive size={48} className="text-slate-300" />
        <p className="text-slate-500 font-medium">Error al cargar backups</p>
        <button onClick={fetchBackups} className="inline-flex items-center gap-2 px-5 py-1.5 text-sm font-bold text-white bg-primary hover:bg-primary/80 rounded-full transition-colors">
          <RefreshCw size={16} />
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      <BackupsHeader onCreateBackup={handleCreateBackup} onUploadRestore={() => setUploadOpen(true)} loading={loading} hasJob={!!currentJob} currentJob={currentJob} onOpenJob={() => setShowJobModal(true)} />

      {loading && backups.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Spinner />
            <span className="text-sm font-medium">Cargando backups...</span>
          </div>
        </div>
      ) : backups.length === 0 ? (
        <EmptyState resource="backups" />
      ) : (
        <>
          <div className="hidden md:flex flex-1 flex-col">
            <BackupsTable
              backups={backups}
              downloading={downloading}
              onDownload={handleDownload}
              onRestoreSafe={(b) => handleRestoreSafe(b)}
              onDelete={(b) => setDeleteTarget(b)}
            />
          </div>
          <div className="md:hidden flex-1 overflow-auto">
            <BackupsMobileCards
              backups={backups}
              downloading={downloading}
              onDownload={handleDownload}
              onRestoreSafe={(b) => handleRestoreSafe(b)}
              onDelete={(b) => setDeleteTarget(b)}
            />
          </div>
        </>
      )}

      <BackupsModals
        currentJob={currentJob}
        jobModalOpen={showJobModal}
        onHideJob={() => setShowJobModal(false)}
        onCloseJob={() => { setShowJobModal(false); stopPolling(); }}
        deleteTarget={deleteTarget}
        onDeleteClose={() => setDeleteTarget(null)}
        onDeleteConfirm={handleDeleteConfirm}
        submitting={submitting}
        uploadOpen={uploadOpen}
        onUploadClose={() => { setUploadOpen(false); setUploadMode("upload"); setUploadDescription(""); setUploadFailed(false); }}
        uploadMode={uploadMode}
        onUploadModeChange={(mode) => { setUploadMode(mode); if (mode !== "upload") setUploadDescription(""); }}
        onUploadSubmit={handleUploadRestoreSubmit}
        onBackupSubmit={handleUploadBackupSubmit}
        uploading={uploading}
        uploadProgress={uploadProgress}
        uploadDescription={uploadDescription}
        onUploadDescriptionChange={setUploadDescription}
        uploadFailed={uploadFailed}
      />

      <Modal
        isOpen={showSafeModal && !!restoreSafeTarget}
        onClose={() => { setShowSafeModal(false); setRestoreSafeTarget(null); setSafeStep("confirm"); }}
        title="Restauración Segura"
        description={restoreSafeTarget?.id ? `Backup: ${restoreSafeTarget.id}` : ""}
        maxWidth="max-w-lg"
      >
        <div className="space-y-4">
          {safeStep === "confirm" && (
            <>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl">
                <ShieldCheck size={24} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-slate-700">Restauración segura</p>
                  <p className="text-xs text-slate-500 mt-1">
                    El proceso valida el backup, restaura en schemas temporales y realiza un swap seguro.
                    Producción no se modifica hasta que todo esté verificado.
                  </p>
                </div>
              </div>
              <p className="text-sm font-bold text-slate-600">¿Qué deseas restaurar?</p>
              <div className="grid grid-cols-1 gap-2">
                <button
                  type="button"
                  onClick={() => setRestoreScope("full")}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                    restoreScope === "full" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <ShieldCheck size={18} className="text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Restauración completa</p>
                    <p className="text-xs text-slate-500">Bases de datos + storage S3</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreScope("database")}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                    restoreScope === "database" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                    <Database size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Solo bases de datos</p>
                    <p className="text-xs text-slate-500">Restaura authdb y core_db</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setRestoreScope("storage")}
                  className={`flex items-center gap-4 p-3 rounded-xl border transition-all text-left ${
                    restoreScope === "storage" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                  }`}
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                    <FolderTree size={18} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">Solo storage</p>
                    <p className="text-xs text-slate-500">Restaura archivos de infracciones en S3</p>
                  </div>
                </button>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" size="sm" onClick={() => { setShowSafeModal(false); setRestoreSafeTarget(null); }} className="flex-1">
                  Cancelar
                </Button>
                <Button variant="primary" size="sm" onClick={handleSafeValidate} isLoading={validationLoading} loadingText="Validando..." className="flex-1">
                  <ShieldCheck size={16} />
                  <span>Validar y continuar</span>
                </Button>
              </div>
            </>
          )}

          {safeStep === "validating" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner />
              <p className="text-sm font-bold text-slate-700">Validando backup...</p>
              <p className="text-xs text-slate-500">Verificando integridad, checksums y compatibilidad</p>
            </div>
          )}

          {safeStep === "result" && validationResult && (
            <>
              {validationResult.valid ? (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-xl">
                    <ShieldCheck size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-emerald-700">Backup válido</p>
                      <p className="text-xs text-emerald-600 mt-1">
                        MySQL: {validationResult.mysqlVersion}
                      </p>
                      {validationResult.schemas?.length > 0 && (
                        <p className="text-xs text-emerald-600 mt-1">
                          Schemas: {validationResult.schemas.join(", ")}
                        </p>
                      )}
                    </div>
                  </div>
                  {validationResult.warnings?.length > 0 && (
                    <div className="p-3 bg-amber-50 rounded-xl text-xs text-amber-700">
                      {validationResult.warnings.map((w, i) => <p key={i}>⚠ {w}</p>)}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <Button variant="outline" size="sm" onClick={() => setSafeStep("confirm")} className="flex-1">
                      Volver
                    </Button>
                    <Button variant="primary" size="sm" onClick={handleSafeExecute} className="flex-1">
                      <ShieldCheck size={16} />
                      <span>Iniciar restauración</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl">
                    <ShieldCheck size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-bold text-red-700">Backup inválido</p>
                      {validationResult.errors?.map((e, i) => (
                        <p key={i} className="text-xs text-red-600 mt-1">✗ {e}</p>
                      ))}
                    </div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => { setShowSafeModal(false); setRestoreSafeTarget(null); setSafeStep("confirm"); }} className="w-full">
                    Cerrar
                  </Button>
                </div>
              )}
            </>
          )}

          {safeStep === "executing" && (
            <div className="flex flex-col items-center gap-4 py-8">
              <Spinner />
              <p className="text-sm font-bold text-slate-700">Iniciando restauración...</p>
              <p className="text-xs text-slate-500">El progreso se mostrará en el panel principal</p>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
}
