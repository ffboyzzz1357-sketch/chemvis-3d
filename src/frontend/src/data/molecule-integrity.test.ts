import { describe, expect, it } from "vitest";

import { MOLECULES } from "@/data/molecules";

/**
 * Structural integrity of the static molecule library. The 3D renderer walks
 * bonds, lone-pair markers, and bond-angle triplets by atom id, so a dangling
 * reference silently drops geometry. These invariants are independent of the
 * React layout and must hold across the UI redesign.
 */
describe("molecule library integrity", () => {
  it("ships the documented 26-molecule dataset with unique ids", () => {
    expect(MOLECULES).toHaveLength(26);
    const ids = MOLECULES.map((m) => m.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("gives every molecule the metadata the details readouts render", () => {
    for (const molecule of MOLECULES) {
      expect(molecule.name.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.formula.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.formulaPlain.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.hybridization.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.vsepr.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.electronGeometry.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.molecularGeometry.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.description.length, molecule.id).toBeGreaterThan(0);
      expect(molecule.bondingPairs, molecule.id).toBeGreaterThanOrEqual(0);
      expect(molecule.lonePairs, molecule.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("has at least one atom and a central atom for every molecule", () => {
    for (const molecule of MOLECULES) {
      expect(molecule.atoms.length, molecule.id).toBeGreaterThan(0);
      expect(
        molecule.atoms.some((atom) => atom.isCentral),
        `${molecule.id} has no central atom`,
      ).toBe(true);
    }
  });

  it("references only existing atoms from bonds, lone pairs, and angles", () => {
    for (const molecule of MOLECULES) {
      const atomIds = new Set(molecule.atoms.map((atom) => atom.id));
      for (const bond of molecule.bonds) {
        expect(
          atomIds.has(bond.from),
          `${molecule.id} bond.from ${bond.from}`,
        ).toBe(true);
        expect(atomIds.has(bond.to), `${molecule.id} bond.to ${bond.to}`).toBe(
          true,
        );
      }
      for (const marker of molecule.lonePairMarkers) {
        expect(
          atomIds.has(marker.atomId),
          `${molecule.id} lone pair on ${marker.atomId}`,
        ).toBe(true);
      }
      for (const angle of molecule.bondAngles) {
        for (const id of [angle.a, angle.b, angle.c]) {
          expect(atomIds.has(id), `${molecule.id} angle atom ${id}`).toBe(true);
        }
      }
    }
  });

  it("uses only valid bond orders and finite atom coordinates", () => {
    for (const molecule of MOLECULES) {
      for (const bond of molecule.bonds) {
        expect([1, 2, 3], `${molecule.id} bond order`).toContain(bond.order);
      }
      for (const atom of molecule.atoms) {
        for (const coordinate of atom.position) {
          expect(Number.isFinite(coordinate), `${molecule.id} ${atom.id}`).toBe(
            true,
          );
        }
      }
    }
  });
});
