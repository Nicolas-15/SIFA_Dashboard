import { Spinner } from '@/components/ui/Spinner';

export function ListView({ title, filters, loading, hasExistingData, table, mobile, children, loadingLabel }) {
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

        {loading && !hasExistingData && (
          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <Spinner />
              <p className="text-sm font-semibold text-slate-500">Cargando {label}...</p>
            </div>
          </div>
        )}

        {(!loading || hasExistingData) && (
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
