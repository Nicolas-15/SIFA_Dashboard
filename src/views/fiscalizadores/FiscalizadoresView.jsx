import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { Search } from "lucide-react";

import { useFiscalizadoresActivos } from "@/core/useFiscalizadoresActivos";
import { FiscalizadoresTable } from "./components/FiscalizadoresTable";
import { FiscalizadoresMobileCards } from "./components/FiscalizadoresMobileCards";
import { TableCard } from "@/components/ui/TableCard";
import { Input } from "@/components/ui/Input";

export function FiscalizadoresView() {
  const { showToast } = useOutletContext();
  const {
    fiscalizadores,
    loading,
    error,
    page,
    totalPages,
    totalElements,
    first,
    last,
    goToPage,
  } = useFiscalizadoresActivos();

  const [search, setSearch] = useState("");

  const filtered = fiscalizadores.filter((f) =>
    f.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-800">
            Fiscalizadores en Terreno
          </h2>
          <p className="text-sm text-slate-500">
            Personal que ha reportado actividad en los últimos 10 minutos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            placeholder="Buscar por email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            icon={Search}
            className="w-64 !py-2"
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm font-medium">
          No se pudieron cargar los fiscalizadores activos.
        </div>
      )}

      <div className="relative flex-1 flex flex-col">
        {loading && fiscalizadores.length > 0 && (
          <div className="absolute inset-0 z-10 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-2xl">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary" />
          </div>
        )}

        {/* Desktop table */}
        <div className="hidden md:flex flex-1 flex-col">
          <TableCard
            totalElements={totalElements}
            totalPages={totalPages}
            page={page}
            first={first}
            last={last}
            loading={loading}
            onPageChange={goToPage}
          >
            <FiscalizadoresTable
              loading={loading}
              filtered={filtered}
              search={search}
            />
          </TableCard>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden flex-1 overflow-auto space-y-3 pb-4">
          <FiscalizadoresMobileCards
            filtered={filtered}
            search={search}
          />
        </div>
      </div>
    </div>
  );
}