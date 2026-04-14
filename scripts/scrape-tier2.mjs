import { createClient } from "@libsql/client";

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log("Tier 2 scrape dispatched at", new Date().toISOString());
  console.log("Chains to scrape: Pizza Pizza, Little Caesars, Pizza Hut, Papa John's");
  console.log("");
  console.log("NOTE: Individual Puppeteer scrapers are not yet implemented.");
  console.log("This workflow will be extended as each Tier 2 scraper is built.");

  // Ensure tables exist
  await client.execute(`CREATE TABLE IF NOT EXISTS scrape_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chain_id TEXT NOT NULL,
    status TEXT NOT NULL,
    error_message TEXT,
    scraped_at DATETIME NOT NULL
  )`);

  const chains = ["pizzapizza", "littlecaesars", "pizzahut", "papajohns"];
  for (const chainId of chains) {
    await client.execute({
      sql: `INSERT INTO scrape_logs (chain_id, status, error_message, scraped_at) VALUES (?, ?, ?, ?)`,
      args: [chainId, "failure", "Puppeteer scraper not yet implemented", new Date().toISOString()],
    });
  }

  console.log("Logged scrape attempts. Exiting.");
}

main().catch(console.error);
