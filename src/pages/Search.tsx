import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ListCard } from "../components/ListCard";
import { TodoFormModal } from "../components/TodoFormModal";
import { TodoItem } from "../components/TodoItem";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { Input } from "../components/ui/Field";
import { SearchIcon } from "../components/ui/Icons";
import { EmptyState, ErrorBanner, Spinner } from "../components/ui/States";
import { listMyTodos } from "../api/todos";
import { useDebounce } from "../hooks/useDebounce";
import { useMeta } from "../hooks/useMeta";
import { useTodoManager } from "../hooks/useTodoManager";

export default function Search() {
  const navigate = useNavigate();
  const { lists, categories, addCategory } = useMeta();

  const loader = useCallback(() => listMyTodos(), []);
  const m = useTodoManager(loader);

  const [query, setQuery] = useState("");
  const q = useDebounce(query.trim().toLowerCase(), 200);

  const listNameById = useMemo(
    () => Object.fromEntries(lists.map((l) => [l.uuid, l.name])),
    [lists]
  );

  const matchedLists = useMemo(() => {
    if (!q) return [];
    return lists.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.description ?? "").toLowerCase().includes(q)
    );
  }, [lists, q]);

  const matchedTodos = useMemo(() => {
    if (!q) return [];
    return m.todos.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        t.categories.some((c) => c.name.toLowerCase().includes(q))
    );
  }, [m.todos, q]);

  const hasResults = matchedLists.length > 0 || matchedTodos.length > 0;

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Buscar</h1>
          <p>Encuentra listas y tareas por nombre, descripción o categoría.</p>
        </div>
      </div>

      <div style={{ position: "relative", marginBottom: 20 }}>
        <span
          style={{
            position: "absolute",
            left: 14,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--text-muted)",
            display: "flex",
          }}
        >
          <SearchIcon width={18} height={18} />
        </span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar listas y tareas…"
          autoFocus
          style={{ paddingLeft: 42 }}
        />
      </div>

      {m.actionError && <ErrorBanner message={m.actionError} />}
      {m.error && <ErrorBanner message={m.error} />}

      {m.loading ? (
        <Spinner center />
      ) : !q ? (
        <EmptyState icon="🔎" title="Escribe para buscar">
          <p className="muted">Busca entre tus {lists.length} listas y {m.todos.length} tareas.</p>
        </EmptyState>
      ) : !hasResults ? (
        <EmptyState icon="🤷" title={`Sin resultados para "${query}"`} />
      ) : (
        <div className="stack" style={{ gap: 28 }}>
          {matchedLists.length > 0 && (
            <section>
              <h3 style={{ marginBottom: 12, fontSize: "0.95rem" }}>
                Listas ({matchedLists.length})
              </h3>
              <div className="grid">
                {matchedLists.map((list) => (
                  <ListCard
                    key={list.uuid}
                    list={list}
                    onOpen={(l) => navigate(`/list/${l.uuid}`)}
                    onEdit={(l) => navigate(`/list/${l.uuid}`)}
                    onDelete={(l) => navigate(`/list/${l.uuid}`)}
                  />
                ))}
              </div>
            </section>
          )}

          {matchedTodos.length > 0 && (
            <section>
              <h3 style={{ marginBottom: 12, fontSize: "0.95rem" }}>
                Tareas ({matchedTodos.length})
              </h3>
              <div className="stack">
                {matchedTodos.map((t) => (
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
            </section>
          )}
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
