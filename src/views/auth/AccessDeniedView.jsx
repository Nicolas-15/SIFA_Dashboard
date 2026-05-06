import { Shield } from 'lucide-react';
import { useAuth } from '@/core/AuthContext';

export function AccessDeniedView() {
  const { currentUser } = useAuth();

  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 bg-white border border-slate-200 rounded-2xl shadow-sm pb-10">
      <Shield size={64} className="mb-4 text-slate-300" />
      <h2 className="text-xl font-black text-slate-700 uppercase tracking-widest">
        Acceso Denegado
      </h2>
      <p className="font-semibold text-sm mt-3">
        Tu rol de {currentUser?.role || 'Invitado'} no tiene privilegios operativos para acceder a esta vista.
      </p>
    </div>
  );
}
