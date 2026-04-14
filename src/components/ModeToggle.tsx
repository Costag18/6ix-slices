"use client";

import type { ComparisonMode } from "@/lib/types";

interface ModeToggleProps {
  mode: ComparisonMode;
  onModeChange: (mode: ComparisonMode) => void;
}

const MODES: { value: ComparisonMode; label: string }[] = [
  { value: "price-per-person", label: "$/Person" },
  { value: "value-score", label: "Value Score" },
];

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="flex rounded-lg border border-[var(--color-tomato)] overflow-hidden">
      {MODES.map(({ value, label }) => (
        <button
          key={value}
          onClick={() => onModeChange(value)}
          className={`flex-1 py-2 px-4 text-sm font-medium transition-colors ${
            mode === value
              ? "bg-[var(--color-tomato)] text-white"
              : "bg-white text-[var(--color-tomato)] hover:bg-red-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
