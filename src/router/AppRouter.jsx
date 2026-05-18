import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { useAuth, AuthProvider } from "@/core/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { SYSTEM_ROLES } from "@/constants/roles";

// Vistas
import { LoginView } from "@/views/auth/LoginView";
import { RecoveryView } from "@/views/auth/RecoveryView";
import { DashboardView } from "@/views/dashboard/DashboardView";
import { InfraccionesView } from "@/views/infracciones/InfraccionesView";
import { UserManagementView } from "@/views/usuarios/UserManagementView";
import { TipoInfraccionesView } from "@/views/tipoInfracciones/TipoInfraccionesView";
import { AccessDeniedView } from "@/views/auth/AccessDeniedView";

// Para rutas protegidas
const ProtectedRoute = ({ children }) => {
  // Se checkea si el usuario está autenticado
  const { isAuthenticated, currentUser } = useAuth();

  // Si no lo está, se devuelve al login
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // Seguridad extra: si tiene el rol restringido, no puede entrar
  if (currentUser?.role === SYSTEM_ROLES.USER_APP) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Para rutas de admin
const AdminRoute = ({ children }) => {
  const { currentUser } = useAuth();
  if (currentUser?.role !== SYSTEM_ROLES.ADMIN) {
    return <AccessDeniedView />;
  }
  return children;
};

// Constante para usarlo en rutas públicas
const PublicRoute = ({ children }) => {
  // Se revisa si ya está autenticado
  const { isAuthenticated } = useAuth();
  // En caso de que lo esté, navega al dashboard.
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  // En caso contrario, renderiza la ruta pública.
  return (
    <div className="h-screen w-full font-sans text-slate-800 bg-slate-900">
      {children}
    </div>
  );
};

const InfraccionesRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const allowedRoles = [
    SYSTEM_ROLES.ADMIN,
    SYSTEM_ROLES.SUPERVISOR,
    SYSTEM_ROLES.DEFAULT,
  ];

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <AccessDeniedView />;
  }
  return children;
};

const TipoInfraccionesRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const allowedRoles = [
    SYSTEM_ROLES.ADMIN,
    SYSTEM_ROLES.SUPERVISOR,
  ];

  if (!currentUser || !allowedRoles.includes(currentUser.role)) {
    return <AccessDeniedView />;
  }
  return children;
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
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardView />} />
            <Route
              path="infracciones"
              element={
                <InfraccionesRoute>
                  <InfraccionesView />
                </InfraccionesRoute>
              }
            />
            <Route
              path="usuarios"
              element={
                <AdminRoute>
                  <UserManagementView />
                </AdminRoute>
              }
            />
            <Route
              path="tipo-infracciones"
              element={
                <TipoInfraccionesRoute>
                  <TipoInfraccionesView />
                </TipoInfraccionesRoute>
              }
            />
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

  if (view === "login") {
    return (
      <LoginView
        onLogin={login}
        onNavigateToRecovery={() => navigate("/recovery")}
      />
    );
  }
  return <RecoveryView onNavigateToLogin={() => navigate("/login")} />;
};
