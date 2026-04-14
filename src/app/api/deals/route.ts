import { NextRequest, NextResponse } from "next/server";
import { getDbClient, initializeDb, getChains, getPizzasByChains, getDealsByChains } from "@/lib/db";
import { ALL_CHAINS } from "@/lib/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const chainsParam = searchParams.get("chains");
    const chainIds: string[] = chainsParam
      ? chainsParam.split(",").map((c) => c.trim()).filter(Boolean)
      : [...ALL_CHAINS];

    const client = getDbClient();
    await initializeDb(client);

    const [chains, pizzas, deals] = await Promise.all([
      getChains(client),
      getPizzasByChains(client, chainIds),
      getDealsByChains(client, chainIds),
    ]);

    const filteredChains = chains.filter((c) => chainIds.includes(c.id));

    return NextResponse.json({ chains: filteredChains, pizzas, deals });
  } catch (error) {
    console.error("Error fetching deals data:", error);
    return NextResponse.json(
      { error: "Failed to fetch deals data" },
      { status: 500 }
    );
  }
}
