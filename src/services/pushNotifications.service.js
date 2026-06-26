import { apiFetch } from "./api";

export const sendAllPush = async ({ title, body }) => {
  return apiFetch("/core/api/v1/notifications/push/all", {
    method: "POST",
    body: JSON.stringify({ title, body }),
  });
};

export const sendOutdatedPush = async ({ currentVersion, title, body }) => {
  return apiFetch("/core/api/v1/notifications/push/outdated", {
    method: "POST",
    body: JSON.stringify({ currentVersion, title, body }),
  });
};

export const getAllDevices = async () => {
  return apiFetch("/core/api/v1/notifications/push/devices");
};

export const getNotificationHistory = async (params = {}) => {
  const { page = 0, size = 10, targetType, startDate, endDate } = params;
  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  if (targetType) queryParams.set("targetType", targetType);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  return apiFetch(`/core/api/v1/notifications/history?${queryParams}`);
};

export const sendSelectPush = async ({ deviceIds, title, body }) => {
  return apiFetch("/core/api/v1/notifications/push/select", {
    method: "POST",
    body: JSON.stringify({ deviceIds, title, body }),
  });
};

export const getDeviceStats = async () => {
  return apiFetch("/core/api/v1/devices/stats");
};

export const getDiagnostics = async () => {
  return apiFetch("/core/api/v1/notifications/push/diagnostico");
};
