import { useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 relative overflow-hidden">

      {/* Background decorations */}
      <div className="absolute inset-0 bg-slate-900 pointer-events-none" />
      <div className="absolute top-0 w-full h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-secondary/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-sm px-4 relative z-10">

        {/* Header/Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 mb-6 relative overflow-hidden group">
            <ShieldCheck size={32} className="text-white" />
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-widest leading-tight">
            SIFA
          </h1>
          <p className="text-slate-400 mt-2 font-medium text-sm">
            I. Municipalidad de El Quisco
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
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
            <button
              onClick={onNavigateToRecovery}
              type="button"
              className="text-xs text-slate-400 font-medium hover:text-white transition-colors"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
