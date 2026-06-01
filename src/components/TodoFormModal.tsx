import { useState } from "react";

import { Button } from "./ui/Button";
import { Field, Input, Select, Textarea } from "./ui/Field";
import { Modal } from "./ui/Modal";
import { ErrorBanner } from "./ui/States";
import { PlusIcon } from "./ui/Icons";
import { createCategory } from "../api/categories";
import { COLOR_PALETTE, PRIORITIES } from "../lib/constants";
import { PRIORITY_LABEL, toDateInputValue } from "../lib/format";
import type {
  Category,
  CreateTodoDto,
  Priority,
  TaskList,
  Todo,
} from "../lib/types";

type TodoFormModalProps = {
  todo?: Todo | null;
  defaultListId?: string;
  lists: TaskList[];
  categories: Category[];
  onClose: () => void;
  onSubmit: (dto: CreateTodoDto) => Promise<void>;
  onCategoryCreated: (category: Category) => void;
};

export function TodoFormModal({
  todo,
  defaultListId,
  lists,
  categories,
  onClose,
  onSubmit,
  onCategoryCreated,
}: TodoFormModalProps) {
  const isEdit = Boolean(todo);

  const [title, setTitle] = useState(todo?.title ?? "");
  const [description, setDescription] = useState(todo?.description ?? "");
  const [priority, setPriority] = useState<Priority>(todo?.priority ?? "MEDIUM");
  const [dueDate, setDueDate] = useState(toDateInputValue(todo?.dueDate));
  const [listId, setListId] = useState(todo?.listId ?? defaultListId ?? "");
  const [selectedCats, setSelectedCats] = useState<string[]>(
    todo?.categories.map((c) => c.uuid) ?? []
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mini formulario para crear una categoría sin salir del modal.
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatColor, setNewCatColor] = useState(COLOR_PALETTE[2]);
  const [creatingCat, setCreatingCat] = useState(false);

  const toggleCat = (uuid: string) =>
    setSelectedCats((prev) =>
      prev.includes(uuid)
        ? prev.filter((c) => c !== uuid)
        : [...prev, uuid]
    );

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    setCreatingCat(true);
    setError(null);
    try {
      const cat = await createCategory({
        name: newCatName.trim(),
        color: newCatColor,
      });
      onCategoryCreated(cat);
      setSelectedCats((prev) => [...prev, cat.uuid]);
      setNewCatName("");
      setShowNewCat(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear");
    } finally {
      setCreatingCat(false);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("El título es obligatorio.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      // En edición enviamos siempre dueDate (""=limpia la fecha en el PUT).
      // En creación omitimos los campos vacíos.
      const dto: CreateTodoDto = {
        title: title.trim(),
        description: description.trim() || undefined,
        priority,
        categoryIds: selectedCats,
      };
      if (listId) dto.listId = listId;
      if (isEdit) {
        dto.dueDate = dueDate;
      } else if (dueDate) {
        dto.dueDate = dueDate;
      }
      await onSubmit(dto);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar");
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? "Editar tarea" : "Nueva tarea"}
      onClose={loading ? () => undefined : onClose}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} loading={loading}>
            {isEdit ? "Guardar" : "Crear tarea"}
          </Button>
        </>
      }
    >
      {error && <ErrorBanner message={error} />}

      <Field label="Título">
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="¿Qué hay que hacer?"
          autoFocus
          maxLength={120}
        />
      </Field>

      <Field label="Descripción (opcional)">
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Detalles…"
        />
      </Field>

      <div className="field">
        <span className="field__label">Prioridad</span>
        <div className="segmented">
          {PRIORITIES.map((p) => (
            <button
              key={p}
              type="button"
              className={priority === p ? "active" : ""}
              onClick={() => setPriority(p)}
            >
              {PRIORITY_LABEL[p]}
            </button>
          ))}
        </div>
      </div>

      <div className="row" style={{ gap: 16, alignItems: "flex-end" }}>
        <div style={{ flex: 1 }}>
          <Field label="Fecha límite (opcional)">
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Lista">
            <Select
              value={listId}
              onChange={(e) => setListId(e.target.value)}
            >
              <option value="">Sin lista</option>
              {lists.map((l) => (
                <option key={l.uuid} value={l.uuid}>
                  {l.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </div>

      <div className="field">
        <div className="row">
          <span className="field__label">Categorías</span>
          <span className="spacer" />
          <button
            type="button"
            className="link-btn"
            onClick={() => setShowNewCat((s) => !s)}
          >
            {showNewCat ? "Cancelar" : "+ Nueva"}
          </button>
        </div>

        {categories.length === 0 && !showNewCat && (
          <p className="muted" style={{ fontSize: "0.84rem" }}>
            Aún no tienes categorías. Crea una con “+ Nueva”.
          </p>
        )}

        <div className="row row--wrap">
          {categories.map((c) => {
            const active = selectedCats.includes(c.uuid);
            return (
              <button
                key={c.uuid}
                type="button"
                className={`chip${active ? " chip--active" : ""}`}
                onClick={() => toggleCat(c.uuid)}
              >
                <span
                  className="chip__dot"
                  style={{ background: c.color }}
                  aria-hidden
                />
                {c.name}
              </button>
            );
          })}
        </div>

        {showNewCat && (
          <div
            className="card"
            style={{ padding: 14, marginTop: 10, display: "grid", gap: 10 }}
          >
            <Input
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="Nombre de la categoría"
              maxLength={40}
            />
            <div className="swatches">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`swatch${c === newCatColor ? " swatch--active" : ""}`}
                  style={{ background: c }}
                  onClick={() => setNewCatColor(c)}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
            <Button
              size="sm"
              onClick={handleCreateCategory}
              loading={creatingCat}
              disabled={!newCatName.trim()}
            >
              <PlusIcon width={15} height={15} /> Crear categoría
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
