import { useCallback, useEffect, useState } from "react";

import { listCategories } from "../api/categories";
import { listLists } from "../api/lists";
import type { Category, TaskList } from "../lib/types";

/**
 * Carga las listas y categorías del usuario. Se usa en varias pantallas para
 * alimentar el selector de lista y los chips de categorías del formulario de
 * tareas. Expone helpers para refrescar y para insertar una categoría recién
 * creada sin volver a pedir todo al servidor.
 */
export function useMeta() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  const reloadLists = useCallback(async () => {
    setLists(await listLists());
  }, []);

  useEffect(() => {
    let active = true;
    (async () => {
      const [l, c] = await Promise.all([listLists(), listCategories()]);
      if (active) {
        setLists(l);
        setCategories(c);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const addCategory = useCallback((category: Category) => {
    setCategories((prev) =>
      prev.some((c) => c.uuid === category.uuid) ? prev : [...prev, category]
    );
  }, []);

  return { lists, categories, reloadLists, addCategory };
}
