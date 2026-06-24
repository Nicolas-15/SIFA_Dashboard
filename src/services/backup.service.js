import { apiFetch, uploadFileWithProgress } from './api';

export const createFullBackup = async () => {
  return apiFetch('/core/api/v1/admin/backups/full', { method: 'POST' });
};

export const listBackups = async () => {
  return apiFetch('/core/api/v1/admin/backups');
};

export const getJobStatus = async (jobId) => {
  return apiFetch(`/core/api/v1/admin/backups/jobs/${jobId}`);
};

export const downloadBackup = async (backupId) => {
  return apiFetch(`/core/api/v1/admin/backups/${backupId}/download`, { timeout: 60000 });
};

export const deleteBackup = async (backupId) => {
  return apiFetch(`/core/api/v1/admin/backups/${backupId}`, { method: 'DELETE' });
};

export const uploadRestore = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  return uploadFileWithProgress('/core/api/v1/admin/backups/upload-restore', formData, onProgress);
};

export const uploadBackup = async (file, onProgress, description) => {
  const formData = new FormData();
  formData.append('file', file);
  if (description) formData.append('description', description);
  return uploadFileWithProgress('/core/api/v1/admin/backups/upload-backup', formData, onProgress);
};

// Restore endpoints (safe restore with validation + temp schemas)
export const validateBackup = async (backupId) => {
  return apiFetch(`/core/api/v1/admin/restore/validate/${backupId}`);
};

export const startRestore = async (backupId, scope = "full") => {
  return apiFetch(`/core/api/v1/admin/restore/${backupId}`, {
    method: 'POST',
    body: JSON.stringify({ scope }),
    headers: { 'Content-Type': 'application/json' },
  });
};

export const getRestoreStatus = async (jobId) => {
  return apiFetch(`/core/api/v1/admin/restore/jobs/${jobId}`);
};

export const cancelRestore = async (jobId) => {
  return apiFetch(`/core/api/v1/admin/restore/jobs/${jobId}/cancel`, { method: 'POST' });
};
