import { useRef, useState, useEffect } from 'react';
import { X, Pencil, RotateCcw } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { StatusBadge } from '@/components/ui/StatusBadge';
import { Button } from '@/components/ui/Button';

import { InfractionNumeraciones }    from './components/InfractionNumeraciones';
import { InfractionPhotoSection, InfractionDetailCard } from './components/InfractionPhotoSection';
import { InfractionInfractorSection } from './components/InfractionInfractorSection';
import { InfractionVehicleSection }  from './components/InfractionVehicleSection';
import { InfractionModalFooter }     from './components/InfractionModalFooter';
import { InfractionPDFTemplate }     from './components/InfractionPDFTemplate';

export function InfractionModal({ infraction, updateStatus, updateInfraction, showToast, onClose, currentUser }) {
  const citationRef = useRef();

  // ── Estado local ────────────────────────────────────────────────────────────
  const [editing, setEditing]           = useState(false);
  const [draft, setDraft]               = useState(null);
  const [confirmAccept, setConfirmAccept] = useState(false);
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [isExporting, setIsExporting]   = useState(false);

  // ── RBAC ────────────────────────────────────────────────────────────────────
  const isJPL     = currentUser?.role === 'Administrativo JPL';
  const canEdit   = isJPL;
  const canAccept = isJPL;
  const canExport = isJPL;

  // ── Cerrar con Escape ───────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  // ── Helpers de draft ────────────────────────────────────────────────────────
  const setField  = (key, val)              => setDraft(d => ({ ...d, [key]: val }));
  const setNested = (parent, key, val)      => setDraft(d => ({ ...d, [parent]: { ...d[parent], [key]: val } }));

  // ── Handlers de edición ─────────────────────────────────────────────────────
  const startEdit  = () => { setDraft(JSON.parse(JSON.stringify(infraction))); setEditing(true); };
  const cancelEdit = () => { setDraft(null); setEditing(false); };

  const saveEdit = async () => {
    try {
      setIsSavingEdit(true);
      await updateInfraction(infraction.id, draft);
      showToast(`Infracción Boleta ${draft.numeroBoleta || draft.id} actualizada`);
      setEditing(false);
      setDraft(null);
    } catch {
      showToast('Error al actualizar la infracción en BD', 'error');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // ── Handlers de estado ──────────────────────────────────────────────────────
  const handleReject = () => {
    updateStatus(infraction.id, 'rejected');
    showToast('Infracción rechazada y anulada');
    onClose();
  };

  const handleAccept = () => {
    updateStatus(infraction.id, 'accepted');
    showToast(`Infracción ${infraction.numeroBoleta || infraction.id} aceptada`);
    setConfirmAccept(false);
  };

  const handleReopen = () => updateStatus(infraction.id, 'pending');

  // ── Exportar PDF ────────────────────────────────────────────────────────────
  const exportPDF = async () => {
    try {
      setIsExporting(true);
      const canvas   = await html2canvas(citationRef.current, { scale: 2, useCORS: true });
      const pdf      = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, pdfWidth, (canvas.height * pdfWidth) / canvas.width);
      pdf.save(`empadronado-${infraction.numeroBoleta || infraction.id}.pdf`);
      updateStatus(infraction.id, 'exported');
      showToast('Citación PDF exportada exitosamente');
    } catch {
      showToast('Error al generar el PDF', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  // ── Datos activos (draft en edición, original en lectura) ───────────────────
  const data     = editing ? draft : infraction;
  const location = infraction.location || {};

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full sm:max-w-4xl rounded-t-2xl sm:rounded-2xl shadow-2xl border border-slate-200 flex flex-col max-h-[93vh] animate-in slide-in-from-bottom-4 duration-300">

        {/* ── Header ── */}
        <div className={`flex items-center justify-between px-5 py-4 border-b rounded-t-2xl shrink-0 transition-colors ${editing ? 'bg-blue-50/50 border-blue-200' : 'bg-slate-50'}`}>
          <div className="flex items-center gap-3">
            <StatusBadge status={infraction.status} />
            <div>
              <h3 className="text-base font-black text-slate-800">
                Infracción {infraction.numeroBoleta ? `Boleta N°${infraction.numeroBoleta}` : ''}
              </h3>
              <p className="text-xs text-slate-500 font-mono">ID: {infraction.id.split('-')[0]}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!editing
              ? canEdit && <Button size="sm" variant="warning" onClick={startEdit}><Pencil size={13} /> Editar Documento</Button>
              : <Button size="sm" variant="ghost" onClick={cancelEdit}><RotateCcw size={13} /> Descartar</Button>
            }
            <Button size="icon" variant="ghost" onClick={onClose}><X size={20} /></Button>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="overflow-y-auto flex-1 p-4 md:p-6 space-y-5">
          <InfractionNumeraciones editing={editing} data={data} setField={setField} setNested={setNested} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfractionPhotoSection editing={editing} data={data} infraction={infraction} location={location} setNested={setNested} />
            <InfractionDetailCard   editing={editing} data={data} setField={setField} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfractionInfractorSection editing={editing} data={data} setNested={setNested} />
            <InfractionVehicleSection   editing={editing} data={data} setNested={setNested} />
          </div>
        </div>

        {/* ── Footer ── */}
        <div className="px-5 py-4 border-t flex items-center justify-end gap-3 bg-slate-50">
          <InfractionModalFooter
            editing={editing}
            infraction={infraction}
            canAccept={canAccept}
            canExport={canExport}
            confirmAccept={confirmAccept}
            isSavingEdit={isSavingEdit}
            isExporting={isExporting}
            onSaveEdit={saveEdit}
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
      <InfractionPDFTemplate citationRef={citationRef} infraction={infraction} />
    </div>
  );
}
