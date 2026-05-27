import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, decodeJWT, getUserFromToken, refreshSession } from '@/services/auth.service';
import { SYSTEM_ROLES } from '@/constants/roles';

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
    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (!token && !storedRefreshToken) {
        setIsInitializing(false);
        return;
      }

      // Si hay token, verificar si es válido localmente
      if (token) {
        const payload = decodeJWT(token);
        if (payload && (!payload.exp || payload.exp * 1000 > Date.now())) {
          const user = getUserFromToken(token);
          if (user && user.role !== SYSTEM_ROLES.USER_APP) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsInitializing(false);
            return;
          }
        }
      }

      // Token expirado o ausente: intentar refresh silencioso
      if (storedRefreshToken) {
        try {
          const newToken = await refreshSession();
          const user = getUserFromToken(newToken);
          if (user && user.role !== SYSTEM_ROLES.USER_APP) {
            setCurrentUser(user);
            setIsAuthenticated(true);
            setIsInitializing(false);
            return;
          }
        } catch (e) {
          // Refresh falló, continuar con logout
        }
      }

      localStorage.setItem('auth_error', 'expired');
      logout();
      setIsInitializing(false);
    };

    restoreSession();
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
      
      if (user.role === SYSTEM_ROLES.USER_APP) {
        throw new Error('Tu cuenta no tiene permisos para acceder a esta plataforma administrativa.');
      }

      localStorage.setItem('token', token);
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login fetch error:', err);
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (isInitializing) {
    return <div className="h-screen w-full flex items-center justify-center bg-slate-900 text-white">Validando sesión...</div>;
  }

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
