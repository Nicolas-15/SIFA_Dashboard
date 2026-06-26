import { Clock, MapPin } from "lucide-react";
import { formatDateTime } from "@/utils/date";

/**
 * Fila superior del modal: Boleta, Parte, Fecha de Citación y Agente.
 * Componente en modo solo lectura.
 */
export function InfractionNumeraciones({ data }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-100 p-3 rounded-xl border border-slate-200">
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
          N° ID
        </p>
        <input
          type="text"
          value={data?.id || "-"}
          readOnly
          className="w-full text-sm rounded-lg border pe-3 py-2 border-transparent bg-transparent
            cursor-default pointer-events-none truncate font-semibold outline-none h-[38px]
            text-slate-800 font-mono tracking-wide text-left"
        />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
          Fecha de Emisión
        </p>
        <input
          type="text"
          value={
            data?.fecha ? formatDateTime(data.fecha) : "-"
          }
          readOnly
          className="w-full text-sm rounded-lg border pe-3 py-2 border-transparent bg-transparent
            cursor-default pointer-events-none truncate font-semibold outline-none h-[38px]
            text-slate-800 tracking-wide text-left"
        />
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">
          Agente / Fiscalizador
        </p>
        <input
          type="text"
          value={data?.idFiscalizador || "-"}
          readOnly
          className="w-full text-sm rounded-lg border pe-3 py-2 border-transparent bg-transparent
            cursor-default pointer-events-none truncate font-semibold outline-none h-[38px]
            text-slate-800 tracking-wide text-left"
        />
      </div>
    </div>
  );
}
