/**
 * Configuración global de la aplicación.
 * Utiliza variables de entorno provistas por Vite.
 */

// En desarrollo, dejamos la URL base vacía para que las peticiones sean relativas
// y el proxy de Vite (vite.config.js) pueda interceptarlas y enviarlas al API Gateway (9000).
// En producción, VITE_API_URL debe apuntar al dominio real del API Gateway.

export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

export const CONFIG = {
  appName: 'SIFA Dashboard',
  version: '1.0.0',
};
