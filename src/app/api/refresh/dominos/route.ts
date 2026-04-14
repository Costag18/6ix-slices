import { NextResponse } from "next/server";
import { getDbClient, initializeDb, upsertPizzas, upsertDeals, logScrape } from "@/lib/db";
import { scrapeDominos } from "@/lib/scrapers/dominos";

export async function GET() {
  const client = getDbClient();
  await initializeDb(client);

  try {
    const { pizzas, deals } = await scrapeDominos();

    await upsertPizzas(client, pizzas);
    await upsertDeals(client, deals);

    await logScrape(client, {
      chainId: "dominos",
      status: "success",
      errorMessage: null,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ pizzas: pizzas.length, deals: deals.length });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Domino's scrape failed:", message);

    await logScrape(client, {
      chainId: "dominos",
      status: "failure",
      errorMessage: message,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
