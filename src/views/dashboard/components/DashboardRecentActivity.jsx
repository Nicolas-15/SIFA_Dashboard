import { Receipt, User } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function DashboardRecentActivity({ infractions, onSelectInfraction, selectedInfractionId }) {
  const recentInfractions = [...infractions]
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 5);

  return (
    <Card>
      <h3 className="text-base font-bold text-slate-800 mb-4">
        Actividad Reciente
      </h3>
      <div className="space-y-1">
        {recentInfractions.map((inf) => {
          const hasLocation = inf.location?.lat && inf.location?.lng;
          const isSelected = selectedInfractionId === inf.id;
          return (
            <button
              key={inf.id}
              onClick={() => {
                if (!hasLocation || !onSelectInfraction) return;
                onSelectInfraction({
                  id: inf.id,
                  lat: parseFloat(inf.location.lat),
                  lng: parseFloat(inf.location.lng),
                  plate: inf.vehicle?.plate || "S/P",
                  fiscalizador: inf.idFiscalizador || "",
                  tipoNombre: inf.tipoInfraccion?.nombre || "",
                });
              }}
              disabled={!hasLocation || !onSelectInfraction}
              className={`w-full text-left flex gap-3 p-2.5 -mx-2.5 rounded-xl transition-colors ${
                isSelected
                  ? "bg-primary/5 ring-1 ring-primary/20"
                  : hasLocation && onSelectInfraction
                    ? "hover:bg-slate-50 cursor-pointer active:bg-slate-100"
                    : "cursor-default"
              }`}
            >
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <Receipt size={15} className="text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <p className="text-sm font-bold text-slate-800 font-mono">
                    {inf.vehicle?.plate || "S/P"}
                  </p>
                  <StatusBadge status={inf.status} tiny />
                </div>
                <p className="text-xs text-slate-500 truncate mt-0.5">
                  {inf.tipoInfraccion.nombre}
                </p>
                <div className="flex items-center justify-between gap-2 mt-0.5">
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                    {new Date(inf.fecha).toLocaleTimeString("es-CL")}
                  </p>
                  <div className="flex items-center gap-1 min-w-0">
                    <User size={10} className="text-slate-400 shrink-0" />
                    <p className="text-[10px] text-slate-500 font-medium truncate">
                      {inf.idFiscalizador || ""}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
