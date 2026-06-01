import { useCallback, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { ListFormModal } from "../components/ListFormModal";
import { TodoFormModal } from "../components/TodoFormModal";
import { TodoItem } from "../components/TodoItem";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PencilIcon, PlusIcon, TrashIcon } from "../components/ui/Icons";
import { EmptyState, ErrorBanner, Spinner } from "../components/ui/States";
import { deleteList, listTodosByList, updateList } from "../api/lists";
import { useMeta } from "../hooks/useMeta";
import { useTodoManager } from "../hooks/useTodoManager";
import type { CreateListDto } from "../lib/types";

export default function ListDetail() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const { lists, categories, addCategory, reloadLists } = useMeta();
  const list = useMemo(() => lists.find((l) => l.uuid === id), [lists, id]);

  const loader = useCallback(() => listTodosByList(id), [id]);
  const m = useTodoManager(loader);

  const [editingList, setEditingList] = useState(false);
  const [deletingList, setDeletingList] = useState(false);

  const onListSubmit = async (dto: CreateListDto) => {
    await updateList(id, dto);
    await reloadLists();
  };

  const color = list?.color || "#0D9488";
  const pendingCount = m.todos.filter((t) => !t.completed).length;

  return (
    <>
      <button
        className="link-btn"
        style={{ marginBottom: 14 }}
        onClick={() => navigate("/")}
      >
        ← Volver a mis listas
      </button>

      <div className="page-head">
        <div>
          <h1 style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              className="chip__dot"
              style={{ background: color, width: 14, height: 14 }}
              aria-hidden
            />
            {list?.name ?? "Lista"}
          </h1>
          <p>
            {list?.description ? `${list.description} · ` : ""}
            {m.todos.length} {m.todos.length === 1 ? "tarea" : "tareas"} ·{" "}
            {pendingCount} pendientes
          </p>
        </div>
        <div className="row">
          {list && (
            <>
              <button
                className="btn btn--secondary btn--icon"
                onClick={() => setEditingList(true)}
                aria-label="Editar lista"
              >
                <PencilIcon width={17} height={17} />
              </button>
              <button
                className="btn btn--secondary btn--icon"
                onClick={() => setDeletingList(true)}
                aria-label="Eliminar lista"
                style={{ color: "var(--danger)" }}
              >
                <TrashIcon width={17} height={17} />
              </button>
            </>
          )}
          <Button onClick={m.openCreate}>
            <PlusIcon width={17} height={17} /> Nueva tarea
          </Button>
        </div>
      </div>

      {m.actionError && <ErrorBanner message={m.actionError} />}
      {m.error && <ErrorBanner message={m.error} />}

      {m.loading ? (
        <Spinner center />
      ) : m.todos.length === 0 ? (
        <EmptyState icon="📝" title="Esta lista está vacía">
          <p className="muted">Agrega una tarea para empezar.</p>
          <div style={{ marginTop: 16 }}>
            <Button onClick={m.openCreate}>
              <PlusIcon width={17} height={17} /> Nueva tarea
            </Button>
          </div>
        </EmptyState>
      ) : (
        <div className="stack">
          {m.todos.map((t) => (
            <TodoItem
              key={t.uuid}
              todo={t}
              onToggle={m.toggle}
              onEdit={m.openEdit}
              onDelete={m.setDeleting}
            />
          ))}
        </div>
      )}

      {m.formOpen && (
        <TodoFormModal
          todo={m.editing}
          defaultListId={id}
          lists={lists}
          categories={categories}
          onClose={m.closeForm}
          onSubmit={m.submit}
          onCategoryCreated={addCategory}
        />
      )}

      {m.deleting && (
        <ConfirmDialog
          title="Eliminar tarea"
          message={`¿Eliminar "${m.deleting.title}"? Esta acción no se puede deshacer.`}
          onConfirm={() => m.remove(m.deleting!)}
          onClose={() => m.setDeleting(null)}
        />
      )}

      {editingList && list && (
        <ListFormModal
          list={list}
          onClose={() => setEditingList(false)}
          onSubmit={onListSubmit}
        />
      )}

      {deletingList && list && (
        <ConfirmDialog
          title="Eliminar lista"
          message={`¿Eliminar "${list.name}"? Las tareas no se borran: quedarán sin lista.`}
          onConfirm={async () => {
            await deleteList(id);
            await reloadLists();
            navigate("/");
          }}
          onClose={() => setDeletingList(false)}
        />
      )}
    </>
  );
}
