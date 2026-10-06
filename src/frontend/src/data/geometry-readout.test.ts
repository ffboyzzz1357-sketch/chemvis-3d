import { describe, expect, it } from "vitest";

import { getMoleculeById } from "@/data/molecules";

/**
 * The accepted geometry-readout semantics: the real, repelled shape is the
 * primary readout and the idealised no-lone-pair shape is shown alongside it.
 * These are the exact molecule/geometry pairs named in the acceptance criteria,
 * so a data regression fails here rather than only in the UI.
 */
const CASES: Array<{
  id: string;
  name: string;
  molecular: string;
  idealized: string;
  lonePairs: number;
}> = [
  {
    id: "h2o",
    name: "Water",
    molecular: "Bent",
    idealized: "Tetrahedral",
    lonePairs: 2,
  },
  {
    id: "nh3",
    name: "Ammonia",
    molecular: "Trigonal Pyramidal",
    idealized: "Tetrahedral",
    lonePairs: 1,
  },
  {
    id: "sf4",
    name: "Sulfur Tetrafluoride",
    molecular: "Seesaw",
    idealized: "Trigonal Bipyramidal",
    lonePairs: 1,
  },
  {
    id: "clf3",
    name: "Chlorine Trifluoride",
    molecular: "T-shaped",
    idealized: "Trigonal Bipyramidal",
    lonePairs: 2,
  },
  {
    id: "brf5",
    name: "Bromine Pentafluoride",
    molecular: "Square Pyramidal",
    idealized: "Octahedral",
    lonePairs: 1,
  },
  {
    id: "xef4",
    name: "Xenon Tetrafluoride",
    molecular: "Square Planar",
    idealized: "Octahedral",
    lonePairs: 2,
  },
];

describe("geometry readout semantics", () => {
  for (const entry of CASES) {
    it(`reads ${entry.name} as ${entry.molecular} over ${entry.idealized}`, () => {
      const molecule = getMoleculeById(entry.id);
      expect(molecule, entry.id).toBeDefined();
      expect(molecule?.name).toBe(entry.name);
      expect(molecule?.molecularGeometry).toBe(entry.molecular);
      expect(molecule?.idealizedGeometry).toBe(entry.idealized);
      expect(molecule?.lonePairs).toBe(entry.lonePairs);
      // The idealised shape is the electron-domain geometry for these cases.
      expect(molecule?.idealizedGeometry).toBe(molecule?.electronGeometry);
    });
  }

  it("gives every molecule a non-empty shape note explaining the difference", () => {
    for (const entry of CASES) {
      const molecule = getMoleculeById(entry.id);
      expect(molecule?.shapeNote.length, entry.id).toBeGreaterThan(0);
    }
  });

  it("draws a lone-pair marker for every lone pair on the central atom", () => {
    for (const entry of CASES) {
      const molecule = getMoleculeById(entry.id);
      expect(molecule?.lonePairMarkers.length, entry.id).toBe(entry.lonePairs);
    }
  });

  it("keeps the idealised shape equal to the real shape when there are no lone pairs", () => {
    for (const id of ["ch4", "becl2", "sf6", "pcl5"]) {
      const molecule = getMoleculeById(id);
      expect(molecule?.lonePairs, id).toBe(0);
      expect(molecule?.idealizedGeometry, id).toBe(molecule?.molecularGeometry);
    }
  });
});
