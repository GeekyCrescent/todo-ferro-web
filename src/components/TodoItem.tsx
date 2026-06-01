import { CategoryChip } from "./CategoryChip";
import { PriorityBadge } from "./PriorityBadge";
import { CalendarIcon, CheckIcon, PencilIcon, TrashIcon } from "./ui/Icons";
import { formatDate, isOverdue } from "../lib/format";
import type { Todo } from "../lib/types";

type TodoItemProps = {
  todo: Todo;
  // listName: nombre de la lista a la que pertenece (opcional, para vistas globales).
  listName?: string;
  onToggle: (todo: Todo) => void;
  onEdit: (todo: Todo) => void;
  onDelete: (todo: Todo) => void;
};

export function TodoItem({
  todo,
  listName,
  onToggle,
  onEdit,
  onDelete,
}: TodoItemProps) {
  const overdue = !todo.completed && isOverdue(todo.dueDate);

  return (
    <div className="card todo">
      <button
        className={`todo__check${todo.completed ? " todo__check--done" : ""}`}
        onClick={() => onToggle(todo)}
        aria-label={todo.completed ? "Marcar pendiente" : "Marcar completada"}
        aria-pressed={todo.completed}
      >
        {todo.completed && <CheckIcon width={14} height={14} />}
      </button>

      <div className="todo__body">
        <div
          className={`todo__title${todo.completed ? " todo__title--done" : ""}`}
        >
          {todo.title}
        </div>
        {todo.description && <div className="todo__desc">{todo.description}</div>}

        <div className="todo__meta">
          <PriorityBadge priority={todo.priority} />

          {todo.dueDate && (
            <span className={`meta-pill${overdue ? " meta-pill--overdue" : ""}`}>
              <CalendarIcon width={13} height={13} />
              {formatDate(todo.dueDate)}
            </span>
          )}

          {listName && <span className="meta-pill">📁 {listName}</span>}

          {todo.categories.map((c) => (
            <CategoryChip key={c.uuid} category={c} />
          ))}
        </div>
      </div>

      <div className="todo__actions">
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => onEdit(todo)}
          aria-label="Editar tarea"
        >
          <PencilIcon width={17} height={17} />
        </button>
        <button
          className="btn btn--ghost btn--icon"
          onClick={() => onDelete(todo)}
          aria-label="Eliminar tarea"
          style={{ color: "var(--danger)" }}
        >
          <TrashIcon width={17} height={17} />
        </button>
      </div>
    </div>
  );
}
