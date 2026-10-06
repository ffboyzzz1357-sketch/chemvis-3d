import { getElement } from "@/data/elements";
import type {
  Atom,
  Bond,
  ElementInfo,
  Molecule,
  MoleculeCategory,
} from "@/types/molecule";

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                    */
/* ------------------------------------------------------------------ */

function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/** Position at a given distance and polar/azimuthal angle (degrees). */
function polar(
  distance: number,
  thetaDeg: number,
  phiDeg: number,
): [number, number, number] {
  const theta = (thetaDeg * Math.PI) / 180;
  const phi = (phiDeg * Math.PI) / 180;
  return [
    round(distance * Math.sin(theta) * Math.cos(phi)),
    round(distance * Math.cos(theta)),
    round(distance * Math.sin(theta) * Math.sin(phi)),
  ];
}

/** Position in the xy-plane at a given distance and angle (degrees). */
function planar(distance: number, angleDeg: number): [number, number, number] {
  const angle = (angleDeg * Math.PI) / 180;
  return [
    round(distance * Math.cos(angle)),
    round(distance * Math.sin(angle)),
    0,
  ];
}

/**
 * Position in the xz-plane at a given distance and angle (degrees).
 * Used for equatorial atoms of trigonal-bipyramidal and square-pyramidal
 * molecules whose axial atoms lie along the y-axis.
 */
function planarXZ(
  distance: number,
  angleDeg: number,
): [number, number, number] {
  const angle = (angleDeg * Math.PI) / 180;
  return [
    round(distance * Math.cos(angle)),
    0,
    round(distance * Math.sin(angle)),
  ];
}

/** Build a central atom plus a set of outer atoms at given positions. */
function centralWith(
  centralElement: string,
  outer: Array<{ element: string; position: [number, number, number] }>,
): Atom[] {
  const atoms: Atom[] = [
    { id: "c", element: centralElement, position: [0, 0, 0], isCentral: true },
  ];
  outer.forEach((atom, index) => {
    atoms.push({
      id: `a${index + 1}`,
      element: atom.element,
      position: atom.position,
    });
  });
  return atoms;
}

/** Star bonds from the central atom "c" to every outer atom. */
function starBonds(count: number, order: 1 | 2 | 3 = 1): Bond[] {
  return Array.from({ length: count }, (_, index) => ({
    from: "c",
    to: `a${index + 1}`,
    order,
  }));
}

/** Bond-angle triplets between consecutive outer atoms around the centre. */
function starAngles(
  count: number,
  ideal: number,
  label?: string,
): Molecule["bondAngles"] {
  return Array.from({ length: count }, (_, index) => ({
    a: `a${index + 1}`,
    b: "c",
    c: `a${((index + 1) % count) + 1}`,
    ideal,
    label,
  }));
}

/* ------------------------------------------------------------------ */
/* VSEPR geometries                                                    */
/* ------------------------------------------------------------------ */

const becl2: Molecule = {
  id: "becl2",
  name: "Beryllium Chloride",
  formula: "BeCl₂",
  formulaPlain: "BeCl2",
  category: "vsepr",
  atoms: centralWith("Be", [
    { element: "Cl", position: [1.79, 0, 0] },
    { element: "Cl", position: [-1.79, 0, 0] },
  ]),
  bonds: starBonds(2),
  hybridization: "sp",
  vsepr: "AX₂",
  bondingPairs: 2,
  lonePairs: 0,
  electronGeometry: "Linear",
  molecularGeometry: "Linear",
  idealizedGeometry: "Linear",
  shapeNote:
    "No lone pairs on beryllium, so the shape is unchanged: two bonding domains stay linear at 180°.",
  description:
    "Two bonding domains and no lone pairs on beryllium give a perfectly linear 180° arrangement.",
  bondAngles: [{ a: "a1", b: "c", c: "a2", ideal: 180, label: "Cl–Be–Cl" }],
  lonePairMarkers: [],
};

const bf3: Molecule = {
  id: "bf3",
  name: "Boron Trifluoride",
  formula: "BF₃",
  formulaPlain: "BF3",
  category: "vsepr",
  atoms: centralWith("B", [
    { element: "F", position: planar(1.31, 90) },
    { element: "F", position: planar(1.31, 210) },
    { element: "F", position: planar(1.31, 330) },
  ]),
  bonds: starBonds(3),
  hybridization: "sp²",
  vsepr: "AX₃",
  bondingPairs: 3,
  lonePairs: 0,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Trigonal Planar",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "No lone pairs on boron, so the shape is unchanged: three bonding domains stay trigonal planar at 120°.",
  description:
    "Three bonding domains spread evenly in a plane, producing 120° F–B–F angles.",
  bondAngles: starAngles(3, 120, "F–B–F"),
  lonePairMarkers: [],
};

