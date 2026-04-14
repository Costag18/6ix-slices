import type { Client } from "@libsql/client";

export async function initializeSchema(client: Client): Promise<void> {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS chains (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      logo_url   TEXT NOT NULL DEFAULT '',
      website_url TEXT NOT NULL DEFAULT ''
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS pizzas (
      id                TEXT PRIMARY KEY,
      chain_id          TEXT NOT NULL REFERENCES chains(id),
      name              TEXT NOT NULL,
      size              TEXT NOT NULL,
      slices            INTEGER NOT NULL,
      price             REAL NOT NULL,
      toppings_included INTEGER NOT NULL DEFAULT 0,
      square_inches     REAL,
      category          TEXT NOT NULL,
      last_updated      DATETIME NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS deals (
      id              TEXT PRIMARY KEY,
      chain_id        TEXT NOT NULL REFERENCES chains(id),
      name            TEXT NOT NULL,
      description     TEXT,
      price           REAL,
      items_included  TEXT NOT NULL DEFAULT '[]',
      min_people      INTEGER,
      max_people      INTEGER,
      promo_code      TEXT,
      valid_days      TEXT,
      valid_hours     TEXT,
      last_updated    DATETIME NOT NULL
    )
  `);

  await client.execute(`
    CREATE TABLE IF NOT EXISTS scrape_logs (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      chain_id      TEXT NOT NULL REFERENCES chains(id),
      status        TEXT NOT NULL,
      error_message TEXT,
      scraped_at    DATETIME NOT NULL
    )
  `);
}

const CHAIN_SEEDS = [
  {
    id: "dominos",
    name: "Domino's",
    logo_url: "",
    website_url: "https://www.dominos.ca/pages/order/",
  },
  {
    id: "pizzanova",
    name: "Pizza Nova",
    logo_url: "",
    website_url: "https://www.pizzanova.com/products/signature-pizzas",
  },
  {
    id: "pizzaiolo",
    name: "Pizzaiolo",
    logo_url: "",
    website_url: "https://pizzaiolo.ca/orders/menu",
  },
  {
    id: "pizzapizza",
    name: "Pizza Pizza",
    logo_url: "",
    website_url: "https://www.pizzapizza.ca/menu/",
  },
  {
    id: "littlecaesars",
    name: "Little Caesars",
    logo_url: "",
    website_url: "https://order.littlecaesars.ca/en-ca/order",
  },
  {
    id: "pizzahut",
    name: "Pizza Hut",
    logo_url: "",
    website_url: "https://www.pizzahut.ca/menu/pizza",
  },
  {
    id: "papajohns",
    name: "Papa John's",
    logo_url: "",
    website_url: "https://www.papajohns.ca/menu/pizza",
  },
];

export async function seedChains(client: Client): Promise<void> {
  for (const chain of CHAIN_SEEDS) {
    await client.execute({
      sql: `INSERT OR REPLACE INTO chains (id, name, logo_url, website_url) VALUES (?, ?, ?, ?)`,
      args: [chain.id, chain.name, chain.logo_url, chain.website_url],
    });
  }
}
