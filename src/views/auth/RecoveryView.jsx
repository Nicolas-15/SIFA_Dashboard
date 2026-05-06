import { useState } from 'react';
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AuthLayout } from './components/AuthLayout';

export function RecoveryView({ onNavigateToLogin }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1500);
  };

  return (
    <AuthLayout
      icon={ShieldAlert}
      iconColorClass="text-secondary"
      title="Recuperar Acceso"
      subtitle="Ingresa tu correo institucional para recibir instrucciones de recuperación."
    >
      {isSuccess ? (
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
            <Mail size={28} />
          </div>
          <h3 className="text-white font-bold text-lg">Enlace enviado</h3>
          <p className="text-sm text-slate-300">
            Si <span className="font-semibold text-white">{email}</span> existe en nuestro sistema, recibirás un enlace en los próximos minutos.
          </p>
          <Button
            variant="ghost"
            onClick={onNavigateToLogin}
            className="!text-white !bg-white/10 hover:!bg-white/20 mt-6"
          >
            Volver a Iniciar Sesión
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Correo Institucional"
            icon={Mail}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ejemplo@elquisco.cl"
            required
            variant="dark"
            className="focus:border-secondary focus:ring-secondary/20"
          />

          <Button
            type="submit"
            isLoading={isLoading}
            variant="secondary"
            className="text-slate-900 bg-secondary hover:bg-[#fcda46]"
          >
            Recuperar Contraseña
          </Button>
        </form>
      )}

      {/* Footer link */}
      {!isSuccess && (
        <div className="mt-6 text-center">
          <Button
            variant="ghost"
            onClick={onNavigateToLogin}
            type="button"
            className="!text-slate-400 hover:!text-white !shadow-none flex items-center gap-1.5 mx-auto"
          >
            <ArrowLeft size={14} />
            Volver atrás
          </Button>
        </div>
      )}
    </AuthLayout>
  );
}
