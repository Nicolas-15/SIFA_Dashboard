import React from "react";
import { 
  PDFHeader, 
  PDFMetadata, 
  PDFMapSection, 
  PDFStatsSection, 
  PDFFooter 
} from "./PDFReportComponents";
export function HeatmapPDFTemplate({
  reportRef,
  mapImage,
  summaryData = {},
  currentUser = {},
  dateRange = {},
}) {
  const totalCount = summaryData?.totalCount ?? 0;
  const georeferencedCount = summaryData?.coordenadas?.length ?? 0;
  
  const formatLocalDate = (dateString) => {
    if (!dateString) return '';
    const parts = dateString.split('-');
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const dateRangeLabel =
    dateRange.startDate && dateRange.endDate
      ? `Desde ${formatLocalDate(dateRange.startDate)} hasta ${formatLocalDate(dateRange.endDate)}`
      : "Todo el histórico";

  const sortedTypes = (summaryData?.topInfracciones || []).map(t => [t.nombre, t.cantidad]);
  const statusCounts = summaryData?.estados || { pending: 0, accepted: 0, rejected: 0, exported: 0 };

  const docDate = new Date().toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="fixed left-[-9999px] top-[-9999px] z-[-1000] pointer-events-none">
      <div
        ref={reportRef}
        className="w-[800px] h-[1080px] bg-white text-slate-800 p-10 font-sans flex flex-col justify-between"
      >
        <div>
          <PDFHeader />
          <PDFMetadata 
            dateRangeLabel={dateRangeLabel}
            currentUser={currentUser}
            docDate={docDate}
            totalCount={totalCount}
            georeferencedCount={georeferencedCount}
          />
          <PDFMapSection mapImage={mapImage} />
          <PDFStatsSection sortedTypes={sortedTypes} statusCounts={statusCounts} />
        </div>
        <PDFFooter />
      </div>
    </div>
  );
}
