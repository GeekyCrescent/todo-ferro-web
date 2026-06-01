import { useCallback, useMemo, useState } from "react";

import { TodoFormModal } from "../components/TodoFormModal";
import { TodoItem } from "../components/TodoItem";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PlusIcon } from "../components/ui/Icons";
import { EmptyState, ErrorBanner, Spinner } from "../components/ui/States";
import { listMyTodos } from "../api/todos";
import { useMeta } from "../hooks/useMeta";
import { useTodoManager } from "../hooks/useTodoManager";
import { PRIORITY_LABEL, PRIORITY_RANK } from "../lib/format";
import { PRIORITIES } from "../lib/constants";
import type { Priority, Todo } from "../lib/types";

type SortKey = "recent" | "priority" | "due";
type StatusFilter = "all" | "pending" | "completed";

const SORT_LABEL: Record<SortKey, string> = {
  recent: "Recientes",
  priority: "Prioridad",
  due: "Fecha límite",
};

export default function AllTodos() {
  const { lists, categories, addCategory } = useMeta();
  const loader = useCallback(() => listMyTodos(), []);
  const m = useTodoManager(loader);

  const [sort, setSort] = useState<SortKey>("recent");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [priority, setPriority] = useState<Priority | "all">("all");

  const listNameById = useMemo(
    () => Object.fromEntries(lists.map((l) => [l.uuid, l.name])),
    [lists]
  );

  const visible = useMemo(() => {
    let result = [...m.todos];

    if (status === "pending") result = result.filter((t) => !t.completed);
    if (status === "completed") result = result.filter((t) => t.completed);
    if (priority !== "all") result = result.filter((t) => t.priority === priority);

    result.sort((a, b) => {
      if (sort === "priority") {
        const diff = PRIORITY_RANK[b.priority] - PRIORITY_RANK[a.priority];
        if (diff !== 0) return diff;
        return b.createdAt.localeCompare(a.createdAt);
      }
      if (sort === "due") {
        // Tareas con fecha primero (asc); las sin fecha al final.
        if (!a.dueDate && !b.dueDate) return b.createdAt.localeCompare(a.createdAt);
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return b.createdAt.localeCompare(a.createdAt);
    });

    return result;
  }, [m.todos, status, priority, sort]);

  const pendingCount = m.todos.filter((t) => !t.completed).length;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Todas las tareas</h1>
          <p>
            {m.todos.length} {m.todos.length === 1 ? "tarea" : "tareas"} ·{" "}
            {pendingCount} pendientes
          </p>
        </div>
        <Button onClick={m.openCreate}>
          <PlusIcon width={17} height={17} /> Nueva tarea
        </Button>
      </div>

      {/* Controles de orden y filtro */}
      <div className="card" style={{ padding: 14, marginBottom: 20 }}>
        <div className="stack" style={{ gap: 12 }}>
          <div className="row row--wrap" style={{ gap: 8 }}>
            <span className="field__label" style={{ alignSelf: "center" }}>
              Ordenar
            </span>
            <div className="segmented">
              {(Object.keys(SORT_LABEL) as SortKey[]).map((k) => (
                <button
                  key={k}
                  className={sort === k ? "active" : ""}
                  onClick={() => setSort(k)}
                >
                  {SORT_LABEL[k]}
                </button>
              ))}
            </div>
          </div>

          <div className="row row--wrap" style={{ gap: 8 }}>
            <span className="field__label" style={{ alignSelf: "center" }}>
              Estado
            </span>
            <button
              className={`chip${status === "all" ? " chip--active" : ""}`}
              onClick={() => setStatus("all")}
            >
              Todas
            </button>
            <button
              className={`chip${status === "pending" ? " chip--active" : ""}`}
              onClick={() => setStatus("pending")}
            >
              Pendientes
            </button>
            <button
              className={`chip${status === "completed" ? " chip--active" : ""}`}
              onClick={() => setStatus("completed")}
            >
              Completadas
            </button>
          </div>

          <div className="row row--wrap" style={{ gap: 8 }}>
            <span className="field__label" style={{ alignSelf: "center" }}>
              Prioridad
            </span>
            <button
              className={`chip${priority === "all" ? " chip--active" : ""}`}
              onClick={() => setPriority("all")}
            >
              Todas
            </button>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                className={`chip${priority === p ? " chip--active" : ""}`}
                onClick={() => setPriority(p)}
              >
                {PRIORITY_LABEL[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {m.actionError && <ErrorBanner message={m.actionError} />}
      {m.error && <ErrorBanner message={m.error} />}

      {m.loading ? (
        <Spinner center />
      ) : m.todos.length === 0 ? (
        <EmptyState icon="✅" title="No tienes tareas todavía">
          <p className="muted">Crea tu primera tarea para empezar.</p>
        </EmptyState>
      ) : visible.length === 0 ? (
        <EmptyState icon="🔍" title="Ninguna tarea coincide con los filtros" />
      ) : (
        <div className="stack">
          {visible.map((t: Todo) => (
            <TodoItem
              key={t.uuid}
              todo={t}
              listName={t.listId ? listNameById[t.listId] : undefined}
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
    </>
  );
}