const h2o: Molecule = {
  id: "h2o",
  name: "Water",
  formula: "H₂O",
  formulaPlain: "H2O",
  category: "vsepr",
  atoms: centralWith("O", [
    { element: "H", position: polar(0.96, 52.25, 0) },
    { element: "H", position: polar(0.96, 52.25, 104.5) },
  ]),
  bonds: starBonds(2),
  hybridization: "sp³",
  vsepr: "AX₂E₂",
  bondingPairs: 2,
  lonePairs: 2,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Bent",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "Two lone pairs compress the H–O–H angle from 109.5° to 104.5°, bending the molecule.",
  description:
    "Two lone pairs compress the H–O–H angle to about 104.5°, giving a bent shape.",
  bondAngles: [{ a: "a1", b: "c", c: "a2", ideal: 104.5, label: "H–O–H" }],
  lonePairMarkers: [
    { atomId: "c", direction: polar(1, 52.25, 180), label: "O lone pair" },
    {
      atomId: "c",
      direction: polar(1, 52.25, 284.5),
      label: "O lone pair",
    },
  ],
};

const so2: Molecule = {
  id: "so2",
  name: "Sulfur Dioxide",
  formula: "SO₂",
  formulaPlain: "SO2",
  category: "vsepr",
  atoms: centralWith("S", [
    { element: "O", position: polar(1.43, 52.25, 0) },
    { element: "O", position: polar(1.43, 52.25, 119) },
  ]),
  bonds: starBonds(2, 2),
  hybridization: "sp²",
  vsepr: "AX₂E",
  bondingPairs: 2,
  lonePairs: 1,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Bent",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "One lone pair pushes the two S=O bonds together, narrowing the O–S–O angle from 120° to about 119°.",
  description:
    "A single lone pair on sulfur opens the O–S–O angle to roughly 119°.",
  bondAngles: [{ a: "a1", b: "c", c: "a2", ideal: 119, label: "O–S–O" }],
  lonePairMarkers: [
    {
      atomId: "c",
      direction: polar(1, 52.25, 239.5),
      label: "S lone pair",
    },
  ],
};

const ch4: Molecule = {
  id: "ch4",
  name: "Methane",
  formula: "CH₄",
  formulaPlain: "CH4",
  category: "vsepr",
  atoms: centralWith("C", [
    { element: "H", position: polar(1.09, 0, 0) },
    { element: "H", position: polar(1.09, 109.47, 0) },
    { element: "H", position: polar(1.09, 109.47, 120) },
    { element: "H", position: polar(1.09, 109.47, 240) },
  ]),
  bonds: starBonds(4),
  hybridization: "sp³",
  vsepr: "AX₄",
  bondingPairs: 4,
  lonePairs: 0,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Tetrahedral",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "No lone pairs on carbon, so the shape is unchanged: four bonding domains stay tetrahedral at 109.5°.",
  description:
    "Four equivalent bonds point to the corners of a tetrahedron at 109.5°.",
  bondAngles: starAngles(4, 109.5, "H–C–H"),
  lonePairMarkers: [],
};

const nh3: Molecule = {
  id: "nh3",
  name: "Ammonia",
  formula: "NH₃",
  formulaPlain: "NH3",
  category: "vsepr",
  atoms: centralWith("N", [
    { element: "H", position: polar(1.01, 0, 0) },
    { element: "H", position: polar(1.01, 107.8, 0) },
    { element: "H", position: polar(1.01, 107.8, 120) },
  ]),
  bonds: starBonds(3),
  hybridization: "sp³",
  vsepr: "AX₃E",
  bondingPairs: 3,
  lonePairs: 1,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Trigonal Pyramidal",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "One lone pair on nitrogen pushes the three N–H bonds down, opening the H–N–H angle from 109.5° to 107.8° and forming a pyramid.",
  description:
    "A lone pair on nitrogen pushes the three N–H bonds into a shallow pyramid.",
  bondAngles: starAngles(3, 107.8, "H–N–H"),
  lonePairMarkers: [
    { atomId: "c", direction: [0, 1, 0], label: "N lone pair" },
  ],
};

