import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, decodeJWT, getUserFromToken } from '../services/auth.service';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restaurar sesión al inicializar desde el token en localStorage
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsInitializing(false);
      return;
    }

    const payload = decodeJWT(token);
    // Si el token no se puede decodificar o está expirado, limpiar sesión
    if (!payload || (payload.exp && payload.exp * 1000 < Date.now())) {
      logout();
      setIsInitializing(false);
      return;
    }

    // Token válido localmente: restaurar usuario desde el token
    // El API Gateway se encargará de rechazar peticiones si el token no es válido en el servidor
    const user = getUserFromToken(token);
    if (user) {
      setCurrentUser(user);
      setIsAuthenticated(true);
    } else {
      logout();
    }

    setIsInitializing(false);
  }, []);

  // Escuchar evento de 401 que lanza la API global
  useEffect(() => {
    const handleUnauthorized = () => logout();
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    try {
      const { token, user } = await authLogin(email, password);
      localStorage.setItem('token', token);
      // Seguridad: ya NO guardamos el objeto user en localStorage para evitar spoofing
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error("Login fetch error:", err);
      throw err; // Propagar el error para que la vista lo maneje
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    // localStorage.removeItem('user'); // Ya no existe
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isInitializing) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">Validando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{
      currentUser,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
