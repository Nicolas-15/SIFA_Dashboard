import { X, CheckCircle, Download, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';

/**
 * Footer del modal de infracción.
 * Renderiza las acciones disponibles según el estado de la infracción y el modo de edición.
 */
export function InfractionModalFooter({
  editing,
  infraction,
  canAccept,
  canExport,
  confirmAccept,
  confirmReject,
  isSavingEdit,
  isExporting,
  onSaveEdit,
  onReject,
  onStartConfirmReject,
  onCancelConfirmReject,
  onStartConfirmAccept,
  onCancelConfirmAccept,
  onAccept,
  onReopen,
  onExportPDF,
}) {
  if (editing) {
    return (
      <Button
        size="sm"
        variant="primary"
        isLoading={isSavingEdit}
        loadingText="Guardando..."
        onClick={onSaveEdit}
        disabled={isSavingEdit}
        className="px-6"
      >
        <Save size={16} /> Guardar Cambios
      </Button>
    );
  }

  return (
    <>
      {/* Pendiente — acciones de revisión */}
      {infraction.status === 'pending' && !confirmAccept && !confirmReject && canAccept && (
        <div className="flex gap-2">
          <Button size="sm" variant="danger" onClick={onStartConfirmReject}>
            <X size={15} /> Rechazar
          </Button>
          <Button size="sm" variant="success" onClick={onStartConfirmAccept} className="!bg-emerald-500 !text-white hover:!bg-emerald-600">
            <CheckCircle size={15} /> Revisar / Aceptar
          </Button>
        </div>
      )}

      {/* Confirmación de rechazo */}
      {infraction.status === 'pending' && confirmReject && canAccept && (
        <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300 w-full justify-between items-center">
          <span className="text-xs font-semibold text-red-600 bg-red-100/50 px-3 py-2 rounded-xl border border-red-200">
            ¿Confirmar rechazo de la infracción?
          </span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={onCancelConfirmReject}>Cancelar</Button>
            <Button size="sm" variant="danger" onClick={onReject}>
              Confirmar Rechazo
            </Button>
          </div>
        </div>
      )}

      {/* Confirmación de aceptación */}
      {infraction.status === 'pending' && confirmAccept && canAccept && (
        <div className="flex gap-2 animate-in slide-in-from-right-4 duration-300">
          <span className="text-xs font-semibold text-slate-500 flex items-center bg-slate-200 px-3 py-2 rounded-xl">
            ¿Confirmar validez legal?
          </span>
          <Button size="sm" variant="ghost" onClick={onCancelConfirmAccept}>Cancelar</Button>
          <Button size="sm" variant="success" onClick={onAccept} className="!bg-emerald-600 !text-white hover:!bg-emerald-700">
            Sí, Aceptar
          </Button>
        </div>
      )}

      {/* Aceptada — exportar */}
      {infraction.status === 'accepted' && canExport && (
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={onReopen}>
            <RotateCcw size={14} /> Reabrir a Pendiente
          </Button>
          <Button size="sm" variant="primary" isLoading={isExporting} loadingText="Generando PDF..." onClick={onExportPDF} disabled={isExporting} className="px-5">
            <Download size={14} /> Generar Empadronado JPL
          </Button>
        </div>
      )}

      {/* Exportada */}
      {infraction.status === 'exported' && (
        <div className="flex gap-2">
          {canAccept && (
            <Button size="sm" variant="outline" onClick={onReopen}>
              <RotateCcw size={14} /> Reabrir a Pendiente
            </Button>
          )}
          {canExport && (
            <Button size="sm" variant="primary" isLoading={isExporting} loadingText="Generando PDF..." onClick={onExportPDF} disabled={isExporting} className="px-5">
              <Download size={14} /> Descargar PDF Nuevamente
            </Button>
          )}
          <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 font-bold text-xs rounded-lg flex items-center gap-2 border border-emerald-200">
            <CheckCircle size={15} /> Exportada
          </span>
        </div>
      )}

      {/* Rechazada */}
      {infraction.status === 'rejected' && (
        <div className="flex items-center gap-2">
          {canAccept && (
            <Button size="sm" variant="outline" onClick={onReopen} title="Deshacer y Reabrir">
              <RotateCcw size={14} /> Reabrir a Pendiente
            </Button>
          )}
          <span className="px-4 py-1.5 bg-red-50 text-red-600 font-bold text-xs rounded-lg flex items-center gap-2 border border-red-200">
            <X size={15} /> Infracción Rechazada Devuelta
          </span>
        </div>
      )}
    </>
  );
}