const pcl5: Molecule = {
  id: "pcl5",
  name: "Phosphorus Pentachloride",
  formula: "PCl₅",
  formulaPlain: "PCl5",
  category: "vsepr",
  atoms: centralWith("P", [
    { element: "Cl", position: [0, 2.02, 0] },
    { element: "Cl", position: [0, -2.02, 0] },
    { element: "Cl", position: planarXZ(2.14, 0) },
    { element: "Cl", position: planarXZ(2.14, 120) },
    { element: "Cl", position: planarXZ(2.14, 240) },
  ]),
  bonds: starBonds(5),
  hybridization: "sp³d",
  vsepr: "AX₅",
  bondingPairs: 5,
  lonePairs: 0,
  electronGeometry: "Trigonal Bipyramidal",
  molecularGeometry: "Trigonal Bipyramidal",
  idealizedGeometry: "Trigonal Bipyramidal",
  shapeNote:
    "No lone pairs on phosphorus, so the shape is unchanged: five bonding domains stay trigonal bipyramidal.",
  description:
    "Three equatorial and two axial chlorines give 120° and 90° bond angles.",
  bondAngles: [
    { a: "a3", b: "c", c: "a4", ideal: 120, label: "equatorial Cl–P–Cl" },
    { a: "a1", b: "c", c: "a3", ideal: 90, label: "axial–equatorial" },
    { a: "a1", b: "c", c: "a2", ideal: 180, label: "axial Cl–P–Cl" },
  ],
  lonePairMarkers: [],
};

const sf4: Molecule = {
  id: "sf4",
  name: "Sulfur Tetrafluoride",
  formula: "SF₄",
  formulaPlain: "SF4",
  category: "vsepr",
  atoms: centralWith("S", [
    { element: "F", position: [0, 1.65, 0] },
    { element: "F", position: [0, -1.65, 0] },
    { element: "F", position: planarXZ(1.55, 0) },
    { element: "F", position: planarXZ(1.55, 120) },
  ]),
  bonds: starBonds(4),
  hybridization: "sp³d",
  vsepr: "AX₄E",
  bondingPairs: 4,
  lonePairs: 1,
  electronGeometry: "Trigonal Bipyramidal",
  molecularGeometry: "Seesaw",
  idealizedGeometry: "Trigonal Bipyramidal",
  shapeNote:
    "One lone pair occupies an equatorial site, bending the two axial F–S–F bonds from 180° to about 173° into a seesaw.",
  description:
    "The lone pair occupies an equatorial site, bending the two axial bonds into a seesaw.",
  bondAngles: [
    { a: "a1", b: "c", c: "a2", ideal: 173, label: "axial F–S–F" },
    { a: "a3", b: "c", c: "a4", ideal: 102, label: "equatorial F–S–F" },
  ],
  lonePairMarkers: [
    { atomId: "c", direction: planarXZ(1, 240), label: "S lone pair" },
  ],
};

const clf3: Molecule = {
  id: "clf3",
  name: "Chlorine Trifluoride",
  formula: "ClF₃",
  formulaPlain: "ClF3",
  category: "vsepr",
  atoms: centralWith("Cl", [
    { element: "F", position: [0, 1.7, 0] },
    { element: "F", position: [0, -1.7, 0] },
    { element: "F", position: planarXZ(1.6, 0) },
  ]),
  bonds: starBonds(3),
  hybridization: "sp³d",
  vsepr: "AX₃E₂",
  bondingPairs: 3,
  lonePairs: 2,
  electronGeometry: "Trigonal Bipyramidal",
  molecularGeometry: "T-shaped",
  idealizedGeometry: "Trigonal Bipyramidal",
  shapeNote:
    "Two equatorial lone pairs squeeze the three fluorines together, pulling the F–Cl–F angle from 90° to about 87.5° and forming a T.",
  description:
    "Two equatorial lone pairs leave the three fluorines in a T shape with ~87.5° angles.",
  bondAngles: [
    { a: "a1", b: "c", c: "a3", ideal: 87.5, label: "F–Cl–F" },
    { a: "a1", b: "c", c: "a2", ideal: 175, label: "axial F–Cl–F" },
  ],
  lonePairMarkers: [
    { atomId: "c", direction: planarXZ(1, 120), label: "Cl lone pair" },
    { atomId: "c", direction: planarXZ(1, 240), label: "Cl lone pair" },
  ],
};

const sf6: Molecule = {
  id: "sf6",
  name: "Sulfur Hexafluoride",
  formula: "SF₆",
  formulaPlain: "SF6",
  category: "vsepr",
  atoms: centralWith("S", [
    { element: "F", position: [0, 1.56, 0] },
    { element: "F", position: [0, -1.56, 0] },
    { element: "F", position: [1.56, 0, 0] },
    { element: "F", position: [-1.56, 0, 0] },
    { element: "F", position: [0, 0, 1.56] },
    { element: "F", position: [0, 0, -1.56] },
  ]),
  bonds: starBonds(6),
  hybridization: "sp³d²",
  vsepr: "AX₆",
  bondingPairs: 6,
  lonePairs: 0,
  electronGeometry: "Octahedral",
  molecularGeometry: "Octahedral",
  idealizedGeometry: "Octahedral",
  shapeNote:
    "No lone pairs on sulfur, so the shape is unchanged: six bonding domains stay octahedral at 90° and 180°.",
  description:
    "Six fluorines sit at the vertices of an octahedron with 90° and 180° angles.",
  bondAngles: [
    { a: "a1", b: "c", c: "a3", ideal: 90, label: "F–S–F" },
    { a: "a1", b: "c", c: "a2", ideal: 180, label: "trans F–S–F" },
  ],
  lonePairMarkers: [],
};

