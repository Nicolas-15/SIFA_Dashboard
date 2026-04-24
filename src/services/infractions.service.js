import { apiFetch } from './api';

export const getInfractions = async () => {
  return apiFetch('/api/infractions');
};

export const updateInfractionStatus = async (id, newStatus) => {
  return apiFetch(`/api/infractions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
};

export const updateInfractionData = async (id, updatedFields) => {
  return apiFetch(`/api/infractions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedFields)
  });
};
