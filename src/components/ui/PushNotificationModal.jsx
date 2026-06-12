import { useState, useEffect } from "react";
import { Bell, Send } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function PushNotificationModal({
  isOpen,
  onClose,
  email,
  onSend,
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setBody("");
      setSending(false);
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!body.trim() || !onSend) return;
    setSending(true);
    try {
      await onSend(title.trim(), body.trim());
      onClose();
    } catch {
      // keep modal open on error
    } finally {
      setSending(false);
    }
  };

  const handleClose = () => {
    setTitle("");
    setBody("");
    setSending(false);
    onClose();
  };

  const canSend = body.trim() && !sending && !!onSend;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Enviar notificación"
      description={email ? `Para: ${email}` : undefined}
      headerIcon={<Bell size={20} className="text-primary" />}
      maxWidth="max-w-md"
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="outline" size="sm" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSend}
            disabled={!canSend}
            isLoading={sending}
            loadingText="Enviando..."
            className="!w-auto !px-6"
          >
            <Send size={14} />
            Enviar
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Título
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título de la notificación"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            autoFocus
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Mensaje
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Escribe el texto de la notificación..."
            rows={4}
            className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          />
        </div>
      </div>
    </Modal>
  );
}
