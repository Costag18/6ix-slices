import type { Pizza } from "@/lib/types";
import { normalizeSizeName, getSlicesForSize, getSquareInches } from "./normalize";

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
    lower.includes("mediterranean") ||
    lower.includes("godfather") ||
    lower.includes("sausage") ||
    lower.includes("mushroom")
  )
    return "specialty";
  return "custom";
}

export function parsePizzaioloHtml(html: string): { pizzas: Pizza[] } {
  // Dynamic import of cheerio to allow tree-shaking in non-scrape paths
  const cheerio = require("cheerio") as typeof import("cheerio");
  const $ = cheerio.load(html);

  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  $(".product-card").each((_i, card) => {
    const name = $(card).find(".product-name").text().trim();
    if (!name) return;

    $(card)
      .find(".price")
      .each((_j, priceEl) => {
        const dataSize = $(priceEl).attr("data-size") ?? "";
        const priceText = $(priceEl).text().trim().replace("$", "");
        const price = parseFloat(priceText);

        if (!dataSize || isNaN(price)) return;

        const size = normalizeSizeName(dataSize);
        const slugName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        pizzas.push({
          id: `pizzaiolo-${slugName}-${size}`,
          chainId: "pizzaiolo",
          name,
          size,
          slices: getSlicesForSize(size),
          price,
          toppingsIncluded: 0,
          squareInches: getSquareInches(size),
          category: categorizeByName(name),
          lastUpdated: now,
        } satisfies Pizza);
      });
  });

  return { pizzas };
}

export async function scrapePizzaiolo(): Promise<{ pizzas: Pizza[] }> {
  const urls = [
    "https://pizzaiolo.ca/en/menu/pizzas/classic-pizzas",
    "https://pizzaiolo.ca/en/menu/pizzas/gourmet-pizzas",
    "https://pizzaiolo.ca/en/menu/pizzas/vegetarian-pizzas",
  ];

  const allPizzas: Pizza[] = [];
  const seenIds = new Set<string>();

  for (const url of urls) {
    const res = await fetch(url);
    if (!res.ok) {
      console.warn(`Pizzaiolo fetch failed for ${url}: ${res.status}`);
      continue;
    }
    const html = await res.text();
    const { pizzas } = parsePizzaioloHtml(html);

    for (const pizza of pizzas) {
      if (!seenIds.has(pizza.id)) {
        seenIds.add(pizza.id);
        allPizzas.push(pizza);
      }
    }
  }

  return { pizzas: allPizzas };
}
