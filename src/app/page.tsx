"use client";
import { useState, useEffect, useCallback } from "react";
import { HeroSection } from "@/components/HeroSection";
import { ChainFilter } from "@/components/ChainFilter";
import { ResultsGrid } from "@/components/ResultsGrid";
import { Footer } from "@/components/Footer";
import { rankByPricePerPerson, rankByValueScore } from "@/lib/scoring";
import type {
  AppetiteLevel,
  ComparisonMode,
  Chain,
  Pizza,
  Deal,
  ChainRecommendation,
  FreshnessResponse,
} from "@/lib/types";
import {
  STALENESS_THRESHOLDS,
  TIER1_CHAINS,
  TIER2_CHAINS,
} from "@/lib/types";

export default function Home() {
  const [groupSize, setGroupSize] = useState(10);
  const [appetite, setAppetite] = useState<AppetiteLevel>("medium");
  const [mode, setMode] = useState<ComparisonMode>("price-per-person");
  const [chains, setChains] = useState<Chain[]>([]);
  const [pizzas, setPizzas] = useState<Pizza[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [selectedChains, setSelectedChains] = useState<string[]>([]);
  const [lastUpdated, setLastUpdated] = useState<Record<string, string | null>>({});
  const [loadingChains, setLoadingChains] = useState<string[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const refreshChain = useCallback(async (chainId: string) => {
    setLoadingChains((prev) => [...prev, chainId]);
    try {
      const refreshRes = await fetch(`/api/refresh/${chainId}`);
      if (refreshRes.ok) {
        const freshRes = await fetch(`/api/deals?chains=${chainId}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          const freshChains: Chain[] = freshData.chains ?? [];
          const freshPizzas: Pizza[] = freshData.pizzas ?? [];
          const freshDeals: Deal[] = freshData.deals ?? [];

          setChains((prev) => {
            const others = prev.filter((c) => c.id !== chainId);
            return [...others, ...freshChains];
          });
          setPizzas((prev) => {
            const others = prev.filter((p) => p.chainId !== chainId);
            return [...others, ...freshPizzas];
          });
          setDeals((prev) => {
            const others = prev.filter((d) => d.chainId !== chainId);
            return [...others, ...freshDeals];
          });
          setLastUpdated((prev) => ({
            ...prev,
            [chainId]: new Date().toISOString(),
          }));
        }
      }
    } finally {
      setLoadingChains((prev) => prev.filter((id) => id !== chainId));
    }
  }, []);

  useEffect(() => {
    async function initialLoad() {
      try {
        const [freshnessRes, dealsRes] = await Promise.all([
          fetch("/api/freshness"),
          fetch("/api/deals"),
        ]);

        const timestamps: Record<string, string | null> = {};
        if (freshnessRes.ok) {
          const freshnessData: FreshnessResponse = await freshnessRes.json();
          Object.assign(timestamps, freshnessData.chains);
          setLastUpdated(freshnessData.chains);
        }

        if (dealsRes.ok) {
          const dealsData = await dealsRes.json();
          const loadedChains: Chain[] = dealsData.chains ?? [];
          const loadedPizzas: Pizza[] = dealsData.pizzas ?? [];
          const loadedDeals: Deal[] = dealsData.deals ?? [];

          setChains(loadedChains);
          setPizzas(loadedPizzas);
          setDeals(loadedDeals);
          setSelectedChains(loadedChains.map((c) => c.id));
        }

        setIsInitialLoad(false);

        // Check staleness for tier1 chains
        const now = Date.now();
        for (const chainId of TIER1_CHAINS) {
          const ts = timestamps[chainId];
          const isStale =
            ts === null ||
            ts === undefined ||
            now - new Date(ts).getTime() > STALENESS_THRESHOLDS.tier1;
          if (isStale) {
            refreshChain(chainId);
          }
        }

        // Check staleness for tier2 chains (refresh individually like tier1)
        for (const chainId of TIER2_CHAINS) {
          const ts = timestamps[chainId];
          const isStale =
            ts === null ||
            ts === undefined ||
            now - new Date(ts).getTime() > STALENESS_THRESHOLDS.tier2;
          if (isStale) {
            refreshChain(chainId);
          }
        }
      } catch {
        setIsInitialLoad(false);
      }
    }

    initialLoad();
  }, [refreshChain]);

  function toggleChain(chainId: string) {
    setSelectedChains((prev) =>
      prev.includes(chainId)
        ? prev.filter((id) => id !== chainId)
        : [...prev, chainId]
    );
  }

  // Derived: filter by selectedChains
  const filteredChains = chains.filter((c) => selectedChains.includes(c.id));
  const filteredPizzas = pizzas.filter((p) => selectedChains.includes(p.chainId));
  const filteredDeals = deals.filter((d) => selectedChains.includes(d.chainId));

  const recommendations: ChainRecommendation[] =
    mode === "price-per-person"
      ? rankByPricePerPerson(filteredChains, filteredPizzas, filteredDeals, groupSize, appetite)
      : rankByValueScore(filteredChains, filteredPizzas, filteredDeals, groupSize, appetite);

  const isLoading = isInitialLoad || loadingChains.length > 0;

  return (
    <main className="max-w-5xl mx-auto">
      <HeroSection
        groupSize={groupSize}
        appetite={appetite}
        mode={mode}
        onGroupSizeChange={setGroupSize}
        onAppetiteChange={setAppetite}
        onModeChange={setMode}
      />

      <section className="px-4 mb-6">
        <ChainFilter
          chains={chains}
          selectedChains={selectedChains}
          onToggleChain={toggleChain}
        />
      </section>

      <section className="px-4">
        <ResultsGrid
          recommendations={recommendations}
          mode={mode}
          isLoading={isLoading}
          loadingChains={loadingChains}
        />
      </section>

      <Footer lastUpdated={lastUpdated} />
    </main>
  );
}
