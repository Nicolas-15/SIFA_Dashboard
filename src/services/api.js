import { API_BASE_URL } from '@/core/config';

const HTTP_ERROR_MESSAGES = {
  400: 'La solicitud contiene datos incorrectos o inválidos.',
  401: 'Sesión no autorizada o expirada.',
  403: 'No tienes permisos suficientes para realizar esta acción.',
  404: 'El recurso solicitado no fue encontrado.',
  409: 'Conflicto en la solicitud. Es posible que el recurso ya exista o haya sido modificado.',
  500: 'Error interno en el servidor. Por favor, intente nuevamente más tarde.',
  503: 'Servicio no disponible temporalmente. Intente nuevamente en unos momentos.'
};

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  let response;
  try {
    response = await fetch(url, { ...options, headers });
  } catch (error) {
    console.error('Network error during fetch:', error);
    throw new Error('No se pudo establecer conexión con el servidor. Por favor, verifique su conexión a internet.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    let errorMessage = '';

    if (errorData) {
      const rawError = errorData.message || errorData.error || errorData;
      errorMessage = (typeof rawError === 'object' && rawError !== null)
        ? Object.values(rawError).flat().join('\n')
        : String(rawError);
    }

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.clear();

      // Si el mensaje del gateway indica inicio de sesión en otro dispositivo o revocación específica
      if (errorMessage && (errorMessage.includes('otro dispositivo') || errorMessage.includes('revocado') || errorMessage.includes('invalidada'))) {
        localStorage.setItem('auth_error', 'revoked');
      } else {
        localStorage.setItem('auth_error', 'unauthorized');
      }

      window.dispatchEvent(new Event('auth:unauthorized'));
    } else if (response.status === 403) {
      window.dispatchEvent(new Event('auth:forbidden'));
    }

    if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = HTTP_ERROR_MESSAGES[response.status] || `Error inesperado (Código: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};