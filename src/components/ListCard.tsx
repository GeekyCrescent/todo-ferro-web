import { PencilIcon, TrashIcon } from "./ui/Icons";
import type { TaskList } from "../lib/types";

type ListCardProps = {
  list: TaskList;
  onOpen: (list: TaskList) => void;
  onEdit: (list: TaskList) => void;
  onDelete: (list: TaskList) => void;
};

export function ListCard({ list, onOpen, onEdit, onDelete }: ListCardProps) {
  const color = list.color || "#0D9488";
  const count = list.todoCount ?? 0;

  return (
    <div
      className="card list-card"
      onClick={() => onOpen(list)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen(list);
        }
      }}
    >
      <span className="list-card__bar" style={{ background: color }} />

      <div className="row">
        <span
          className="chip__dot"
          style={{ background: color, width: 12, height: 12 }}
          aria-hidden
        />
        <span className="list-card__name">{list.name}</span>
        <span className="spacer" />
        <button
          className="btn btn--ghost btn--icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(list);
          }}
          aria-label="Editar lista"
        >
          <PencilIcon width={16} height={16} />
        </button>
        <button
          className="btn btn--ghost btn--icon"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(list);
          }}
          aria-label="Eliminar lista"
          style={{ color: "var(--danger)" }}
        >
          <TrashIcon width={16} height={16} />
        </button>
      </div>

      {list.description && (
        <p className="list-card__desc">{list.description}</p>
      )}

      <span className="list-card__count">
        {count} {count === 1 ? "tarea" : "tareas"}
      </span>
    </div>
  );
}
