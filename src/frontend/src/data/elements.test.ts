import { describe, expect, it } from "vitest";

import { ELEMENTS, UNKNOWN_ELEMENT, getElement } from "@/data/elements";
import { MOLECULES } from "@/data/molecules";

/**
 * CPK colour table contract. The 3D renderer reads these hex colours and
 * display radii directly, so a regression here changes every rendered atom.
 * This is layout-independent and must survive the UI redesign.
 */
describe("element CPK table", () => {
  it("exposes a hex colour and positive radius for every entry", () => {
    for (const [symbol, element] of Object.entries(ELEMENTS)) {
      expect(element.symbol).toBe(symbol);
      expect(element.name.length).toBeGreaterThan(0);
      expect(element.color).toMatch(/^#[0-9a-f]{6}$/i);
      expect(element.radius).toBeGreaterThan(0);
    }
  });

  it("covers every element used by the molecule library", () => {
    const used = new Set<string>();
    for (const molecule of MOLECULES) {
      for (const atom of molecule.atoms) used.add(atom.element);
    }
    for (const symbol of used) {
      expect(ELEMENTS[symbol], `missing CPK entry for ${symbol}`).toBeDefined();
    }
  });

  it("resolves a known element by symbol", () => {
    expect(getElement("O")).toEqual({
      symbol: "O",
      name: "Oxygen",
      color: "#ff0d0d",
      radius: 0.62,
    });
  });

  it("falls back to the neutral unknown entry for an unlisted symbol", () => {
    expect(getElement("Zz")).toBe(UNKNOWN_ELEMENT);
  });
});
