import { describe, expect, it } from "vitest";

import { getMoleculeById } from "@/data/molecules";
import type { Atom, Molecule } from "@/types/molecule";

/**
 * Geometry characterization for molecules whose shapes are already correct and
 * must survive the requested PCl5/SF4/ClF3/BrF5 coordinate fix and the benzene
 * ball-sizing change.
 *
 * The assertions are deliberately frame-independent — bond angles, coplanarity,
 * and equal bond lengths rather than literal x/y/z values — so a fix that
 * re-expresses coordinates in a different axis convention still passes as long
 * as the molecular shape is unchanged. The known-wrong PCl5/SF4/ClF3/BrF5
 * coordinates and the current benzene ball size are intentionally NOT frozen
 * here.
 */

type Vec3 = [number, number, number];

function sub(a: Vec3, b: Vec3): Vec3 {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dot(a: Vec3, b: Vec3): number {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

function length(a: Vec3): number {
  return Math.hypot(a[0], a[1], a[2]);
}

/** Angle in degrees at vertex `b` between the rays b→a and b→c. */
function angleAt(a: Vec3, b: Vec3, c: Vec3): number {
  const u = sub(a, b);
  const v = sub(c, b);
  const denom = length(u) * length(v);
  if (denom === 0) return Number.NaN;
  const cosine = Math.min(1, Math.max(-1, dot(u, v) / denom));
  return (Math.acos(cosine) * 180) / Math.PI;
}

/** True when every point lies in a single plane (scalar triple product ≈ 0). */
function areCoplanar(points: Vec3[]): boolean {
  if (points.length < 4) return true;
  const [p0, p1, p2] = points;
  const normal = cross(sub(p1, p0), sub(p2, p0));
  if (length(normal) === 0) return true;
  return points.every((p) => Math.abs(dot(normal, sub(p, p0))) < 1e-6);
}

function atom(molecule: Molecule, id: string): Atom {
  const found = molecule.atoms.find((a) => a.id === id);
  if (!found) throw new Error(`${molecule.id} is missing atom ${id}`);
  return found;
}

function pos(molecule: Molecule, id: string): Vec3 {
  return atom(molecule, id).position;
}

function requireMolecule(id: string): Molecule {
  const molecule = getMoleculeById(id);
  if (!molecule) throw new Error(`missing molecule ${id}`);
  return molecule;
}

describe("unchanged molecule geometry", () => {
  it("keeps BeCl2 linear with a 180° Cl–Be–Cl angle", () => {
    const becl2 = requireMolecule("becl2");
    const angle = angleAt(pos(becl2, "a1"), pos(becl2, "c"), pos(becl2, "a2"));
    expect(angle).toBeCloseTo(180, 1);
  });

  it("keeps CO2 linear with a 180° O=C=O angle", () => {
    const co2 = requireMolecule("co2");
    const angle = angleAt(pos(co2, "a1"), pos(co2, "c"), pos(co2, "a2"));
    expect(angle).toBeCloseTo(180, 1);
  });

  it("keeps BF3 trigonal planar: coplanar, equidistant, 120° apart", () => {
    const bf3 = requireMolecule("bf3");
    const centre = pos(bf3, "c");
    const outer = ["a1", "a2", "a3"].map((id) => pos(bf3, id));
    expect(areCoplanar([centre, ...outer])).toBe(true);

    const distances = outer.map((p) => length(sub(p, centre)));
    for (const d of distances) expect(d).toBeCloseTo(distances[0], 3);

    expect(angleAt(outer[0], centre, outer[1])).toBeCloseTo(120, 1);
    expect(angleAt(outer[1], centre, outer[2])).toBeCloseTo(120, 1);
    expect(angleAt(outer[2], centre, outer[0])).toBeCloseTo(120, 1);
  });

  it("keeps SF6 octahedral: six equal bonds at 90° or 180°", () => {
    const sf6 = requireMolecule("sf6");
    const centre = pos(sf6, "c");
    const outer = ["a1", "a2", "a3", "a4", "a5", "a6"].map((id) =>
      pos(sf6, id),
    );

    const distances = outer.map((p) => length(sub(p, centre)));
    for (const d of distances) expect(d).toBeCloseTo(distances[0], 3);

    for (let i = 0; i < outer.length; i += 1) {
      for (let j = i + 1; j < outer.length; j += 1) {
        const angle = angleAt(outer[i], centre, outer[j]);
        const isRightOrStraight =
          Math.abs(angle - 90) < 0.5 || Math.abs(angle - 180) < 0.5;
        expect(isRightOrStraight, `F–S–F angle ${angle}`).toBe(true);
      }
    }
  });

  it("keeps XeF4 square planar: coplanar, equidistant, 90° apart", () => {
    const xef4 = requireMolecule("xef4");
    const centre = pos(xef4, "c");
    const outer = ["a1", "a2", "a3", "a4"].map((id) => pos(xef4, id));
    expect(areCoplanar([centre, ...outer])).toBe(true);

    const distances = outer.map((p) => length(sub(p, centre)));
    for (const d of distances) expect(d).toBeCloseTo(distances[0], 3);

    for (let i = 0; i < outer.length; i += 1) {
      const next = outer[(i + 1) % outer.length];
      expect(angleAt(outer[i], centre, next)).toBeCloseTo(90, 1);
    }
  });
});

describe("benzene ring structure (independent of ball sizing)", () => {
  const benzene = requireMolecule("benzene");

  it("keeps six carbons and six hydrogens", () => {
    expect(benzene.atoms.filter((a) => a.element === "C")).toHaveLength(6);
    expect(benzene.atoms.filter((a) => a.element === "H")).toHaveLength(6);
  });

  it("keeps the six carbons coplanar in a closed ring", () => {
    const carbons = ["c1", "c2", "c3", "c4", "c5", "c6"].map((id) =>
      pos(benzene, id),
    );
    expect(areCoplanar(carbons)).toBe(true);

    // Each carbon is bonded to its two ring neighbours, closing the loop.
    for (let i = 0; i < 6; i += 1) {
      const current = `c${i + 1}`;
      const next = `c${((i + 1) % 6) + 1}`;
      const bonded = benzene.bonds.some(
        (b) =>
          (b.from === current && b.to === next) ||
          (b.from === next && b.to === current),
      );
      expect(bonded, `${current}–${next} ring bond`).toBe(true);
    }
  });

  it("keeps 120° C–C–C ring angles and alternating double bonds", () => {
    for (let i = 0; i < 6; i += 1) {
      const prev = `c${((i + 5) % 6) + 1}`;
      const current = `c${i + 1}`;
      const next = `c${((i + 1) % 6) + 1}`;
      expect(
        angleAt(pos(benzene, prev), pos(benzene, current), pos(benzene, next)),
      ).toBeCloseTo(120, 1);
    }

    const ringOrders = benzene.bonds
      .filter((b) => b.from.startsWith("c") && b.to.startsWith("c"))
      .map((b) => b.order);
    expect(ringOrders.filter((o) => o === 2)).toHaveLength(3);
    expect(ringOrders.filter((o) => o === 1)).toHaveLength(3);
  });

  it("keeps one C–H bond per ring carbon", () => {
    for (let i = 1; i <= 6; i += 1) {
      const carbon = `c${i}`;
      const hydrogen = `h${i}`;
      const bonded = benzene.bonds.some(
        (b) =>
          (b.from === carbon && b.to === hydrogen) ||
          (b.from === hydrogen && b.to === carbon),
      );
      expect(bonded, `${carbon}–${hydrogen} bond`).toBe(true);
    }
  });
});

describe("PCl5 metadata (independent of the coordinate fix)", () => {
  const pcl5 = requireMolecule("pcl5");

  it("keeps one central phosphorus and five chlorines", () => {
    expect(pcl5.atoms.filter((a) => a.element === "P")).toHaveLength(1);
    expect(pcl5.atoms.filter((a) => a.element === "Cl")).toHaveLength(5);
    expect(pcl5.atoms.filter((a) => a.isCentral)).toHaveLength(1);
    expect(atom(pcl5, "c").element).toBe("P");
  });

  it("keeps five P–Cl bonds and the trigonal bipyramidal readout", () => {
    expect(pcl5.bonds).toHaveLength(5);
    expect(pcl5.vsepr).toBe("AX₅");
    expect(pcl5.molecularGeometry).toBe("Trigonal Bipyramidal");
    expect(pcl5.electronGeometry).toBe("Trigonal Bipyramidal");
    expect(pcl5.bondingPairs).toBe(5);
    expect(pcl5.lonePairs).toBe(0);
  });
});
