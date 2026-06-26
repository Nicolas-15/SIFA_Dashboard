import { apiFetch, refreshToken } from './api';
import { SYSTEM_ROLES } from '@/constants/roles';

export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function (c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export const getUserFromToken = (token) => {
  const payload = decodeJWT(token);
  if (!payload) return null;

  let userRole = SYSTEM_ROLES.USER_APP; // Por defecto restringido

  if (payload.roles) {
    const roles = Array.isArray(payload.roles) ? payload.roles : [payload.roles];

    if (roles.some(r => ["ADMIN", "USER_ADMIN", "ROLE_ADMIN"].includes(r))) {
      userRole = SYSTEM_ROLES.ADMIN;
    } else if (roles.some(r => ["SUPERVISOR", "USER_SUPERVISOR", "ROLE_SUPERVISOR"].includes(r))) {
      userRole = SYSTEM_ROLES.SUPERVISOR;
    } else if (roles.some(r => ["DEFAULT", "USER_DEFAULT", "ROLE_DEFAULT", "USER_JPL", "ROLE_JPL", "JPL"].includes(r))) {
      userRole = SYSTEM_ROLES.DEFAULT;
    }
  }

  return {
    name: payload.name || payload.sub,
    lastname: payload.lastname || '',
    rut: payload.rut || '',
    email: payload.email || payload.sub,
    role: userRole
  };
};

export const refreshSession = async () => {
  return refreshToken();
};

export const logout = async () => {
  return apiFetch('/auth/api/v1/logout', {
    method: 'POST'
  });
};

export const login = async (email, password) => {
  const data = await apiFetch('/auth/api/v1/login', {
    method: 'POST',
    headers: { 'X-Client-Origin': 'web' },
    body: JSON.stringify({ email, password })
  });

  const mappedUser = getUserFromToken(data.accessToken) || {
    name: email,
    email: email,
    role: SYSTEM_ROLES.USER_APP // Fallback seguro: restringido
  };

  return { token: data.accessToken, refreshToken: data.refreshToken, user: mappedUser };
};

export const requestPasswordRecovery = async (email) => {
  return await apiFetch('/auth/api/v1/recovery/request', {
    method: 'POST',
    body: JSON.stringify({ email })
  });
};

export const resetPassword = async (email, code, newPassword) => {
  return await apiFetch('/auth/api/v1/recovery/reset', {
    method: 'POST',
    body: JSON.stringify({ email, code, newPassword })
  });
};
