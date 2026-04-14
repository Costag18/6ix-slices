import { describe, it, expect } from "vitest";
import { parsePizzaioloHtml } from "@/lib/scrapers/pizzaiolo";

const mockHtml = `
<div class="pizza-select col-12 col-md-6 col-lg-4 product_display pizza_preset" data-pizza-category-id="1">
  <div class="pizza-card pizza_card_gourmet-meat-pizzas">
    <div class="card-data">
      <div class="quantity-card-wrapper">
        <div class="quantity-card-title">
          <h2 class="card-title">The Godfather</h2>
        </div>
      </div>
      <div class="price_difference_list">
        <ul class="category_pizza_sizes">
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="0" name="category_pizza_size_upgrade_0" type="radio" value="medium" /><label for="category_pizza_size_upgrade_0_medium">Medium (8 slices)</label></div></span>
            <span class="right">$16.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input checked="" class="category_size_upgrade_btn" data-pizza-id="0" name="category_pizza_size_upgrade_0" type="radio" value="large" /><label for="category_pizza_size_upgrade_0_large">Large (10 slices)</label></div></span>
            <span class="right">$21.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="0" name="category_pizza_size_upgrade_0" type="radio" value="xlarge" /><label for="category_pizza_size_upgrade_0_xlarge">XLarge (12 slices)</label></div></span>
            <span class="right">$26.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="0" name="category_pizza_size_upgrade_0" type="radio" value="party" /><label for="category_pizza_size_upgrade_0_party">Party (24 slices)</label></div></span>
            <span class="right">$39.99</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
<div class="pizza-select col-12 col-md-6 col-lg-4 product_display pizza_preset" data-pizza-category-id="1">
  <div class="pizza-card pizza_card_gourmet-meat-pizzas">
    <div class="card-data">
      <div class="quantity-card-wrapper">
        <div class="quantity-card-title">
          <h2 class="card-title">Margherita</h2>
        </div>
      </div>
      <div class="price_difference_list">
        <ul class="category_pizza_sizes">
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="1" name="category_pizza_size_upgrade_1" type="radio" value="medium" /><label for="category_pizza_size_upgrade_1_medium">Medium (8 slices)</label></div></span>
            <span class="right">$15.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input checked="" class="category_size_upgrade_btn" data-pizza-id="1" name="category_pizza_size_upgrade_1" type="radio" value="large" /><label for="category_pizza_size_upgrade_1_large">Large (10 slices)</label></div></span>
            <span class="right">$20.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="1" name="category_pizza_size_upgrade_1" type="radio" value="xlarge" /><label for="category_pizza_size_upgrade_1_xlarge">XLarge (12 slices)</label></div></span>
            <span class="right">$25.99</span>
          </li>
          <li>
            <span class="left"><div class="radio"><input class="category_size_upgrade_btn" data-pizza-id="1" name="category_pizza_size_upgrade_1" type="radio" value="party" /><label for="category_pizza_size_upgrade_1_party">Party (24 slices)</label></div></span>
            <span class="right">$38.99</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</div>
`;

describe("parsePizzaioloHtml", () => {
  it("extracts pizzas with prices from static HTML", () => {
    const { pizzas } = parsePizzaioloHtml(mockHtml);
    expect(pizzas.length).toBe(8);
    expect(pizzas[0].chainId).toBe("pizzaiolo");
  });

  it("parses prices correctly", () => {
    const { pizzas } = parsePizzaioloHtml(mockHtml);
    const godfather = pizzas.find(
      (p) => p.name === "The Godfather" && p.size === "large"
    );
    expect(godfather?.price).toBe(21.99);
  });

  it("extracts slices from label text", () => {
    const { pizzas } = parsePizzaioloHtml(mockHtml);
    const partyGodfather = pizzas.find(
      (p) => p.name === "The Godfather" && p.size === "party"
    );
    expect(partyGodfather?.slices).toBe(24);
  });

  it("assigns all IDs as pizzaiolo", () => {
    const { pizzas } = parsePizzaioloHtml(mockHtml);
    expect(pizzas.every((p) => p.chainId === "pizzaiolo")).toBe(true);
  });
});
