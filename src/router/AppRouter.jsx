import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useAuth, AuthProvider } from '../contexts/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Vistas
import { LoginView } from '../views/auth/LoginView';
import { RecoveryView } from '../views/auth/RecoveryView';
import { DashboardView } from '../views/dashboard/DashboardView';
import { InfraccionesView } from '../views/infracciones/InfraccionesView';
import { UserManagementView } from '../views/usuarios/UserManagementView';
import { Shield } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser?.role !== 'Administrador') {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm pb-10">
        <Shield size={64} className="mb-4 text-slate-300" />
        <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest">Acceso Denegado</h2>
        <p className="font-semibold text-sm mt-3">Tu rol de {currentUser?.role} no tiene privilegios operativos para gestionar usuarios.</p>
      </div>
    );
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
