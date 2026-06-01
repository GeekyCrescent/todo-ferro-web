import type { Category } from "../lib/types";

/** Chip estático de categoría con su color como punto. */
export function CategoryChip({ category }: { category: Category }) {
  return (
    <span className="chip chip--static">
      <span
        className="chip__dot"
        style={{ background: category.color }}
        aria-hidden
      />
      {category.name}
    </span>
  );
}
