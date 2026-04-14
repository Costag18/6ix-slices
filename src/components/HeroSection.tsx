"use client";

import type { AppetiteLevel, ComparisonMode } from "@/lib/types";
import { Logo } from "./Logo";
import { GroupControls } from "./GroupControls";
import { ModeToggle } from "./ModeToggle";

interface HeroSectionProps {
  groupSize: number;
  appetite: AppetiteLevel;
  mode: ComparisonMode;
  onGroupSizeChange: (value: number) => void;
  onAppetiteChange: (value: AppetiteLevel) => void;
  onModeChange: (mode: ComparisonMode) => void;
}

export function HeroSection({
  groupSize,
  appetite,
  mode,
  onGroupSizeChange,
  onAppetiteChange,
  onModeChange,
}: HeroSectionProps) {
  return (
    <div className="flex flex-col items-center gap-6 py-10 px-4">
      <Logo className="w-24 h-24" />

      <div className="text-center">
        <h1 className="text-4xl font-bold text-[var(--color-text)]">6ix Slices</h1>
        <p className="mt-2 text-[var(--color-text-muted)] text-base">
          Toronto&apos;s smartest pizza calculator
        </p>
      </div>

      <GroupControls
        groupSize={groupSize}
        appetite={appetite}
        onGroupSizeChange={onGroupSizeChange}
        onAppetiteChange={onAppetiteChange}
      />

      <ModeToggle mode={mode} onModeChange={onModeChange} />
    </div>
  );
}
