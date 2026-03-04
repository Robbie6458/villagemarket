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
            ? "bg-moss text-white"
            : "bg-white text-bark border border-wheat hover:border-moss"
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
              ? "bg-moss text-white"
              : "bg-white text-bark border border-wheat hover:border-moss"
          }`}
        >
          {cat}
        </button>
      ))}
    </div>
  );
}
