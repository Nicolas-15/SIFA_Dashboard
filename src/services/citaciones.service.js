import { apiFetch } from "./api";

/**
 * Obtiene el listado paginado de citaciones con filtros opcionales.
 */
export const getCitaciones = async (params = {}) => {
  const { page = 0, size = 10, startDate, endDate, search } = params;

  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  if (startDate) queryParams.set("startDate", startDate);
  if (endDate) queryParams.set("endDate", endDate);
  if (search) queryParams.set("search", search);

  const data = await apiFetch(`/core/api/v1/citaciones/all?${queryParams}`);

  return {
    content: data.content || [],
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? 0,
    number: data.number ?? 0,
    size: data.size ?? size,
    first: data.first ?? true,
    last: data.last ?? true,
    numberOfElements: data.numberOfElements ?? 0,
  };
};

/**
 * Obtiene el detalle de una citación por su ID.
 */
export const getCitacionById = async (id) => {
  return apiFetch(`/core/api/v1/citaciones/${id}`);
};

/**
 * Reprograma la fecha de una citación existente.
 * @param {number} id - ID de la citación
 * @param {string} fecha - Nueva fecha en formato ISO (yyyy-MM-ddTHH:mm:ss)
 */
export const reprogramarCitacion = async (id, fecha) => {
  return apiFetch(`/core/api/v1/citaciones/${id}`, {
    method: "PUT",
    body: JSON.stringify({ fecha }),
  });
};
