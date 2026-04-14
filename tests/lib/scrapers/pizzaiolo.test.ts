import { describe, it, expect } from "vitest";
import { parsePizzaioloHtml } from "@/lib/scrapers/pizzaiolo";

const mockHtml = `
<div class="product-card">
  <h3 class="product-name">The Godfather</h3>
  <p class="product-description">Pepperoni, Italian sausage, mushrooms</p>
  <div class="product-prices">
    <span class="price" data-size="Medium">$16.99</span>
    <span class="price" data-size="Large">$21.99</span>
    <span class="price" data-size="XLarge">$26.99</span>
    <span class="price" data-size="Party">$39.99</span>
  </div>
</div>
<div class="product-card">
  <h3 class="product-name">Margherita</h3>
  <p class="product-description">Fresh mozzarella, tomato, basil</p>
  <div class="product-prices">
    <span class="price" data-size="Medium">$15.99</span>
    <span class="price" data-size="Large">$20.99</span>
    <span class="price" data-size="XLarge">$25.99</span>
    <span class="price" data-size="Party">$38.99</span>
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

  it("assigns all IDs as pizzaiolo", () => {
    const { pizzas } = parsePizzaioloHtml(mockHtml);
    expect(pizzas.every((p) => p.chainId === "pizzaiolo")).toBe(true);
  });
});
