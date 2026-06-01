import { useCallback, useEffect, useState } from "react";

import {
  createTodo,
  deleteTodo,
  toggleTodo,
  updateTodo,
} from "../api/todos";
import type { CreateTodoDto, Todo } from "../lib/types";

/**
 * Maneja la colección de tareas de una pantalla: carga, toggle optimista y el
 * estado de los modales de crear/editar/eliminar. El `loader` debe ser estable
 * (envuélvelo en useCallback). Tras crear/editar/eliminar se recarga; el toggle
 * es optimista para que se sienta inmediato.
 */
export function useTodoManager(loader: () => Promise<Todo[]>) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Modales
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Todo | null>(null);
  const [deleting, setDeleting] = useState<Todo | null>(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      setTodos(await loader());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar las tareas"
      );
    }
  }, [loader]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      await load();
      if (active) setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [load]);

  const toggle = useCallback(async (todo: Todo) => {
    setActionError(null);
    // Optimista: invierte el estado al instante.
    setTodos((prev) =>
      prev.map((t) =>
        t.uuid === todo.uuid ? { ...t, completed: !t.completed } : t
      )
    );
    try {
      const updated = await toggleTodo(todo.uuid);
      // El toggle NO regresa categorías: conservamos las locales.
      setTodos((prev) =>
        prev.map((t) =>
          t.uuid === todo.uuid
            ? { ...updated, categories: todo.categories }
            : t
        )
      );
    } catch (err) {
      // Revierte si falla.
      setTodos((prev) => prev.map((t) => (t.uuid === todo.uuid ? todo : t)));
      setActionError(
        err instanceof Error ? err.message : "No se pudo actualizar la tarea"
      );
    }
  }, []);

  const submit = useCallback(
    async (dto: CreateTodoDto) => {
      if (editing) {
        await updateTodo(editing.uuid, dto);
      } else {
        await createTodo(dto);
      }
      await load();
    },
    [editing, load]
  );

  const remove = useCallback(
    async (todo: Todo) => {
      await deleteTodo(todo.uuid);
      await load();
    },
    [load]
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((todo: Todo) => {
    setEditing(todo);
    setFormOpen(true);
  }, []);

  return {
    todos,
    loading,
    error,
    actionError,
    setActionError,
    formOpen,
    editing,
    deleting,
    setDeleting,
    openCreate,
    openEdit,
    closeForm: () => setFormOpen(false),
    toggle,
    submit,
    remove,
    reload: load,
  };
}
