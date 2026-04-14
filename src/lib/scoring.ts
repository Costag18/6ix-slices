import type {
  Pizza,
  Deal,
  Chain,
  AppetiteLevel,
  ChainRecommendation,
} from "@/lib/types";
import { AREA_PER_PERSON, PIZZA_DIAMETERS, TAX_RATE } from "@/lib/types";

// ---------------------------------------------------------------------------
// Helper: estimate square inches from pizza size if not stored on the record
// ---------------------------------------------------------------------------
export function estimateSquareInches(size: Pizza["size"]): number {
  const diameter = PIZZA_DIAMETERS[size];
  const radius = diameter / 2;
  return Math.PI * radius * radius;
}

function getSquareInches(pizza: Pizza): number {
  return pizza.squareInches ?? estimateSquareInches(pizza.size);
}

// ---------------------------------------------------------------------------
// calculatePizzasNeeded
// Picks the single pizza with the lowest cost-per-square-inch, then calculates
// how many are needed to provide enough total area for the group.
// This ensures a small pizza slice isn't weighted the same as a large one.
// ---------------------------------------------------------------------------
export function calculatePizzasNeeded(
  groupSize: number,
  appetite: AppetiteLevel,
  pizzas: Pizza[]
): { pizza: Pizza; quantity: number }[] {
  if (pizzas.length === 0) return [];

  const totalAreaNeeded = groupSize * AREA_PER_PERSON[appetite];

  // Pick the pizza with the lowest cost per square inch
  const best = pizzas.reduce((prev, curr) => {
    const prevArea = getSquareInches(prev);
    const currArea = getSquareInches(curr);
    const prevCpsi = prevArea > 0 ? prev.price / prevArea : Infinity;
    const currCpsi = currArea > 0 ? curr.price / currArea : Infinity;
    return currCpsi < prevCpsi ? curr : prev;
  });

  const bestArea = getSquareInches(best);
  const quantity = bestArea > 0 ? Math.ceil(totalAreaNeeded / bestArea) : 1;
  return [{ pizza: best, quantity }];
}

// ---------------------------------------------------------------------------
// calculatePricePerPerson
// Sums up the cost of all pizzas ordered, applying any deal discounts, then
// divides by group size.
// ---------------------------------------------------------------------------
export function calculatePricePerPerson(
  pizzasNeeded: { pizza: Pizza; quantity: number }[],
  dealsApplied: Deal[],
  groupSize: number
): { totalCost: number; costPerPerson: number } {
  const subtotal = pizzasNeeded.reduce(
    (sum, { pizza, quantity }) => sum + pizza.price * quantity,
    0
  );

  // Deals are displayed for reference but don't override the pizza-based total.
  // Individual deal prices (e.g. "$3.99 carry-out special") apply to single
  // items, not to the whole order, so replacing the total would be incorrect.

  // Apply Ontario HST (13%)
  const totalCost = subtotal * (1 + TAX_RATE);

  const costPerPerson = groupSize > 0 ? totalCost / groupSize : 0;
  return { totalCost, costPerPerson };
}

// ---------------------------------------------------------------------------
// calculateValueScore
// Returns 0-100 composite score:
//   40% – price per square inch (inverted; lower is better)
//   20% – toppings included (more is better, capped at 5)
//   25% – active promo discount
//   15% – bundled extras (items included in deal beyond pizza)
// ---------------------------------------------------------------------------

// Reference bounds for price-per-sq-inch used to normalise the score.
// $0.05/sq-in is excellent; $0.30/sq-in is poor.
const PPSI_BEST = 0.05;
const PPSI_WORST = 0.30;

export function calculateValueScore(pizza: Pizza, activeDeal: Deal | null): number {
  const sqIn = getSquareInches(pizza);
  const ppsi = sqIn > 0 ? pizza.price / sqIn : PPSI_WORST;

  // 40% – price per square inch (higher raw score = cheaper per inch)
  const ppsiRaw = Math.max(0, Math.min(1, (PPSI_WORST - ppsi) / (PPSI_WORST - PPSI_BEST)));
  const ppsiScore = ppsiRaw * 40;

  // 20% – toppings included (0-5 mapped to 0-20)
  const toppingsRaw = Math.min(pizza.toppingsIncluded, 5) / 5;
  const toppingsScore = toppingsRaw * 20;

  // 25% – active promo discount
  let promoScore = 0;
  if (activeDeal !== null && activeDeal.price !== null && activeDeal.price < pizza.price) {
    const discountFraction = (pizza.price - activeDeal.price) / pizza.price;
    promoScore = Math.min(discountFraction, 1) * 25;
  }

  // 15% – bundled extras (items included beyond just "pizza", capped at 4)
  let extrasScore = 0;
  if (activeDeal !== null) {
    const extras = activeDeal.itemsIncluded.filter(
      (item) => !item.toLowerCase().includes("pizza")
    ).length;
    extrasScore = (Math.min(extras, 4) / 4) * 15;
  }

  const total = ppsiScore + toppingsScore + promoScore + extrasScore;
  return Math.max(0, Math.min(100, total));
}

