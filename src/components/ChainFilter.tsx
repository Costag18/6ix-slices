"use client";

import type { Chain } from "@/lib/types";

interface ChainFilterProps {
  chains: Chain[];
  selectedChains: string[];
  onToggleChain: (chainId: string) => void;
}

export function ChainFilter({ chains, selectedChains, onToggleChain }: ChainFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {chains.map((chain) => {
        const isSelected = selectedChains.includes(chain.id);
        return (
          <button
            key={chain.id}
            onClick={() => onToggleChain(chain.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
              isSelected
                ? "bg-[var(--color-tomato)] text-white border-[var(--color-tomato)]"
                : "bg-white text-[var(--color-text-muted)] border-gray-300 hover:border-[var(--color-tomato)]"
            }`}
          >
            {chain.name}
          </button>
        );
      })}
    </div>
  );
}
