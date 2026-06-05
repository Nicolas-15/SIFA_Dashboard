import { apiFetch } from "./api";

const mapAuditLog = (data) => {
  if (!data) return null;
  // Ahora el backend entrega los datos exactamente como los necesita el frontend
  return data;
};

export const getAuditLogs = async (params = {}) => {
  const { page = 0, size = 10, startDate, endDate, user, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (user) queryParams.set("user", user);
  if (search) queryParams.set("search", search);

  const data = await apiFetch(`/core/api/v1/internal/audit?${queryParams}`);

  return {
    content: (data.content || []).map(mapAuditLog),
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? size,
    first: data.first ?? true,
    last: data.last ?? true,
    numberOfElements: data.numberOfElements ?? 0,
  };
};
