import { createContext, useContext, useState, useEffect } from 'react';
import { login as authLogin, checkSessionStatus, logout as apiLogout } from '@/services/auth.service';
import { SYSTEM_ROLES } from '@/constants/roles';
import SessionLoadingScreen from '@/components/ui/SessionLoadingScreen';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Restaurar sesión al inicializar consultando el endpoint /status.
  // Con cookies httpOnly, el token viaja en la cookie y el servidor
  // valida si la sesión sigue siendo válida.
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const status = await checkSessionStatus();

        if (status?.valid && status.user) {
          const user = {
            name: status.user.name || status.user.email,
            lastname: status.user.lastname || '',
            rut: status.user.rut || '',
            email: status.user.email,
            role: status.user.roles?.some(r => r.includes('ADMIN'))
              ? SYSTEM_ROLES.ADMIN
              : status.user.roles?.some(r => r.includes('SUPERVISOR'))
                ? SYSTEM_ROLES.SUPERVISOR
                : status.user.roles?.some(r => r.includes('JPL') || r.includes('DEFAULT'))
                  ? SYSTEM_ROLES.DEFAULT
                  : SYSTEM_ROLES.USER_APP,
          };

          if (user.role !== SYSTEM_ROLES.USER_APP) {
            setCurrentUser(user);
            setIsAuthenticated(true);
          }
        } else if (status?.error) {
          // La sesión expiró o fue revocada: informar al usuario
          const errorType = status.error.includes('revocada')
            ? 'revoked'
            : 'expired';
          localStorage.setItem('auth_error', errorType);
        }
      } catch (e) {
        // Fallo de conexión o sesión inválida: no autenticar
        console.warn('No se pudo restaurar la sesión:', e);
      } finally {
        setIsInitializing(false);
      }
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
      const { user } = await authLogin(email, password);

      if (user.role === SYSTEM_ROLES.USER_APP) {
        throw new Error('Tu cuenta no tiene permisos para acceder a esta plataforma administrativa.');
      }

      // Los tokens se guardan en cookies httpOnly; la respuesta solo trae el usuario
      setCurrentUser(user);
      setIsAuthenticated(true);
      return true;
    } catch (err) {
      console.error('Login fetch error:', err);
      throw err;
    }
  };

  const logout = async () => {
    try {
      // El servidor revoca el token y limpia las cookies httpOnly
      await apiLogout();
    } catch (err) {
      console.warn('Logout API call failed, cleaning up locally:', err);
    } finally {
      // Limpiar estado local (las cookies se limpian en el servidor).
      // No se borra sessionStorage completo para preservar restore_in_progress,
      // que LoginView usa para mostrar el mensaje de restauración en curso.
      localStorage.removeItem('auth_error');
      sessionStorage.removeItem('auth_error');
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  if (isInitializing) {
    return <SessionLoadingScreen />;
  }

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};