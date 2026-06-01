import { useState } from "react";

import { Button } from "./Button";
import { Modal } from "./Modal";
import { ErrorBanner } from "./States";

type ConfirmDialogProps = {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Eliminar",
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handle = async () => {
    setLoading(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo completar");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={title}
      onClose={loading ? () => undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={handle} loading={loading}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}
      <p className="muted">{message}</p>
    </Modal>
  );
}
