import { apiFetch } from "./api";

export const getFiscalizadoresActivos = async () => {
  return apiFetch("core/api/v1/fis-activity/activos");
};
