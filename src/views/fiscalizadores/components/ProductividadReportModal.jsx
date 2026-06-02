import { useState, useRef, useEffect } from "react";
import { Download, Loader2, User } from "lucide-react";
import { getProductividadFiscalizadorReporte } from "@/services/infractions.service";
import { useOutletContext } from "react-router-dom";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { Modal } from "@/components/ui/Modal";

export function ProductividadReportModal({
  isOpen,
  onClose,
  startDate,
  endDate,
}) {
  const { currentUser = {}, showToast } = useOutletContext() || {};
  const [productividadData, setProductividadData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const reportRef = useRef(null);

  // Cargar datos de productividad cuando se abra el modal
  useEffect(() => {
    if (isOpen && startDate && endDate) {
      const fetchProductividadData = async () => {
        setLoading(true);
        try {
          const data = await getProductividadFiscalizadorReporte({
            startDate,
            endDate,
          });
          setProductividadData(data || []);
        } catch (err) {
          console.error("Error al cargar datos de productividad:", err);
          if (showToast) {
            showToast("Error al cargar datos de productividad", "error");
          }
        } finally {
          setLoading(false);
        }
      };
      fetchProductividadData();
    }
  }, [isOpen, startDate, endDate, showToast]);

  // Calcular estadísticas
  const totalInfracciones = productividadData.reduce(
    (sum, item) => sum + (item.cantidadInfracciones || 0),
    0,
  );
  const totalFiscalizadores = productividadData.length;
  const promedio =
    totalFiscalizadores > 0
      ? (totalInfracciones / totalFiscalizadores).toFixed(1)
      : "0";

  // Ordenar por cantidad de infracciones (mayor a menor)
  const sortedData = [...productividadData].sort(
    (a, b) => (b.cantidadInfracciones || 0) - (a.cantidadInfracciones || 0),
  );

  // Formatear fecha para el reporte
  const formatLocalDate = (dateString) => {
    if (!dateString) return "";
    const parts = dateString.split("-");
    if (parts.length !== 3) return dateString;
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  const dateRangeLabel =
    startDate && endDate
      ? `Desde ${formatLocalDate(startDate)} hasta ${formatLocalDate(endDate)}`
      : "Todo el histórico";

  const docDate = new Date().toLocaleString("es-CL", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  // Manejar exportación del reporte
  const handleExportReport = async () => {
    if (!reportRef.current) return;

    try {
      setIsExporting(true);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Capturar la plantilla de reporte (escala 3x para PDF nítido)
      const reportCanvas = await html2canvas(reportRef.current, {
        useCORS: true,
        allowTaint: false,
        logging: false,
        scale: 3,
      });

      // Crear el documento PDF en formato A4
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (reportCanvas.height * pdfWidth) / reportCanvas.width;

      pdf.addImage(
        reportCanvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdfWidth,
        pdfHeight,
      );

      const timestamp = new Date().toISOString().slice(0, 10);
      pdf.save(`reporte-productividad-${timestamp}.pdf`);

      if (showToast) {
        showToast("Reporte de productividad generado exitosamente");
      }
    } catch (err) {
      console.error("Error al exportar reporte:", err);
      if (showToast) {
        showToast("Error al generar el reporte en PDF", "error");
      }
    } finally {
      setIsExporting(false);
    }
  };

  const renderHeaderExtra = (
    <button
      onClick={handleExportReport}
      disabled={
        isExporting || loading || productividadData.length === 0
      }
      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary/90 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs rounded-xl transition-all border border-primary/20 shadow-sm shrink-0"
    >
      {isExporting ? (
        <>
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Generando...</span>
        </>
      ) : (
        <>
          <Download size={13} />
          <span>Exportar PDF</span>
        </>
      )}
    </button>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reporte de Productividad por Fiscalizador"
      description={
        startDate && endDate
          ? `Período: ${startDate} al ${endDate}`
          : "Seleccione un rango de fechas válido"
      }
      maxWidth="max-w-4xl"
      maxHeight="h-[80vh]"
      closeOnBackdropClick={true}
      className="mx-4 rounded-2xl"
      headerClassName="p-4 border-b border-slate-200"
      bodyClassName="p-4 min-h-0 flex flex-col"
      titleClassName="text-lg font-bold text-slate-800"
      descriptionClassName="text-xs text-slate-500 mt-0.5"
      closeButtonClassName="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors w-9 h-9 border-0 bg-transparent flex items-center justify-center"
      headerExtra={renderHeaderExtra}
    >
      <div className="flex-1 min-h-0 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-slate-600 font-medium">
                Cargando datos de productividad...
              </p>
            </div>
          </div>
        ) : productividadData.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-sm text-slate-600 font-medium mb-1">
                No hay datos de productividad
              </p>
              <p className="text-xs text-slate-400">
                No se encontraron infracciones en este período
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Estadísticas resumen */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Fiscalizadores
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {totalFiscalizadores}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Total Infracciones
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {totalInfracciones}
                </p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Promedio por Fiscalizador
                </p>
                <p className="text-2xl font-black text-slate-800">
                  {promedio}
                </p>
              </div>
            </div>

            {/* Tabla de productividad */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Detalle por Fiscalizador
                </h4>
              </div>
              <div className="divide-y divide-slate-100">
                {sortedData.map((item, index) => (
                  <div
                    key={item.idFiscalizador}
                    className="flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800">
                          {item.idFiscalizador}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-500">
                        infracciones:
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary font-bold text-sm rounded-lg">
                        {item.cantidadInfracciones}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Plantilla invisible del PDF */}
      <div className="fixed left-[-9999px] top-[-9999px] z-[-1000] pointer-events-none">
        <div
          ref={reportRef}
          className="w-[800px] h-[1080px] bg-white text-slate-800 p-10 font-sans flex flex-col"
        >
          {/* Encabezado */}
          <div className="flex justify-between items-center border-b border-slate-200 pb-5 mb-6">
            <div className="flex flex-col">
              <span className="text-sm font-extrabold text-slate-800 tracking-wider">
                SIFA
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Sistema Inteligente de Fiscalización Automática
              </span>
            </div>
            <div className="text-right">
              <p className="text-[11px] font-bold text-slate-600">
                I. MUNICIPALIDAD DE EL QUISCO
              </p>
              <p className="text-[9px] text-slate-400 font-medium">
                Dirección de Seguridad Pública y Fiscalización
              </p>
            </div>
          </div>

          {/* Metadatos */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Filtro de Fecha
              </p>
              <p className="text-xs font-bold text-slate-700">
                {dateRangeLabel}
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Generado por
              </p>
              <p className="text-xs font-bold text-slate-700">
                {currentUser?.name
                  ? `${currentUser.name} ${currentUser.lastname}`
                  : "Administrador"}
                <span className="text-[10px] text-slate-400 font-medium ml-1">
                  ({currentUser?.role || "Admin"})
                </span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Fecha Emisión
              </p>
              <p className="text-xs font-bold text-slate-700">{docDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Total Registros
              </p>
              <p className="text-xs font-bold text-slate-700">
                {totalInfracciones} infracciones
              </p>
            </div>
          </div>

          {/* Estadísticas */}
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Resumen Estadístico
          </h3>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 mb-1">
                Total Fiscalizadores
              </p>
              <p className="text-2xl font-black text-slate-800">
                {totalFiscalizadores}
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 mb-1">
                Total Infracciones
              </p>
              <p className="text-2xl font-black text-slate-800">
                {totalInfracciones}
              </p>
            </div>
            <div className="border border-slate-200 rounded-xl p-4 text-center">
              <p className="text-[10px] text-slate-500 mb-1">Promedio</p>
              <p className="text-2xl font-black text-slate-800">{promedio}</p>
            </div>
          </div>

          {/* Tabla */}
          <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-3">
            Detalle por Fiscalizador
          </h3>
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Fiscalizador
                  </th>
                  <th className="px-4 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
                    Infracciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {sortedData.map((item, index) => (
                  <tr key={item.idFiscalizador}>
                    <td className="px-4 py-3 text-slate-600 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-4 py-3 text-slate-800 font-semibold">
                      {item.idFiscalizador}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-primary">
                        {item.cantidadInfracciones}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="mt-auto pt-6 border-t border-slate-200 flex justify-between items-center text-[9px] text-slate-400 font-semibold uppercase tracking-wider">
            <span>SIFA - Municipalidad de El Quisco</span>
            <span>Página 1 de 1</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
