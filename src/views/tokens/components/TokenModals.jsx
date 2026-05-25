import { Shield, ShieldOff, Clock, Mail, User, Key, Fingerprint, Hash } from 'lucide-react';
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

function maskToken(token) {
  if (!token) return '-';
  return `${token.slice(0, 5)}*****`;
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-all">{value || '-'}</p>
      </div>
    </div>
  );
}

export function TokenModals({
  isDetailModalOpen,
  setIsDetailModalOpen,
  handleRevokeConfirm,
  handleExpireConfirm,
  submitting,
  selectedItem,
}) {
  const isActive = selectedItem?.status === 'active';

  const renderDetailFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsDetailModalOpen(false)}
        className="px-5"
      >
        Cerrar
      </Button>
      {isActive && (
        <>
          <Button
            isLoading={submitting === 'expire'}
            loadingText="Expirando..."
            variant="outline"
            onClick={() => handleExpireConfirm(selectedItem)}
            className="!w-auto px-6"
          >
            <Clock size={16} />
            <span className="ml-2">Expirar</span>
          </Button>
          <Button
            isLoading={submitting === 'revoke'}
            loadingText="Revocando..."
            variant="danger"
            onClick={() => handleRevokeConfirm(selectedItem)}
            className="!w-auto px-6"
          >
            <ShieldOff size={16} />
            <span className="ml-2">Revocar</span>
          </Button>
        </>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isDetailModalOpen}
      onClose={() => setIsDetailModalOpen(false)}
      title="Detalle del Token"
      description={selectedItem?.userName
        ? `Token de ${selectedItem.userName} ${selectedItem.userLastName || ''}`
        : 'Información del token'}
      headerExtra={
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3.5 py-1.5 rounded-xl">
          <span className="text-[10px] font-bold uppercase tracking-widest text-primary/70">ID</span>
          <span className="text-sm font-black text-primary font-mono">#{selectedItem?.id}</span>
        </div>
      }
      footer={renderDetailFooter}
    >
      <div className="space-y-5">
        <DetailRow icon={User} label="Usuario" value={`${selectedItem?.userName || ''} ${selectedItem?.userLastName || ''}`} />
        <DetailRow icon={Fingerprint} label="RUT" value={selectedItem?.userRut} />
        <DetailRow icon={Mail} label="Email" value={selectedItem?.userEmail} />
        <DetailRow icon={Key} label="Token" value={maskToken(selectedItem?.token)} />
        <DetailRow icon={Shield} label="Tipo" value={selectedItem?.tokenType} />
        <DetailRow
          icon={selectedItem?.status === 'active' ? Shield : selectedItem?.status === 'revoked' ? ShieldOff : Clock}
          label="Estado"
          value={
            selectedItem?.status === 'active' ? 'Activo' :
            selectedItem?.status === 'revoked' ? 'Revocado' :
            'Expirado'
          }
        />
      </div>
    </Modal>
  );
}
