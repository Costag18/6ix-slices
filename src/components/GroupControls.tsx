"use client";

import type { AppetiteLevel } from "@/lib/types";

interface GroupControlsProps {
  groupSize: number;
  appetite: AppetiteLevel;
  onGroupSizeChange: (value: number) => void;
  onAppetiteChange: (value: AppetiteLevel) => void;
}

const APPETITE_OPTIONS: { value: AppetiteLevel; label: string; desc: string }[] = [
  { value: "light", label: "Light", desc: "~2 slices" },
  { value: "medium", label: "Medium", desc: "~3 slices" },
  { value: "hungry", label: "Hungry", desc: "~4 slices" },
];

export function GroupControls({
  groupSize,
  appetite,
  onGroupSizeChange,
  onAppetiteChange,
}: GroupControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md">
      {/* Group size slider */}
      <div className="flex flex-col gap-2">
        <label className="flex justify-between text-sm font-medium text-[var(--color-text)]">
          <span>Group Size</span>
          <span className="text-[var(--color-tomato)] font-bold">{groupSize}</span>
        </label>
        <input
          type="range"
          min={1}
          max={50}
          value={groupSize}
          onChange={(e) => onGroupSizeChange(Number(e.target.value))}
          className="w-full accent-[var(--color-tomato)] cursor-pointer"
        />
        <div className="flex justify-between text-xs text-[var(--color-text-muted)]">
          <span>1</span>
          <span>50</span>
        </div>
      </div>

      {/* Appetite toggle */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-[var(--color-text)]">Appetite</span>
        <div className="flex gap-2">
          {APPETITE_OPTIONS.map(({ value, label, desc }) => (
            <button
              key={value}
              onClick={() => onAppetiteChange(value)}
              className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors border ${
                appetite === value
                  ? "bg-[var(--color-tomato)] text-white border-[var(--color-tomato)]"
                  : "bg-white text-[var(--color-text-muted)] border-gray-200 hover:border-[var(--color-tomato)]"
              }`}
            >
              <span className="block">{label}</span>
              <span className="block text-xs opacity-75">{desc}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
