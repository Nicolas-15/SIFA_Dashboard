import { useState, useRef, useEffect, useCallback } from "react";

export function useFileDrop({ onDrop, disabled = false } = {}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const dragCounter = useRef(0);
  const onDropRef = useRef(onDrop);
  onDropRef.current = onDrop;

  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current++;
    setIsDragOver(true);
  }, [disabled]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDragOver(false);
    }
  }, [disabled]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    dragCounter.current = 0;
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) onDropRef.current?.(file);
  }, [disabled]);

  useEffect(() => {
    return () => {
      dragCounter.current = 0;
    };
  }, []);

  return {
    isDragOver,
    dragHandlers: {
      onDragEnter: handleDragEnter,
      onDragOver: handleDragOver,
      onDragLeave: handleDragLeave,
      onDrop: handleDrop,
    },
  };
}
