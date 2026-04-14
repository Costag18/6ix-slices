import type { PizzaSize } from "@/lib/types";

const SIZE_MAP: Record<string, PizzaSize> = {
  "10": "small",
  "12": "medium",
  "14": "large",
  "16": "xlarge",
  "18": "party",
};

const SLICES_MAP: Record<PizzaSize, number> = {
  small: 6,
  medium: 8,
  large: 8,
  xlarge: 10,
  party: 12,
};

const DIAMETER_MAP: Record<PizzaSize, number> = {
  small: 10,
  medium: 12,
  large: 14,
  xlarge: 16,
  party: 18,
};

export function normalizeSizeCode(code: string): PizzaSize {
  return SIZE_MAP[code] || "medium";
}

export function normalizeSizeName(name: string): PizzaSize {
  const lower = name.toLowerCase();
  if (lower.includes("party") || lower.includes("jumbo")) return "party";
  if (lower.includes("extra large") || lower.includes("xlarge") || lower.includes("x-large")) return "xlarge";
  if (lower.includes("large")) return "large";
  if (lower.includes("medium")) return "medium";
  if (lower.includes("small")) return "small";
  return "medium";
}

export function getSlicesForSize(size: PizzaSize): number {
  return SLICES_MAP[size];
}

export function getSquareInches(size: PizzaSize): number {
  const d = DIAMETER_MAP[size];
  return Math.round(Math.PI * (d / 2) ** 2 * 100) / 100;
}
