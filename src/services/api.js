export const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem('token');
      localStorage.clear();
      window.dispatchEvent(new Event('auth:unauthorized'));
    }
    const errorData = await response.json().catch(() => null);
    
    let errorMessage = `HTTP Error ${response.status}`;

    if (errorData) {
      const rawError = errorData.error || errorData;
      errorMessage = (typeof rawError === 'object' && rawError !== null)
        ? Object.values(rawError).flat().join('\n')
        : String(rawError);
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};