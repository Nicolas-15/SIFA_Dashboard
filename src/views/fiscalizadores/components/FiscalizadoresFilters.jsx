import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Calendar, RotateCcw } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

function formatDateInput(value) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

function toApiDate(display) {
  if (!display || display.length !== 10) return "";
  const [dd, mm, yyyy] = display.split("/");
  if (!dd || !mm || !yyyy) return "";
  return `${yyyy}-${mm}-${dd}`;
}

function fromApiDate(api) {
  if (!api) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(api)) return api;
  const parts = api.split("-");
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return api;
}

function parseDisplayDate(val) {
  if (!val || val.length !== 10) return null;
  const [dd, mm, yyyy] = val.split("/");
  if (!dd || !mm || !yyyy) return null;
  return new Date(`${yyyy}-${mm}-${dd}`);
}

function useDebouncedCallback(fn, delay = 350) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        fnRef.current(...args);
      }, delay);
    },
    [delay],
  );
}

export function FiscalizadoresFilters({
  search,
  setSearch,
  statusFilter,
  setStatusFilter,
  dateRange,
  onDateRangeChange,
  users,
}) {
  const [localStartDate, setLocalStartDate] = useState(
    fromApiDate(dateRange?.startDate || ""),
  );
  const [localEndDate, setLocalEndDate] = useState(
    fromApiDate(dateRange?.endDate || ""),
  );
  const [dateError, setDateError] = useState("");
  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const debouncedDateRange = useDebouncedCallback(onDateRangeChange);

  useEffect(() => {
    setLocalStartDate(fromApiDate(dateRange?.startDate || ""));
    setLocalEndDate(fromApiDate(dateRange?.endDate || ""));
  }, [dateRange?.startDate, dateRange?.endDate]);

  const validateDates = useCallback((startDisplay, endDisplay) => {
    if (startDisplay && endDisplay) {
      const start = parseDisplayDate(startDisplay);
      const end = parseDisplayDate(endDisplay);
      if (start && end && start > end) {
        setDateError(
          "La fecha de inicio no puede ser mayor a la fecha de término",
        );
        return false;
      }
    }
    setDateError("");
    return true;
  }, []);

  const handleStartDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalStartDate(formatted);
    if (validateDates(formatted, localEndDate)) {
      debouncedDateRange({
        startDate: toApiDate(formatted),
        endDate: toApiDate(localEndDate),
      });
    }
  };

  const handleEndDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalEndDate(formatted);
    if (validateDates(localStartDate, formatted)) {
      debouncedDateRange({
        startDate: toApiDate(localStartDate),
        endDate: toApiDate(formatted),
      });
    }
  };

  const handleStartNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split("-");
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalStartDate(formatted);
    if (validateDates(formatted, localEndDate)) {
      debouncedDateRange({
        startDate: toApiDate(formatted),
        endDate: toApiDate(localEndDate),
      });
    }
  };

  const handleEndNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split("-");
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalEndDate(formatted);
    if (validateDates(localStartDate, formatted)) {
      debouncedDateRange({
        startDate: toApiDate(localStartDate),
        endDate: toApiDate(formatted),
      });
    }
  };

  const clearStartDate = (e) => {
    e.stopPropagation();
    setLocalStartDate("");
    onDateRangeChange?.({ startDate: "", endDate: toApiDate(localEndDate) });
  };

  const clearEndDate = (e) => {
    e.stopPropagation();
    setLocalEndDate("");
    onDateRangeChange?.({ startDate: toApiDate(localStartDate), endDate: "" });
  };

  const openStartPicker = () => {
    startPickerRef.current?.showPicker();
  };

  const openEndPicker = () => {
    endPickerRef.current?.showPicker();
  };

  const handleClearAll = () => {
    setSearch("");
    setStatusFilter("all");
    setLocalStartDate("");
    setLocalEndDate("");
    setDateError("");
    onDateRangeChange?.({ startDate: "", endDate: "" });
  };

  const filters = [
    { key: "all", label: "Todos" },
    { key: "active", label: "Activos" },
    { key: "revoked", label: "Revocados" },
  ];

  const hasFilters =
    search || statusFilter !== "all" || localStartDate || localEndDate;

  const filterCounts = filters.map((f) => ({
    ...f,
    count:
      f.key === "all"
        ? users.length
        : users.filter((u) => u.status === f.key).length,
  }));

  return (
    <div className="flex flex-col gap-3">
      {/* Fila 1: Búsqueda + Filtros de estado */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:w-72">
          <Input
            icon={Search}
            type="text"
            placeholder="Buscar por nombre, RUT o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={search ? "!pr-8" : ""}
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {filterCounts.map((f) => (
            <Button
              key={f.key}
              size="sm"
              variant={statusFilter === f.key ? "primary" : "outline"}
              onClick={() => setStatusFilter(f.key)}
              className="flex-1 sm:flex-none min-w-[90px] sm:min-w-0 max-w-[calc(50%-4px)] sm:max-w-none items-center gap-1.5"
            >
              {f.label}
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${statusFilter === f.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
              >
                {f.count}
              </span>
            </Button>
          ))}
        </div>
      </div>

      {/* Fila 2: Filtros de fecha + Botón limpiar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="w-full sm:w-44">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">
            Desde
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={localStartDate}
              onChange={handleStartDateChange}
              onClick={openStartPicker}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-16"
            />
            {localStartDate && (
              <button
                type="button"
                onClick={clearStartDate}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                tabIndex={-1}
                title="Limpiar fecha"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={openStartPicker}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              tabIndex={-1}
              title="Abrir calendario"
            >
              <Calendar size={15} />
            </button>
            <input
              ref={startPickerRef}
              type="date"
              onChange={handleStartNativeDateChange}
              className="sr-only"
            />
          </div>
        </div>
        <div className="w-full sm:w-44">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">
            Hasta
          </label>
          <div className="relative">
            <input
              type="text"
              inputMode="numeric"
              placeholder="dd/mm/aaaa"
              value={localEndDate}
              onChange={handleEndDateChange}
              onClick={openEndPicker}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-16"
            />
            {localEndDate && (
              <button
                type="button"
                onClick={clearEndDate}
                className="absolute right-9 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                tabIndex={-1}
                title="Limpiar fecha"
              >
                <X size={14} />
              </button>
            )}
            <button
              type="button"
              onClick={openEndPicker}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
              tabIndex={-1}
              title="Abrir calendario"
            >
              <Calendar size={15} />
            </button>
            <input
              ref={endPickerRef}
              type="date"
              onChange={handleEndNativeDateChange}
              className="sr-only"
            />
          </div>
        </div>
        {hasFilters && (
          <div className="sm:pt-[22px] w-full sm:w-auto">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClearAll}
              title="Limpiar todos los filtros"
              className="shrink-0"
            >
              <RotateCcw size={13} />
              Limpiar filtros
            </Button>
          </div>
        )}
      </div>

      {/* Error de validación */}
      {dateError && (
        <p className="text-[11px] font-bold text-red-500 flex items-center gap-1.5 ml-1 animate-in fade-in slide-in-from-top-1">
          <Calendar size={13} />
          {dateError}
        </p>
      )}
    </div>
  );
}
