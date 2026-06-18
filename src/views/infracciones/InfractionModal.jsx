import { useRef, useState, useEffect } from "react";
import { X } from "lucide-react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

import { StatusBadge } from "@/components/ui/StatusBadge";

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
  const [confirmReject, setConfirmReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
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
    if (!rejectionReason.trim()) {
      showToast("Por favor, ingrese un motivo de rechazo.", "error");
      return;
    }
    updateStatus(infraction.id, "rejected", rejectionReason);
    showToast("Infracción rechazada y anulada");
    setConfirmReject(false);
    onClose();
  };

  const handleAccept = () => {
    updateStatus(infraction.id, "accepted");
    showToast(
      `Infracción ID: ${infraction.id} aceptada`,
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
      pdf.save(`empadronado-${infraction.id}.pdf`);
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
            <button
              onClick={onClose}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all hover:rotate-90 shrink-0"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-5">
          {infraction.status === 'rejected' && infraction.motivoRechazo && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex flex-col gap-1 text-sm animate-in fade-in duration-200">
              <span className="font-bold text-xs uppercase tracking-wider text-red-800">Motivo del Rechazo</span>
              <p className="italic">"{infraction.motivoRechazo}"</p>
            </div>
          )}

          {confirmReject && (
            <div className="bg-red-50 border border-red-200 p-4 rounded-xl space-y-2 animate-in slide-in-from-top-4 duration-300">
              <label htmlFor="rejectionReason" className="block text-xs font-bold uppercase tracking-wider text-red-800">
                Motivo del Rechazo <span className="text-red-500">*</span>
              </label>
              <textarea
                id="rejectionReason"
                rows={3}
                className="w-full px-3 py-2 border border-red-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent bg-white text-slate-800 placeholder-slate-400"
                placeholder="Escriba aquí el motivo detallado de la anulación o rechazo..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          )}

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
            confirmReject={confirmReject}
            isExporting={isExporting}
            onReject={handleReject}
            onStartConfirmReject={() => setConfirmReject(true)}
            onCancelConfirmReject={() => {
              setConfirmReject(false);
              setRejectionReason("");
            }}
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
