import { getElement } from "@/data/elements";
import { directionBetween, findAtom, midpoint } from "@/lib/view-utils";
import type { Bond, Molecule } from "@/types/molecule";
import { Line } from "@react-three/drei";
import { useMemo } from "react";
import { Quaternion, Vector3 } from "three";

interface MoleculeModelProps {
  molecule: Molecule;
  showLonePairs: boolean;
  showBondAngles: boolean;
}

/** Light-blue metallic bond colour from the reference screenshots. */
const BOND_COLOR = "#c3ccd6";
const LONE_PAIR_COLOR = "#5eead4";
const ANGLE_COLOR = "#fbbf24";

/** A single bond rendered as one or more parallel cylinders. */
function BondMesh({ bond, molecule }: { bond: Bond; molecule: Molecule }) {
  const from = findAtom(molecule, bond.from);
  const to = findAtom(molecule, bond.to);

  const geometry = useMemo(() => {
    if (!from || !to) return null;
    const { direction, length } = directionBetween(from.position, to.position);
    const mid = midpoint(from.position, to.position);
    const quaternion = new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      new Vector3(direction[0], direction[1], direction[2]),
    );
    return { length, mid, quaternion };
  }, [from, to]);

  if (!from || !to || !geometry) return null;

  const { length, mid } = geometry;
  const offsets =
    bond.order === 1
      ? [0]
      : bond.order === 2
        ? [-0.09, 0.09]
        : [-0.13, 0, 0.13];

  return (
    <group>
      {offsets.map((offset) => (
        <mesh
          key={`${bond.from}-${bond.to}-${offset}`}
          position={[mid[0], mid[1] + offset, mid[2]]}
          quaternion={geometry.quaternion}
        >
          <cylinderGeometry args={[0.075, 0.075, length, 20]} />
          <meshStandardMaterial
            color={BOND_COLOR}
            emissive={BOND_COLOR}
            emissiveIntensity={0.12}
            roughness={0.28}
            metalness={0.55}
          />
        </mesh>
      ))}
    </group>
  );
}

/**
 * A lone-pair electron-domain marker: a short dashed ray from the host atom
 * ending in a soft teal lobe that stands in for the electron pair, so the
 * repulsion source is visible in the 3D view.
 */
function LonePairMarker({
  origin,
  direction,
}: {
  origin: [number, number, number];
  direction: [number, number, number];
}) {
  const end: [number, number, number] = [
    origin[0] + direction[0] * 0.85,
    origin[1] + direction[1] * 0.85,
    origin[2] + direction[2] * 0.85,
  ];
  return (
    <group>
      <Line
        points={[origin, end]}
        color={LONE_PAIR_COLOR}
        lineWidth={2}
        dashed
        dashSize={0.12}
        gapSize={0.08}
      />
      <mesh position={end}>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshStandardMaterial
          color={LONE_PAIR_COLOR}
          emissive={LONE_PAIR_COLOR}
          emissiveIntensity={0.55}
          roughness={0.35}
          metalness={0.1}
          transparent
          opacity={0.9}
        />
      </mesh>
    </group>
  );
}

/** Bond-angle arc drawn between two outer atoms around a vertex atom. */
function AngleArc({
  a,
  b,
  c,
}: {
  a: [number, number, number];
  b: [number, number, number];
  c: [number, number, number];
}) {
  const points = useMemo(() => {
    const radius = 0.55;
    const va = directionBetween(b, a).direction;
    const vc = directionBetween(b, c).direction;
    const steps = 24;
    const result: [number, number, number][] = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      const x = va[0] * (1 - t) + vc[0] * t;
      const y = va[1] * (1 - t) + vc[1] * t;
      const z = va[2] * (1 - t) + vc[2] * t;
      const len = Math.hypot(x, y, z) || 1;
      result.push([
        b[0] + (x / len) * radius,
        b[1] + (y / len) * radius,
        b[2] + (z / len) * radius,
      ]);
    }
    return result;
  }, [a, b, c]);

  return <Line points={points} color={ANGLE_COLOR} lineWidth={2} />;
}

/**
 * Renders a molecule as CPK-coloured spheres and light-blue metallic bonds,
 * with optional lone-pair markers and bond-angle arcs. The lone-pair rays and
 * angle arcs only appear when their toggles are on.
 */
export function MoleculeModel({
  molecule,
  showLonePairs,
  showBondAngles,
}: MoleculeModelProps) {
  return (
    <group>
      {molecule.atoms.map((atom) => {
        const element = getElement(atom.element);
        return (
          <mesh key={atom.id} position={atom.position}>
            <sphereGeometry args={[element.radius, 32, 32]} />
            <meshStandardMaterial
              color={element.color}
              roughness={0.3}
              metalness={0.15}
              emissive={element.color}
              emissiveIntensity={0.06}
            />
          </mesh>
        );
      })}

      {molecule.bonds.map((bond) => (
        <BondMesh
          key={`${bond.from}-${bond.to}-${bond.order}`}
          bond={bond}
          molecule={molecule}
        />
      ))}

      {showLonePairs &&
        molecule.lonePairMarkers.map((marker, index) => {
          const host = findAtom(molecule, marker.atomId);
          if (!host) return null;
          return (
            <LonePairMarker
              key={`${marker.atomId}-lp-${index}`}
              origin={host.position}
              direction={marker.direction}
            />
          );
        })}

      {showBondAngles &&
        molecule.bondAngles.map((angle, index) => {
          const a = findAtom(molecule, angle.a);
          const b = findAtom(molecule, angle.b);
          const c = findAtom(molecule, angle.c);
          if (!a || !b || !c) return null;
          return (
            <AngleArc
              key={`${angle.a}-${angle.b}-${angle.c}-${index}`}
              a={a.position}
              b={b.position}
              c={c.position}
            />
          );
        })}
    </group>
  );
}
