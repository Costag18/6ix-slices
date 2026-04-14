import { describe, it, expect } from "vitest";
import { parseDominosMenu } from "@/lib/scrapers/dominos";

const mockApiResponse = {
  Variants: {
    "10SCREEN": {
      Code: "10SCREEN",
      Name: "Small (10\") Hand Tossed Pizza",
      Price: "8.99",
      SizeCode: "10",
      ProductCode: "S_PIZZA",
      Tags: {},
    },
    "12SCREEN": {
      Code: "12SCREEN",
      Name: "Medium (12\") Hand Tossed Pizza",
      Price: "10.99",
      SizeCode: "12",
      ProductCode: "S_PIZZA",
      Tags: {},
    },
    "14SCREEN": {
      Code: "14SCREEN",
      Name: "Large (14\") Hand Tossed Pizza",
      Price: "14.99",
      SizeCode: "14",
      ProductCode: "S_PIZZA",
      Tags: {},
    },
  },
  Coupons: {
    "9730": {
      Code: "9730",
      Name: "Unlimited Large 2-Topping $12.99 each (min 2)",
      Price: "12.99",
      Tags: { MultiSame: true },
      Description: "Large 2-topping pizzas at $12.99 each when you buy 2+",
    },
    "8521": {
      Code: "8521",
      Name: "Buy 1 Get 1 Free (Mon-Tue)",
      Price: "0",
      Tags: { BOGO: true },
      Description: "Buy any pizza, get second free. Monday-Tuesday only.",
    },
  },
  Products: {
    S_PIZZA: {
      Code: "S_PIZZA",
      Name: "Pizza",
      ProductType: "Pizza",
      AvailableSizes: ["10", "12", "14"],
    },
  },
};

describe("parseDominosMenu", () => {
  it("extracts pizzas with correct prices and sizes", () => {
    const { pizzas, deals } = parseDominosMenu(mockApiResponse);
    expect(pizzas.length).toBe(3);
    const large = pizzas.find((p) => p.size === "large");
    expect(large).toBeDefined();
    expect(large!.price).toBe(14.99);
    expect(large!.chainId).toBe("dominos");
    expect(large!.slices).toBeGreaterThan(0);
  });

  it("extracts deals/coupons", () => {
    const { deals } = parseDominosMenu(mockApiResponse);
    expect(deals.length).toBe(2);
    const bogo = deals.find((d) => d.promoCode === "8521");
    expect(bogo).toBeDefined();
    expect(bogo!.chainId).toBe("dominos");
  });

  it("assigns correct pizza size categories", () => {
    const { pizzas } = parseDominosMenu(mockApiResponse);
    const sizes = pizzas.map((p) => p.size);
    expect(sizes).toContain("small");
    expect(sizes).toContain("medium");
    expect(sizes).toContain("large");
  });
});
