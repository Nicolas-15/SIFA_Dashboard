// Helper para calcular y dar formato a los datos estadísticos que se muestran en el reporte PDF
export function getPDFReportData(infractions = [], dateRange = {}) {
  const totalCount = infractions.length;
  
  // Filtrar cantidad de registros georreferenciados válidos
  const georeferencedCount = infractions.filter(
    (inf) => inf.location && inf.location.lat && inf.location.lng
  ).length;

  // Formatear el rango de fechas para el encabezado
  const dateRangeLabel =
    dateRange.startDate && dateRange.endDate
      ? `Desde ${new Date(dateRange.startDate).toLocaleDateString("es-CL")} hasta ${new Date(dateRange.endDate).toLocaleDateString("es-CL")}`
      : "Todo el histórico";

  // Calcular el Top 3 de tipos de infracción
  const typeCounts = {};
  infractions.forEach((inf) => {
    const name = inf.tipoInfraccion?.nombre || "Otro";
    typeCounts[name] = (typeCounts[name] || 0) + 1;
  });

  const sortedTypes = Object.entries(typeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Calcular el desglose de estados
  const statusCounts = { pending: 0, accepted: 0, rejected: 0, exported: 0 };
  infractions.forEach((inf) => {
    const s = inf.status || "pending";
    if (statusCounts[s] !== undefined) {
      statusCounts[s]++;
    }
  });

  // Obtener fecha y hora de emisión del documento en hora local
  const docDate = new Date().toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return {
    totalCount,
    georeferencedCount,
    dateRangeLabel,
    sortedTypes,
    statusCounts,
    docDate
  };
}
