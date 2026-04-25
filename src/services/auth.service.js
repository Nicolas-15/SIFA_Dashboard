import { apiFetch } from './api';
import { SYSTEM_ROLES } from '../utils/constants';

export const decodeJWT = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
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

  let userRole = SYSTEM_ROLES.DEFAULT;
  if (payload.roles) {
    if (payload.roles.includes("ADMIN") || payload.roles.includes("SUPER_ADMIN") || payload.roles.includes("ROLE_ADMIN")) {
      userRole = SYSTEM_ROLES.ADMIN;
    } else if (payload.roles.includes("SUPERVISOR") || payload.roles.includes("ROLE_SUPERVISOR")) {
      userRole = SYSTEM_ROLES.SUPERVISOR;
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

export const login = async (email, password) => {
  const data = await apiFetch('auth/api/v1/users', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  const mappedUser = getUserFromToken(data.accessToken) || { 
    name: email, 
    email: email, 
    role: SYSTEM_ROLES.DEFAULT
  };

  return { token: data.accessToken, user: mappedUser };
};
