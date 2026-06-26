import React from "react";

// Encabezado institucional con membrete y logos
export function PDFHeader() {
  return (
    <div className="flex justify-between items-center border-b border-slate-200 pb-5 mb-6">
      <div className="flex flex-col">
        <span className="text-sm font-extrabold text-slate-800 tracking-wider">SIFA</span>
        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
          Sistema Inteligente de Fiscalización Automática
        </span>
      </div>
      <div className="text-right">
        <p className="text-[11px] font-bold text-slate-600">I. MUNICIPALIDAD DE EL QUISCO</p>
        <p className="text-[9px] text-slate-400 font-medium">Dirección de Seguridad Pública y Fiscalización</p>
      </div>
    </div>
  );
}

// Bloque de metadatos del reporte (fechas, emisor y registros)
export function PDFMetadata({ dateRangeLabel, currentUser, docDate, totalCount, georeferencedCount }) {
  const username = currentUser.name 
    ? `${currentUser.name} ${currentUser.lastname}` 
    : "Administrador";
  const userRole = currentUser.role || "Admin";

  return (
    <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Filtro de Fecha</p>
        <p className="text-xs font-bold text-slate-700">{dateRangeLabel}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Generado por</p>
        <p className="text-xs font-bold text-slate-700">
          {username} 
          <span className="text-[10px] text-slate-400 font-medium ml-1">({userRole})</span>
        </p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Fecha Emisión</p>
        <p className="text-xs font-bold text-slate-700">{docDate}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Registros Analizados</p>
        <p className="text-xs font-bold text-slate-700">
          {totalCount} infracciones <span className="text-[10px] text-slate-400 font-medium ml-0.5">({georeferencedCount} con GPS)</span>
        </p>
      </div>
    </div>
  );
}

// Sección contenedora de la imagen del mapa de calor capturado
export function PDFMapSection({ mapImage }) {
  return (
    <div className="mb-6">
      <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
        Vista del Mapa de Calor
      </h3>
      <div className="border border-slate-300 rounded-xl overflow-hidden bg-slate-100 shadow-sm flex items-center justify-center p-1">
        {mapImage ? (
          <img
            src={mapImage}
            alt="Mapa de calor de infracciones"
            className="w-full h-auto max-h-[460px] object-contain rounded-lg"
          />
        ) : (
          <div className="h-[340px] flex items-center justify-center">
            <span className="text-xs text-slate-400 font-semibold">Cargando mapa de calor...</span>
          </div>
        )}
      </div>
    </div>
  );
}

// Tarjetas estadísticas de resumen: Top 3 y Desglose de estados
export function PDFStatsSection({ sortedTypes, statusCounts }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Top 3 Infracciones más recurrentes */}
      <div className="border border-slate-200 rounded-xl p-4 flex flex-col">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-3">
          Top 3 Infracciones Frecuentes
        </h4>
        <div className="space-y-3 mt-1">
          {sortedTypes.length > 0 ? (
            sortedTypes.map(([name, count], index) => {
              // Recortamos el nombre programáticamente en JS para evitar clipping de html2canvas
              const truncatedName = name.length > 28 ? name.substring(0, 28) + "..." : name;
              return (
                <div key={index} className="flex justify-between items-baseline text-xs py-1">
                  <span className="font-semibold text-slate-700 leading-relaxed" title={name}>
                    {index + 1}. {truncatedName}
                  </span>
                  <span className="font-bold text-primary px-2 py-0.5 bg-slate-100 rounded-md text-[10px]">
                    {count}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">No hay datos disponibles</p>
          )}
        </div>
      </div>

      {/* Desglose de estados de las infracciones */}
      <div className="border border-slate-200 rounded-xl p-4">
        <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
          Desglose de Estados
        </h4>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Pendientes:</span>
            <span className="font-bold text-amber-600">{statusCounts.pending}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Aprobadas:</span>
            <span className="font-bold text-emerald-600">{statusCounts.accepted}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Rechazadas:</span>
            <span className="font-bold text-red-600">{statusCounts.rejected}</span>
          </div>
          <div className="bg-slate-50 border border-slate-100 rounded-lg p-2 flex justify-between items-center">
            <span className="text-slate-500 font-medium">Exportadas:</span>
            <span className="font-bold text-indigo-600">{statusCounts.exported}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Pie de página del documento PDF
export function PDFFooter() {
  return (
    <div className="pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
      <span>SIFA - Municipalidad de El Quisco</span>
      <span>Página 1 de 1</span>
    </div>
  );
}
