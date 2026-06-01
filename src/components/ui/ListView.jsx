export function ListView({ title, filters, loading, hasExistingData, table, mobile, children }) {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-3">
      <h2 className="text-xl md:text-2xl font-bold text-slate-800 my-0 pt-0">{title}</h2>

      {filters}

      <div className="relative flex-1 flex flex-col">
        {loading && hasExistingData && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {loading && !hasExistingData && (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {!loading && (
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