const brf5: Molecule = {
  id: "brf5",
  name: "Bromine Pentafluoride",
  formula: "BrF₅",
  formulaPlain: "BrF5",
  category: "vsepr",
  atoms: centralWith("Br", [
    { element: "F", position: [0, 1.72, 0] },
    { element: "F", position: planarXZ(1.7, 0) },
    { element: "F", position: planarXZ(1.7, 90) },
    { element: "F", position: planarXZ(1.7, 180) },
    { element: "F", position: planarXZ(1.7, 270) },
  ]),
  bonds: starBonds(5),
  hybridization: "sp³d²",
  vsepr: "AX₅E",
  bondingPairs: 5,
  lonePairs: 1,
  electronGeometry: "Octahedral",
  molecularGeometry: "Square Pyramidal",
  idealizedGeometry: "Octahedral",
  shapeNote:
    "One lone pair below the bromine pushes the four basal fluorines up, tilting the apical–basal angle from 90° to about 85° into a square pyramid.",
  description:
    "A lone pair below the bromine lifts the four basal fluorines into a square pyramid.",
  bondAngles: [
    { a: "a2", b: "c", c: "a3", ideal: 90, label: "basal F–Br–F" },
    { a: "a1", b: "c", c: "a2", ideal: 85, label: "apical–basal" },
  ],
  lonePairMarkers: [
    { atomId: "c", direction: [0, -1, 0], label: "Br lone pair" },
  ],
};

const xef4: Molecule = {
  id: "xef4",
  name: "Xenon Tetrafluoride",
  formula: "XeF₄",
  formulaPlain: "XeF4",
  category: "vsepr",
  atoms: centralWith("Xe", [
    { element: "F", position: planarXZ(1.95, 45) },
    { element: "F", position: planarXZ(1.95, 135) },
    { element: "F", position: planarXZ(1.95, 225) },
    { element: "F", position: planarXZ(1.95, 315) },
  ]),
  bonds: starBonds(4),
  hybridization: "sp³d²",
  vsepr: "AX₄E₂",
  bondingPairs: 4,
  lonePairs: 2,
  electronGeometry: "Octahedral",
  molecularGeometry: "Square Planar",
  idealizedGeometry: "Octahedral",
  shapeNote:
    "Two axial lone pairs cancel each other out, leaving the four fluorines flat in a square at 90°.",
  description:
    "Two axial lone pairs cancel, leaving four fluorines in a flat square at 90°.",
  bondAngles: starAngles(4, 90, "F–Xe–F"),
  lonePairMarkers: [
    { atomId: "c", direction: [0, 1, 0], label: "Xe lone pair" },
    { atomId: "c", direction: [0, -1, 0], label: "Xe lone pair" },
  ],
};

/* ------------------------------------------------------------------ */
/* Organic molecules                                                   */
/* ------------------------------------------------------------------ */

const methaneOrganic: Molecule = {
  ...ch4,
  id: "methane",
  category: "organic",
  description:
    "The simplest alkane: a tetrahedral carbon with four equivalent C–H bonds.",
};

const ethane: Molecule = {
  id: "ethane",
  name: "Ethane",
  formula: "C₂H₆",
  formulaPlain: "C2H6",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [-0.77, 0, 0], isCentral: true },
    { id: "c2", element: "C", position: [0.77, 0, 0], isCentral: true },
    { id: "h1", element: "H", position: [-1.16, 1.02, 0] },
    { id: "h2", element: "H", position: [-1.16, -0.51, 0.88] },
    { id: "h3", element: "H", position: [-1.16, -0.51, -0.88] },
    { id: "h4", element: "H", position: [1.16, -1.02, 0] },
    { id: "h5", element: "H", position: [1.16, 0.51, 0.88] },
    { id: "h6", element: "H", position: [1.16, 0.51, -0.88] },
  ],
  bonds: [
    { from: "c1", to: "c2", order: 1 },
    { from: "c1", to: "h1", order: 1 },
    { from: "c1", to: "h2", order: 1 },
    { from: "c1", to: "h3", order: 1 },
    { from: "c2", to: "h4", order: 1 },
    { from: "c2", to: "h5", order: 1 },
    { from: "c2", to: "h6", order: 1 },
  ],
  hybridization: "sp³",
  vsepr: "AX₄",
  bondingPairs: 4,
  lonePairs: 0,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Tetrahedral",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "No lone pairs on either carbon, so the shape is unchanged: both centres stay tetrahedral at 109.5°.",
  description: "Two staggered tetrahedral carbons joined by a single C–C bond.",
  bondAngles: [
    { a: "h1", b: "c1", c: "h2", ideal: 109.5, label: "H–C–H" },
    { a: "c1", b: "c2", c: "h4", ideal: 109.5, label: "C–C–H" },
  ],
  lonePairMarkers: [],
};

