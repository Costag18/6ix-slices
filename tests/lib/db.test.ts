import { describe, it, expect, beforeEach } from "vitest";
import { createClient } from "@libsql/client";
import {
  initializeDb,
  getChains,
  upsertPizzas,
  upsertDeals,
  getPizzasByChains,
  getDealsByChains,
  getLastUpdated,
  logScrape,
} from "@/lib/db";
import type { Pizza, Deal } from "@/lib/types";

const testClient = createClient({ url: ":memory:" });

describe("Database helpers", () => {
  beforeEach(async () => {
    await testClient.execute("DROP TABLE IF EXISTS scrape_logs");
    await testClient.execute("DROP TABLE IF EXISTS deals");
    await testClient.execute("DROP TABLE IF EXISTS pizzas");
    await testClient.execute("DROP TABLE IF EXISTS chains");
    await initializeDb(testClient);
  });

  it("initializes schema and seeds chains", async () => {
    const chains = await getChains(testClient);
    expect(chains.length).toBe(7);
    expect(chains.find((c) => c.id === "dominos")?.name).toBe("Domino's");
  });

  it("upserts pizzas and retrieves by chain", async () => {
    const pizzas: Pizza[] = [
      {
        id: "dominos-pepperoni-large",
        chainId: "dominos",
        name: "Pepperoni",
        size: "large",
        slices: 8,
        price: 14.99,
        toppingsIncluded: 1,
        squareInches: 153.94,
        category: "pepperoni",
        lastUpdated: new Date().toISOString(),
      },
    ];
    await upsertPizzas(testClient, pizzas);
    const result = await getPizzasByChains(testClient, ["dominos"]);
    expect(result.length).toBe(1);
    expect(result[0].name).toBe("Pepperoni");
    expect(result[0].price).toBe(14.99);
  });

  it("upserts deals and retrieves by chain", async () => {
    const deals: Deal[] = [
      {
        id: "dominos-deal-1",
        chainId: "dominos",
        name: "2 Large 2-Topping for $24.99",
        description: "Two large pizzas with 2 toppings each",
        price: 24.99,
        itemsIncluded: ["large pizza x2"],
        minPeople: 4,
        maxPeople: 8,
        promoCode: "9730",
        validDays: null,
        validHours: null,
        lastUpdated: new Date().toISOString(),
      },
    ];
    await upsertDeals(testClient, deals);
    const result = await getDealsByChains(testClient, ["dominos"]);
    expect(result.length).toBe(1);
    expect(result[0].price).toBe(24.99);
  });

  it("tracks last updated timestamps", async () => {
    await logScrape(testClient, {
      chainId: "dominos",
      status: "success",
      errorMessage: null,
      scrapedAt: "2026-04-14T12:00:00Z",
    });
    const timestamps = await getLastUpdated(testClient);
    expect(timestamps["dominos"]).toBe("2026-04-14T12:00:00Z");
    expect(timestamps["pizzanova"]).toBeNull();
  });

  it("upsert overwrites existing pizza on conflict", async () => {
    const pizza: Pizza = {
      id: "dominos-pepperoni-large",
      chainId: "dominos",
      name: "Pepperoni",
      size: "large",
      slices: 8,
      price: 14.99,
      toppingsIncluded: 1,
      squareInches: 153.94,
      category: "pepperoni",
      lastUpdated: new Date().toISOString(),
    };
    await upsertPizzas(testClient, [pizza]);
    await upsertPizzas(testClient, [{ ...pizza, price: 16.99 }]);
    const result = await getPizzasByChains(testClient, ["dominos"]);
    expect(result.length).toBe(1);
    expect(result[0].price).toBe(16.99);
  });
});
