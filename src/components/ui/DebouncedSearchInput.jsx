import { useState, useEffect, useRef, useCallback } from 'react';
import { Input } from './Input';

export function DebouncedSearchInput({
  value,
  onChange,
  debounceDelay = 1000,
  ...props
}) {
  const [localValue, setLocalValue] = useState(value || '');
  const timerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Sincronizar el valor local cuando el valor del padre cambia (por ejemplo, al limpiar la búsqueda)
  useEffect(() => {
    setLocalValue(value || '');
  }, [value]);

  // Limpiar el timer al desmontar el componente
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerChange = useCallback((val) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    onChangeRef.current(val);
  }, []);

  const handleTextChange = useCallback((e) => {
    const val = e.target.value;
    setLocalValue(val);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      onChangeRef.current(val);
    }, debounceDelay);
  }, [debounceDelay]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      triggerChange(localValue);
    }
  }, [localValue, triggerChange]);

  return (
    <Input
      {...props}
      value={localValue}
      onChange={handleTextChange}
      onKeyDown={handleKeyDown}
    />
  );
}
