"use client";

import type { ChainRecommendation, ComparisonMode } from "@/lib/types";

interface DealCardProps {
  recommendation: ChainRecommendation;
  mode: ComparisonMode;
  rank: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

function getValueScoreColor(score: number): string {
  if (score >= 70) return "bg-green-100 text-green-800";
  if (score >= 40) return "bg-yellow-100 text-yellow-800";
  return "bg-red-100 text-red-800";
}

export function DealCard({
  recommendation,
  mode,
  rank,
  isExpanded,
  onToggleExpand,
}: DealCardProps) {
  const { chain, totalCost, costPerPerson, pizzasNeeded, dealsApplied, valueScore } =
    recommendation;
  const hasDeals = dealsApplied.length > 0;

  return (
    <div
      onClick={onToggleExpand}
      className="bg-[var(--color-card)] rounded-2xl p-5 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow select-none"
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-sm font-bold text-[var(--color-text)]">
            {rank}
          </span>
          <div>
            <h3 className="font-bold text-[var(--color-text)] text-base leading-tight">
              {chain.name}
            </h3>
            {hasDeals && (
              <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-700">
                Promo applied
              </span>
            )}
          </div>
        </div>

        {/* Value score badge */}
        {mode === "value-score" && (
          <span
            className={`px-2 py-1 rounded-lg text-xs font-bold ${getValueScoreColor(valueScore)}`}
          >
            {valueScore.toFixed(0)}/100
          </span>
        )}
      </div>

      {/* What you get summary */}
      <p className="text-sm text-[var(--color-text-muted)] mb-3">
        {pizzasNeeded
          .map(({ pizza, quantity }) => `${quantity}× ${pizza.name}`)
          .join(", ")}
      </p>

      {/* Price row */}
      <div className="flex items-end justify-between">
        <span className="text-2xl font-bold text-[var(--color-tomato)]">
          ${costPerPerson.toFixed(2)}
          <span className="text-sm font-normal text-[var(--color-text-muted)] ml-1">
            /person
          </span>
        </span>
        <span className="text-sm text-[var(--color-text-muted)]">
          ${totalCost.toFixed(2)} total
        </span>
      </div>

      {/* Expanded breakdown */}
      {isExpanded && (
        <div
          className="mt-4 pt-4 border-t border-gray-100"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Pizza breakdown */}
          <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
            Breakdown
          </h4>
          <ul className="space-y-1 mb-3">
            {pizzasNeeded.map(({ pizza, quantity }) => (
              <li key={pizza.id} className="flex justify-between text-sm">
                <span className="text-[var(--color-text)]">
                  {quantity}× {pizza.name} ({pizza.size})
                </span>
                <span className="text-[var(--color-text-muted)]">
                  ${(pizza.price * quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>

          {/* Deals applied */}
          {hasDeals && (
            <>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-muted)] mb-2">
                Deals Applied
              </h4>
              <ul className="space-y-1 mb-3">
                {dealsApplied.map((deal) => (
                  <li key={deal.id} className="text-sm">
                    <span className="text-green-700 font-medium">{deal.name}</span>
                    {deal.promoCode && (
                      <span className="ml-2 px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono text-[var(--color-text-muted)]">
                        {deal.promoCode}
                      </span>
                    )}
                    {deal.description && (
                      <p className="text-[var(--color-text-muted)] text-xs mt-0.5">
                        {deal.description}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </>
          )}

          {/* Link to chain website */}
          <a
            href={chain.websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm font-medium text-[var(--color-tomato)] hover:underline"
          >
            Order from {chain.name} &rarr;
          </a>
        </div>
      )}
    </div>
  );
}
