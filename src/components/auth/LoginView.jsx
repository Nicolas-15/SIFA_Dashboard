import { useState } from 'react';
import { Lock, Mail, ShieldCheck } from 'lucide-react';

export function LoginView({ onLogin, onNavigateToRecovery, error: extError }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError('');
    setIsLoading(true);

    // Mock API call delay
    setTimeout(() => {
      setIsLoading(false);
      const success = onLogin(email, password);
      if (!success) {
        setLocalError('Correo o contraseña incorrectos. Verifica tus credenciales.');
      }
    }, 1200);
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
                    placeholder="admin@elquisco.cl"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl outline-none focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="block text-xs font-semibold text-slate-300">
                    Contraseña
                  </label>
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 text-white placeholder:text-slate-500 rounded-xl outline-none focus:bg-white/10 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium tracking-wider"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`
                w-full py-3.5 rounded-xl font-bold text-sm tracking-wide text-white 
                shadow-lg transition-all duration-300 flex items-center justify-center gap-2
                ${isLoading ? 'bg-primary/70 cursor-wait shadow-none' : 'bg-primary hover:bg-primary/90 hover:shadow-primary/50 hover:-translate-y-0.5'}
              `}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Autenticando...</span>
                </>
              ) : (
                <span>Ingresar al Sistema</span>
              )}
            </button>
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
        
        {/* Helper Note for testing */}
        <div className="mt-8 text-center opacity-40">
          <p className="text-[10px] text-slate-200">
            Login de prueba: admin@elquisco.cl / 123456
          </p>
        </div>

      </div>
    </div>
  );
}
