import { describe, it, expect } from "vitest";
import { parsePizzaNovaData } from "@/lib/scrapers/pizzanova";

const mockNextData = {
  props: {
    pageProps: {
      products: [
        {
          productID: 1001,
          sku: "doppio-pepperoni",
          name: "Doppio Pepperoni",
          description: "Double pepperoni pizza",
          isVegetarian: false,
          recipeType: "PIZZA",
          sizes: [
            { size: "Small", price: 14.44, slices: 6 },
            { size: "Medium", price: 18.29, slices: 8 },
            { size: "Large", price: 22.14, slices: 10 },
            { size: "Jumbo", price: 31.94, slices: 12 },
            { size: "Party", price: 34.84, slices: 24 },
          ],
        },
        {
          productID: 1002,
          sku: "veggie-supreme",
          name: "Veggie Supreme",
          description: "Loaded vegetarian pizza",
          isVegetarian: true,
          recipeType: "PIZZA",
          sizes: [
            { size: "Small", price: 13.44, slices: 6 },
            { size: "Medium", price: 17.29, slices: 8 },
            { size: "Large", price: 21.14, slices: 10 },
          ],
        },
        {
          productID: 2001,
          sku: "garlic-bread",
          name: "Garlic Bread",
          description: "Side item",
          isVegetarian: true,
          recipeType: "SIDE",
          sizes: [],
        },
      ],
    },
  },
};

describe("parsePizzaNovaData", () => {
  it("extracts pizza products with sizes and prices", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData);
    expect(pizzas.length).toBe(8);
    expect(pizzas[0].chainId).toBe("pizzanova");
  });

  it("filters out non-pizza items", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData);
    const garlic = pizzas.find((p) => p.name.includes("Garlic"));
    expect(garlic).toBeUndefined();
  });

  it("normalizes size names correctly", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData);
    const sizes = [...new Set(pizzas.map((p) => p.size))];
    expect(sizes).toContain("small");
    expect(sizes).toContain("large");
  });

  it("assigns correct prices", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData);
    const largeDoppio = pizzas.find(
      (p) => p.name === "Doppio Pepperoni" && p.size === "large"
    );
    expect(largeDoppio?.price).toBe(22.14);
  });
});
