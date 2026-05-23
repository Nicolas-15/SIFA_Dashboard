import { apiFetch } from './api';

export const getTokens = async (params = {}) => {
  const { page = 0, size = 10 } = params;
  const queryParams = new URLSearchParams();
  queryParams.set('page', page);
  queryParams.set('size', size);

  return apiFetch(`/auth/api/v1/tokens?${queryParams}`);
};

export const getTokenById = async (id) => {
  return apiFetch(`/auth/api/v1/tokens/${id}`);
};

export const getTokensByUserRut = async (rut) => {
  const data = await apiFetch(`/auth/api/v1/tokens/user/${rut}`);
  return Array.isArray(data) ? data : [];
};

export const revokeToken = async (id) => {
  return apiFetch(`/auth/api/v1/tokens/${id}/revoke`, {
    method: 'PATCH',
  });
};

export const expireToken = async (id) => {
  return apiFetch(`/auth/api/v1/tokens/${id}/expire`, {
    method: 'PATCH',
  });
};
