import type { ElementInfo } from "@/types/molecule";

/**
 * CPK colour table and display radii for every element used by the library.
 *
 * Colours follow the standard CPK convention (Corey–Pauling–Koltun) with the
 * common Jmol refinements for carbon and hydrogen. Radii are display radii in
 * Ångströms, not covalent or van der Waals radii, and are tuned so that bonded
 * spheres read clearly without overlapping.
 */
export const ELEMENTS: Record<string, ElementInfo> = {
  H: { symbol: "H", name: "Hydrogen", color: "#ffffff", radius: 0.3 },
  Be: { symbol: "Be", name: "Beryllium", color: "#c2ff00", radius: 0.55 },
  B: { symbol: "B", name: "Boron", color: "#ffb5b5", radius: 0.6 },
  C: { symbol: "C", name: "Carbon", color: "#909090", radius: 0.68 },
  N: { symbol: "N", name: "Nitrogen", color: "#3050f8", radius: 0.64 },
  O: { symbol: "O", name: "Oxygen", color: "#ff0d0d", radius: 0.62 },
  F: { symbol: "F", name: "Fluorine", color: "#90e050", radius: 0.56 },
  P: { symbol: "P", name: "Phosphorus", color: "#ff8000", radius: 0.78 },
  S: { symbol: "S", name: "Sulfur", color: "#ffff30", radius: 0.78 },
  Cl: { symbol: "Cl", name: "Chlorine", color: "#1ff01f", radius: 0.74 },
  Br: { symbol: "Br", name: "Bromine", color: "#a62929", radius: 0.82 },
  Xe: { symbol: "Xe", name: "Xenon", color: "#429eb0", radius: 0.88 },
};

/** Fallback used when an element is missing from the table. */
export const UNKNOWN_ELEMENT: ElementInfo = {
  symbol: "?",
  name: "Unknown",
  color: "#a1a1aa",
  radius: 0.6,
};

/** Look up element metadata by symbol, falling back to a neutral entry. */
export function getElement(symbol: string): ElementInfo {
  return ELEMENTS[symbol] ?? UNKNOWN_ELEMENT;
}
