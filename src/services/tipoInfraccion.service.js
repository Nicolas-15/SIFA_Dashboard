import { apiFetch } from './api';

export const getTipoInfracciones = async () => {
  return apiFetch('/core/api/v1/tipoInfracciones/all');
};

export const getTipoInfraccionById = async (id) => {
  return apiFetch(`/core/api/v1/tipoInfracciones/id/${id}`);
};

export const createTipoInfraccion = async (data) => {
  return apiFetch('/core/api/v1/tipoInfracciones', {
    method: 'POST',
    body: JSON.stringify(data)
  });
};

export const updateTipoInfraccion = async (id, data) => {
  return apiFetch(`/core/api/v1/tipoInfracciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
};

export const deleteTipoInfraccion = async (id) => {
  return apiFetch(`/core/api/v1/tipoInfracciones/${id}`, {
    method: 'DELETE'
  });
};

export const createTipoInfraccionBackend = async (data) => {
  return apiFetch('/core/api/v1/tipoInfracciones', {
    method: 'POST',
    body: JSON.stringify({
      nombre: data.nombre,
      disposicionInfringida: data.descripcion || null
    })
  });
};

export const updateTipoInfraccionBackend = async (id, data) => {
  return apiFetch(`/core/api/v1/tipoInfracciones/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
      nombre: data.nombre,
      disposicionInfringida: data.descripcion || null
    })
  });
};