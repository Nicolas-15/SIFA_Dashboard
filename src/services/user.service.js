import { apiFetch } from "./api";

export const getUsersFiscalizadores = async () => {
  return apiFetch("auth/api/v1/users/fiscalizadores");
};

export const getUsers = async (params = {}) => {
  const { page = 0, size = 10, search } = params;
  const queryParams = new URLSearchParams();
  queryParams.set("page", page);
  queryParams.set("size", size);
  if (search) queryParams.set("search", search);
  return apiFetch(`/auth/api/v1/users?${queryParams}`);
};

export const createUser = async (userData) => {
  return apiFetch("/auth/api/v1/users", {
    method: "POST",
    body: JSON.stringify(userData),
  });
};

export const revokeUser = async (rut) => {
  return apiFetch(`/auth/api/v1/users?rut=${rut}`, {
    method: "DELETE",
  });
};

export const activateUser = async (rut) => {
  return apiFetch(`/auth/api/v1/users/${rut}/activate`, {
    method: "PATCH",
  });
};

export const updateUserRole = async (rut, role) => {
  return apiFetch(`/auth/api/v1/users/${rut}/role`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
};

export const updateUser = async (rut, userData) => {
  return apiFetch(`/auth/api/v1/users/${rut}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
};
