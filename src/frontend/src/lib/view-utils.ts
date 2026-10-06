import type { Atom, Molecule } from "@/types/molecule";

/** Largest distance from the origin to any atom, used to frame the camera. */
export function moleculeRadius(molecule: Molecule): number {
  let max = 0;
  for (const atom of molecule.atoms) {
    const [x, y, z] = atom.position;
    max = Math.max(max, Math.hypot(x, y, z));
  }
  return max || 1;
}

/** Camera distance that comfortably frames a molecule of the given radius. */
export function framingDistance(molecule: Molecule): number {
  return Math.max(4.5, moleculeRadius(molecule) * 3.1);
}

/** Look up an atom by id within a molecule. */
export function findAtom(molecule: Molecule, id: string): Atom | undefined {
  return molecule.atoms.find((atom) => atom.id === id);
}

/** Midpoint between two positions. */
export function midpoint(
  a: [number, number, number],
  b: [number, number, number],
): [number, number, number] {
  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
}

/** Distance between two positions. */
export function distance(
  a: [number, number, number],
  b: [number, number, number],
): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}

/**
 * Unit direction from `from` to `to`, plus the length. Returns a stable
 * fallback direction when the two points coincide.
 */
export function directionBetween(
  from: [number, number, number],
  to: [number, number, number],
): { direction: [number, number, number]; length: number } {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const length = Math.hypot(dx, dy, dz);
  if (length === 0) return { direction: [0, 1, 0], length: 0 };
  return { direction: [dx / length, dy / length, dz / length], length };
}

/** Convert a hex colour string to an [r, g, b] tuple in 0..1 for three.js. */
export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = Number.parseInt(clean, 16);
  return [
    ((value >> 16) & 255) / 255,
    ((value >> 8) & 255) / 255,
    (value & 255) / 255,
  ];
}
