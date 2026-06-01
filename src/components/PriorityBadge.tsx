import { PRIORITY_COLOR, PRIORITY_LABEL } from "../lib/format";
import type { Priority } from "../lib/types";

/** Convierte un hex en rgba con baja opacidad para fondos suaves. */
const soft = (hex: string, alpha = 0.14) => {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export function PriorityBadge({ priority }: { priority: Priority }) {
  const color = PRIORITY_COLOR[priority];
  return (
    <span
      className="priority"
      style={{ background: soft(color), color }}
    >
      <span
        className="chip__dot"
        style={{ background: color }}
        aria-hidden
      />
      {PRIORITY_LABEL[priority]}
    </span>
  );
}
