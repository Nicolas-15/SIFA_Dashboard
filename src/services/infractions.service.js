import { apiFetch } from './api';

export const getInfractions = () => {
  return apiFetch('/api/infractions');
};

export const updateInfractionStatus = (id, newStatus) => {
  return apiFetch(`/api/infractions/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus }),
  });
};

export const updateInfractionData = (id, updatedFields) => {
  return apiFetch(`/api/infractions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedFields),
  });
};
