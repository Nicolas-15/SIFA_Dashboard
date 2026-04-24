import { apiFetch } from './api';

export const getUsers = async () => {
  return apiFetch('/auth-api/api/v1/users');
};

export const createUser = async (userData) => {
  return apiFetch('/auth-api/api/v1/users', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
};

export const revokeUser = async (rut) => {
  return apiFetch(`/auth-api/api/v1/users?rut=${rut}`, {
    method: 'DELETE'
  });
};

export const activateUser = async (rut) => {
  return apiFetch(`/auth-api/api/v1/users/${rut}/activate`, {
    method: 'PATCH'
  });
};
