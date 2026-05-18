import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";

import { InfractionNumeraciones } from "./components/InfractionNumeraciones";
import {
  InfractionPhotoSection,
  InfractionDetailCard,
} from "./components/InfractionPhotoSection";
import { InfractionInfractorSection } from "./components/InfractionInfractorSection";
import { InfractionVehicleSection } from "./components/InfractionVehicleSection";
import { InfractionModalFooter } from "./components/InfractionModalFooter";
import { InfractionPDFTemplate } from "./components/InfractionPDFTemplate";

export function InfractionModal({
  infraction,
  updateStatus,
  showToast,
  onClose,
  currentUser,
}) {
  console.log("Datos infraccion: ", JSON.stringify(infraction, null, 2));
  const citationRef = useRef();

  // ── Estado local ────────────────────────────────────────────────────────────
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // ── RBAC ────────────────────────────────────────────────────────────────────
  const isJPL = currentUser?.role === "Administrativo JPL";
  const canAccept = isJPL;
  const canExport = isJPL;

  // ── Cerrar con Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // ── Handlers de estado ──────────────────────────────────────────────────────
  const handleReject = () => {
    updateStatus(infraction.id, "rejected");
    showToast("Infracción rechazada y anulada");
    onClose();
  };

  const handleAccept = () => {
    updateStatus(infraction.id, "accepted");
    showToast(
      `Infracción ${infraction.numeroBoleta || infraction.id} aceptada`,
    );
    setConfirmAccept(false);
  };

  const handleReopen = () => updateStatus(infraction.id, "pending");

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    try {
      setIsExporting(true);
      const canvas = await html2canvas(citationRef.current, {
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(
        canvas.toDataURL("image/png"),
        "PNG",
        0,
        0,
        pdfWidth,
        (canvas.height * pdfWidth) / canvas.width,
      );
      pdf.save(`empadronado-${infraction.numeroBoleta || infraction.id}.pdf`);
      updateStatus(infraction.id, "exported");
      showToast("Citación PDF exportada exitosamente");
    } catch {
      showToast("Error al generar el PDF", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // ── Datos ───────────────────────────────────────────────────────────────────
  const location = infraction.location || {};

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[93vh] animate-in slide-in-from-bottom-4 duration-300">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b rounded-t-2xl shrink-0 bg-slate-50">
          <div className="flex items-center gap-3">
            <StatusBadge status={infraction.status} />
            <div>
              <h3 className="text-base font-black text-slate-800">
                Infracción {infraction.id ? `ID: ${infraction.id}` : ""}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={onClose}>
              <X size={20} />
            </Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-5">
          <InfractionNumeraciones data={infraction} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfractionPhotoSection
              data={infraction}
              infraction={infraction}
              location={location}
            />
            <InfractionDetailCard data={infraction} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfractionInfractorSection data={infraction} />
            <InfractionVehicleSection data={infraction} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-3 bg-slate-50">
          <InfractionModalFooter
            infraction={infraction}
            canAccept={canAccept}
            canExport={canExport}
            confirmAccept={confirmAccept}
            isExporting={isExporting}
            onReject={handleReject}
            onStartConfirmAccept={() => setConfirmAccept(true)}
            onCancelConfirmAccept={() => setConfirmAccept(false)}
            onAccept={handleAccept}
            onReopen={handleReopen}
            onExportPDF={exportPDF}
          />
        </div>
      </div>

      {/* ── Plantilla PDF invisible ── */}
      <InfractionPDFTemplate
        citationRef={citationRef}
        infraction={infraction}
      />
    </div>
  );
}
