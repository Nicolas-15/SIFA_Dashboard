import { useState } from 'react';
import { Mail, ArrowLeft, ShieldAlert } from 'lucide-react';

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
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-900 relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute top-0 w-full h-[500px] pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-50" />
      </div>

      <div className="w-full max-w-sm px-4 relative z-10">
        
        {/* Header/Logo */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mb-6 border border-white/5">
            <ShieldAlert size={32} className="text-secondary" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Recuperar Acceso
          </h1>
          <p className="text-slate-400 text-sm">
            Ingresa tu correo institucional para recibir instrucciones de recuperación.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-3xl shadow-2xl">
          
          {isSuccess ? (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-500/30">
                <Mail size={28} />
              </div>
              <h3 className="text-white font-bold text-lg">Enlace enviado</h3>
              <p className="text-sm text-slate-300">
                Si <span className="font-semibold text-white">{email}</span> existe en nuestro sistema, recibirás un enlace en los próximos minutos.
              </p>
              <button
                onClick={onNavigateToLogin}
                className="w-full py-3 rounded-xl bg-white/10 mt-6 text-white text-sm font-bold hover:bg-white/20 transition-colors"
              >
                Volver a Iniciar Sesión
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 ml-1">
                  Correo Institucional
                </label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ejemplo@elquisco.cl"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl outline-none focus:bg-white/10 focus:border-secondary focus:ring-2 focus:ring-secondary/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-slate-900 
                  transition-all duration-300 flex items-center justify-center gap-2
                  ${isLoading ? 'bg-secondary/70 cursor-wait' : 'bg-secondary hover:bg-[#fcda46] hover:shadow-lg hover:shadow-secondary/20 hover:-translate-y-0.5'}
                `}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                ) : (
                  <span>Recuperar Contraseña</span>
                )}
              </button>
            </form>
          )}

        </div>

        {/* Footer link */}
        {!isSuccess && (
          <div className="mt-6 text-center">
            <button 
              onClick={onNavigateToLogin}
              type="button"
              className="text-xs text-slate-400 font-medium hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto"
            >
              <ArrowLeft size={14} />
              <span>Volver atrás</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
