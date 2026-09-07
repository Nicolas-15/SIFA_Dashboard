import { apiFetch } from './api';
import { SYSTEM_ROLES } from '@/constants/roles';

/**
 * Mapea los roles del backend a los roles del sistema del frontend.
 *
 * El backend retorna roles completos (ej: "USER_ADMIN") en la lista
 * `roles` de la respuesta del usuario. Este helper los convierte al
 * enum interno del dashboard.
 *
 * @param {string[]} roles Lista de roles del backend
 * @returns {string} Rol del sistema (SYSTEM_ROLES)
 */
const mapBackendRolesToSystemRole = (roles) => {
  if (!Array.isArray(roles) || roles.length === 0) {
    return SYSTEM_ROLES.USER_APP; // Fallback seguro: restringido
  }

  if (roles.some(r => r.includes('ADMIN'))) {
    return SYSTEM_ROLES.ADMIN;
  }
  if (roles.some(r => r.includes('SUPERVISOR'))) {
    return SYSTEM_ROLES.SUPERVISOR;
  }
  if (roles.some(r => r.includes('JPL') || r.includes('DEFAULT'))) {
    return SYSTEM_ROLES.DEFAULT;
  }
  return SYSTEM_ROLES.USER_APP;
};

/**
 * Convierte la respuesta del usuario del backend al formato del frontend.
 *
 * Con cookies httpOnly, el backend envía la información del usuario
 * directamente en la respuesta (sin tokens). Este helper normaliza
 * los campos para el estado de la aplicación.
 *
 * @param {object} data Respuesta del backend (email, name, lastname, rut, roles)
 * @returns {object} Usuario mapeado con el rol del sistema
 */
const mapUserData = (data) => ({
  name: data.name || data.email,
  lastname: data.lastname || '',
  rut: data.rut || '',
  email: data.email,
  role: mapBackendRolesToSystemRole(data.roles),
});

/**
 * Cierra la sesión del usuario.
 * El servidor revoca el token y limpia las cookies httpOnly en la respuesta.
 *
 * @returns {Promise<object|null>} Respuesta del servidor
 */
export const logout = async () => {
  return apiFetch('/auth/api/v1/logout', {
    method: 'POST'
  });
};

/**
 * Inicia sesión de un usuario.
 *
 * Con cookies httpOnly, la respuesta del login solo contiene la
 * información del usuario (los tokens se guardan en cookies en el navegador).
 *
 * @param {string} email Correo del usuario
 * @param {string} password Contraseña del usuario
 * @returns {Promise<object>} Usuario mapeado { name, lastname, rut, email, role }
 */
export const login = async (email, password) => {
  const data = await apiFetch('/auth/api/v1/login', {
    method: 'POST',
    headers: { 'X-Client-Origin': 'web' },
    body: JSON.stringify({ email, password })
  });

  return { user: mapUserData(data) };
};

/**
 * Verifica el estado de la sesión actual.
 *
 * Llama al endpoint /status que lee el access token de la cookie
 * httpOnly (inaccesible desde JavaScript) y valida si la sesión sigue
 * siendo válida. Se usa al cargar la aplicación para restaurar la sesión.
 *
 * @returns {Promise<object|null>} Estado de la sesión { valid, user, error }
 */
export const checkSessionStatus = async () => {
  return apiFetch('/auth/api/v1/status', {
    method: 'GET'
  });
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