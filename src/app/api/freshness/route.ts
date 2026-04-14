import { NextResponse } from "next/server";
import { getDbClient, initializeDb, getLastUpdated } from "@/lib/db";

export async function GET() {
  try {
    const client = getDbClient();
    await initializeDb(client);
    const chains = await getLastUpdated(client);
    return NextResponse.json({ chains });
  } catch (error) {
    console.error("Error fetching freshness data:", error);
    return NextResponse.json(
      { error: "Failed to fetch freshness data" },
      { status: 500 }
    );
  }
}
