import type { Pizza } from "@/lib/types";
import { normalizeSizeName, getSlicesForSize, getSquareInches } from "./normalize";

interface PizzaNovaSize {
  size: string;
  price: number;
  slices: number;
}

interface PizzaNovaProduct {
  productID: number;
  sku: string;
  name: string;
  description: string;
  isVegetarian: boolean;
  recipeType: string;
  sizes: PizzaNovaSize[];
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
  if (lower.includes("cheese") || lower === "margherita") return "cheese";
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

export function parsePizzaNovaData(data: PizzaNovaNextData): { pizzas: Pizza[] } {
  const now = new Date().toISOString();

  const products = data.props.pageProps.products;

  const pizzas: Pizza[] = products
    .filter((p) => p.recipeType === "PIZZA")
    .flatMap((product) =>
      product.sizes.map((s) => {
        const size = normalizeSizeName(s.size);
        return {
          id: `pizzanova-${product.sku}-${s.size.toLowerCase()}`,
          chainId: "pizzanova",
          name: product.name,
          size,
          slices: getSlicesForSize(size),
          price: s.price,
          toppingsIncluded: 0,
          squareInches: getSquareInches(size),
          category: categorizeByName(product.name),
          lastUpdated: now,
        } satisfies Pizza;
      })
    );

  return { pizzas };
}

export async function scrapePizzaNova(): Promise<{ pizzas: Pizza[] }> {
  const urls = [
    "https://www.pizzanova.com/products/4505",
    "https://www.pizzanova.com/products/4513",
    "https://www.pizzanova.com/products/4494",
  ];

  const { load } = await import("cheerio");

  const allPizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const url of urls) {
    const res = await fetch(url);
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
