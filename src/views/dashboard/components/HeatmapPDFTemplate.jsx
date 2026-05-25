import React from "react";
import { 
  PDFHeader, 
  PDFMetadata, 
  PDFMapSection, 
  PDFStatsSection, 
  PDFFooter 
} from "./PDFReportComponents";
import { getPDFReportData } from "../utils/reportHelpers";

export function HeatmapPDFTemplate({
  reportRef,
  mapImage,
  infractions = [],
  currentUser = {},
  dateRange = {},
}) {
  // Extraemos toda la lógica de procesamiento de datos desde el helper
  const {
    totalCount,
    georeferencedCount,
    dateRangeLabel,
    sortedTypes,
    statusCounts,
    docDate
  } = getPDFReportData(infractions, dateRange);

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
