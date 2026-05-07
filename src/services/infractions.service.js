import { apiFetch } from './api';

export const getInfractions = async () => {
  return apiFetch('/core/api/v1/infracciones/all');
};

export const getInfractionById = async (id) => {
  return apiFetch(`/core/api/v1/infracciones/id/${id}`);
};

export const getInfractionsByFiscalizador = async (idFiscalizador) => {
  return apiFetch(`/core/api/v1/infracciones/fiscalizador/${idFiscalizador}`);
};

export const getInfractionsByVehiculoPatente = async (vehiculoPatente) => {
  return apiFetch(`/core/api/v1/infracciones/vehiculo/${vehiculoPatente}`);
};

export const updateInfractionStatus = async (id, newStatus) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
};

export const updateInfractionData = async (id, updatedFields) => {
  return apiFetch(`/core/api/v1/infracciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedFields)
  });
};
