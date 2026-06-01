import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ListCard } from "../components/ListCard";
import { ListFormModal } from "../components/ListFormModal";
import { Button } from "../components/ui/Button";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { PlusIcon } from "../components/ui/Icons";
import { EmptyState, ErrorBanner, Spinner } from "../components/ui/States";
import {
  createList,
  deleteList,
  listLists,
  updateList,
} from "../api/lists";
import type { CreateListDto, TaskList } from "../lib/types";

export default function Home() {
  const navigate = useNavigate();

  const [lists, setLists] = useState<TaskList[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TaskList | null>(null);
  const [deleting, setDeleting] = useState<TaskList | null>(null);

  const load = async () => {
    setError(null);
    try {
      setLists(await listLists());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar las listas");
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      await load();
      setLoading(false);
    })();
  }, []);

  const onSubmit = async (dto: CreateListDto) => {
    if (editing) {
      await updateList(editing.uuid, dto);
    } else {
      await createList(dto);
    }
    await load();
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };
  const openEdit = (list: TaskList) => {
    setEditing(list);
    setShowForm(true);
  };

  const totalTodos = lists.reduce((sum, l) => sum + (l.todoCount ?? 0), 0);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Mis listas</h1>
          <p>
            {lists.length} {lists.length === 1 ? "lista" : "listas"} ·{" "}
            {totalTodos} {totalTodos === 1 ? "tarea" : "tareas"}
          </p>
        </div>
        <Button onClick={openCreate}>
          <PlusIcon width={17} height={17} /> Nueva lista
        </Button>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <Spinner center />
      ) : lists.length === 0 ? (
        <EmptyState icon="🗂️" title="Aún no tienes listas">
          <p className="muted">Crea tu primera lista para organizar tus tareas.</p>
          <div style={{ marginTop: 16 }}>
            <Button onClick={openCreate}>
              <PlusIcon width={17} height={17} /> Crear lista
            </Button>
          </div>
        </EmptyState>
      ) : (
        <div className="grid">
          {lists.map((list) => (
            <ListCard
              key={list.uuid}
              list={list}
              onOpen={(l) => navigate(`/list/${l.uuid}`)}
              onEdit={openEdit}
              onDelete={setDeleting}
            />
          ))}
        </div>
      )}

      {showForm && (
        <ListFormModal
          list={editing}
          onClose={() => setShowForm(false)}
          onSubmit={onSubmit}
        />
      )}

      {deleting && (
        <ConfirmDialog
          title="Eliminar lista"
          message={`¿Eliminar "${deleting.name}"? Las tareas no se borran: quedarán sin lista.`}
          onConfirm={async () => {
            await deleteList(deleting.uuid);
            await load();
          }}
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
