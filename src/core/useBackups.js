import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "@/core/AuthContext";
import * as backupService from "@/services/backup.service";

export const useBackups = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentJob, setCurrentJob] = useState(null);
  const [downloading, setDownloading] = useState(null);
  const pollingRef = useRef(null);
  const { isAuthenticated } = useAuth();

  // Restore state
  const [restoreJob, setRestoreJob] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  const [validationLoading, setValidationLoading] = useState(false);

  const fetchBackups = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    setError(false);
    try {
      const data = await backupService.listBackups();
      setBackups(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Error fetching backups:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchBackups();
  }, [fetchBackups]);

  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  const pollJob = useCallback((jobId, statusFn) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(async () => {
      try {
        const data = await statusFn(jobId);
        setCurrentJob(data);
        if (data.status === "SUCCESS" || data.status === "FAILED") {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
          if (data.status === "SUCCESS") fetchBackups();
        }
      } catch {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    }, 2000);
  }, [fetchBackups]);

  const createBackup = useCallback(async () => {
    try {
      const data = await backupService.createFullBackup();
      setCurrentJob({ jobId: data.jobId, status: "PENDING", progress: 0, message: "Iniciando..." });
      pollJob(data.jobId, backupService.getJobStatus);
      return data;
    } catch (err) {
      throw err;
    }
  }, [pollJob]);

  const validateBackup = useCallback(async (backupId) => {
    setValidationLoading(true);
    setValidationResult(null);
    try {
      const result = await backupService.validateBackup(backupId);
      setValidationResult(result);
      return result;
    } catch (err) {
      setValidationResult({ valid: false, errors: [err.message || "Error de validación"] });
      throw err;
    } finally {
      setValidationLoading(false);
    }
  }, []);

  const executeRestoreSafe = useCallback(async (backupId, scope = "full") => {
    try {
      const data = await backupService.startRestore(backupId, scope);
      setRestoreJob(data);
      setCurrentJob({ jobId: data.jobId, status: data.status, progress: data.progress || 0, message: data.message || "Iniciando restore..." });
      pollJob(data.jobId, backupService.getRestoreStatus);
      return data;
    } catch (err) {
      throw err;
    }
  }, [pollJob]);

  const cancelRestoreSafe = useCallback(async (jobId) => {
    try {
      await backupService.cancelRestore(jobId);
      setCurrentJob(null);
      setRestoreJob(null);
    } catch (err) {
      throw err;
    }
  }, []);

  const handleDownload = useCallback(async (backupId) => {
    setDownloading(backupId);
    try {
      const data = await backupService.downloadBackup(backupId);
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err) {
      console.error("Error downloading backup:", err);
    } finally {
      setDownloading(null);
    }
  }, []);

  const handleDelete = useCallback(async (backupId) => {
    await backupService.deleteBackup(backupId);
    await fetchBackups();
  }, [fetchBackups]);

  const handleUploadRestore = useCallback(async (file, onProgress) => {
    const data = await backupService.uploadRestore(file, onProgress);
    setCurrentJob({ jobId: data.jobId, status: "PENDING", progress: 0, message: "Iniciando..." });
    pollJob(data.jobId, backupService.getJobStatus);
    return data;
  }, [pollJob]);

  const handleUploadBackup = useCallback(async (file, onProgress, description) => {
    const data = await backupService.uploadBackup(file, onProgress, description);
    setCurrentJob({ jobId: data.jobId, status: "PENDING", progress: 0, message: "Iniciando..." });
    pollJob(data.jobId, backupService.getJobStatus);
    return data;
  }, [pollJob]);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
    setCurrentJob(null);
    setRestoreJob(null);
  }, []);

  return {
    backups,
    loading,
    error,
    fetchBackups,
    createBackup,
    handleDownload,
    handleDelete,
    handleUploadRestore,
    handleUploadBackup,
    currentJob,
    downloading,
    stopPolling,
    restoreJob,
    validationResult,
    validationLoading,
    validateBackup,
    executeRestoreSafe,
    cancelRestoreSafe,
  };
};
