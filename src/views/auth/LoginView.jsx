import { useState, useEffect, useCallback } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './components/AuthLayout';
import { Toast } from '@/components/ui/Toast';

export function LoginView({ onLogin, onNavigateToRecovery, error: extError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const authError = localStorage.getItem('auth_error');
    if (authError) {
      let message = 'Sesión no autorizada o expirada.';
      const restoreFlag = sessionStorage.getItem('restore_in_progress');
      if (restoreFlag === 'true') {
        message = 'La sesión se cerró debido a que hay una restauración en curso. Vuelve a iniciar sesión.';
        sessionStorage.removeItem('restore_in_progress');
      } else if (authError === 'revoked') {
        message = 'Se ha iniciado sesión en otro dispositivo o la sesión fue revocada.';
      } else if (authError === 'unauthorized') {
        message = 'Redirigiendo debido a la invalidez del token.';
      } else if (authError === 'expired') {
        message = 'Su sesión ha expirado por inactividad. Por favor, vuelva a ingresar.';
      }
      setToast({
        message,
        type: 'error',
        key: Date.now()
      });
      localStorage.removeItem('auth_error');
    }
  }, []);

  const closeToast = useCallback(() => setToast(null), []);

  const validate = () => {
    const newErrors = { email: '', password: '' };
    let isValid = true;

    if (!email.trim()) {
      newErrors.email = 'El correo es obligatorio';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Formato de correo inválido';
      isValid = false;
    }

    if (!password) {
      newErrors.password = 'La contraseña es obligatoria';
      isValid = false;
    } else if (password.length < 4) {
      newErrors.password = 'Mínimo 4 caracteres';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (!validate()) return;

    setIsLoading(true);
    try {
      await onLogin(email.trim(), password);
    } catch (err) {
      setLocalError(err.message || 'Error de conexión con el servidor.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AuthLayout
        icon={ShieldCheck}
        iconColorClass="text-primary"
        title="SIFA"
        subtitle="I. Municipalidad de El Quisco"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {(localError || extError) && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-xs text-red-200 text-center font-medium">
                {localError || extError}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <Input
              label="Correo Institucional"
              icon={Mail}
              type="text"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors({ ...errors, email: '' });
              }}
              placeholder="usuario@correo.com"
              variant="dark"
              error={errors.email}
            />

            <Input
              label="Contraseña"
              icon={Lock}
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                if (errors.password) setErrors({ ...errors, password: '' });
              }}
              placeholder="••••••••"
              variant="dark"
              className="tracking-wider"
              error={errors.password}
            />
          </div>

          <Button
            type="submit"
            isLoading={isLoading}
            loadingText="Autenticando..."
            variant="primary"
          >
            Ingresar al Sistema
          </Button>
        </form>

        {/* Footer link */}
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onNavigateToRecovery}
            type="button"
            className="!text-slate-400 hover:!text-white !shadow-none !text-xs !bg-transparent hover:!bg-transparent !w-auto mx-auto"
          >
            ¿Olvidaste tu contraseña?
          </Button>
        </div>
      </AuthLayout>

      {toast && (
        <Toast
          key={toast.key}
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </>
  );
}
