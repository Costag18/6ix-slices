import { NextResponse } from "next/server";
import { getDbClient, initializeDb, upsertPizzas, logScrape } from "@/lib/db";
import { scrapePizzaNova } from "@/lib/scrapers/pizzanova";

export async function GET() {
  const client = getDbClient();
  await initializeDb(client);

  try {
    const { pizzas } = await scrapePizzaNova();

    await upsertPizzas(client, pizzas);

    await logScrape(client, {
      chainId: "pizzanova",
      status: "success",
      errorMessage: null,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ pizzas: pizzas.length, deals: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Pizza Nova scrape failed:", message);

    await logScrape(client, {
      chainId: "pizzanova",
      status: "failure",
      errorMessage: message,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
