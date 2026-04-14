import type { Pizza, Deal } from "@/lib/types";
import { getSquareInches } from "./normalize";

// Static pricing data sourced from public Canadian menu aggregator sites (April 2026)
// Pizza Pizza sizes: Small 10", Medium 12", Large 14", XLarge 16"

interface PizzaDef {
  name: string;
  category: Pizza["category"];
  toppings: number;
  prices: { small: number; medium: number; large: number; xlarge: number };
}

const PIZZA_DATA: PizzaDef[] = [
  { name: "Pepperoni", category: "pepperoni", toppings: 1, prices: { small: 10.04, medium: 14.49, large: 16.69, xlarge: 18.94 } },
  { name: "Ultimate Pepperoni", category: "pepperoni", toppings: 2, prices: { small: 10.97, medium: 15.47, large: 17.89, xlarge: 20.32 } },
  { name: "Meat Supreme", category: "specialty", toppings: 5, prices: { small: 15.59, medium: 20.89, large: 23.99, xlarge: 27.19 } },
  { name: "Tropical Hawaiian", category: "specialty", toppings: 3, prices: { small: 14.74, medium: 19.99, large: 22.69, xlarge: 25.44 } },
  { name: "Canadian Eh!", category: "specialty", toppings: 3, prices: { small: 13.74, medium: 18.74, large: 21.59, xlarge: 24.44 } },
  { name: "Classic Super", category: "specialty", toppings: 4, prices: { small: 13.74, medium: 18.74, large: 21.59, xlarge: 24.44 } },
  { name: "Garden Veggie", category: "specialty", toppings: 4, prices: { small: 13.74, medium: 18.74, large: 21.59, xlarge: 24.44 } },
  { name: "Bacon Double Cheeseburger", category: "specialty", toppings: 4, prices: { small: 13.04, medium: 18.39, large: 20.89, xlarge: 23.74 } },
  { name: "Buffalo Chicken", category: "specialty", toppings: 3, prices: { small: 16.99, medium: 22.24, large: 25.99, xlarge: 29.49 } },
  { name: "Spicy BBQ Chicken", category: "specialty", toppings: 3, prices: { small: 15.84, medium: 21.14, large: 24.14, xlarge: 27.44 } },
  { name: "Sausage Mushroom Melt", category: "specialty", toppings: 3, prices: { small: 12.99, medium: 18.34, large: 20.99, xlarge: 23.69 } },
  { name: "Mediterranean Vegetarian", category: "specialty", toppings: 5, prices: { small: 17.44, medium: 22.44, large: 26.19, xlarge: 29.94 } },
  { name: "Creamy Garlic Pizza", category: "specialty", toppings: 2, prices: { small: 14.14, medium: 19.14, large: 22.44, xlarge: 25.74 } },
  { name: "Pesto Amore", category: "specialty", toppings: 4, prices: { small: 16.69, medium: 21.94, large: 25.69, xlarge: 29.19 } },
  { name: "Chicken Bruschetta", category: "specialty", toppings: 4, prices: { small: 16.59, medium: 21.89, large: 24.99, xlarge: 28.19 } },
  { name: "Hot Honey", category: "specialty", toppings: 3, prices: { small: 15.24, medium: 20.49, large: 23.99, xlarge: 27.74 } },
  { name: "Butter Chicken", category: "specialty", toppings: 3, prices: { small: 15.84, medium: 21.14, large: 24.14, xlarge: 27.44 } },
  { name: "Creamy Mushroom Florentine", category: "specialty", toppings: 3, prices: { small: 15.99, medium: 20.99, large: 24.74, xlarge: 28.49 } },
  { name: "Create Your Own", category: "cheese", toppings: 0, prices: { small: 7.99, medium: 10.99, large: 13.99, xlarge: 17.99 } },
];

const SIZE_SLICES: Record<string, number> = { small: 6, medium: 8, large: 8, xlarge: 10 };

export function generatePizzaPizzaData(): { pizzas: Pizza[]; deals: Deal[] } {
  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  for (const def of PIZZA_DATA) {
    for (const [size, price] of Object.entries(def.prices)) {
      const s = size as Pizza["size"];
      const slug = def.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      pizzas.push({
        id: `pizzapizza-${slug}-${s}`,
        chainId: "pizzapizza",
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
      id: "pizzapizza-deal-walkin",
      chainId: "pizzapizza",
      name: "Walk-In Special",
      description: "Medium 1-topping pizza for $7.99",
      price: 7.99,
      itemsIncluded: ["1x Medium 1-topping pizza"],
      minPeople: 2,
      maxPeople: 4,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
    {
      id: "pizzapizza-deal-2pizza",
      chainId: "pizzapizza",
      name: "2 Pizzas Deal",
      description: "Two medium pizzas, 4 toppings combined, dipping sauce for $15.99",
      price: 15.99,
      itemsIncluded: ["2x Medium pizza", "4 toppings combined", "Dipping sauce"],
      minPeople: 4,
      maxPeople: 8,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
    {
      id: "pizzapizza-deal-family",
      chainId: "pizzapizza",
      name: "Family Combo",
      description: "2 large pizzas, 4 drinks, 2 dipping sauces for $29.99",
      price: 29.99,
      itemsIncluded: ["2x Large pizza", "4 drinks", "2 dipping sauces"],
      minPeople: 6,
      maxPeople: 10,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
    {
      id: "pizzapizza-deal-xl",
      chainId: "pizzapizza",
      name: "XL Fixed Rate",
      description: "XL 4-topping pizza for $17.99",
      price: 17.99,
      itemsIncluded: ["1x XL 4-topping pizza"],
      minPeople: 3,
      maxPeople: 5,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
  ];

  return { pizzas, deals };
}

export async function scrapePizzaPizza(): Promise<{ pizzas: Pizza[]; deals: Deal[] }> {
  // Static data — no network call needed.
  // TODO: Replace with live Puppeteer scraping via GitHub Actions.
  return generatePizzaPizzaData();
}
