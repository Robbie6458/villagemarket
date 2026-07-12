"use client";

import { CATEGORIES } from "@/lib/types";

interface CategoryFilterProps {
  selected: string | null;
  onChange: (cat: string | null) => void;
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
      <button
        onClick={() => onChange(null)}
        className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
          selected === null
            ? "bg-ember text-gold"
            : "bg-linen text-smoke border border-fence hover:border-gold/50"
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat === selected ? null : cat)}
          className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            selected === cat
              ? "bg-ember text-gold"
              : "bg-linen text-smoke border border-fence hover:border-gold/50"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
