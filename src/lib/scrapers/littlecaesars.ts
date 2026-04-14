import type { Pizza, Deal } from "@/lib/types";
import { getSquareInches } from "./normalize";

// Static pricing data sourced from public Canadian menu aggregator sites (April 2026)
// Little Caesars sizes: Small 10", Medium 12", Large 14", XLarge 16"

interface PizzaDef {
  name: string;
  category: Pizza["category"];
  toppings: number;
  prices: Partial<Record<Pizza["size"], number>>;
}

// Prices verified against littlecaesars.ca ordering site (April 2026, Toronto)
// Note: HOT-N-READY walk-in prices (~$7.99 classic) are separate promos, NOT regular menu prices
const PIZZA_DATA: PizzaDef[] = [
  { name: "Classic Pepperoni", category: "pepperoni", toppings: 1, prices: { small: 5.49, medium: 9.99, large: 11.99, xlarge: 14.99 } },
  { name: "Classic Cheese", category: "cheese", toppings: 0, prices: { small: 5.49, medium: 9.49, large: 11.99, xlarge: 14.99 } },
  { name: "ExtraMostBestest Pepperoni", category: "pepperoni", toppings: 2, prices: { small: 6.49, medium: 10.49, large: 12.99, xlarge: 15.99 } },
  { name: "ExtraMostBestest Cheese", category: "cheese", toppings: 0, prices: { small: 6.49, medium: 10.49, large: 12.99, xlarge: 15.99 } },
  { name: "Hula Hawaiian", category: "specialty", toppings: 2, prices: { small: 8.49, medium: 13.99, large: 15.99, xlarge: 18.99 } },
  { name: "3 Meat Treat", category: "specialty", toppings: 3, prices: { small: 8.99, medium: 13.99, large: 15.99, xlarge: 18.99 } },
  { name: "Canadian", category: "specialty", toppings: 3, prices: { small: 8.99, medium: 14.99, large: 16.99, xlarge: 19.99 } },
  { name: "Veggie", category: "specialty", toppings: 4, prices: { small: 8.99, medium: 14.99, large: 16.99, xlarge: 19.99 } },
  { name: "Ultimate Supreme", category: "specialty", toppings: 5, prices: { small: 9.49, medium: 14.99, large: 17.99, xlarge: 20.99 } },
  { name: "BBQ Chicken", category: "specialty", toppings: 3, prices: { small: 9.49, medium: 14.99, large: 17.99, xlarge: 20.49 } },
  { name: "5 Meat Feast", category: "specialty", toppings: 5, prices: { medium: 15.99, large: 17.99, xlarge: 20.99 } },
  { name: "Old World Fanceroni", category: "pepperoni", toppings: 2, prices: { medium: 12.99, large: 14.99 } },
  { name: "Founder's Favourite", category: "specialty", toppings: 4, prices: { medium: 15.99 } },
  { name: "Sweet-N-Spicy BBQ", category: "specialty", toppings: 3, prices: { medium: 15.99 } },
  { name: "Mediterranean Chicken", category: "specialty", toppings: 4, prices: { medium: 16.99 } },
  { name: "BBQ Meat Overload", category: "specialty", toppings: 5, prices: { medium: 16.99 } },
  { name: "Create Your Own", category: "custom", toppings: 0, prices: { small: 5.99, medium: 7.49, large: 10.99, xlarge: 13.99 } },
];

const SIZE_SLICES: Record<string, number> = { small: 6, medium: 8, large: 8, xlarge: 10, party: 12 };

// Party size pizzas
const PARTY_PIZZAS: { name: string; category: Pizza["category"]; toppings: number; price: number }[] = [
  { name: "Classic Cheese", category: "cheese", toppings: 0, price: 15.99 },
  { name: "Classic Pepperoni", category: "pepperoni", toppings: 1, price: 15.99 },
  { name: "Hula Hawaiian", category: "specialty", toppings: 2, price: 18.99 },
  { name: "3 Meat Treat", category: "specialty", toppings: 3, price: 18.99 },
  { name: "Canadian", category: "specialty", toppings: 3, price: 19.99 },
  { name: "Veggie", category: "specialty", toppings: 4, price: 19.99 },
  { name: "Ultimate Supreme", category: "specialty", toppings: 5, price: 21.99 },
  { name: "5 Meat Feast", category: "specialty", toppings: 5, price: 21.99 },
];

export function generateLittleCaesarsData(): { pizzas: Pizza[]; deals: Deal[] } {
  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  for (const def of PIZZA_DATA) {
    for (const [size, price] of Object.entries(def.prices)) {
      const s = size as Pizza["size"];
      const slug = def.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      pizzas.push({
        id: `littlecaesars-${slug}-${s}`,
        chainId: "littlecaesars",
        name: def.name,
        size: s,
        slices: SIZE_SLICES[s],
        price: price as number,
        toppingsIncluded: def.toppings,
        squareInches: getSquareInches(s),
        category: def.category,
        lastUpdated: now,
      });
    }
  }

  for (const pp of PARTY_PIZZAS) {
    const slug = pp.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    pizzas.push({
      id: `littlecaesars-${slug}-party`,
      chainId: "littlecaesars",
      name: pp.name,
      size: "party",
      slices: 12,
      price: pp.price,
      toppingsIncluded: pp.toppings,
      squareInches: getSquareInches("party"),
      category: pp.category,
      lastUpdated: now,
    });
  }

  const deals: Deal[] = [
    {
      id: "littlecaesars-deal-hotnready",
      chainId: "littlecaesars",
      name: "HOT-N-READY",
      description: "Large pepperoni or cheese pizza, walk-in carryout only — $7.99",
      price: 7.99,
      itemsIncluded: ["1x Large pizza"],
      minPeople: 2,
      maxPeople: 4,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
  ];

  return { pizzas, deals };
}

export async function scrapeLittleCaesars(): Promise<{ pizzas: Pizza[]; deals: Deal[] }> {
  // Static data — no network call needed.
  // TODO: Replace with live Puppeteer scraping via GitHub Actions.
  return generateLittleCaesarsData();
}
