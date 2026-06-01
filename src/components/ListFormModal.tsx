import { useState } from "react";

import { Button } from "./ui/Button";
import { Field, Input, Textarea } from "./ui/Field";
import { Modal } from "./ui/Modal";
import { ErrorBanner } from "./ui/States";
import { COLOR_PALETTE } from "../lib/constants";
import type { CreateListDto, TaskList } from "../lib/types";

type ListFormModalProps = {
  // Si `list` viene definido, es edición; si no, es creación.
  list?: TaskList | null;
  onClose: () => void;
  onSubmit: (dto: CreateListDto) => Promise<void>;
};

export function ListFormModal({ list, onClose, onSubmit }: ListFormModalProps) {
  const isEdit = Boolean(list);
  const [name, setName] = useState(list?.name ?? "");
  const [description, setDescription] = useState(list?.description ?? "");
  const [color, setColor] = useState(list?.color ?? COLOR_PALETTE[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim() || undefined,
        color,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar lista" : "Nueva lista"}
      onClose={loading ? () => undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? "Guardar" : "Crear lista"}
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}

      <Field label="Nombre">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej. Trabajo, Personal…"
          autoFocus
          maxLength={60}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="¿De qué trata esta lista?"
        />
      </Field>

      <div className="field">
        <span className="field__label">Color</span>
        <div className="swatches">
          {COLOR_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              className={`swatch${c === color ? " swatch--active" : ""}`}
              style={{ background: c }}
              onClick={() => setColor(c)}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>
    </Modal>
  );
}
