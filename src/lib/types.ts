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

export const SLICES_PER_PERSON: Record<AppetiteLevel, number> = {
  light: 2,
  medium: 3,
  hungry: 4,
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
