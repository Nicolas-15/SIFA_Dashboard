import { apiFetch } from "./api";

const mapInfraction = (data) => {
  if (!data) return null;
  // Ahora el backend entrega los datos exactamente como los necesita el frontend
  return data;
};

export const getInfractions = async (params = {}) => {
  const { page = 0, size = 10, startDate, endDate, user, status, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (user) queryParams.set("user", user);
  if (status) queryParams.set("status", status);
  if (search) queryParams.set("search", search);

  const data = await apiFetch(`/core/api/v1/infracciones/all?${queryParams}`);

  return {
    content: (data.content || []).map(mapInfraction),
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? size,
    first: data.first ?? true,
    last: data.last ?? true,
    numberOfElements: data.numberOfElements ?? 0,
  };
};

export const getInfractionById = async (id) => {
  const data = await apiFetch(`/core/api/v1/infracciones/id/${id}`);
  return mapInfraction(data);
};

export const getInfractionsByFiscalizador = async (idFiscalizador) => {
  const data = await apiFetch(
    `/core/api/v1/infracciones/fiscalizador/${idFiscalizador}`,
  );
  if (!Array.isArray(data)) return [];
  return data.map(mapInfraction);
};

export const getInfractionsByVehiculoPatente = async (vehiculoPatente) => {
  const data = await apiFetch(
    `/core/api/v1/infracciones/vehiculo/${vehiculoPatente}`,
  );
  if (!Array.isArray(data)) return [];
  return data.map(mapInfraction);
};

export const updateInfractionStatus = async (id, newStatus, motivoRechazo) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status: newStatus, motivoRechazo }),
  });
};

export const updateInfractionData = async (id, updatedFields) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: "PUT",
    body: JSON.stringify(updatedFields),
  });
};

export const getInfractionsReportSummary = async (params = {}) => {
  const { startDate, endDate, user } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (user) queryParams.set("user", user);

  return apiFetch(`/core/api/v1/infracciones/resumen-reporte?${queryParams}`);
};

export const getProductividadFiscalizadorReporte = async (params = {}) => {
  const { startDate, endDate } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);

  return apiFetch(
    `/core/api/v1/infracciones/reporte/productividad?${queryParams}`,
  );
};

/**
 * Obtiene las estadísticas livianas del Dashboard.
 * Retorna: totalInfracciones, cantidadPorEstado (GROUP BY), fechaInicio, fechaFin.
 * Si no se envían fechas, el backend filtra por el día actual.
 */
export const getDashboardStats = async (params = {}) => {
  const { startDate, endDate, user, search } = params;

  const queryParams = new URLSearchParams();
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (user) queryParams.set("user", user);
  if (search) queryParams.set("search", search);

  return apiFetch(`/core/api/v1/infracciones/estadisticas?${queryParams}`);
};
