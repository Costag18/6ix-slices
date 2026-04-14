import { NextResponse } from "next/server";
import { getDbClient, initializeDb, upsertPizzas, logScrape } from "@/lib/db";
import { scrapePizzaiolo } from "@/lib/scrapers/pizzaiolo";

export async function GET() {
  const client = getDbClient();
  await initializeDb(client);

  try {
    const { pizzas } = await scrapePizzaiolo();

    await upsertPizzas(client, pizzas);

    await logScrape(client, {
      chainId: "pizzaiolo",
      status: "success",
      errorMessage: null,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ pizzas: pizzas.length, deals: 0 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Pizzaiolo scrape failed:", message);

    await logScrape(client, {
      chainId: "pizzaiolo",
      status: "failure",
      errorMessage: message,
      scrapedAt: new Date().toISOString(),
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
