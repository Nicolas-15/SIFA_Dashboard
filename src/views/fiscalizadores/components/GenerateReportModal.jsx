import { useState } from "react";
import { FileText, Calendar, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

export function GenerateReportModal({
  isOpen,
  onClose,
  fiscalizadores,
  onGenerateReport,
}) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reportType, setReportType] = useState("actividad");
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
      alert("Por favor seleccione un rango de fechas válido.");
      return;
    }

    // Llamar al callback con el tipo de reporte y las fechas
    if (onGenerateReport) {
      onGenerateReport({ startDate, endDate, reportType });
      return;
    }

    setGenerating(true);

    // Simulación de generación de reporte
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Aquí iría la lógica real de generación de reporte
    console.log("Generando reporte:", {
      startDate,
      endDate,
      reportType,
      totalFiscalizadores: fiscalizadores?.length || 0,
    });

    setGenerating(false);
    onClose();

    // Resetear formulario
    setStartDate("");
    setEndDate("");
    setReportType("actividad");
  };

  const renderFooter = (
    <div className="flex items-center gap-3 w-full">
      <Button
        variant="outline"
        onClick={onClose}
        className="flex-1"
        disabled={generating}
      >
        Cancelar
      </Button>
      <Button
        variant="primary"
        onClick={handleGenerate}
        className="flex-1"
        disabled={generating || !startDate || !endDate}
      >
        {generating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Generando...
          </>
        ) : (
          <>
            <Download className="w-4 h-4" />
            Generar Reporte
          </>
        )}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Generar Reporte"
      description="Exportar datos de fiscalizadores"
      headerIcon={<FileText className="w-5 h-5 text-primary" />}
      maxWidth="max-w-md"
      closeOnBackdropClick={true}
      className="mx-4"
      headerClassName="p-6 border-b border-slate-200"
      bodyClassName="p-6 space-y-5"
      footerClassName="flex items-center gap-3 p-6 border-t border-slate-200"
      titleClassName="text-lg font-bold text-slate-800"
      descriptionClassName="text-xs text-slate-500 mt-0.5"
      closeButtonClassName="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors w-9 h-9 border-0 bg-transparent flex items-center justify-center"
      footer={renderFooter}
    >
      {/* Tipo de Reporte */}
      <div>
        <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
          Tipo de Reporte
        </label>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setReportType("actividad")}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              reportType === "actividad"
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Calendar size={16} />
              Productividad
            </div>
          </button>
          <button
            type="button"
            onClick={() => setReportType("ubicaciones")}
            className={`p-3 rounded-xl border text-sm font-medium transition-all ${
              reportType === "ubicaciones"
                ? "border-primary bg-primary/5 text-primary"
                : "border-slate-200 text-slate-600 hover:border-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              Mapa
            </div>
          </button>
        </div>
      </div>

      {/* Rango de Fechas */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Fecha Inicio
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            max={endDate || new Date().toISOString().slice(0, 10)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
            Fecha Fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            min={startDate}
            max={new Date().toISOString().slice(0, 10)}
            className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-800 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      {/* Resumen */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <FileText size={14} className="text-slate-500" />
          <span className="text-xs font-semibold text-slate-600 uppercase">
            Resumen
          </span>
        </div>
        <div className="space-y-1 text-sm text-slate-600">
          <div className="flex justify-between">
            <span>Total fiscalizadores:</span>
            <span className="font-bold text-slate-800">
              {fiscalizadores?.length || 0}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Formato:</span>
            <span className="font-bold text-slate-800">PDF</span>
          </div>
        </div>
      </div>
    </Modal>
  );
}
