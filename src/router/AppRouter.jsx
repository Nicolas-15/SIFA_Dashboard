import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { SYSTEM_ROLES } from '../utils/constants';

// Vistas
import { LoginView } from '../views/auth/LoginView';
import { RecoveryView } from '../views/auth/RecoveryView';
import { DashboardView } from '../views/dashboard/DashboardView';
import { InfraccionesView } from '../views/infracciones/InfraccionesView';
import { UserManagementView } from '../views/usuarios/UserManagementView';
import { AccessDeniedView } from '../views/auth/AccessDeniedView';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser?.role !== SYSTEM_ROLES.ADMIN) {
    return <AccessDeniedView />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  return (
    <div className="h-screen w-full font-sans text-slate-800 bg-slate-900">
      {children}
    </div>
  );
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Rutas Públicas */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <AuthWrapperView view="login" />
              </PublicRoute>
            }
          />
          <Route
            path="/recovery"
            element={
              <PublicRoute>
                <AuthWrapperView view="recovery" />
              </PublicRoute>
            }
          />

          {/* Rutas Privadas / Dashboard */}
          <Route path="/" element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route path="infracciones" element={<InfraccionesView />} />
            <Route path="usuarios" element={<AdminRoute><UserManagementView /></AdminRoute>} />
          </Route>

          {/* Catch All */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

// Necesitamos un wrapper para inyectar login y navigate a las vistas de auth directamente
const AuthWrapperView = ({ view }) => {
  const { login } = useAuth();
  const navigate = useNavigate();

  if (view === 'login') {
    return <LoginView onLogin={login} onNavigateToRecovery={() => navigate('/recovery')} />;
  }
  return <RecoveryView onNavigateToLogin={() => navigate('/login')} />;
};
