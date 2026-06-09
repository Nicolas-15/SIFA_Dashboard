import React from 'react';

/**
 * Componente Spinner reutilizable para estados de carga.
 * @param {('sm'|'md'|'lg')} size - El tamaño del spinner.
 * @param {string} className - Clases adicionales de Tailwind/CSS.
 */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'h-5 w-5 border-2',
    md: 'h-8 w-8 border-t-2 border-b-2',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div
      className={`animate-spin rounded-full border-t-2 border-b-2 border-primary ${sizes[size]} ${className}`}
      role="status"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
}

export default Spinner;
