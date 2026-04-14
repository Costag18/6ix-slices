import type { Pizza } from "@/lib/types";
import { normalizeSizeName, getSlicesForSize, getSquareInches } from "./normalize";

function categorizeByName(name: string): Pizza["category"] {
  const lower = name.toLowerCase();
  if (lower.includes("cheese") || lower === "margherita" || lower.includes("margherita")) return "cheese";
  if (lower.includes("pepperoni") || lower.includes("roni")) return "pepperoni";
  if (
    lower.includes("veggie") ||
    lower.includes("vegetarian") ||
    lower.includes("vegan") ||
    lower.includes("supreme") ||
    lower.includes("deluxe") ||
    lower.includes("combo") ||
    lower.includes("meat") ||
    lower.includes("bbq") ||
    lower.includes("hawaiian") ||
    lower.includes("honolulu") ||
    lower.includes("greek") ||
    lower.includes("mediterranean") ||
    lower.includes("godfather") ||
    lower.includes("sausage") ||
    lower.includes("mushroom") ||
    lower.includes("sicilian") ||
    lower.includes("capone") ||
    lower.includes("mafioso") ||
    lower.includes("soprano")
  )
    return "specialty";
  return "custom";
}

export function parsePizzaioloHtml(html: string): { pizzas: Pizza[] } {
  const cheerio = require("cheerio") as typeof import("cheerio");
  const $ = cheerio.load(html);

  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  // Each pizza card is .pizza-select > .pizza-card
  $(".pizza-select").each((_i, card) => {
    const name = $(card).find("h2.card-title").text().trim();
    if (!name) return;

    // Each size is a <li> inside ul.category_pizza_sizes
    $(card)
      .find("ul.category_pizza_sizes li")
      .each((_j, li) => {
        // Size name from the radio input value attribute (e.g. "medium", "large", "xlarge", "party")
        const sizeValue = $(li).find("input.category_size_upgrade_btn").attr("value") ?? "";
        // Price from span.right (e.g. "$19.76")
        const priceText = $(li).find("span.right").text().trim().replace("$", "");
        const price = parseFloat(priceText);

        if (!sizeValue || isNaN(price)) return;

        const size = normalizeSizeName(sizeValue);
        const slugName = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

        // Extract slices from label text like "Medium (8 slices)" if available
        const labelText = $(li).find("label").text();
        const slicesMatch = labelText.match(/\((\d+)\s*slices?\)/i);
        const slices = slicesMatch ? parseInt(slicesMatch[1], 10) : getSlicesForSize(size);

        pizzas.push({
          id: `pizzaiolo-${slugName}-${size}`,
          chainId: "pizzaiolo",
          name,
          size,
          slices,
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
    "https://pizzaiolo.ca/orders/gourmet-meat-pizzas/categories",
    "https://pizzaiolo.ca/orders/gourmet-vegetarian-pizzas/categories",
    "https://pizzaiolo.ca/orders/gourmet-vegan-pizzas/categories",
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