const ethene: Molecule = {
  id: "ethene",
  name: "Ethene",
  formula: "C₂H₄",
  formulaPlain: "C2H4",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [-0.67, 0, 0], isCentral: true },
    { id: "c2", element: "C", position: [0.67, 0, 0], isCentral: true },
    { id: "h1", element: "H", position: [-1.23, 0.93, 0] },
    { id: "h2", element: "H", position: [-1.23, -0.93, 0] },
    { id: "h3", element: "H", position: [1.23, 0.93, 0] },
    { id: "h4", element: "H", position: [1.23, -0.93, 0] },
  ],
  bonds: [
    { from: "c1", to: "c2", order: 2 },
    { from: "c1", to: "h1", order: 1 },
    { from: "c1", to: "h2", order: 1 },
    { from: "c2", to: "h3", order: 1 },
    { from: "c2", to: "h4", order: 1 },
  ],
  hybridization: "sp²",
  vsepr: "AX₃",
  bondingPairs: 3,
  lonePairs: 0,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Trigonal Planar",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "No lone pairs on either carbon, so the shape is unchanged: both sp² centres stay trigonal planar at 120°.",
  description:
    "A planar C=C double bond with 120° angles around each sp² carbon.",
  bondAngles: [
    { a: "h1", b: "c1", c: "h2", ideal: 117, label: "H–C–H" },
    { a: "h1", b: "c1", c: "c2", ideal: 121.5, label: "H–C=C" },
  ],
  lonePairMarkers: [],
};

const ethyne: Molecule = {
  id: "ethyne",
  name: "Ethyne (Acetylene)",
  formula: "C₂H₂",
  formulaPlain: "C2H2",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [-0.6, 0, 0], isCentral: true },
    { id: "c2", element: "C", position: [0.6, 0, 0], isCentral: true },
    { id: "h1", element: "H", position: [-1.66, 0, 0] },
    { id: "h2", element: "H", position: [1.66, 0, 0] },
  ],
  bonds: [
    { from: "c1", to: "c2", order: 3 },
    { from: "c1", to: "h1", order: 1 },
    { from: "c2", to: "h2", order: 1 },
  ],
  hybridization: "sp",
  vsepr: "AX₂",
  bondingPairs: 2,
  lonePairs: 0,
  electronGeometry: "Linear",
  molecularGeometry: "Linear",
  idealizedGeometry: "Linear",
  shapeNote:
    "No lone pairs on either carbon, so the shape is unchanged: both sp centres stay linear at 180°.",
  description:
    "A linear sp carbon framework with a triple C≡C bond and 180° angles.",
  bondAngles: [
    { a: "h1", b: "c1", c: "c2", ideal: 180, label: "H–C≡C" },
    { a: "c1", b: "c2", c: "h2", ideal: 180, label: "C≡C–H" },
  ],
  lonePairMarkers: [],
};

const acetone: Molecule = {
  id: "acetone",
  name: "Acetone",
  formula: "C₃H₆O",
  formulaPlain: "C3H6O",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [0, 0, 0], isCentral: true },
    { id: "o1", element: "O", position: [0, 1.22, 0] },
    { id: "c2", element: "C", position: [-1.29, -0.75, 0] },
    { id: "c3", element: "C", position: [1.29, -0.75, 0] },
    { id: "h1", element: "H", position: [-1.29, -1.36, 0.89] },
    { id: "h2", element: "H", position: [-2.18, -0.12, 0] },
    { id: "h3", element: "H", position: [-1.29, -1.36, -0.89] },
    { id: "h4", element: "H", position: [1.29, -1.36, 0.89] },
    { id: "h5", element: "H", position: [2.18, -0.12, 0] },
    { id: "h6", element: "H", position: [1.29, -1.36, -0.89] },
  ],
  bonds: [
    { from: "c1", to: "o1", order: 2 },
    { from: "c1", to: "c2", order: 1 },
    { from: "c1", to: "c3", order: 1 },
    { from: "c2", to: "h1", order: 1 },
    { from: "c2", to: "h2", order: 1 },
    { from: "c2", to: "h3", order: 1 },
    { from: "c3", to: "h4", order: 1 },
    { from: "c3", to: "h5", order: 1 },
    { from: "c3", to: "h6", order: 1 },
  ],
  hybridization: "sp²",
  vsepr: "AX₃",
  bondingPairs: 3,
  lonePairs: 0,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Trigonal Planar",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "No lone pairs on the carbonyl carbon, so the shape is unchanged: its three domains stay trigonal planar at ~120°.",
  description:
    "A planar carbonyl carbon flanked by two methyl groups at ~121°.",
  bondAngles: [
    { a: "o1", b: "c1", c: "c2", ideal: 121.5, label: "O=C–C" },
    { a: "c2", b: "c1", c: "c3", ideal: 117, label: "C–C–C" },
  ],
  lonePairMarkers: [],
};

