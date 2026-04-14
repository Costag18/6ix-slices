import type { Pizza, Deal } from "@/lib/types";
import { normalizeSizeCode, getSlicesForSize, getSquareInches } from "./normalize";

interface DominosVariant {
  Code: string;
  Name: string;
  Price: string;
  SizeCode: string;
  ProductCode: string;
  Tags: Record<string, unknown>;
}

interface DominosCoupon {
  Code: string;
  Name: string;
  Price: string;
  Tags: Record<string, unknown>;
  Description?: string;
}

interface DominosProduct {
  Code: string;
  Name: string;
  ProductType: string;
  AvailableSizes: string[];
}

interface DominosMenuResponse {
  Variants: Record<string, DominosVariant>;
  Coupons: Record<string, DominosCoupon>;
  Products: Record<string, DominosProduct>;
}

export function parseDominosMenu(data: DominosMenuResponse): {
  pizzas: Pizza[];
  deals: Deal[];
} {
  const now = new Date().toISOString();

  // Collect pizza product codes (ProductType === "Pizza")
  const pizzaProductCodes = new Set<string>(
    Object.values(data.Products)
      .filter((p) => p.ProductType === "Pizza")
      .map((p) => p.Code)
  );

  // Parse pizza variants
  const pizzas: Pizza[] = Object.values(data.Variants)
    .filter((v) => pizzaProductCodes.has(v.ProductCode))
    .map((v) => {
      const size = normalizeSizeCode(v.SizeCode);
      return {
        id: `dominos-${v.Code}`,
        chainId: "dominos",
        name: v.Name,
        size,
        slices: getSlicesForSize(size),
        price: parseFloat(v.Price),
        toppingsIncluded: 0,
        squareInches: getSquareInches(size),
        category: "cheese" as const,
        lastUpdated: now,
      };
    });

  // Parse coupons as deals
  const deals: Deal[] = Object.values(data.Coupons).map((c) => ({
    id: `dominos-coupon-${c.Code}`,
    chainId: "dominos",
    name: c.Name,
    description: c.Description ?? null,
    price: c.Price ? parseFloat(c.Price) : null,
    itemsIncluded: [],
    minPeople: null,
    maxPeople: null,
    promoCode: c.Code,
    validDays: null,
    validHours: null,
    lastUpdated: now,
  }));

  return { pizzas, deals };
}

export async function scrapeDominos(): Promise<{ pizzas: Pizza[]; deals: Deal[] }> {
  const url =
    "https://order.dominos.ca/power/store/10391/menu?lang=en&structured=true";
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Domino's API responded with ${res.status}`);
  }
  const data = (await res.json()) as DominosMenuResponse;
  return parseDominosMenu(data);
}
