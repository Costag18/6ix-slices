"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ChainRecommendation, ComparisonMode } from "@/lib/types";
import { DealCard } from "./DealCard";
import { SkeletonCard } from "./SkeletonCard";

interface ResultsGridProps {
  recommendations: ChainRecommendation[];
  mode: ComparisonMode;
  isLoading: boolean;
  loadingChains: string[];
}

export function ResultsGrid({
  recommendations,
  mode,
  isLoading,
  loadingChains,
}: ResultsGridProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  function handleToggleExpand(chainId: string) {
    setExpandedId((prev) => (prev === chainId ? null : chainId));
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {recommendations.map((rec, index) => (
          <motion.div
            key={rec.chain.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.25, delay: index * 0.04 }}
          >
            <DealCard
              recommendation={rec}
              mode={mode}
              rank={index + 1}
              isExpanded={expandedId === rec.chain.id}
              onToggleExpand={() => handleToggleExpand(rec.chain.id)}
            />
          </motion.div>
        ))}

        {isLoading &&
          loadingChains.map((chainId) => (
            <motion.div
              key={`skeleton-${chainId}`}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <SkeletonCard />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
