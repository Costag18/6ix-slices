import { createClient } from "@libsql/client";
import type { Client } from "@libsql/client";
import { initializeSchema, seedChains } from "@/lib/schema";
import type { Chain, Pizza, Deal, ScrapeLog } from "@/lib/types";
import { ALL_CHAINS } from "@/lib/types";

// ---------------------------------------------------------------------------
// Singleton client
// ---------------------------------------------------------------------------

let _client: Client | null = null;

export function getDbClient(): Client {
  if (!_client) {
    const url = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!url) {
      throw new Error("TURSO_DATABASE_URL environment variable is not set");
    }

    _client = createClient({ url, authToken });
  }
  return _client;
}

// ---------------------------------------------------------------------------
// Initialization
// ---------------------------------------------------------------------------

export async function initializeDb(client: Client): Promise<void> {
  await initializeSchema(client);
  await seedChains(client);
}

// ---------------------------------------------------------------------------
// Chains
// ---------------------------------------------------------------------------

export async function getChains(client: Client): Promise<Chain[]> {
  const result = await client.execute("SELECT * FROM chains");
  return result.rows.map((row) => ({
    id: row.id as string,
    name: row.name as string,
    logoUrl: (row.logo_url as string) ?? "",
    websiteUrl: (row.website_url as string) ?? "",
  }));
}

// ---------------------------------------------------------------------------
// Pizzas
// ---------------------------------------------------------------------------

export async function upsertPizzas(
  client: Client,
  pizzas: Pizza[]
): Promise<void> {
  for (const pizza of pizzas) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO pizzas
              (id, chain_id, name, size, slices, price, toppings_included, square_inches, category, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        pizza.id,
        pizza.chainId,
        pizza.name,
        pizza.size,
        pizza.slices,
        pizza.price,
        pizza.toppingsIncluded,
        pizza.squareInches ?? null,
        pizza.category,
        pizza.lastUpdated,
      ],
    });
  }
}

export async function getPizzasByChains(
  client: Client,
  chainIds: string[]
): Promise<Pizza[]> {
  if (chainIds.length === 0) return [];

  const placeholders = chainIds.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT * FROM pizzas WHERE chain_id IN (${placeholders})`,
    args: chainIds,
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    chainId: row.chain_id as string,
    name: row.name as string,
    size: row.size as Pizza["size"],
    slices: row.slices as number,
    price: row.price as number,
    toppingsIncluded: row.toppings_included as number,
    squareInches: row.square_inches as number | null,
    category: row.category as Pizza["category"],
    lastUpdated: row.last_updated as string,
  }));
}

// ---------------------------------------------------------------------------
// Deals
// ---------------------------------------------------------------------------

export async function upsertDeals(
  client: Client,
  deals: Deal[]
): Promise<void> {
  for (const deal of deals) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO deals
              (id, chain_id, name, description, price, items_included, min_people, max_people, promo_code, valid_days, valid_hours, last_updated)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        deal.id,
        deal.chainId,
        deal.name,
        deal.description ?? null,
        deal.price ?? null,
        JSON.stringify(deal.itemsIncluded),
        deal.minPeople ?? null,
        deal.maxPeople ?? null,
        deal.promoCode ?? null,
        deal.validDays ? JSON.stringify(deal.validDays) : null,
        deal.validHours ?? null,
        deal.lastUpdated,
      ],
    });
  }
}

export async function getDealsByChains(
  client: Client,
  chainIds: string[]
): Promise<Deal[]> {
  if (chainIds.length === 0) return [];

  const placeholders = chainIds.map(() => "?").join(", ");
  const result = await client.execute({
    sql: `SELECT * FROM deals WHERE chain_id IN (${placeholders})`,
    args: chainIds,
  });

  return result.rows.map((row) => ({
    id: row.id as string,
    chainId: row.chain_id as string,
    name: row.name as string,
    description: (row.description as string | null) ?? null,
    price: (row.price as number | null) ?? null,
    itemsIncluded: JSON.parse((row.items_included as string) ?? "[]"),
    minPeople: (row.min_people as number | null) ?? null,
    maxPeople: (row.max_people as number | null) ?? null,
    promoCode: (row.promo_code as string | null) ?? null,
    validDays: row.valid_days
      ? JSON.parse(row.valid_days as string)
      : null,
    validHours: (row.valid_hours as string | null) ?? null,
    lastUpdated: row.last_updated as string,
  }));
}

// ---------------------------------------------------------------------------
// Scrape logs / last updated
// ---------------------------------------------------------------------------

export async function logScrape(
  client: Client,
  log: ScrapeLog
): Promise<void> {
  await client.execute({
    sql: `INSERT INTO scrape_logs (chain_id, status, error_message, scraped_at)
          VALUES (?, ?, ?, ?)`,
    args: [log.chainId, log.status, log.errorMessage ?? null, log.scrapedAt],
  });
}

export async function getLastUpdated(
  client: Client
): Promise<Record<string, string | null>> {
  const result = await client.execute(`
    SELECT chain_id, MAX(scraped_at) AS last_scraped
    FROM scrape_logs
    WHERE status = 'success'
    GROUP BY chain_id
  `);

  // Build a lookup from the query results
  const lookup: Record<string, string | null> = {};
  for (const row of result.rows) {
    lookup[row.chain_id as string] = (row.last_scraped as string | null) ?? null;
  }

  // Ensure every known chain has an entry (null if never scraped)
  const timestamps: Record<string, string | null> = {};
  for (const chainId of ALL_CHAINS) {
    timestamps[chainId] = lookup[chainId] ?? null;
  }

  return timestamps;
}
