import { Shield, ShieldOff, Clock, X, Mail, User, Key, Fingerprint, Hash, RefreshCw, Lock, Calendar } from 'lucide-react';
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { formatDateTime } from "@/utils/date";

function maskToken(token) {
  if (!token) return '-';
  return `${token.slice(0, 5)}*****`;
}

function parseBackendDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr + 'Z');
}

function getExpiraInfo(selectedItem) {
  const info = { fecha: '-', restante: null };
  if (!selectedItem?.expiresAt) return info;

  const expira = parseBackendDate(selectedItem.expiresAt);
  if (!expira) return info;

  info.fecha = formatDateTime(expira);

  if (selectedItem.status !== 'active') return info;

  const diffMs = expira.getTime() - Date.now();
  if (diffMs <= 0) return info;

  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffMin < 1) info.restante = 'menos de 1 min';
  else if (diffH < 1) info.restante = `${diffMin} min`;
  else if (diffD < 1) info.restante = `${diffH}h ${diffMin % 60}min`;
  else info.restante = `${diffD}d ${diffH % 24}h`;

  return info;
}

function DetailRow({ icon: Icon, label, value, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={15} className="text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-slate-800 break-all">{children || value || '-'}</p>
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
  const expiraInfo = getExpiraInfo(selectedItem);

  const renderDetailFooter = (
    <div className="flex items-center justify-end gap-3">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDetailModalOpen(false)}
        className="!border-primary/40"
        style={{ width: 100, height: 32 }}
      >
        <X size={16} />
        <span className="ml-1.5">Cerrar</span>
      </Button>
      {isActive && (
        <>
          <Button
            isLoading={submitting === 'expire'}
            loadingText="Expirando..."
            variant="outline"
            onClick={() => handleExpireConfirm(selectedItem)}
            style={{ width: 100, height: 32 }}
          >
            <Clock size={16} />
            <span className="ml-1.5">Expirar</span>
          </Button>
          <Button
            isLoading={submitting === 'revoke'}
            loadingText="Revocando..."
            variant="danger"
            onClick={() => handleRevokeConfirm(selectedItem)}
            style={{ width: 100, height: 32 }}
          >
            <ShieldOff size={16} />
            <span className="ml-1.5">Revocar</span>
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
        <DetailRow
          icon={selectedItem?.tokenType === 'REFRESH' ? RefreshCw : selectedItem?.tokenType === 'ACCESS' ? Lock : Key}
          label="Tipo"
          value={selectedItem?.tokenType}
        />
        <DetailRow
          icon={selectedItem?.status === 'active' ? Shield : selectedItem?.status === 'revoked' ? ShieldOff : Clock}
          label="Estado"
          value={
            selectedItem?.status === 'active' ? 'Activo' :
            selectedItem?.status === 'revoked' ? 'Revocado' :
            'Expirado'
          }
        />
        <DetailRow icon={Calendar} label="Creado" value={selectedItem?.createdAt ? formatDateTime(parseBackendDate(selectedItem.createdAt)) : '-'} />
        <DetailRow icon={Calendar} label="Modificado" value={selectedItem?.modifiedAt ? formatDateTime(parseBackendDate(selectedItem.modifiedAt)) : '-'} />
        <DetailRow icon={Clock} label="Expira">
          {expiraInfo.fecha}
          {expiraInfo.restante && (
            <span className="text-emerald-600">{` (${expiraInfo.restante})`}</span>
          )}
        </DetailRow>
      </div>
    </Modal>
  );
}
