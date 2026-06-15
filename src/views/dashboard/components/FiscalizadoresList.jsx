import { User, Clock, Smartphone, MapPin } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const formatDate = (dateString) => {
  try {
    const date = new Date(dateString);
    return format(date, "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es });
  } catch {
    return dateString;
  }
};

export function FiscalizadoresList({
  fiscalizadores = [],
  selectedFiscalizadorEmail,
  onSelectFiscalizador,
  className = "",
}) {
  return (
    <Card className={className}>
      <div className="mb-3">
        <h3 className="text-base font-bold text-slate-800">
          Fiscalizadores en Terreno
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          {fiscalizadores.length}{" "}
          {fiscalizadores.length === 1
            ? "fiscalizador activo"
            : "fiscalizadores activos"}
        </p>
      </div>

      {fiscalizadores.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <p className="text-sm text-slate-400">
            No hay fiscalizadores activos en este momento
          </p>
        </div>
      ) : (
        <div className="space-y-1 max-h-[460px] overflow-y-auto pr-1">
          {fiscalizadores.map((f) => {
            const isSelected = selectedFiscalizadorEmail === f.email;
            const hasLocation =
              f.latitud !== undefined && f.longitud !== undefined;
            const deviceName = [f.marcaDispositivo, f.modeloDispositivo]
              .filter(Boolean)
              .join(" / ");

            return (
              <button
                key={f.email}
                onClick={() => onSelectFiscalizador?.(f)}
                disabled={!hasLocation || !onSelectFiscalizador}
                className={`w-full text-left flex gap-3 p-2.5 -mx-2.5 rounded-xl transition-colors ${
                  isSelected
                    ? "bg-amber-50 ring-1 ring-amber-300"
                    : hasLocation && onSelectFiscalizador
                      ? "hover:bg-slate-50 cursor-pointer active:bg-slate-100"
                      : "cursor-default opacity-60"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                    isSelected ? "bg-amber-100" : "bg-blue-50"
                  }`}
                >
                  <User
                    size={15}
                    className={
                      isSelected ? "text-amber-600" : "text-blue-600"
                    }
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-sm font-bold text-slate-800 truncate">
                      {f.email}
                    </span>
                    <span className="flex items-center gap-1.5 bg-green-50 px-1.5 py-0.5 rounded-full shrink-0">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-[9px] text-green-700 font-bold uppercase">
                        Activo
                      </span>
                    </span>
                  </div>
                  {deviceName && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Smartphone size={11} className="text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-500 truncate">
                        {deviceName}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <div className="flex items-center gap-1 min-w-0">
                      <Clock size={10} className="text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-500 font-medium truncate">
                        {formatDate(f.ultimaConexion)}
                      </span>
                    </div>
                    {hasLocation && (
                      <div className="flex items-center gap-1 shrink-0">
                        <MapPin size={10} className="text-primary" />
                        <span className="text-[10px] text-primary font-semibold">
                          Ubicado
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </Card>
  );
}
