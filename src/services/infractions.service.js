import { apiFetch } from './api';

const mapInfraction = (data) => {
  if (!data) return null;
  // Ahora el backend entrega los datos exactamente como los necesita el frontend
  return data;
};

export const getInfractions = async () => {
  const data = await apiFetch('/core/api/v1/infracciones/all');
  if (!Array.isArray(data)) return [];
  return data.map(mapInfraction);
};

export const getInfractionById = async (id) => {
  const data = await apiFetch(`/core/api/v1/infracciones/id/${id}`);
  return mapInfraction(data);
};

export const getInfractionsByFiscalizador = async (idFiscalizador) => {
  const data = await apiFetch(`/core/api/v1/infracciones/fiscalizador/${idFiscalizador}`);
  if (!Array.isArray(data)) return [];
  return data.map(mapInfraction);
};

export const getInfractionsByVehiculoPatente = async (vehiculoPatente) => {
  const data = await apiFetch(`/core/api/v1/infracciones/vehiculo/${vehiculoPatente}`);
  if (!Array.isArray(data)) return [];
  return data.map(mapInfraction);
};

export const updateInfractionStatus = async (id, newStatus, motivoRechazo) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus, motivoRechazo })
  });
};

export const updateInfractionData = async (id, updatedFields) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedFields)
  });
};
