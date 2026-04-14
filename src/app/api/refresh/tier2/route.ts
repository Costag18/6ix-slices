import { NextResponse } from "next/server";

export async function POST() {
  const githubPat = process.env.GITHUB_PAT;
  const githubRepo = process.env.GITHUB_REPO;

  if (!githubPat || !githubRepo) {
    return NextResponse.json(
      { error: "GITHUB_PAT and GITHUB_REPO environment variables are required" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/repos/${githubRepo}/actions/workflows/scrape-tier2.yml/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${githubPat}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({ ref: "main" }),
      }
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`GitHub API error ${response.status}: ${text}`);
    }

    return NextResponse.json({ dispatched: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Tier 2 dispatch failed:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