const methanol: Molecule = {
  id: "methanol",
  name: "Methanol",
  formula: "CH₃OH",
  formulaPlain: "CH3OH",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [0, 0, 0], isCentral: true },
    { id: "o1", element: "O", position: [1.43, 0, 0] },
    { id: "h1", element: "H", position: [1.82, 0.89, 0] },
    { id: "h2", element: "H", position: [-0.36, 1.03, 0] },
    { id: "h3", element: "H", position: [-0.36, -0.51, 0.89] },
    { id: "h4", element: "H", position: [-0.36, -0.51, -0.89] },
  ],
  bonds: [
    { from: "c1", to: "o1", order: 1 },
    { from: "o1", to: "h1", order: 1 },
    { from: "c1", to: "h2", order: 1 },
    { from: "c1", to: "h3", order: 1 },
    { from: "c1", to: "h4", order: 1 },
  ],
  hybridization: "sp³",
  vsepr: "AX₄",
  bondingPairs: 4,
  lonePairs: 0,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Tetrahedral",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "The carbon centre has no lone pairs, so its tetrahedral shape is unchanged; the oxygen's two lone pairs bend the C–O–H angle to 108.5°.",
  description: "A tetrahedral methyl group bonded to a bent hydroxyl oxygen.",
  bondAngles: [
    { a: "h2", b: "c1", c: "h3", ideal: 109.5, label: "H–C–H" },
    { a: "c1", b: "o1", c: "h1", ideal: 108.5, label: "C–O–H" },
  ],
  lonePairMarkers: [
    { atomId: "o1", direction: [0.5, -0.85, 0], label: "O lone pair" },
    { atomId: "o1", direction: [0.5, 0.85, 0], label: "O lone pair" },
  ],
};

const ethanol: Molecule = {
  id: "ethanol",
  name: "Ethanol",
  formula: "C₂H₅OH",
  formulaPlain: "C2H5OH",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: [-1.25, 0, 0], isCentral: true },
    { id: "c2", element: "C", position: [0.25, 0.6, 0], isCentral: true },
    { id: "o1", element: "O", position: [1.45, -0.35, 0] },
    { id: "h1", element: "H", position: [2.28, 0.05, 0] },
    { id: "h2", element: "H", position: [-1.55, 0.55, 0.89] },
    { id: "h3", element: "H", position: [-1.55, 0.55, -0.89] },
    { id: "h4", element: "H", position: [-1.55, -1.03, 0] },
    { id: "h5", element: "H", position: [0.45, 1.25, 0.89] },
    { id: "h6", element: "H", position: [0.45, 1.25, -0.89] },
  ],
  bonds: [
    { from: "c1", to: "c2", order: 1 },
    { from: "c2", to: "o1", order: 1 },
    { from: "o1", to: "h1", order: 1 },
    { from: "c1", to: "h2", order: 1 },
    { from: "c1", to: "h3", order: 1 },
    { from: "c1", to: "h4", order: 1 },
    { from: "c2", to: "h5", order: 1 },
    { from: "c2", to: "h6", order: 1 },
  ],
  hybridization: "sp³",
  vsepr: "AX₄",
  bondingPairs: 4,
  lonePairs: 0,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Tetrahedral",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "The carbon centres have no lone pairs, so their tetrahedral shape is unchanged; the oxygen's two lone pairs bend the C–O–H angle to 108.5°.",
  description: "A two-carbon chain ending in a bent hydroxyl group.",
  bondAngles: [
    { a: "c1", b: "c2", c: "o1", ideal: 109.5, label: "C–C–O" },
    { a: "c2", b: "o1", c: "h1", ideal: 108.5, label: "C–O–H" },
  ],
  lonePairMarkers: [
    { atomId: "o1", direction: [0.5, -0.85, 0], label: "O lone pair" },
    { atomId: "o1", direction: [0.5, 0.85, 0], label: "O lone pair" },
  ],
};

