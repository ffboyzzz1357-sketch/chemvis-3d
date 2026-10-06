/**
 * Domain types for the 3D molecule viewer.
 *
 * Coordinates are expressed in Ångströms (Å) in a right-handed Cartesian
 * frame. The central atom of every molecule is placed at the origin unless a
 * molecule has no single obvious centre (e.g. ethane), in which case the
 * geometry is still centred near the origin for pleasant framing.
 */

export type MoleculeCategory = "vsepr" | "organic" | "inorganic";

export interface Atom {
  /** Stable identifier, unique within a molecule. */
  id: string;
  /** Element symbol, e.g. "C", "Cl". */
  element: string;
  /** Cartesian position in Ångströms. */
  position: [number, number, number];
  /** True for the atom the geometry is described around. */
  isCentral?: boolean;
}

export interface Bond {
  /** Atom id of the first atom. */
  from: string;
  /** Atom id of the second atom. */
  to: string;
  /** 1 = single, 2 = double, 3 = triple. */
  order: 1 | 2 | 3;
}

export interface ElementInfo {
  /** Element symbol, e.g. "C". */
  symbol: string;
  /** Human readable element name, e.g. "Carbon". */
  name: string;
  /** CPK colour as a hex string. */
  color: string;
  /** Display radius in Ångströms, used for rendering spheres. */
  radius: number;
}

export interface BondAngle {
  /** Atom id of the first outer atom. */
  a: string;
  /** Atom id of the vertex (central) atom. */
  b: string;
  /** Atom id of the second outer atom. */
  c: string;
  /** Ideal angle in degrees. */
  ideal: number;
  /** Optional short label, e.g. "H–O–H". */
  label?: string;
}

export interface LonePair {
  /** Atom id of the atom carrying the lone pair (usually the central atom). */
  atomId: string;
  /**
   * Unit direction vector pointing away from the atom, in the same Cartesian
   * frame as the atom coordinates.
   */
  direction: [number, number, number];
  /** Optional short label, e.g. "O lone pair". */
  label?: string;
}

export interface Molecule {
  /** Stable identifier, e.g. "ch4". */
  id: string;
  /** Display name, e.g. "Methane". */
  name: string;
  /** Chemical formula, e.g. "CH₄". */
  formula: string;
  /** Plain ASCII formula for search, e.g. "CH4". */
  formulaPlain: string;
  /** Library grouping. */
  category: MoleculeCategory;
  /** Atoms with 3D coordinates. */
  atoms: Atom[];
  /** Bonds between atoms. */
  bonds: Bond[];
  /** Hybridisation of the central atom, e.g. "sp³". */
  hybridization: string;
  /** VSEPR notation, e.g. "AX₄". */
  vsepr: string;
  /** Number of bonding electron domains on the central atom. */
  bondingPairs: number;
  /** Number of lone pairs on the central atom. */
  lonePairs: number;
  /** Electron-domain geometry name, e.g. "Tetrahedral". */
  electronGeometry: string;
  /** Molecular geometry name, e.g. "Tetrahedral". */
  molecularGeometry: string;
  /**
   * The geometry the same electron domains would adopt if every lone pair were
   * a bonding pair, e.g. "Tetrahedral" for water. Equal to
   * `molecularGeometry` when the central atom has no lone pairs.
   */
  idealizedGeometry: string;
  /**
   * Plain-language explanation of why the real shape differs from the
   * idealised one, e.g. "Two lone pairs compress the H–O–H angle from 109.5°
   * to 104.5°." For molecules with no lone pairs this states that the shape is
   * unchanged.
   */
  shapeNote: string;
  /** Short description of the molecule and its shape. */
  description: string;
  /** Bond-angle triplets to measure in the overlay. */
  bondAngles: BondAngle[];
  /** Lone-pair direction vectors for the overlay. */
  lonePairMarkers: LonePair[];
}
