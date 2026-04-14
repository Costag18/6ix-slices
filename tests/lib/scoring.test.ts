import { describe, it, expect } from "vitest";
import {
  calculatePizzasNeeded,
  calculatePricePerPerson,
  calculateValueScore,
  rankByPricePerPerson,
  rankByValueScore,
} from "@/lib/scoring";
import type { Pizza, Deal, Chain } from "@/lib/types";

const mockChain: Chain = {
  id: "testchain",
  name: "Test Chain",
  logoUrl: "/logos/test.svg",
  websiteUrl: "https://test.com",
};

const mockLargePizza: Pizza = {
  id: "test-large",
  chainId: "testchain",
  name: "Large Pepperoni",
  size: "large",
  slices: 8,
  price: 14.99,
  toppingsIncluded: 1,
  squareInches: 153.94,
  category: "pepperoni",
  lastUpdated: "2026-04-14T00:00:00Z",
};

const mockMediumPizza: Pizza = {
  id: "test-medium",
  chainId: "testchain",
  name: "Medium Pepperoni",
  size: "medium",
  slices: 8,
  price: 10.99,
  toppingsIncluded: 1,
  squareInches: 113.1,
  category: "pepperoni",
  lastUpdated: "2026-04-14T00:00:00Z",
};

describe("calculatePizzasNeeded", () => {
  it("calculates for medium appetite, 10 people", () => {
    const result = calculatePizzasNeeded(10, "medium", [mockLargePizza]);
    expect(result[0].quantity).toBe(4);
    expect(result[0].pizza.id).toBe("test-large");
  });

  it("calculates for light appetite, 4 people", () => {
    const result = calculatePizzasNeeded(4, "light", [mockLargePizza]);
    expect(result[0].quantity).toBe(1);
  });

  it("calculates for hungry appetite, 20 people", () => {
    const result = calculatePizzasNeeded(20, "hungry", [mockLargePizza]);
    expect(result[0].quantity).toBe(10);
  });

  it("picks cheapest pizza per square inch when multiple sizes available", () => {
    const result = calculatePizzasNeeded(10, "medium", [
      mockLargePizza,
      mockMediumPizza,
    ]);
    expect(result[0].pizza.id).toBe("test-medium");
  });
});

describe("calculatePricePerPerson", () => {
  it("returns total cost / group size", () => {
    const result = calculatePricePerPerson(
      [{ pizza: mockLargePizza, quantity: 4 }],
      [],
      10
    );
    // 4 × $14.99 = $59.96 + 13% HST = $67.75
    expect(result.totalCost).toBeCloseTo(67.75, 1);
    expect(result.costPerPerson).toBeCloseTo(6.775, 1);
  });
});

describe("calculateValueScore", () => {
  it("returns a score between 0 and 100", () => {
    const score = calculateValueScore(mockLargePizza, null);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
  });

  it("scores higher for lower price per square inch", () => {
    const cheapPizza = { ...mockLargePizza, price: 8.99 };
    const expensivePizza = { ...mockLargePizza, price: 24.99 };
    const cheapScore = calculateValueScore(cheapPizza, null);
    const expensiveScore = calculateValueScore(expensivePizza, null);
    expect(cheapScore).toBeGreaterThan(expensiveScore);
  });

  it("scores higher with more toppings included", () => {
    const moreToppings = { ...mockLargePizza, toppingsIncluded: 5 };
    const fewerToppings = { ...mockLargePizza, toppingsIncluded: 0 };
    const moreScore = calculateValueScore(moreToppings, null);
    const fewerScore = calculateValueScore(fewerToppings, null);
    expect(moreScore).toBeGreaterThan(fewerScore);
  });
});

describe("rankByPricePerPerson", () => {
  it("ranks cheapest first", () => {
    const cheapChain: Chain = { ...mockChain, id: "cheap", name: "Cheap" };
    const expensiveChain: Chain = { ...mockChain, id: "expensive", name: "Expensive" };
    const cheapPizza = { ...mockLargePizza, chainId: "cheap", id: "c1", price: 8.99 };
    const expensivePizza = { ...mockLargePizza, chainId: "expensive", id: "e1", price: 24.99 };

    const result = rankByPricePerPerson(
      [cheapChain, expensiveChain],
      [cheapPizza, expensivePizza],
      [],
      10,
      "medium"
    );
    expect(result[0].chain.id).toBe("cheap");
    expect(result[1].chain.id).toBe("expensive");
  });
});