const benzene: Molecule = {
  id: "benzene",
  name: "Benzene",
  formula: "C₆H₆",
  formulaPlain: "C6H6",
  category: "organic",
  atoms: [
    { id: "c1", element: "C", position: planar(1.39, 90), isCentral: true },
    { id: "c2", element: "C", position: planar(1.39, 150) },
    { id: "c3", element: "C", position: planar(1.39, 210) },
    { id: "c4", element: "C", position: planar(1.39, 270) },
    { id: "c5", element: "C", position: planar(1.39, 330) },
    { id: "c6", element: "C", position: planar(1.39, 30) },
    { id: "h1", element: "H", position: planar(2.47, 90) },
    { id: "h2", element: "H", position: planar(2.47, 150) },
    { id: "h3", element: "H", position: planar(2.47, 210) },
    { id: "h4", element: "H", position: planar(2.47, 270) },
    { id: "h5", element: "H", position: planar(2.47, 330) },
    { id: "h6", element: "H", position: planar(2.47, 30) },
  ],
  bonds: [
    { from: "c1", to: "c2", order: 2 },
    { from: "c2", to: "c3", order: 1 },
    { from: "c3", to: "c4", order: 2 },
    { from: "c4", to: "c5", order: 1 },
    { from: "c5", to: "c6", order: 2 },
    { from: "c6", to: "c1", order: 1 },
    { from: "c1", to: "h1", order: 1 },
    { from: "c2", to: "h2", order: 1 },
    { from: "c3", to: "h3", order: 1 },
    { from: "c4", to: "h4", order: 1 },
    { from: "c5", to: "h5", order: 1 },
    { from: "c6", to: "h6", order: 1 },
  ],
  hybridization: "sp²",
  vsepr: "AX₃",
  bondingPairs: 3,
  lonePairs: 0,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Trigonal Planar",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "No lone pairs on the ring carbons, so the shape is unchanged: every sp² carbon stays trigonal planar at 120°.",
  description:
    "A planar hexagonal ring of sp² carbons with alternating double bonds.",
  bondAngles: [
    { a: "c1", b: "c2", c: "c3", ideal: 120, label: "C–C–C" },
    { a: "c2", b: "c1", c: "h1", ideal: 120, label: "C–C–H" },
  ],
  lonePairMarkers: [],
};

/* ------------------------------------------------------------------ */
/* Inorganic molecules                                                 */
/* ------------------------------------------------------------------ */

const waterInorganic: Molecule = {
  ...h2o,
  id: "water",
  category: "inorganic",
  description:
    "The universal solvent: a bent, strongly polar molecule with two lone pairs.",
};

const co2: Molecule = {
  id: "co2",
  name: "Carbon Dioxide",
  formula: "CO₂",
  formulaPlain: "CO2",
  category: "inorganic",
  atoms: centralWith("C", [
    { element: "O", position: [1.16, 0, 0] },
    { element: "O", position: [-1.16, 0, 0] },
  ]),
  bonds: starBonds(2, 2),
  hybridization: "sp",
  vsepr: "AX₂",
  bondingPairs: 2,
  lonePairs: 0,
  electronGeometry: "Linear",
  molecularGeometry: "Linear",
  idealizedGeometry: "Linear",
  shapeNote:
    "No lone pairs on carbon, so the shape is unchanged: two double bonds stay linear at 180°.",
  description:
    "Two double bonds and no lone pairs on carbon give a linear 180° molecule.",
  bondAngles: [{ a: "a1", b: "c", c: "a2", ideal: 180, label: "O=C=O" }],
  lonePairMarkers: [],
};

const ammoniaInorganic: Molecule = {
  ...nh3,
  id: "ammonia",
  category: "inorganic",
  description:
    "A trigonal pyramidal molecule whose lone pair makes it a good base.",
};

const sulfurDioxideInorganic: Molecule = {
  ...so2,
  id: "sulfur-dioxide",
  category: "inorganic",
  description:
    "A bent, polar oxide of sulfur with one lone pair on the central atom.",
};

