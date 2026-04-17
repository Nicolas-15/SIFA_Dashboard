import { apiFetch } from './api';

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

export const login = async (email, password) => {
  const data = await apiFetch('/auth-api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username: email, password })
  });

  const payload = decodeJWT(data.token);
  let userRole = "Administrativo JPL";
  
  if (payload && payload.roles) {
    if (payload.roles.includes("ADMIN") || payload.roles.includes("SUPER_ADMIN")) {
      userRole = "Administrador";
    } else if (payload.roles.includes("SUPERVISOR")) {
      userRole = "Supervisor";
    }
  }

  const displayName = payload?.name || data.username || payload?.sub || email;
  const displayLastname = payload?.lastname || '';
  const mappedUser = {
    name: displayName,
    lastname: displayLastname,
    rut: payload?.rut || '',
    email: payload?.email || email,
    role: userRole
  };

  return { token: data.token, user: mappedUser };
};
