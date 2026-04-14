import { describe, it, expect } from "vitest";
import { parsePizzaNovaData } from "@/lib/scrapers/pizzanova";

const mockNextData = {
  props: {
    pageProps: {
      products: [
        {
          productID: 129319,
          sku: "PPZdoppio",
          name: "*NEW* Doppio Pepperoni",
          description: "Double pepperoni pizza",
          isVegetarian: "false",
          recipeType: "PIZZA",
          productPrice: 14.44,
          customizationConfig: [
            {
              name: "*NEW* Doppio Pepperoni",
              variants: [
                { productID: 129320, masterProductID: 129319, name: "Small - Doppio Pepperoni", size: 2, productPrice: 14.44, displayName: "Small - 6 Slices" },
                { productID: 129321, masterProductID: 129319, name: "Medium - Doppio Pepperoni", size: 3, productPrice: 18.29, displayName: "Medium - 8 Slices" },
                { productID: 129322, masterProductID: 129319, name: "Large - Doppio Pepperoni", size: 4, productPrice: 22.14, displayName: "Large - 10 Slices" },
                { productID: 129323, masterProductID: 129319, name: "Jumbo - Doppio Pepperoni", size: 20, productPrice: 31.94, displayName: "18\u201D Jumbo - 12 Slices" },
                { productID: 129324, masterProductID: 129319, name: "Party - Doppio Pepperoni", size: 21, productPrice: 34.84, displayName: "21x15\u201D Party - 24 Squares" },
              ],
            },
          ],
        },
        {
          productID: 1002,
          sku: "PPZveggie",
          name: "Veggie Supreme",
          description: "Loaded vegetarian pizza",
          isVegetarian: "true",
          recipeType: "PIZZA",
          productPrice: 13.44,
          customizationConfig: [
            {
              name: "Veggie Supreme",
              variants: [
                { productID: 2001, masterProductID: 1002, name: "Small - Veggie Supreme", size: 2, productPrice: 13.44, displayName: "Small - 6 Slices" },
                { productID: 2002, masterProductID: 1002, name: "Medium - Veggie Supreme", size: 3, productPrice: 17.29, displayName: "Medium - 8 Slices" },
                { productID: 2003, masterProductID: 1002, name: "Large - Veggie Supreme", size: 4, productPrice: 21.14, displayName: "Large - 10 Slices" },
              ],
            },
          ],
        },
        {
          productID: 2001,
          sku: "SIDEgbread",
          name: "Garlic Bread",
          description: "Side item",
          isVegetarian: "true",
          recipeType: "SIDE",
          productPrice: 5.99,
          customizationConfig: [],
        },
      ],
    },
  },
};

describe("parsePizzaNovaData", () => {
  it("extracts pizza products with sizes and prices", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    expect(pizzas.length).toBe(8);
    expect(pizzas[0].chainId).toBe("pizzanova");
  });

  it("filters out non-pizza items", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    const garlic = pizzas.find((p) => p.name.includes("Garlic"));
    expect(garlic).toBeUndefined();
  });

  it("normalizes size names correctly", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    const sizes = [...new Set(pizzas.map((p) => p.size))];
    expect(sizes).toContain("small");
    expect(sizes).toContain("large");
  });

  it("assigns correct prices from variants", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    const largeDoppio = pizzas.find(
      (p) => p.name === "Doppio Pepperoni" && p.size === "large"
    );
    expect(largeDoppio?.price).toBe(22.14);
  });

  it("extracts slices from displayName", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    const smallDoppio = pizzas.find(
      (p) => p.name === "Doppio Pepperoni" && p.size === "small"
    );
    expect(smallDoppio?.slices).toBe(6);
  });

  it("strips *NEW* prefix from names", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    const doppio = pizzas.find((p) => p.name === "Doppio Pepperoni");
    expect(doppio).toBeDefined();
  });

  it("handles jumbo and party sizes", () => {
    const { pizzas } = parsePizzaNovaData(mockNextData as any);
    // Both jumbo (18") and party (21x15") map to "party" size
    const partyPizzas = pizzas.filter(
      (p) => p.name === "Doppio Pepperoni" && p.size === "party"
    );
    expect(partyPizzas.length).toBe(2);
    // Jumbo has 12 slices, Party has 24 squares
    expect(partyPizzas.map((p) => p.slices).sort()).toEqual([12, 24]);
    expect(partyPizzas.map((p) => p.price).sort()).toEqual([31.94, 34.84]);
  });
});
