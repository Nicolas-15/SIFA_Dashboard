import { useState, useEffect, useRef } from "react";
import { X, Check, CalendarClock, Car, User, MapPin, FileText, Clock, AlertTriangle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { parseISODateTime } from "@/views/infracciones/utils/infractionFormatters";

function formatDateInput(value) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toApiDate(display) {
  if (!display || display.length !== 10) return '';
  const [dd, mm, yyyy] = display.split('/');
  if (!dd || !mm || !yyyy) return '';
  return `${yyyy}-${mm}-${dd}`;
}

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
  const [showConfirmReprogramar, setShowConfirmReprogramar] = useState(false);
  const [nuevaFecha, setNuevaFecha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fechaCitacion, setFechaCitacion] = useState(citacion?.fecha || "");
  const datePickerRef = useRef(null);

  const openDatePicker = () => datePickerRef.current?.showPicker();

  const handleNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    setNuevaFecha(`${dd}/${mm}/${yyyy}`);
  };

  const inf = citacion?.infraccion;
  const vehicle = inf?.vehicle;
  const prop = inf?.propietario;
  const tipo = inf?.tipoInfraccion;
  const location = inf?.location;

  // RBAC: solo JPL puede reprogramar
  const isJPL = currentUser?.role === "Administrativo JPL";
  const canReprogramar = isJPL && isFuture(fechaCitacion);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const handleShowConfirm = () => {
    if (!nuevaFecha || nuevaFecha.length !== 10) {
      showToast("Seleccione una fecha válida.", "error");
      return;
    }
    const apiDate = toApiDate(nuevaFecha);
    if (!apiDate) {
      showToast("Formato de fecha inválido.", "error");
      return;
    }
    setShowConfirmReprogramar(true);
  };

  const handleReprogramar = async () => {
    const apiDate = toApiDate(nuevaFecha);
    const fechaISO = apiDate + "T09:00:00";

    setSubmitting(true);
    try {
      await onReprogramar(citacion.idCitacion, fechaISO);
      setFechaCitacion(fechaISO);
      showToast("Citación reprogramada exitosamente");
      setShowReprogramar(false);
      setShowConfirmReprogramar(false);
      setNuevaFecha("");
    } catch (err) {
      showToast(err.message || "Error al reprogramar la citación", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
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
            isFuture(fechaCitacion)
              ? 'bg-primary/5 border-primary/30'
              : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`p-3 rounded-xl ${isFuture(fechaCitacion) ? 'bg-primary/10' : 'bg-slate-100'}`}>
              <CalendarClock size={24} className={isFuture(fechaCitacion) ? 'text-primary' : 'text-slate-400'} />
            </div>
            <div className="flex-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Fecha de Citación al JPL
              </p>
              <p className={`text-lg font-black ${isFuture(fechaCitacion) ? 'text-primary' : 'text-slate-600'}`}>
                {fechaCitacion ? parseISODateTime(fechaCitacion) : 'No definida'}
              </p>
              <p className={`text-xs font-semibold ${isFuture(fechaCitacion) ? 'text-emerald-600' : 'text-slate-400'}`}>
                {isFuture(fechaCitacion) ? '● Próxima' : '● Pasada'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Nueva fecha <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="dd/mm/aaaa"
                      value={nuevaFecha}
                      onChange={(e) => setNuevaFecha(formatDateInput(e.target.value))}
                      onClick={openDatePicker}
                      className="w-full px-2.5 py-2 border border-amber-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-slate-800 pr-10"
                    />
                    <button
                      type="button"
                      onClick={openDatePicker}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-amber-600 hover:bg-amber-100 transition-colors cursor-pointer"
                      tabIndex={-1}
                      title="Abrir calendario"
                    >
                      <Calendar size={16} />
                    </button>
                    <input
                      ref={datePickerRef}
                      type="date"
                      min={new Date().toISOString().slice(0, 10)}
                      onChange={handleNativeDateChange}
                      className="sr-only"
                    />
                  </div>
                </div>
                <div className="flex items-end pb-2">
                  <div className="flex items-center gap-1.5 text-amber-700 bg-amber-100/50 px-3 py-1.5 rounded-lg">
                    <Clock size={14} />
                    <span className="text-xs font-bold">Se agendará la citación a las 09:00 hrs</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => { setShowReprogramar(false); setNuevaFecha(""); }}
                >
                  <X size={14} />
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleShowConfirm}
                >
                  <Check size={14} />
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

      {showConfirmReprogramar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-md w-full mx-4 p-6 animate-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-100 rounded-xl">
                <CalendarClock size={22} className="text-amber-600" />
              </div>
              <div>
                <h4 className="text-sm font-black text-slate-800">Reprogramar citación</h4>
                <p className="text-xs text-slate-500">¿Está seguro de reprogramar esta citación?</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Citación</span>
                <span className="text-sm font-bold text-slate-800">#{citacion?.idCitacion}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Nueva fecha</span>
                <span className="text-sm font-bold text-slate-800">{nuevaFecha}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-400">Hora</span>
                <span className="text-sm font-bold text-slate-800">09:00 hrs</span>
              </div>
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowConfirmReprogramar(false)}
              >
                <X size={14} />
                Cancelar
              </Button>
              <Button
                size="sm"
                variant="primary"
                onClick={handleReprogramar}
                isLoading={submitting}
                loadingText="Reprogramando..."
              >
                <Check size={14} />
                Confirmar reprogramación
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
