import { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, RefreshCw, Calendar, RotateCcw, Download } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DebouncedSearchInput } from '@/components/ui/DebouncedSearchInput';
import { exportInfractionsCSV } from '@/services/infractions.service';

function useDebouncedCallback(fn, delay = 300) {
  const timerRef = useRef(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return useCallback((...args) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      fnRef.current(...args);
    }, delay);
  }, [delay]);
}

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

function fromApiDate(api) {
  if (!api) return '';
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(api)) return api;
  const parts = api.split('-');
  if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
  return api;
}

function parseDisplayDate(val) {
  if (!val || val.length !== 10) return null;
  const [dd, mm, yyyy] = val.split('/');
  if (!dd || !mm || !yyyy) return null;
  return new Date(`${yyyy}-${mm}-${dd}`);
}

export function InfractionsFilters({
  searchQuery,
  setSearchQuery,
  filters,
  activeFilter,
  setActiveFilter,
  onClearHeaderSearch,
  onRefresh,
  dateRange,
  onDateRangeChange,
  userFilter,
  onUserFilterChange,
  onClearFilters,
  infractions,
}) {
  const [refreshing, setRefreshing] = useState(false);
  const [localStartDate, setLocalStartDate] = useState(fromApiDate(dateRange?.startDate || ''));
  const [localEndDate, setLocalEndDate] = useState(fromApiDate(dateRange?.endDate || ''));
  const [localUser, setLocalUser] = useState(userFilter || '');
  const [dateError, setDateError] = useState('');

  const startPickerRef = useRef(null);
  const endPickerRef = useRef(null);

  const debouncedDateRange = useDebouncedCallback(onDateRangeChange, 350);

  useEffect(() => {
    setLocalStartDate(fromApiDate(dateRange?.startDate || ''));
    setLocalEndDate(fromApiDate(dateRange?.endDate || ''));
  }, [dateRange?.startDate, dateRange?.endDate]);

  useEffect(() => {
    setLocalUser(userFilter || '');
  }, [userFilter]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh?.();
    setRefreshing(false);
  };

  const [exporting, setExporting] = useState(false);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      await exportInfractionsCSV({
        startDate: toApiDate(localStartDate) || undefined,
        endDate: toApiDate(localEndDate) || undefined,
        user: userFilter || undefined,
        status: activeFilter !== 'all' ? activeFilter : undefined,
        search: searchQuery || undefined,
      });
    } catch {
      // Error silencioso — el usuario ve que no descargó nada
    } finally {
      setExporting(false);
    }
  };

  const validateDates = useCallback((startDisplay, endDisplay) => {
    if (startDisplay && endDisplay) {
      const start = parseDisplayDate(startDisplay);
      const end = parseDisplayDate(endDisplay);
      if (start && end && start > end) {
        setDateError('La fecha de inicio no puede ser mayor a la fecha de término');
        return false;
      }
    }
    setDateError('');
    return true;
  }, []);

  const handleStartDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalStartDate(formatted);
    if (validateDates(formatted, localEndDate)) {
      debouncedDateRange({ startDate: toApiDate(formatted), endDate: toApiDate(localEndDate) });
    }
  };

  const handleEndDateChange = (e) => {
    const raw = e.target.value;
    const formatted = formatDateInput(raw);
    setLocalEndDate(formatted);
    if (validateDates(localStartDate, formatted)) {
      debouncedDateRange({ startDate: toApiDate(localStartDate), endDate: toApiDate(formatted) });
    }
  };

  const handleStartNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalStartDate(formatted);
    if (validateDates(formatted, localEndDate)) {
      debouncedDateRange({ startDate: toApiDate(formatted), endDate: toApiDate(localEndDate) });
    }
  };

  const handleEndNativeDateChange = (e) => {
    const val = e.target.value;
    if (!val) return;
    const [yyyy, mm, dd] = val.split('-');
    const formatted = `${dd}/${mm}/${yyyy}`;
    setLocalEndDate(formatted);
    if (validateDates(localStartDate, formatted)) {
      debouncedDateRange({ startDate: toApiDate(localStartDate), endDate: toApiDate(formatted) });
    }
  };

  const clearStartDate = (e) => {
    e.stopPropagation();
    setLocalStartDate('');
    onDateRangeChange?.({ startDate: '', endDate: toApiDate(localEndDate) });
  };

  const clearEndDate = (e) => {
    e.stopPropagation();
    setLocalEndDate('');
    onDateRangeChange?.({ startDate: toApiDate(localStartDate), endDate: '' });
  };

  const openStartPicker = () => {
    startPickerRef.current?.showPicker();
  };

  const openEndPicker = () => {
    endPickerRef.current?.showPicker();
  };

  const [allUsers, setAllUsers] = useState([]);
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const blurTimerRef = useRef(null);
  const userFilterRef = useRef(userFilter);
  userFilterRef.current = userFilter;

  // Extraer fiscalizadores únicos desde las infracciones cargadas
  useEffect(() => {
    if (!infractions || infractions.length === 0) return;
    const seen = new Map();
    infractions.forEach(inf => {
      const value = inf.idFiscalizador;
      if (!value || seen.has(value)) return;
      seen.set(value, {
        value,
        fullName: value,
        email: value,
      });
    });
    const mapped = Array.from(seen.values());
    setAllUsers(mapped);
  }, [infractions]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    };
  }, []);

  const handleUserChange = useCallback((e) => {
    const val = e.target.value;
    setLocalUser(val);

    if (allUsers.length === 0) return;

    if (val.length === 0) {
      setUserSuggestions(allUsers.slice(0, 10));
      setShowSuggestions(allUsers.length < 50);
    } else {
      const q = val.toLowerCase();
      const matches = allUsers.filter(u =>
        u.value.toLowerCase().includes(q)
      );
      setUserSuggestions(matches.slice(0, 10));
      setShowSuggestions(matches.length > 0 && matches.length < 50);
    }
  }, [allUsers]);

  const handleUserFocus = useCallback(() => {
    if (allUsers.length > 0) {
      setUserSuggestions(allUsers.slice(0, 10));
      setShowSuggestions(allUsers.length < 50);
    }
  }, [allUsers]);

  const handleSelectSuggestion = useCallback((user) => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    setLocalUser(user.fullName);
    setShowSuggestions(false);
    onUserFilterChange?.(user.email);
  }, [onUserFilterChange]);

  const handleUserBlur = useCallback(() => {
    if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
    blurTimerRef.current = setTimeout(() => {
      const current = localUserRef.current;
      if (current !== userFilterRef.current) {
        const match = allUsers.find(u => u.fullName === current);
        onUserFilterChange?.(match ? match.email : current);
      }
    }, 200);
  }, [onUserFilterChange, allUsers]);

  const handleUserKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      if (blurTimerRef.current) clearTimeout(blurTimerRef.current);
      const current = localUserRef.current;
      if (current !== userFilterRef.current) {
        const match = allUsers.find(u => u.fullName === current);
        onUserFilterChange?.(match ? match.email : current);
      }
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  }, [onUserFilterChange, allUsers]);

  const localUserRef = useRef(localUser);
  localUserRef.current = localUser;

  const handleClearUser = useCallback(() => {
    setLocalUser('');
    setShowSuggestions(false);
    onUserFilterChange?.('');
  }, [onUserFilterChange]);

  const handleClearAll = () => {
    setLocalStartDate('');
    setLocalEndDate('');
    setLocalUser('');
    setDateError('');
    onClearFilters?.();
  };

  const hasFilters = localStartDate || localEndDate || localUser;

  return (
    <div className="flex flex-col gap-3">
      {/* Fila 1: Búsqueda + Filtros de estado + Actualizar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="sm:w-72">
          <DebouncedSearchInput
            icon={Search}
            type="text"
            placeholder="Buscar por patente, tipo o ID…"
            value={searchQuery}
            onChange={setSearchQuery}
            className={searchQuery ? '!pr-8' : ''}
          />
        </div>

        <div className="flex gap-2 flex-wrap justify-center">
          {filters.map(f => (
            <Button
              key={f.key}
              size="sm"
              variant={activeFilter === f.key ? 'primary' : 'outline'}
              onClick={() => setActiveFilter(f.key)}
              className="flex-1 sm:flex-none min-w-[90px] sm:min-w-0 max-w-[calc(50%-4px)] sm:max-w-none items-center gap-1.5"
            >
              {f.label}
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold
                ${activeFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'}`}>
                {f.count}
              </span>
            </Button>
          ))}
          {searchQuery && (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => { setSearchQuery(''); onClearHeaderSearch?.(); }}
              title="Limpiar búsqueda"
            >
              <X size={14} />
            </Button>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={handleRefresh}
            title="Actualizar infracciones"
            className="flex-1 sm:flex-none min-w-[120px] sm:min-w-0 max-w-[calc(50%-4px)] sm:max-w-none"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Actualizando...' : 'Actualizar'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCSV}
            disabled={exporting}
            title="Exportar infracciones a CSV"
            className="flex-1 sm:flex-none min-w-[120px] sm:min-w-0 max-w-[calc(50%-4px)] sm:max-w-none"
          >
            <Download size={13} className={exporting ? 'animate-pulse' : ''} />
            {exporting ? 'Exportando...' : 'Exportar CSV'}
          </Button>
        </div>
      </div>

      {/* Fila 2: Filtros de fecha + fiscalizador */}
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
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
        <div className="w-full sm:max-w-xs relative">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1 ml-1">
            Fiscalizador
          </label>
          <div className="relative">
            <input
              type="text"
              value={localUser}
              onChange={handleUserChange}
              onFocus={handleUserFocus}
              onBlur={handleUserBlur}
              onKeyDown={handleUserKeyDown}
              placeholder="Email del fiscalizador…"
              className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-9"
            />
            {localUser && (
              <button
                type="button"
                onClick={handleClearUser}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors"
                tabIndex={-1}
                title="Limpiar fiscalizador"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Dropdown de sugerencias */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-20 left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto"
              style={{ top: '100%' }}
            >
              {userSuggestions.map(u => (
                <button
                  key={u.value}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); handleSelectSuggestion(u); }}
                  className="w-full text-left px-3 py-2.5 text-sm hover:bg-slate-50 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  <span className="text-slate-700">{u.value}</span>
                </button>
              ))}
            </div>
          )}
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