// ---------------------------------------------------------------------------
// rankByPricePerPerson
// Returns ChainRecommendation[] sorted by costPerPerson ascending.
// ---------------------------------------------------------------------------
export function rankByPricePerPerson(
  chains: Chain[],
  pizzas: Pizza[],
  deals: Deal[],
  groupSize: number,
  appetite: AppetiteLevel
): ChainRecommendation[] {
  return buildRecommendations(chains, pizzas, deals, groupSize, appetite).sort(
    (a, b) => a.costPerPerson - b.costPerPerson
  );
}

// ---------------------------------------------------------------------------
// rankByValueScore
// Returns ChainRecommendation[] sorted by valueScore descending.
// ---------------------------------------------------------------------------
export function rankByValueScore(
  chains: Chain[],
  pizzas: Pizza[],
  deals: Deal[],
  groupSize: number,
  appetite: AppetiteLevel
): ChainRecommendation[] {
  return buildRecommendations(chains, pizzas, deals, groupSize, appetite).sort(
    (a, b) => b.valueScore - a.valueScore
  );
}

// ---------------------------------------------------------------------------
// Internal: build a ChainRecommendation for every chain that has at least
// one pizza in the provided list.
// ---------------------------------------------------------------------------
function buildRecommendations(
  chains: Chain[],
  pizzas: Pizza[],
  deals: Deal[],
  groupSize: number,
  appetite: AppetiteLevel
): ChainRecommendation[] {
  const recommendations: ChainRecommendation[] = [];

  for (const chain of chains) {
    const chainPizzas = pizzas.filter((p) => p.chainId === chain.id);
    if (chainPizzas.length === 0) continue;

    const chainDeals = deals.filter((d) => d.chainId === chain.id);

    const pizzasNeeded = calculatePizzasNeeded(groupSize, appetite, chainPizzas);
    const { totalCost, costPerPerson } = calculatePricePerPerson(
      pizzasNeeded,
      chainDeals,
      groupSize
    );

    // Best deal for the value score (lowest priced deal, or null)
    const activeDeal =
      chainDeals.length > 0
        ? chainDeals.reduce((best, d) => {
            if (d.price === null) return best;
            if (best === null) return d;
            return d.price < (best.price ?? Infinity) ? d : best;
          }, null as Deal | null)
        : null;

    // Value score based on the best pizza for this chain
    const bestPizza = pizzasNeeded[0]?.pizza ?? chainPizzas[0];
    const valueScore = calculateValueScore(bestPizza, activeDeal);

    // Only include deals that actually beat the best per-pizza price found.
    // A deal is "helpful" if its price per sq-inch of pizza area is lower than
    // the best pizza option, or if it's a bundle that covers enough people.
    const bestPizzaPricePerSqIn =
      bestPizza && getSquareInches(bestPizza) > 0
        ? bestPizza.price / getSquareInches(bestPizza)
        : Infinity;
    const helpfulDeals = chainDeals.filter((d) => {
      if (d.price === null) return false;
      // Only evaluate deals that have structured itemsIncluded data
      const pizzaItems = d.itemsIncluded.filter((i) =>
        i.toLowerCase().includes("pizza")
      );
      if (pizzaItems.length === 0) return false;
      const equivalentArea = pizzaItems.length * getSquareInches(bestPizza ?? chainPizzas[0]);
      const dealPricePerSqIn = equivalentArea > 0 ? d.price / equivalentArea : Infinity;
      return dealPricePerSqIn < bestPizzaPricePerSqIn;
    });

    recommendations.push({
      chain,
      totalCost,
      costPerPerson,
      pizzasNeeded,
      dealsApplied: helpfulDeals,
      valueScore,
    });
  }

  return recommendations;
}
