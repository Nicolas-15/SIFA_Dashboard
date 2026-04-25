const API_BASE_URL = 'http://54.161.59.28/';
export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const fullUrl = url.startsWith('http') ? url : ${ API_BASE_URL }${ url };

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    // Solo expulsar si el error viene de una ruta PROTEGIDA (no del login en sí)
    const isLoginEndpoint = url.includes('/login');
    if (!isLoginEndpoint && (response.status === 401 || response.status === 403)) {
      // Protocolo estricto de expulsion: el Gateway o Auth Service rechazaron el token
      localStorage.clear();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || errorData?.message || errorData?.error || `HTTP Error ${response.status}`);
  }

  // HTTP 204 No Content: respuesta válida sin body (ej: DELETE revocar, PATCH activar)
  if (response.status === 204) return null;

  return response.json();
};
