import { describe, expect, it } from "vitest";

import {
  CATEGORY_LABELS,
  MOLECULES,
  getElementsForMolecule,
  getMoleculeById,
  searchMolecules,
} from "@/data/molecules";

/**
 * Library data contract: the search index and the molecule metadata the
 * details sheet renders. These are the values the acceptance criteria name
 * explicitly, so a data regression fails here rather than only in the UI.
 */
describe("molecule library data", () => {
  it("groups every molecule under one of the three categories", () => {
    const categories = new Set(MOLECULES.map((m) => m.category));
    expect([...categories].sort()).toEqual(["inorganic", "organic", "vsepr"]);
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual([
      "inorganic",
      "organic",
      "vsepr",
    ]);
  });

  it("finds Water by name and exposes its VSEPR readout", () => {
    const results = searchMolecules("water");
    const water = results.find((m) => m.name === "Water");
    expect(water).toBeDefined();
    expect(water?.formula).toBe("H₂O");
    expect(water?.hybridization).toBe("sp³");
    expect(water?.vsepr).toBe("AX₂E₂");
    expect(water?.electronGeometry).toBe("Tetrahedral");
    expect(water?.molecularGeometry).toBe("Bent");
    expect(water?.bondingPairs).toBe(2);
    expect(water?.lonePairs).toBe(2);
    expect(water?.bondAngles).toEqual([
      expect.objectContaining({ ideal: 104.5, label: "H–O–H" }),
    ]);
  });

  it("finds Methane by its plain formula CH4", () => {
    const methane = searchMolecules("CH4").find((m) => m.name === "Methane");
    expect(methane).toBeDefined();
    expect(methane?.formula).toBe("CH₄");
    expect(methane?.hybridization).toBe("sp³");
    expect(methane?.vsepr).toBe("AX₄");
    expect(methane?.molecularGeometry).toBe("Tetrahedral");
    expect(methane?.bondingPairs).toBe(4);
    expect(methane?.lonePairs).toBe(0);
  });

  it("finds Sulfur Hexafluoride by SF6 with 90° and 180° angles", () => {
    const sf6 = searchMolecules("SF6").find(
      (m) => m.name === "Sulfur Hexafluoride",
    );
    expect(sf6).toBeDefined();
    expect(sf6?.hybridization).toBe("sp³d²");
    expect(sf6?.vsepr).toBe("AX₆");
    expect(sf6?.molecularGeometry).toBe("Octahedral");
    const ideals = sf6?.bondAngles.map((a) => a.ideal) ?? [];
    expect(ideals).toContain(90);
    expect(ideals).toContain(180);
  });

  it("matches case-insensitively across name and formula", () => {
    expect(searchMolecules("WATER").some((m) => m.name === "Water")).toBe(true);
    expect(searchMolecules("h2o").some((m) => m.name === "Water")).toBe(true);
    expect(searchMolecules("ch4").some((m) => m.name === "Methane")).toBe(true);
  });

  it("ignores surrounding whitespace in the query", () => {
    expect(searchMolecules("  water  ")).toEqual(searchMolecules("water"));
  });

  it("returns no matches for a nonsense query", () => {
    expect(searchMolecules("zzz")).toEqual([]);
  });

  it("returns the whole library for an empty query", () => {
    expect(searchMolecules("")).toHaveLength(MOLECULES.length);
  });

  it("resolves a molecule by id and falls back to undefined", () => {
    expect(getMoleculeById("h2o")?.name).toBe("Water");
    expect(getMoleculeById("does-not-exist")).toBeUndefined();
  });

  it("lists unique CPK elements present in a molecule", () => {
    const water = getMoleculeById("h2o");
    expect(water).toBeDefined();
    const symbols = getElementsForMolecule(water!).map((e) => e.symbol);
    expect(symbols.sort()).toEqual(["H", "O"]);
  });
});
