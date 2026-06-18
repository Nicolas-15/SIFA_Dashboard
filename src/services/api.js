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

export async function refreshToken() {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) {
    throw new Error('No refresh token disponible');
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/api/v1/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
      signal: controller.signal,
    });
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
  clearTimeout(timeoutId);

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    throw new Error(errorBody?.message || 'Sesión expirada');
  }

  const data = await response.json();
  localStorage.setItem('token', data.accessToken);
  if (data.refreshToken) {
    localStorage.setItem('refreshToken', data.refreshToken);
  }
  return data.accessToken;
}

function isTokenLocallyExpired(token) {
  if (!token) return true;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return !payload.exp || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

export const apiFetch = async (endpoint, options = {}) => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  const signal = options.signal
    ? combineAbortSignals(options.signal, controller.signal)
    : controller.signal;

  let response;
  try {
    response = await fetch(url, { ...options, headers, signal });
  } catch (error) {
    clearTimeout(timeoutId);
    console.error('Network error during fetch:', error);
    throw new Error('Fallo de conexión con el servidor, intente más tarde.');
  }
  clearTimeout(timeoutId);

  const shouldRefresh = (
    response.status === 401 ||
    (response.status === 403 && isTokenLocallyExpired(localStorage.getItem('token')))
  ) && localStorage.getItem('refreshToken');

  if (shouldRefresh) {
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
      clearAuth();
      localStorage.setItem('auth_error', 'expired');
      window.dispatchEvent(new Event('auth:unauthorized'));
      throw new Error('Sesión expirada. Por favor, inicie sesión nuevamente.');
    }

    const retryHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`,
      ...options.headers,
    };

    response = await fetch(url, { ...options, headers: retryHeaders });

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

    if (response.status === 401) {
      clearAuth();

      if (errorMessage && (errorMessage.includes('otro dispositivo') || errorMessage.includes('revocado') || errorMessage.includes('invalidada'))) {
        localStorage.setItem('auth_error', 'revoked');
      } else {
        localStorage.setItem('auth_error', 'unauthorized');
      }

      window.dispatchEvent(new Event('auth:unauthorized'));
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
