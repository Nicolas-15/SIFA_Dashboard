import { useState, useMemo, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Bell,
  Package,
  MessageSquareText,
  Send,
  Users,
  Smartphone,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  AlertTriangle,
  History,
  Clock,
  Target,
  CheckSquare,
  Square,
  HelpCircle,
  Upload,
  QrCode,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { DataTable } from "@/components/ui/DataTable";
import { Spinner } from "@/components/ui/Spinner";
import { Pagination } from "@/components/ui/Pagination";
import { usePushNotifications } from "@/core/usePushNotifications";
import { AppMovilView } from "@/views/appMovil/AppMovilView";
import { SYSTEM_ROLES } from "@/constants/roles";
import { formatDateTime } from "@/utils/date";

const TARGET_OPTIONS = [
  { value: "ALL", label: "Todos los dispositivos", icon: Users, desc: "Envía a todos los dispositivos registrados" },
  { value: "OUTDATED", label: "Sólo desactualizados", icon: Package, desc: "Envía a dispositivos con versión distinta a la actual" },
  { value: "SELECT", label: "Seleccionar dispositivos", icon: Target, desc: "Elige manualmente los dispositivos a notificar" },
];

const LABEL_MAP = { ALL: "A todos", OUTDATED: "Desactualizados", SELECT: "Seleccionados" };

function AndroidIcon({ size, className }) {
  return (
    <svg
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      fill="currentColor"
    >
      <path d="M23.35 12.653l2.496-4.323c0.044-0.074 0.070-0.164 0.070-0.26 0-0.287-0.232-0.519-0.519-0.519-0.191 0-0.358 0.103-0.448 0.257l-0.001 0.002-2.527 4.377c-1.887-0.867-4.094-1.373-6.419-1.373s-4.532 0.506-6.517 1.413l0.098-0.040-2.527-4.378c-0.091-0.156-0.259-0.26-0.45-0.26-0.287 0-0.519 0.232-0.519 0.519 0 0.096 0.026 0.185 0.071 0.262l-0.001-0.002 2.496 4.323c-4.286 2.367-7.236 6.697-7.643 11.744l-0.003 0.052h29.991c-0.41-5.099-3.36-9.429-7.57-11.758l-0.076-0.038zM9.098 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0zM22.902 20.176c-0 0-0 0-0 0-0.69 0-1.249-0.559-1.249-1.249s0.559-1.249 1.249-1.249c0.69 0 1.249 0.559 1.249 1.249v0c-0.001 0.689-0.559 1.248-1.249 1.249h-0z"></path>
    </svg>
  );
}

const STATUS_CONFIG = {
  ACTIVE: { color: "bg-emerald-500", label: "Activo", desc: "Envió heartbeat en los últimos 10 min" },
  INACTIVE: { color: "bg-orange-400", label: "Inactivo", desc: "No envía heartbeat hace más de 10 min" },
  UNKNOWN: { color: "bg-gray-400", label: "Desconocido", desc: "Aún no ha enviado ningún heartbeat" },
};

const PLATFORM_COLORS = {
  ANDROID: { bg: "bg-emerald-100", fg: "text-emerald-600" },
};

const PLATFORM_ICONS = {
  ANDROID: AndroidIcon,
};

const HISTORY_COLUMNS = [
  {
    key: "targetType",
    label: "Tipo",
    render: (row) => (
      <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700 uppercase">
        {LABEL_MAP[row.targetType] || row.targetType}
      </span>
    ),
  },
  {
    key: "title",
    label: "Título",
    render: (row) => (
      <span className="text-sm font-semibold text-slate-800 max-w-[160px] truncate block">{row.title}</span>
    ),
  },
  {
    key: "body",
    label: "Mensaje",
    render: (row) => (
      <span className="text-xs text-slate-600 max-w-[220px] truncate block">{row.body || "—"}</span>
    ),
  },
  {
    key: "devicesCount",
    label: "Enviados",
    className: "w-24",
    render: (row) => (
      <span className="text-sm font-bold text-slate-700">{row.devicesCount}</span>
    ),
  },
  {
    key: "appVersion",
    label: "Versión",
    className: "w-24",
    render: (row) => (
      <span className="text-xs font-mono text-slate-600">
        {row.appVersion && row.appVersion !== "unknown" ? `v${row.appVersion}` : "—"}
      </span>
    ),
  },
  {
    key: "sentBy",
    label: "Enviado por",
    className: "w-36",
    render: (row) => (
      <span className="text-xs text-slate-600 truncate block">{row.sentBy}</span>
    ),
  },
  {
    key: "sentAt",
    label: "Fecha",
    className: "w-36",
    render: (row) => (
      <span className="text-xs text-slate-600">
        {formatDateTime(row.sentAt)}
      </span>
    ),
  },
];

function DeviceStatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.UNKNOWN;
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold text-slate-600 uppercase">
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.color}`} />
      {cfg.label}
    </span>
  );
}

function DeviceCheckbox({ checked, onChange }) {
  const Icon = checked ? CheckSquare : Square;
  return (
    <button type="button" onClick={(e) => { e.stopPropagation(); onChange(); }} className="shrink-0 text-slate-500 hover:text-primary transition-colors">
      <Icon size={16} />
    </button>
  );
}

function DeviceRow({ device, showCheckbox, selected, onToggle }) {
  const PlatformIcon = PLATFORM_ICONS[device.platform] || Smartphone;
  const colors = PLATFORM_COLORS[device.platform] || { bg: "bg-green-100", fg: "text-green-600" };
  const modelInfo = [device.manufacturer, device.deviceModel].filter(Boolean).join(" ");
  const showId = device.id || device.deviceId;

  return (
    <div
      className={`flex items-center gap-2 py-2 px-3 rounded-lg border transition-colors ${
        showCheckbox && selected
          ? "bg-primary/5 border-primary/20"
          : "bg-slate-100/40 border-slate-200"
      } ${showCheckbox ? "cursor-pointer hover:bg-slate-200" : ""}`}
      onClick={showCheckbox ? () => onToggle(device.id) : undefined}
      role={showCheckbox ? "option" : undefined}
      aria-selected={showCheckbox ? selected : undefined}
      title={`ID: ${device.id ?? "—"} | Dispositivo: ${device.deviceId ?? "—"}`}
    >
      {showCheckbox && (
        <DeviceCheckbox checked={selected} onChange={() => onToggle(device.id)} />
      )}
      <div className={`w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center shrink-0`}>
        <PlatformIcon size={14} className={colors.fg} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold text-slate-700 truncate">
            {device.emailUsuario || "—"}
          </p>
          <DeviceStatusBadge status={device.status} />
        </div>
        <div className="flex items-center gap-2">
          {modelInfo && (
            <p className="text-[10px] text-slate-600 truncate">{modelInfo}</p>
          )}
          {showId && (
            <span className="text-[9px] font-mono text-slate-400 truncate" title={`ID: ${device.id}, deviceId: ${device.deviceId}`}>
              #{device.id ?? device.deviceId}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 ml-2 shrink-0">
        <span className="text-[10px] font-bold text-slate-700 bg-slate-200 px-1.5 py-0.5 rounded-full whitespace-nowrap">
          {device.appVersion && device.appVersion !== "unknown" ? `Versión: ${device.appVersion}` : "—"}
        </span>
      </div>
    </div>
  );
}

export function NotificacionesView() {
  const { showToast, currentUser } = useOutletContext();
  const {
    loading, result, error, send, reset,
    devices, devicesLoading, fetchDevices,
    TARGET_TYPES,
    history, historyLoading, historyPage, historyTotalPages,
    historyTotalElements, historyFirst, historyLast, historyFilter,
    fetchHistory, goToHistoryPage, applyHistoryFilter,
  } = usePushNotifications();

  const [tab, setTab] = useState("send");
  const [targetType, setTargetType] = useState(TARGET_TYPES.ALL);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [currentVersion, setCurrentVersion] = useState("");
  const [showDevices, setShowDevices] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showHelp, setShowHelp] = useState(false);

  const TABS = [
    { value: "send", label: "Enviar", icon: Send },
    { value: "history", label: "Historial", icon: History },
    ...(currentUser?.role === SYSTEM_ROLES.ADMIN
      ? [{ value: "upload", label: "Subir APK", icon: Upload }]
      : []),
    ...(currentUser?.role === SYSTEM_ROLES.ADMIN || currentUser?.role === SYSTEM_ROLES.SUPERVISOR
      ? [{ value: "download", label: "Descargar / QR", icon: QrCode }]
      : []),
  ];

  const isSelectMode = targetType === TARGET_TYPES.SELECT;

  useEffect(() => {
    if (error) showToast(error, "error");
  }, [error, showToast]);

  useEffect(() => {
    if (result) {
      showToast(`Notificación enviada a ${result.sent} dispositivo${result.sent !== 1 ? "s" : ""}.`, "success");
      handleReset();
    }
  }, [result, showToast]);

  const deviceCount = devices.length;
  const outdatedCount = currentVersion
    ? devices.filter((d) => d.appVersion !== currentVersion).length
    : deviceCount;
  const selectCount = selectedIds.length;

  const targetLabel = TARGET_OPTIONS.find((o) => o.value === targetType)?.label;

  const targetCount = useMemo(() => {
    if (targetType === TARGET_TYPES.OUTDATED && currentVersion.trim()) return outdatedCount;
    if (targetType === TARGET_TYPES.SELECT) return selectCount;
    return deviceCount;
  }, [targetType, currentVersion, outdatedCount, selectCount, deviceCount]);

  const isValid = useMemo(() => {
    if (!title.trim() || !body.trim()) return false;
    if (targetType === TARGET_TYPES.OUTDATED && !currentVersion.trim()) return false;
    if (targetType === TARGET_TYPES.SELECT && selectCount === 0) return false;
    return true;
  }, [title, body, targetType, currentVersion, selectCount]);

  const handleToggleDevice = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleTargetChange = (type) => {
    setTargetType(type);
    setSelectedIds([]);
    reset();
  };

  const handleSendClick = () => {
    if (!isValid) return;
    setShowConfirm(true);
  };

  const handleConfirmSend = async () => {
    setShowConfirm(false);
    await send({
      targetType,
      title,
      body,
      currentVersion,
      deviceIds: isSelectMode ? selectedIds : undefined,
    });
  };

  const handleTabChange = (newTab) => {
    setTab(newTab);
    if (newTab === "history") {
      fetchHistory(historyPage, historyFilter);
    }
  };

  const handleReset = () => {
    setTitle("");
    setBody("");
    setCurrentVersion("");
    setTargetType(TARGET_TYPES.ALL);
    setSelectedIds([]);
    reset();
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 my-0 pt-0">
          Notificaciones Push
        </h2>
      </div>

      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.value;
          return (
            <button
              key={t.value}
              type="button"
              onClick={() => handleTabChange(t.value)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                active
                  ? "bg-white text-slate-800 shadow-sm"
                  : "text-slate-600 hover:text-slate-800"
              }`}
            >
              <Icon size={16} />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "upload" || tab === "download" ? (
        <AppMovilView tab={tab} />
      ) : tab === "send" ? (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
          <div className="lg:col-span-3 flex flex-col gap-3">
            <Card padding="lg" className="flex-1">
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-3">
                    Destino
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {TARGET_OPTIONS.map((opt) => {
                      const Icon = opt.icon;
                      const isActive = targetType === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleTargetChange(opt.value)}
                            className={`flex flex-col items-start gap-1.5 p-4 rounded-xl border text-left transition-all ${
                              isActive
                                ? "border-primary bg-primary/5 text-primary shadow-sm ring-1 ring-primary/20"
                                : "border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-100"
                            }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon size={18} />
                            <span className="text-sm font-bold">{opt.label}</span>
                          </div>
                          <span className={`text-xs ml-7 ${isActive ? "text-primary/70" : "text-slate-500"}`}>
                            {opt.desc}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <Input
                  label="Título"
                  icon={Bell}
                  placeholder="Ej: Nueva actualización disponible"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  variant="light"
                />

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2 ml-1">
                    Mensaje
                  </label>
                  <div className="relative">
                    <MessageSquareText size={16} className="absolute left-4 top-4 text-slate-500 pointer-events-none z-10" />
                    <textarea
                      placeholder="Ej: Se ha lanzado una nueva versión de la aplicación. Actualiza para disfrutar de las últimas mejoras."
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      rows={4}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                {targetType === TARGET_TYPES.OUTDATED && (
                  <Input
                    label="Versión actual (app)"
                    icon={Package}
                    placeholder="Ej: 1.2.0"
                    value={currentVersion}
                    onChange={(e) => setCurrentVersion(e.target.value)}
                    variant="light"
                  />
                )}

                <div className="bg-slate-100/40 rounded-xl p-4 border border-slate-300">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-700">
                      <Smartphone size={15} className="text-slate-600 shrink-0" />
                      <strong className="text-slate-800">{deviceCount}</strong> dispositivo{deviceCount !== 1 ? "s" : ""} registrado{deviceCount !== 1 ? "s" : ""}
                      {targetType === TARGET_TYPES.OUTDATED && currentVersion.trim() && (
                        <> · <strong className="text-amber-600">{outdatedCount}</strong> desactualizado{outdatedCount !== 1 ? "s" : ""}</>
                      )}
                      {isSelectMode && (
                        <> · <strong className="text-primary">{selectCount}</strong> seleccionado{selectCount !== 1 ? "s" : ""}</>
                      )}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Send size={12} />
                      Recibirán la notificación
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
                  <Button
                    variant="primary"
                    size="lg"
                    onClick={handleSendClick}
                    isLoading={loading}
                    loadingText="Enviando..."
                    disabled={!isValid}
                    className="sm:flex-1"
                  >
                    <Send size={18} />
                    <span>Enviar notificación</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="md"
                    onClick={handleReset}
                    disabled={loading}
                    className="sm:w-auto sm:px-6"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 flex flex-col gap-3">

            <Card padding="md">
              <h3 className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-3">
                Vista previa
              </h3>
              <div className="bg-slate-800 rounded-2xl p-4 shadow-lg">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                    <MessageSquareText size={16} className="text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-white truncate">
                      {title || "Título de la notificación"}
                    </p>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                      {body || "Vista previa del mensaje que recibirán los dispositivos..."}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="md">
              <button
                type="button"
                onClick={() => setShowDevices(!showDevices)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <Smartphone size={16} className="text-slate-500" />
                  <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Dispositivos registrados
                  </span>
                  {!devicesLoading && (
                    <span className="text-xs font-bold text-slate-600 bg-slate-200 px-1.5 py-0.5 rounded-full">
                      {deviceCount}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowHelp(true); }}
                    className="text-slate-300 hover:text-slate-500 transition-colors"
                  >
                    <HelpCircle size={14} />
                  </button>
                </div>
                {showDevices ? (
                  <ChevronUp size={16} className="text-slate-500" />
                ) : (
                  <ChevronDown size={16} className="text-slate-500" />
                )}
              </button>

              {showDevices && (
                <div className="mt-3 space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={fetchDevices}
                      disabled={devicesLoading}
                      className="flex items-center gap-1.5 text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
                    >
                      <RefreshCw size={12} className={devicesLoading ? "animate-spin" : ""} />
                      Actualizar
                    </button>
                    {isSelectMode && selectCount > 0 && (
                      <span className="text-xs text-slate-500">
                        {selectCount} seleccionado{selectCount !== 1 ? "s" : ""}
                      </span>
                    )}
                    {isSelectMode && selectCount < deviceCount && (
                      <button
                        type="button"
                        onClick={() => setSelectedIds(devices.map((d) => d.id))}
                        className="text-xs text-primary font-semibold hover:text-primary/80 transition-colors"
                      >
                        Seleccionar todos
                      </button>
                    )}
                    {isSelectMode && selectCount > 0 && (
                      <button
                        type="button"
                        onClick={() => setSelectedIds([])}
                        className="text-xs text-slate-500 font-semibold hover:text-slate-700 transition-colors"
                      >
                        Limpiar selección
                      </button>
                    )}
                  </div>

                  {devices.length === 0 && !devicesLoading && (
                    <p className="text-xs text-slate-500 text-center py-4">No hay dispositivos registrados</p>
                  )}

                  {devicesLoading && devices.length === 0 && (
                    <div className="flex justify-center py-4">
                      <Spinner size="sm" />
                    </div>
                  )}

                  {devices.length > 0 && (
                    <div className="max-h-72 overflow-y-auto space-y-1.5">
                      {devices.map((device, i) => (
                        <DeviceRow
                          key={device.id || i}
                          device={device}
                          showCheckbox={isSelectMode}
                          selected={selectedIds.includes(device.id)}
                          onToggle={handleToggleDevice}
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-3">
          <Card padding="md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-slate-500" />
                <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Notificaciones enviadas
                </span>
                {!historyLoading && (
                  <span className="text-xs font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                    {historyTotalElements}
                  </span>
                )}
              </div>
              <div className="flex gap-1">
                {[
                  { value: null, label: "Todas" },
                  { value: "ALL", label: "A todos" },
                  { value: "OUTDATED", label: "Desactualizados" },
                  { value: "SELECT", label: "Seleccionados" },
                ].map((opt) => {
                  const active = historyFilter === opt.value;
                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => applyHistoryFilter(opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                        active
                          ? "bg-primary text-white"
                          : "text-slate-600 hover:text-slate-800 hover:bg-slate-100"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </Card>

          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex-1 flex flex-col">
            <div className="overflow-auto flex-1">
              {historyLoading && history.length === 0 ? (
                <div className="flex items-center justify-center py-24">
                  <div className="flex flex-col items-center gap-3">
                    <Spinner />
                    <p className="text-sm text-slate-500 font-medium">Cargando historial...</p>
                  </div>
                </div>
              ) : !historyLoading && history.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center px-6">
                  <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
                    <History size={28} className="text-slate-400" />
                  </div>
                  <p className="text-slate-800 font-bold text-lg">Sin resultados</p>
                    <p className="text-slate-600 text-sm mt-1">No hay notificaciones enviadas</p>
                </div>
              ) : (
                <DataTable
                  columns={HISTORY_COLUMNS}
                  data={history}
                  loading={historyLoading}
                  resourceLabel="notificaciones"
                />
              )}
            </div>
            <div className="border-t border-slate-200">
              <Pagination
                page={historyPage}
                totalPages={historyTotalPages}
                totalElements={historyTotalElements}
                first={historyFirst}
                last={historyLast}
                onPageChange={goToHistoryPage}
                loading={historyLoading}
                size={10}
                noBorder
              />
            </div>
          </div>
        </div>
      )}

      <Modal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar envío"
        description="Esta acción no se puede deshacer"
        headerIcon={<AlertTriangle size={20} className="text-amber-600" />}
        maxWidth="max-w-md"
        closeOnBackdropClick={false}
        headerClassName="p-6 border-b border-slate-200"
        bodyClassName="p-6 space-y-4"
        footerClassName="flex items-center gap-3 p-6 border-t border-slate-200"
        titleClassName="text-lg font-bold text-slate-800"
        descriptionClassName="text-xs text-slate-500 mt-0.5"
        closeButtonClassName="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors w-9 h-9 border-0 bg-transparent flex items-center justify-center"
        footer={
          <div className="flex items-center gap-3 w-full">
            <Button
              variant="outline"
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmSend}
              isLoading={loading}
              loadingText="Enviando..."
              className="flex-1"
            >
              <Send size={16} />
              Enviar ahora
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">
                  Se enviará a <strong>{targetCount}</strong> dispositivo{targetCount !== 1 ? "s" : ""}
                </p>
                <p className="text-xs text-amber-700 mt-0.5">{targetLabel}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Título</p>
            <p className="text-sm font-bold text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
              {title}
            </p>
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Mensaje</p>
            <p className="text-sm text-slate-600 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200 whitespace-pre-wrap">
              {body}
            </p>
          </div>

          {targetType === TARGET_TYPES.OUTDATED && currentVersion && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Versión actual</p>
              <p className="text-sm font-bold text-slate-800 bg-slate-50 rounded-lg px-3 py-2 border border-slate-200">
                v{currentVersion}
              </p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showHelp} onClose={() => setShowHelp(false)} title="Estados de dispositivos">
        <div className="space-y-4 py-2">
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Activo</p>
              <p className="text-xs text-slate-600">El dispositivo envió heartbeat en los últimos 10 minutos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-orange-400 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Inactivo</p>
              <p className="text-xs text-slate-600">El dispositivo no envía heartbeat hace más de 10 minutos.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-2 h-2 rounded-full bg-gray-400 mt-1.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-slate-800">Desconocido</p>
              <p className="text-xs text-slate-600">El dispositivo aún no ha enviado ningún heartbeat.</p>
            </div>
          </div>
          <hr className="border-slate-200" />
          <div>
            <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Detalle de tiempos</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li><strong className="text-slate-700">Heartbeat:</strong> cada dispositivo envía su estado cada 3 minutos.</li>
              <li><strong className="text-slate-700">Umbral de inactividad:</strong> si pasan más de 10 minutos sin recibir heartbeat, se marca como <span className="italic">Inactivo</span>.</li>
              <li><strong className="text-slate-700">Limpieza automática:</strong> una tarea programada revisa cada 5 minutos y actualiza los estados.</li>
              <li><strong className="text-slate-700">Transición:</strong> <span className="italic">Desconocido</span> → primer heartbeat → <span className="italic">Activo</span> → sin heartbeat +10 min → <span className="italic">Inactivo</span>.</li>
            </ul>
          </div>
        </div>
      </Modal>
    </div>
  );
}
