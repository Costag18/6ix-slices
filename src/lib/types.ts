export interface Chain {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string;
}

export interface Pizza {
  id: string;
  chainId: string;
  name: string;
  size: PizzaSize;
  slices: number;
  price: number;
  toppingsIncluded: number;
  squareInches: number | null;
  category: PizzaCategory;
  lastUpdated: string;
}

export type PizzaSize = "small" | "medium" | "large" | "xlarge" | "party";

export type PizzaCategory = "cheese" | "pepperoni" | "specialty" | "custom";

export interface Deal {
  id: string;
  chainId: string;
  name: string;
  description: string | null;
  price: number | null;
  itemsIncluded: string[];
  minPeople: number | null;
  maxPeople: number | null;
  promoCode: string | null;
  validDays: string[] | null;
  validHours: string | null;
  lastUpdated: string;
}

export interface ScrapeLog {
  chainId: string;
  status: "success" | "failure";
  errorMessage: string | null;
  scrapedAt: string;
}

export interface FreshnessResponse {
  chains: Record<string, string | null>;
}

export interface DealsResponse {
  pizzas: Pizza[];
  deals: Deal[];
  chains: Chain[];
}

export type AppetiteLevel = "light" | "medium" | "hungry";

// Area-based appetite: sq inches per person, based on standard large (14") slices.
// Large pizza = π × 7² ≈ 153.94 sq in / 8 slices ≈ 19.24 sq in per slice.
const LARGE_SLICE_AREA = Math.PI * 7 * 7 / 8; // ~19.24 sq in
export const AREA_PER_PERSON: Record<AppetiteLevel, number> = {
  light: 2 * LARGE_SLICE_AREA,   // ~38.48 sq in
  medium: 3 * LARGE_SLICE_AREA,  // ~57.73 sq in
  hungry: 4 * LARGE_SLICE_AREA,  // ~76.97 sq in
};

export type ComparisonMode = "price-per-person" | "value-score";

export interface ChainRecommendation {
  chain: Chain;
  totalCost: number;
  costPerPerson: number;
  pizzasNeeded: { pizza: Pizza; quantity: number }[];
  dealsApplied: Deal[];
  valueScore: number;
}

export const PIZZA_DIAMETERS: Record<PizzaSize, number> = {
  small: 10,
  medium: 12,
  large: 14,
  xlarge: 16,
  party: 18,
};

// Ontario HST (Toronto)
export const TAX_RATE = 0.13;

export const STALENESS_THRESHOLDS = {
  tier1: 6 * 60 * 60 * 1000,
  tier2: 24 * 60 * 60 * 1000,
};

export const TIER1_CHAINS = ["dominos", "pizzanova", "pizzaiolo"] as const;
export const TIER2_CHAINS = [
  "pizzapizza",
  "littlecaesars",
  "pizzahut",
  "papajohns",
] as const;

export const ALL_CHAINS = [...TIER1_CHAINS, ...TIER2_CHAINS] as const;
