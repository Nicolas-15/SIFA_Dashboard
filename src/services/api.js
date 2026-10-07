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

// El login responde 401 solo cuando las credenciales son inválidas.
// No debe tramitarse como sesión expirada ni disparar refresh/logout.
const LOGIN_ENDPOINT = '/auth/api/v1/login';

function combineAbortSignals(...signals) {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  for (const signal of signals) {
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }
  return controller.signal;
}

let isRefreshing = false;
let refreshPromise = null;

/**
 * Renueva los tokens de sesión.
 *
 * Con cookies httpOnly, el refresh token se envía automáticamente en la
 * cookie refresh_token (Path=/auth/api/v1). No es necesario almacenarlo
 * en localStorage ni enviarlo en el body de la petición.
 *
 * @returns {Promise<void>} Resuelve cuando el refresh fue exitoso
 */
export async function refreshToken() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/api/v1/refresh`, {
      method: 'POST',
      credentials: 'include',
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new Error(errorBody?.message || 'Sesión expirada');
  }
}

/**
 * Restablece el estado de autenticación y notifica a la aplicación.
 *
 * Al usar cookies httpOnly, el frontend no puede limpiar los tokens
 * directamente. La cookie se elimina en el servidor cuando el endpoint
 * de logout responde con el header Set-Cookie de expiración.
 *
 * @param {string} errorType Tipo de error ('expired', 'revoked', 'unauthorized')
 */
function notifyAuthError(errorType) {
  if (errorType) {
    // Se usa sessionStorage (no localStorage) para la flag de error,
    // que es temporal y solo relevante para la sesión actual
    const target = sessionStorage.getItem('restore_in_progress') ? sessionStorage : localStorage;
    target.setItem('auth_error', errorType);
  }
  window.dispatchEvent(new Event('auth:unauthorized'));
}

/**
 * Sube un archivo con barra de progreso.
 *
 * Usa XMLHttpRequest y envía las cookies automáticamente
 * (credentials: 'include') en lugar de un header manual.
 *
 * @param {string} endpoint Endpoint del servidor
 * @param {FormData} formData Datos del formulario (con el archivo)
 * @param {Function} onProgress Callback de progreso (0-100)
 * @returns {Promise<object|null>} Respuesta del servidor
 */
export const uploadFileWithProgress = (endpoint, formData, onProgress) => {
  return new Promise((resolve, reject) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    // Enviar cookies httpOnly en la petición
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = async () => {
      if (xhr.status === 401) {
        try {
          await refreshToken();
          const retryXhr = new XMLHttpRequest();
          retryXhr.open('POST', url);
          retryXhr.withCredentials = true;
          retryXhr.upload.onprogress = xhr.upload.onprogress;
          retryXhr.onload = () => {
            if (retryXhr.status >= 200 && retryXhr.status < 300) {
              if (retryXhr.status === 204) resolve(null);
              else resolve(JSON.parse(retryXhr.responseText));
            } else {
              reject(new Error(`Error ${retryXhr.status}`));
            }
          };
          retryXhr.onerror = () => reject(new Error('Fallo de conexión con el servidor, intente más tarde.'));
          retryXhr.send(formData);
          return;
        } catch {
          notifyAuthError('expired');
          reject(new Error('Sesión expirada'));
          return;
        }
      }

      if (xhr.status >= 200 && xhr.status < 300) {
        if (xhr.status === 204) resolve(null);
        else resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Error ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Fallo de conexión con el servidor, intente más tarde.'));
    xhr.ontimeout = () => reject(new Error('Tiempo de espera agotado'));
    xhr.timeout = 300000;
    xhr.send(formData);
  });
};

/**
 * Cliente HTTP central de la aplicación.
 *
 * Con cookies httpOnly de autenticación:
 * - No se lee ningún token de localStorage
 * - credentials: 'include' envía las cookies automáticamente
 * - El refresh es automático (el servidor rota cookies)
 * - Los errores 401 detonan logout via evento auth:unauthorized.
 *   Excepción: el 401 del login significa credenciales inválidas, por lo que
 *   no se refresca ni se dispara el logout y se propaga el mensaje del servidor.
 *
 * @param {string} endpoint Ruta del endpoint (o URL completa)
 * @param {object} options Opciones de fetch (method, body, headers, etc.)
 * @returns {Promise<object|null>} Respuesta parseada del servidor
 */
export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  // Las credenciales inválidas devuelven 401 en el login, no una sesión caducada.
  const isLoginRequest = url.endsWith(LOGIN_ENDPOINT);

  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const timeout = options.timeout || 15000;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  const signal = options.signal
    ? combineAbortSignals(options.signal, controller.signal)
    : controller.signal;

  let response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
      signal,
      credentials: 'include',
    });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Network error during fetch:', error);
    throw new Error('Fallo de conexión con el servidor, intente más tarde.');
  }
  clearTimeout(timeoutId);

  // Con cookies httpOnly, el acceso 401 puede deberse a un access token expirado.
  // El servidor rota automáticamente las cookies en el refresh, por lo que
  // intentamos refrescar solo cuando la cookie refresh_token podría estar presente.
  // El login queda excluido: su 401 indica credenciales inválidas, no una sesión
  // que renovar.
  if (response.status === 401 && !isLoginRequest) {
    try {
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false;
          refreshPromise = null;
        });
      }
      await refreshPromise;
    } catch {
      notifyAuthError('expired');
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    response = await fetch(url, { ...options, headers, credentials: 'include' });

    if (response.ok) {
      if (response.status === 204) return null;
      return response.json();
    }
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

    if (response.status === 401 && !isLoginRequest) {
      notifyAuthError(errorMessage
        ? (errorMessage.includes('otro dispositivo') || errorMessage.includes('revocado') || errorMessage.includes('invalidada')
          ? 'revoked'
          : 'unauthorized')
        : 'unauthorized');
    } else if (response.status === 403) {
      window.dispatchEvent(new Event('auth:forbidden'));
    }

    if (response.status >= 502 && response.status <= 503) {
      errorMessage = 'Fallo de conexión con el servidor, intente más tarde.';
    } else if (!errorMessage || errorMessage.trim() === '') {
      errorMessage = HTTP_ERROR_MESSAGES[response.status] || `Error inesperado (Código: ${response.status})`;
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};