const hno3: Molecule = {
  id: "hno3",
  name: "Nitric Acid",
  formula: "HNO₃",
  formulaPlain: "HNO3",
  category: "inorganic",
  atoms: [
    { id: "n1", element: "N", position: [0, 0, 0], isCentral: true },
    { id: "o1", element: "O", position: [0, 1.21, 0] },
    { id: "o2", element: "O", position: [1.16, -0.4, 0] },
    { id: "o3", element: "O", position: [-1.16, -0.4, 0] },
    { id: "h1", element: "H", position: [-1.75, 0.35, 0] },
  ],
  bonds: [
    { from: "n1", to: "o1", order: 2 },
    { from: "n1", to: "o2", order: 1 },
    { from: "n1", to: "o3", order: 1 },
    { from: "o3", to: "h1", order: 1 },
  ],
  hybridization: "sp²",
  vsepr: "AX₃",
  bondingPairs: 3,
  lonePairs: 0,
  electronGeometry: "Trigonal Planar",
  molecularGeometry: "Trigonal Planar",
  idealizedGeometry: "Trigonal Planar",
  shapeNote:
    "No lone pairs on nitrogen, so the shape is unchanged: its three domains stay trigonal planar at 120°.",
  description:
    "A planar nitrogen centre with two N–O single bonds and one N=O double bond.",
  bondAngles: [
    { a: "o1", b: "n1", c: "o2", ideal: 120, label: "O–N–O" },
    { a: "o2", b: "n1", c: "o3", ideal: 120, label: "O–N–O" },
  ],
  lonePairMarkers: [],
};

const h2so4: Molecule = {
  id: "h2so4",
  name: "Sulfuric Acid",
  formula: "H₂SO₄",
  formulaPlain: "H2SO4",
  category: "inorganic",
  atoms: [
    { id: "s1", element: "S", position: [0, 0, 0], isCentral: true },
    { id: "o1", element: "O", position: [0, 1.44, 0] },
    { id: "o2", element: "O", position: [0, -1.44, 0] },
    { id: "o3", element: "O", position: [1.36, 0.5, 0] },
    { id: "o4", element: "O", position: [-1.36, 0.5, 0] },
    { id: "h1", element: "H", position: [2.05, -0.1, 0] },
    { id: "h2", element: "H", position: [-2.05, -0.1, 0] },
  ],
  bonds: [
    { from: "s1", to: "o1", order: 2 },
    { from: "s1", to: "o2", order: 2 },
    { from: "s1", to: "o3", order: 1 },
    { from: "s1", to: "o4", order: 1 },
    { from: "o3", to: "h1", order: 1 },
    { from: "o4", to: "h2", order: 1 },
  ],
  hybridization: "sp³",
  vsepr: "AX₄",
  bondingPairs: 4,
  lonePairs: 0,
  electronGeometry: "Tetrahedral",
  molecularGeometry: "Tetrahedral",
  idealizedGeometry: "Tetrahedral",
  shapeNote:
    "No lone pairs on sulfur, so the shape is unchanged: its four domains stay tetrahedral at 109.5°.",
  description:
    "A tetrahedral sulfur centre with two S=O double bonds and two hydroxyl groups.",
  bondAngles: [
    { a: "o1", b: "s1", c: "o2", ideal: 109.5, label: "O=S=O" },
    { a: "o3", b: "s1", c: "o4", ideal: 109.5, label: "HO–S–OH" },
  ],
  lonePairMarkers: [],
};

/* ------------------------------------------------------------------ */
/* Library                                                             */
/* ------------------------------------------------------------------ */

export const MOLECULES: Molecule[] = [
  // VSEPR geometries
  becl2,
  bf3,
  h2o,
  so2,
  ch4,
  nh3,
  pcl5,
  sf4,
  clf3,
  sf6,
  brf5,
  xef4,
  // Organic
  methaneOrganic,
  ethane,
  ethene,
  ethyne,
  acetone,
  methanol,
  ethanol,
  benzene,
  // Inorganic
  waterInorganic,
  co2,
  ammoniaInorganic,
  sulfurDioxideInorganic,
  hno3,
  h2so4,
];

export const CATEGORY_LABELS: Record<MoleculeCategory, string> = {
  vsepr: "VSEPR Geometries",
  organic: "Organic",
  inorganic: "Inorganic",
};

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Find a molecule by its stable id. */
export function getMoleculeById(id: string): Molecule | undefined {
  return MOLECULES.find((molecule) => molecule.id === id);
}

/** Case-insensitive search across name, formula, and plain formula. */
export function searchMolecules(query: string): Molecule[] {
  const needle = query.trim().toLowerCase();
  if (!needle) return MOLECULES;
  return MOLECULES.filter((molecule) => {
    return (
      molecule.name.toLowerCase().includes(needle) ||
      molecule.formula.toLowerCase().includes(needle) ||
      molecule.formulaPlain.toLowerCase().includes(needle)
    );
  });
}

/** Unique element metadata for every atom in a molecule. */
export function getElementsForMolecule(molecule: Molecule): ElementInfo[] {
  const seen = new Set<string>();
  const result: ElementInfo[] = [];
  for (const atom of molecule.atoms) {
    if (seen.has(atom.element)) continue;
    seen.add(atom.element);
    result.push(getElement(atom.element));
  }
  return result;
}
