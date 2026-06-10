import { Spinner } from '@/components/ui/Spinner';

export function ListView({ title, filters, loading, error, onRetry, hasExistingData, table, mobile, children, loadingLabel }) {
  const label = loadingLabel ?? title?.toLowerCase() ?? 'datos';
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-3">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 my-0 pt-0">{title}</h2>

      {filters}

      <div className="relative flex-1 flex flex-col">
        {loading && hasExistingData && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm font-semibold text-slate-500">Actualizando {label}...</p>
            </div>
          </div>
        )}

        {loading && !hasExistingData && !error && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm font-semibold text-slate-500">Cargando {label}...</p>
            </div>
          </div>
        )}

        {error && !hasExistingData && (
          <div className="flex-1 flex items-center justify-center py-12 bg-white border border-slate-200 rounded-2xl shadow-sm min-h-[300px]">
            <div className="text-center max-w-sm px-6">
              <div className="w-16 h-16 rounded-2xl bg-red-100 flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚠️</span>
              </div>
              <h2 className="text-xl font-black text-slate-800 mb-2">
                Servicio no disponible
              </h2>
              <p className="text-sm text-slate-500 mb-6">
                No se pudo establecer conexión con el servidor para obtener los datos de {label}.
              </p>
              {onRetry && (
                <button
                  onClick={onRetry}
                  className="px-5 py-2.5 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-sm"
                >
                  Reintentar conexión
                </button>
              )}
            </div>
          </div>
        )}

        {error && hasExistingData && (
          <div className="mb-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
            No se pudieron actualizar los datos de {label}. Mostrando datos locales.
          </div>
        )}

        {(!loading || hasExistingData) && (!error || hasExistingData) && (
          <>
            <div className="hidden md:flex flex-1 flex-col">{table}</div>

            {mobile && (
              <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
                {mobile}
              </div>
            )}
          </>
        )}
      </div>

      {children}
    </div>
  );
}
