import { useState, useEffect } from "react";
import { X, CalendarClock, Car, User, MapPin, FileText, Clock, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parseISODateTime } from "@/views/infracciones/utils/infractionFormatters";

function InfoRow({ label, value, mono = false }) {
  if (!value) return null;
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</span>
      <span className={`text-sm font-semibold text-slate-700 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}

function SectionCard({ icon, title, children }) {
  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 space-y-3">
      <div className="flex items-center gap-2 text-slate-600">
        {icon}
        <h4 className="text-xs font-black uppercase tracking-wider">{title}</h4>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {children}
      </div>
    </div>
  );
}

function isFuture(fecha) {
  if (!fecha) return false;
  return new Date(fecha) >= new Date();
}

export function CitacionModal({ citacion, onClose, onReprogramar, showToast, currentUser }) {
  const [showReprogramar, setShowReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const inf = citacion?.infraccion;
  const vehicle = inf?.vehicle;
  const prop = inf?.propietario;
  const tipo = inf?.tipoInfraccion;
  const location = inf?.location;

  // RBAC: solo JPL puede reprogramar
  const isJPL = currentUser?.role === "Administrativo JPL";
  const canReprogramar = isJPL && isFuture(citacion?.fecha);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleReprogramar = async () => {
    if (!nuevaFecha) {
      showToast("Seleccione una fecha y hora válida.", "error");
      return;
    }

    const fechaISO = nuevaFecha.includes("T") ? nuevaFecha + ":00" : nuevaFecha;

    setSubmitting(true);
    try {
      await onReprogramar(citacion.idCitacion, fechaISO);
      showToast("Citación reprogramada exitosamente");
      setShowReprogramar(false);
      setNuevaFecha("");
    } catch (err) {
      showToast(err.message || "Error al reprogramar la citación", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-3xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[93vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b rounded-t-2xl shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <CalendarClock size={20} className="text-primary" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-800">
                Citación #{citacion?.idCitacion}
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Infracción #{inf?.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={inf?.status} />
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-4">
          {/* Fecha de citación destacada */}
          <div className={`rounded-xl border-2 p-4 flex items-center gap-4 ${
            isFuture(citacion?.fecha)
              ? 'bg-primary/5 border-primary/30'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`p-3 rounded-xl ${isFuture(citacion?.fecha) ? 'bg-primary/10' : 'bg-slate-100'}`}>
              <CalendarClock size={24} className={isFuture(citacion?.fecha) ? 'text-primary' : 'text-slate-400'} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fecha de Citación al JPL
              </p>
              <p className={`text-lg font-black ${isFuture(citacion?.fecha) ? 'text-primary' : 'text-slate-600'}`}>
                {citacion?.fecha ? parseISODateTime(citacion.fecha) : 'No definida'}
              </p>
              <p className={`text-xs font-semibold ${isFuture(citacion?.fecha) ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isFuture(citacion?.fecha) ? '● Próxima' : '● Pasada'}
              </p>
            </div>
          </div>

          {/* Reprogramar */}
          {showReprogramar && (
            <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl space-y-3 animate-in slide-in-from-top-4 duration-300">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertTriangle size={15} className="shrink-0" />
                <p className="text-xs font-bold">Reprogramar citación</p>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Nueva fecha y hora <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={nuevaFecha}
                  onChange={(e) => setNuevaFecha(e.target.value)}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-800"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowReprogramar(false); setNuevaFecha(""); }}
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleReprogramar}
                  isLoading={submitting}
                  loadingText="Reprogramando..."
                >
                  Confirmar nueva fecha
                </Button>
              </div>
            </div>
          )}

          {/* Infractor */}
          {prop && (
            <SectionCard icon={<User size={14} />} title="Infractor">
              <InfoRow label="Nombre completo" value={prop.nombreCompleto} />
              <InfoRow label="RUT" value={prop.rut} mono />
              <InfoRow label="Dirección" value={prop.direccion} />
              <InfoRow label="Comuna" value={prop.comuna} />
              <InfoRow label="Correo" value={prop.correo} />
              <InfoRow label="Teléfono" value={prop.telefono} />
              <InfoRow label="Profesión" value={prop.profesion} />
              <InfoRow label="Estado civil" value={prop.estadoCivil} />
            </SectionCard>
          )}

          {/* Vehículo */}
          {vehicle && (
            <SectionCard icon={<Car size={14} />} title="Vehículo">
              <InfoRow label="Patente" value={vehicle.plate} mono />
              <InfoRow label="Marca" value={vehicle.brand} />
              <InfoRow label="Modelo" value={vehicle.model} />
              <InfoRow label="Año" value={vehicle.year} />
              <InfoRow label="Color" value={vehicle.color} />
              <InfoRow label="Tipo" value={vehicle.type} />
              <InfoRow label="N° Motor" value={vehicle.nroMotor} mono />
              <InfoRow label="N° Serie" value={vehicle.nroSerie} mono />
            </SectionCard>
          )}

          {/* Infracción */}
          {tipo && (
            <SectionCard icon={<FileText size={14} />} title="Infracción">
              <InfoRow label="Código" value={tipo.id} />
              <InfoRow label="Tipo" value={tipo.nombre} />
              <div className="col-span-2">
                <InfoRow label="Disposición infringida" value={tipo.disposicionInfringida} />
              </div>
            </SectionCard>
          )}

          {/* Detalles adicionales */}
          <SectionCard icon={<Clock size={14} />} title="Detalles">
            <InfoRow label="Fecha emisión" value={inf?.fecha ? parseISODateTime(inf.fecha) : '-'} />
            <InfoRow label="Fiscalizador" value={inf?.idFiscalizador || '-'} />
            {location && (
              <div className="col-span-2 flex items-start gap-1.5">
                <MapPin size={13} className="text-slate-400 mt-0.5 shrink-0" />
                <InfoRow label="Ubicación" value={location.address} />
              </div>
            )}
            {inf?.observaciones && (
              <div className="col-span-2">
                <InfoRow label="Observaciones" value={inf.observaciones} />
              </div>
            )}
          </SectionCard>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-3 bg-slate-50">
          <Button size="sm" variant="ghost" onClick={onClose}>
            Cerrar
          </Button>
          {canReprogramar && !showReprogramar && (
            <Button
              size="sm"
              variant="primary"
              onClick={() => setShowReprogramar(true)}
            >
              <CalendarClock size={14} />
              Reprogramar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
