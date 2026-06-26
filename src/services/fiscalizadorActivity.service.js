import { apiFetch } from "./api";

export const getFiscalizadoresActivos = async (params = {}) => {
  const { page = 0, size = 10 } = params;
  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  return apiFetch(`core/api/v1/fis-activity/activos?${queryParams}`);
};
