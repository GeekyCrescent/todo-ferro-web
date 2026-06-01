import type { Priority } from "./types";

export const PRIORITY_LABEL: Record<Priority, string> = {
  HIGH: "Alta",
  MEDIUM: "Media",
  LOW: "Baja",
};

export const PRIORITY_COLOR: Record<Priority, string> = {
  HIGH: "#EF4444",
  MEDIUM: "#F59E0B",
  LOW: "#10B981",
};

// Orden de mayor a menor prioridad para ordenamientos.
export const PRIORITY_RANK: Record<Priority, number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

/** Convierte un ISO datetime a "YYYY-MM-DD" para inputs type="date". */
export const toDateInputValue = (iso?: string | null): string => {
  if (!iso) return "";
  return iso.slice(0, 10);
};

/** Fecha legible en español, p.ej. "5 jun 2026". */
export const formatDate = (iso?: string | null): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/** True si la fecha límite ya pasó (comparando solo el día). */
export const isOverdue = (iso?: string | null): boolean => {
  if (!iso) return false;
  const due = new Date(iso);
  if (Number.isNaN(due.getTime())) return false;
  const today = new Date();
  due.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return due.getTime() < today.getTime();
};
