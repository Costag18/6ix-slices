import type { Pizza, Deal } from "@/lib/types";
import { getSquareInches } from "./normalize";

// Static pricing data sourced from public Canadian menu aggregator sites (April 2026)
// Pizza Hut sizes: Personal 6", Small 9", Medium 12", Large 14", Panormous XL 16"

const PI = Math.PI;
function areaFromDiameter(d: number): number {
  return Math.round(PI * (d / 2) ** 2 * 100) / 100;
}

interface PizzaVariant {
  name: string;
  category: Pizza["category"];
  toppings: number;
  size: Pizza["size"];
  price: number;
  diameter: number; // actual inches
  slices: number;
}

// All pizza variants with their ACTUAL diameters for correct area calculation
const PIZZA_VARIANTS: PizzaVariant[] = [];

// Standard handcrafted pizzas: Medium 12", Large 14", Panormous XL 16"
const STANDARD_NAMES: { name: string; category: Pizza["category"]; toppings: number }[] = [
  { name: "Classic Pepperoni", category: "pepperoni", toppings: 1 },
  { name: "Pepperoni Duo", category: "pepperoni", toppings: 2 },
  { name: "Hawaiian", category: "specialty", toppings: 2 },
  { name: "Canadian", category: "specialty", toppings: 3 },
  { name: "Meat Lover's", category: "specialty", toppings: 5 },
  { name: "Veggie Lover's", category: "specialty", toppings: 5 },
  { name: "Supreme Lover's", category: "specialty", toppings: 5 },
  { name: "Smoky Tri-Cheese Blend", category: "cheese", toppings: 3 },
  { name: "Cheddar Bacon Ranch", category: "specialty", toppings: 3 },
  { name: "Fajita Chicken", category: "specialty", toppings: 3 },
  { name: "BBQ Chicken", category: "specialty", toppings: 3 },
  { name: "Chicken Caesar", category: "specialty", toppings: 3 },
  { name: "Margherita", category: "cheese", toppings: 2 },
  { name: "Italian Classic", category: "specialty", toppings: 4 },
  { name: "Greek Pizza", category: "specialty", toppings: 4 },
];

for (const p of STANDARD_NAMES) {
  PIZZA_VARIANTS.push(
    { ...p, size: "medium", price: 22.99, diameter: 12, slices: 8 },
    { ...p, size: "large", price: 26.49, diameter: 14, slices: 10 },
    { ...p, size: "xlarge", price: 28.99, diameter: 16, slices: 12 },
  );
}

// Personal Pan Pizza — 6" diameter, 4 slices
PIZZA_VARIANTS.push({
  name: "Personal Pan Pizza", category: "custom", toppings: 0,
  size: "small", price: 6.99, diameter: 6, slices: 4,
});

// Pan Pizza — Small is 9", Medium 12", Large 14"
PIZZA_VARIANTS.push(
  { name: "Pan Pizza", category: "custom", toppings: 0, size: "small", price: 16.99, diameter: 9, slices: 6 },
  { name: "Pan Pizza", category: "custom", toppings: 0, size: "medium", price: 22.99, diameter: 12, slices: 8 },
  { name: "Pan Pizza", category: "custom", toppings: 0, size: "large", price: 26.49, diameter: 14, slices: 10 },
);

export function generatePizzaHutData(): { pizzas: Pizza[]; deals: Deal[] } {
  const now = new Date().toISOString();
  const pizzas: Pizza[] = [];

  for (const v of PIZZA_VARIANTS) {
    const slug = v.name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    pizzas.push({
      id: `pizzahut-${slug}-${v.size}`,
      chainId: "pizzahut",
      name: v.name,
      size: v.size,
      slices: v.slices,
      price: v.price,
      toppingsIncluded: v.toppings,
      squareInches: areaFromDiameter(v.diameter),
      category: v.category,
      lastUpdated: now,
    });
  }

  const deals: Deal[] = [
    {
      id: "pizzahut-deal-pizzaoftheday",
      chainId: "pizzahut",
      name: "Pizza of the Day",
      description: "Different medium pizza for $10.99 each day, online only. Upsize to large for a few dollars more.",
      price: 10.99,
      itemsIncluded: ["1x Medium specialty pizza"],
      minPeople: 2,
      maxPeople: 4,
      promoCode: null,
      validDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      validHours: null,
      lastUpdated: now,
    },
    {
      id: "pizzahut-deal-gamenight",
      chainId: "pizzahut",
      name: "Game Night Meal",
      description: "2 medium pizzas, boneless bites, dips & 2L drink for $52.99",
      price: 52.99,
      itemsIncluded: ["2x Medium pizza", "Boneless bites", "Dips", "2L drink"],
      minPeople: 4,
      maxPeople: 8,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
    {
      id: "pizzahut-deal-family",
      chainId: "pizzahut",
      name: "Family Deal",
      description: "Large pizza, 4 dips & 4 cans for $39.99",
      price: 39.99,
      itemsIncluded: ["1x Large pizza", "4 dips", "4 cans"],
      minPeople: 4,
      maxPeople: 6,
      promoCode: null,
      validDays: null,
      validHours: null,
      lastUpdated: now,
    },
  ];

  return { pizzas, deals };
}

export async function scrapePizzaHut(): Promise<{ pizzas: Pizza[]; deals: Deal[] }> {
  // Static data — no network call needed.
  // TODO: Replace with live Puppeteer scraping via GitHub Actions.
  return generatePizzaHutData();
}
