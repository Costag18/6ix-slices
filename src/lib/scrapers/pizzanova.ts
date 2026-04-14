import type { Pizza } from "@/lib/types";
import { normalizeSizeName, getSlicesForSize, getSquareInches } from "./normalize";

interface PizzaNovaVariant {
  productID: number;
  masterProductID: number;
  name: string;
  size: number;
  productPrice: number;
  displayName: string;
}

interface PizzaNovaCustomizationConfig {
  name: string;
  variants: PizzaNovaVariant[];
}

interface PizzaNovaProduct {
  productID: number;
  sku: string;
  name: string;
  description: string;
  isVegetarian: string;
  recipeType: string;
  productPrice: number;
  customizationConfig: PizzaNovaCustomizationConfig[];
}

interface PizzaNovaNextData {
  props: {
    pageProps: {
      products: PizzaNovaProduct[];
    };
  };
}

function categorizeByName(name: string): Pizza["category"] {
  const lower = name.toLowerCase();
  if (lower.includes("cheese") || lower.includes("margherita")) return "cheese";
  if (lower.includes("pepperoni")) return "pepperoni";
  if (
    lower.includes("veggie") ||
    lower.includes("vegetarian") ||
    lower.includes("supreme") ||
    lower.includes("deluxe") ||
    lower.includes("combo") ||
    lower.includes("meat") ||
    lower.includes("bbq") ||
    lower.includes("hawaiian") ||
    lower.includes("greek") ||
    lower.includes("mediterranean")
  )
    return "specialty";
  return "custom";
}

function extractSlicesFromDisplayName(displayName: string): number | null {
  const match = displayName.match(/(\d+)\s*(?:slices?|squares?)/i);
  return match ? parseInt(match[1], 10) : null;
}

export function parsePizzaNovaData(data: PizzaNovaNextData): { pizzas: Pizza[] } {
  const now = new Date().toISOString();

  const products = data.props.pageProps.products;

  const pizzas: Pizza[] = products
    .filter((p) => p.recipeType === "PIZZA")
    .flatMap((product) => {
      const config = product.customizationConfig?.[0];
      if (!config?.variants?.length) return [];

      return config.variants.map((variant) => {
        // Size is a numeric code (e.g. 2=small, 3=medium, etc.)
        // but displayName has the human label like "Small - 6 Slices"
        const size = normalizeSizeName(variant.displayName);
        const slices = extractSlicesFromDisplayName(variant.displayName) ?? getSlicesForSize(size);

        return {
          id: `pizzanova-${product.sku}-${variant.size}`,
          chainId: "pizzanova",
          name: product.name.replace(/^\*NEW\*\s*/i, "").trim(),
          size,
          slices,
          price: variant.productPrice,
          toppingsIncluded: 0,
          squareInches: getSquareInches(size),
          category: categorizeByName(product.name),
          lastUpdated: now,
        } satisfies Pizza;
      });
    });

  return { pizzas };
}

export async function scrapePizzaNova(): Promise<{ pizzas: Pizza[] }> {
  const urls = [
    "https://www.pizzanova.com/products/signature-pizzas",
    "https://www.pizzanova.com/products/create-your-own",
    "https://www.pizzanova.com/products/other-favourites",
  ];

  const { load } = await import("cheerio");

  const allPizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const url of urls) {
    const res = await fetch(url, { redirect: "follow" });
    if (!res.ok) {
      console.warn(`Pizza Nova fetch failed for ${url}: ${res.status}`);
      continue;
    }
    const html = await res.text();
    const $ = load(html);

    const scriptContent = $("script#__NEXT_DATA__").text();
    if (!scriptContent) {
      console.warn(`No __NEXT_DATA__ found at ${url}`);
      continue;
    }

    let nextData: PizzaNovaNextData;
    try {
      nextData = JSON.parse(scriptContent) as PizzaNovaNextData;
    } catch {
      console.warn(`Failed to parse __NEXT_DATA__ at ${url}`);
      continue;
    }

    const { pizzas } = parsePizzaNovaData(nextData);
    for (const pizza of pizzas) {
      if (!seenIds.has(pizza.id)) {
        seenIds.add(pizza.id);
        allPizzas.push(pizza);
      }
    }
  }

  return { pizzas: allPizzas };
}
