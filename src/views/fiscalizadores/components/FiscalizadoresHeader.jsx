import { Search } from "lucide-react";
import { Input } from "@/components/ui/Input";

export function FiscalizadoresHeader({ search, setSearch }) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h2 className="text-2xl font-black text-slate-800">
          Usuarios Fiscalizadores
        </h2>
        <p className="text-sm text-slate-500">
          Lista de personal autorizado para fiscalización en terreno.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <Input
          placeholder="Buscar fiscalizador..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={Search}
          className="w-64 !py-2"
        />
      </div>
    </div>
  );
}
