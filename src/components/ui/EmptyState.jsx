import { Search } from 'lucide-react';

export function EmptyState({ query, filter }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-6">
      <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
        <Search size={28} className="text-slate-300" />
      </div>
      <p className="text-slate-800 font-bold text-lg">Sin resultados</p>
      <p className="text-slate-500 text-sm mt-1">
        {query
          ? `No hay infracciones que coincidan con "${query}"`
          : `No hay infracciones con estado "${filter}"`
        }
      </p>
    </div>
  );
}
