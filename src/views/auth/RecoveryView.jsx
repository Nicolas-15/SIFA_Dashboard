import { useState } from 'react';
import { Mail, ArrowLeft, ShieldAlert, Key, Lock, CheckCircle } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './components/AuthLayout';
import { requestPasswordRecovery, resetPassword } from '@/services/auth.service';

export function RecoveryView({ onNavigateToLogin }) {
  const [step, setStep] = useState(1); // 1: Request email, 2: Code & New Password, 3: Success
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const handleRequestEmail = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    try {
      await requestPasswordRecovery(email.trim());
      // Limpiar los campos para recibir el nuevo código limpios
      setCode('');
      setNewPassword('');
      setConfirmPassword('');
      setFieldErrors({});
      setStep(2); // Go to code entry
    } catch (err) {
      setLocalError(err.message || 'Error al solicitar el código de recuperación.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLocalError('');
    setFieldErrors({});

    let errors = {};
    if (code.trim().length !== 6) {
      errors.code = 'El código debe tener exactamente 6 dígitos';
    }
    if (newPassword.length < 8) {
      errors.newPassword = 'La contraseña debe tener al menos 8 caracteres';
    }
    if (newPassword !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword(email.trim(), code.trim(), newPassword);
      setStep(3); // Success page
    } catch (err) {
      setLocalError(err.message || 'Error al restablecer la contraseña.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render step 1: Request email code
  if (step === 1) {
    return (
      <AuthLayout
        icon={ShieldAlert}
        iconColorClass="text-secondary"
        title="Recuperar Acceso"
        subtitle="Ingresa tu correo institucional para recibir el código de verificación."
      >
        <form onSubmit={handleRequestEmail} className="space-y-6">
          {localError && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-xs text-red-200 text-center font-medium">
                {localError}
              </p>
            </div>
          )}

          <Input
            label="Correo Institucional"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@correo.com"
            required
            variant="dark"
            className="focus:border-secondary focus:ring-secondary/20"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant="secondary"
            className="text-slate-900 bg-secondary hover:bg-[#fcda46]"
            loadingText="Enviando código..."
          >
            Enviar Código de Recuperación
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onNavigateToLogin}
            type="button"
            className="!text-slate-400 hover:!text-white !shadow-none flex items-center gap-1.5 mx-auto !bg-transparent hover:!bg-transparent !w-auto"
          >
            <ArrowLeft size={14} />
            Volver atrás
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Render step 2: Input code & new password
  if (step === 2) {
    return (
      <AuthLayout
        icon={Key}
        iconColorClass="text-secondary"
        title="Restablecer Contraseña"
        subtitle={`Ingresa el código enviado a ${email} y tu nueva contraseña.`}
      >
        <form onSubmit={handleResetPassword} className="space-y-4">
          {localError && (
            <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-xl">
              <p className="text-xs text-red-200 text-center font-medium">
                {localError}
              </p>
            </div>
          )}

          <Input
            label="Código de Verificación (6 dígitos)"
            icon={Key}
            type="text"
            value={code}
            onChange={(e) => {
              setCode(e.target.value);
              if (fieldErrors.code) setFieldErrors({ ...fieldErrors, code: '' });
            }}
            placeholder="000000"
            maxLength={6}
            required
            variant="dark"
            error={fieldErrors.code}
            className="text-center font-bold tracking-widest text-lg focus:border-secondary focus:ring-secondary/20"
          />

          <Input
            label="Contraseña Nueva (mín. 8 caracteres)"
            icon={Lock}
            type="password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.newPassword) setFieldErrors({ ...fieldErrors, newPassword: '' });
            }}
            placeholder="••••••••"
            required
            variant="dark"
            error={fieldErrors.newPassword}
            className="focus:border-secondary focus:ring-secondary/20"
          />

          <Input
            label="Confirmar Contraseña"
            icon={Lock}
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirmPassword) setFieldErrors({ ...fieldErrors, confirmPassword: '' });
            }}
            placeholder="••••••••"
            required
            variant="dark"
            error={fieldErrors.confirmPassword}
            className="focus:border-secondary focus:ring-secondary/20"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant="secondary"
            className="text-slate-900 bg-secondary hover:bg-[#fcda46] mt-4"
            loadingText="Restableciendo..."
          >
            Restablecer Contraseña
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={() => {
              setCode('');
              setNewPassword('');
              setConfirmPassword('');
              setFieldErrors({});
              setStep(1);
            }}
            type="button"
            className="!text-slate-400 hover:!text-white !shadow-none flex items-center gap-1.5 mx-auto !bg-transparent hover:!bg-transparent !w-auto"
          >
            <ArrowLeft size={14} />
            Volver a ingresar correo
          </Button>
        </div>
      </AuthLayout>
    );
  }

  // Render step 3: Success reset completed
  return (
    <AuthLayout
      icon={CheckCircle}
      iconColorClass="text-green-400"
      title="Contraseña Restablecida"
      subtitle="Tu contraseña ha sido actualizada con éxito y todas las sesiones previas fueron cerradas."
    >
      <div className="text-center space-y-6">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
          <CheckCircle size={28} />
        </div>
        <p className="text-sm text-slate-300">
          Ya puedes iniciar sesión en el sistema usando tus nuevas credenciales de acceso.
        </p>
        <Button
          variant="secondary"
          onClick={onNavigateToLogin}
          className="text-slate-900 bg-secondary hover:bg-[#fcda46] mt-6"
        >
          Ir al Inicio de Sesión
        </Button>
      </div>
    </AuthLayout>
  );
}
