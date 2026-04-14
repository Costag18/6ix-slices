import type { Pizza, Deal } from "@/lib/types";
import { getSquareInches } from "./normalize";

// Static pricing data sourced from public Canadian menu aggregator sites (April 2026)
// Papa John's sizes: Small (6 slices), Medium (8 slices), Large (8 slices), XL (10 slices)

interface PizzaDef {
  name: string;
  category: Pizza["category"];
  toppings: number;
  prices: { small: number; medium: number; large: number; xlarge: number };
}

const PIZZA_DATA: PizzaDef[] = [
  { name: "Pepperoni", category: "pepperoni", toppings: 1, prices: { small: 12.55, medium: 15.75, large: 18.74, xlarge: 23.01 } },
  { name: "Cheese", category: "cheese", toppings: 0, prices: { small: 12.55, medium: 15.75, large: 18.74, xlarge: 23.01 } },
  { name: "Sausage", category: "specialty", toppings: 1, prices: { small: 12.55, medium: 15.75, large: 18.74, xlarge: 23.01 } },
  { name: "The Works", category: "specialty", toppings: 5, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "The Meats", category: "specialty", toppings: 5, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Zesty Italian Trio", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Meatball Pepperoni", category: "pepperoni", toppings: 2, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Super Hawaiian", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "BBQ Chicken Bacon", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Fiery Buffalo Chicken", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Philly Cheesesteak", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Extra Cheesy Alfredo", category: "cheese", toppings: 2, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Garden Fresh", category: "specialty", toppings: 4, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.49 } },
  { name: "Tuscan Six Cheese", category: "cheese", toppings: 6, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Hawaiian BBQ Chicken", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Chicken Bacon Ranch", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Hawaiian", category: "specialty", toppings: 2, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Canadian Classic", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Mediterranean", category: "specialty", toppings: 4, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Donair", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.59, large: 24.79, xlarge: 29.39 } },
  { name: "Spinach Alfredo", category: "specialty", toppings: 3, prices: { small: 17.84, medium: 23.11, large: 27.88, xlarge: 33.10 } },
];

const SIZE_SLICES: Record<string, number> = { small: 6, medium: 8, large: 8, xlarge: 10 };

export function generatePapaJohnsData(): { pizzas: Pizza[]; deals: Deal[] } {
  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  for (const def of PIZZA_DATA) {
    for (const [size, price] of Object.entries(def.prices)) {
      const s = size as Pizza["size"];
      const slug = def.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      pizzas.push({
        id: `papajohns-${slug}-${s}`,
        chainId: "papajohns",
        name: def.name,
        size: s,
        slices: SIZE_SLICES[s],
        price,
        toppingsIncluded: def.toppings,
        squareInches: getSquareInches(s),
        category: def.category,
        lastUpdated: now,
      });
    }
  }

  const deals: Deal[] = [
    {
      id: "papajohns-deal-medium1top",
      chainId: "papajohns",
      name: "Medium 1-Topping Special",
      description: "Medium 1-topping pizza from $6.70",
      price: 6.70,
      itemsIncluded: ["1x Medium 1-topping pizza"],
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

export async function scrapePapaJohns(): Promise<{ pizzas: Pizza[]; deals: Deal[] }> {
  // Static data — no network call needed.
  // TODO: Replace with live Puppeteer scraping via GitHub Actions.
  return generatePapaJohnsData();
}
