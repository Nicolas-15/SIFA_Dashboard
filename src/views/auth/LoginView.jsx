import { useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './components/AuthLayout';

export function LoginView({ onLogin, onNavigateToRecovery, error: extError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    try {
      await onLogin(email, password);
    } catch (err) {
      setLocalError(err.message || 'Error de conexión con el sistema central.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="usuario@correo.com"
            required
            variant="dark"
          />

          <Input
            label="Contraseña"
            icon={Lock}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            variant="dark"
            className="tracking-wider"
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
          className="!text-slate-400 hover:!text-white !shadow-none !text-xs"
        >
          ¿Olvidaste tu contraseña?
        </Button>
      </div>
    </AuthLayout>
  );
}
