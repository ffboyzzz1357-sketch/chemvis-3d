import { describe, expect, it } from "vitest";

import { getMoleculeById } from "@/data/molecules";
import {
  directionBetween,
  distance,
  findAtom,
  framingDistance,
  hexToRgb,
  midpoint,
  moleculeRadius,
} from "@/lib/view-utils";

/**
 * Pure geometry and framing helpers that drive the 3D viewport. They are
 * independent of the React layout, so they are characterized directly to keep
 * the camera framing and bond/label math stable across UI changes.
 */
const water = getMoleculeById("h2o")!;
const sf6 = getMoleculeById("sf6")!;

describe("view-utils", () => {
  it("measures the largest atom distance from the origin", () => {
    // Water's hydrogens sit ~0.96 Å from the central oxygen at the origin.
    expect(moleculeRadius(water)).toBeCloseTo(0.96, 2);
    // SF6's fluorines sit 1.56 Å out along each axis.
    expect(moleculeRadius(sf6)).toBeCloseTo(1.56, 2);
  });

  it("never returns a zero radius for a degenerate molecule", () => {
    const single: typeof water = {
      ...water,
      atoms: [{ id: "c", element: "O", position: [0, 0, 0] }],
    };
    expect(moleculeRadius(single)).toBe(1);
  });

  it("frames the camera at least 4.5 units out", () => {
    expect(framingDistance(water)).toBeGreaterThanOrEqual(4.5);
    expect(framingDistance(sf6)).toBeCloseTo(1.56 * 3.1, 2);
  });

  it("finds an atom by id and returns undefined for a miss", () => {
    expect(findAtom(water, "c")?.element).toBe("O");
    expect(findAtom(water, "nope")).toBeUndefined();
  });

  it("computes midpoints and distances", () => {
    expect(midpoint([0, 0, 0], [2, 4, 6])).toEqual([1, 2, 3]);
    expect(distance([0, 0, 0], [3, 4, 0])).toBe(5);
  });

  it("returns a unit direction and length between two points", () => {
    const { direction, length } = directionBetween([0, 0, 0], [0, 3, 0]);
    expect(length).toBe(3);
    expect(direction).toEqual([0, 1, 0]);
  });

  it("falls back to a stable direction for coincident points", () => {
    const { direction, length } = directionBetween([1, 1, 1], [1, 1, 1]);
    expect(length).toBe(0);
    expect(direction).toEqual([0, 1, 0]);
  });

  it("converts a CPK hex colour to normalized rgb", () => {
    expect(hexToRgb("#ffffff")).toEqual([1, 1, 1]);
    expect(hexToRgb("#000000")).toEqual([0, 0, 0]);
    expect(hexToRgb("#ff0000")).toEqual([1, 0, 0]);
  });
});
