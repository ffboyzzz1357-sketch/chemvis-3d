import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { MoleculeModel } from "@/components/MoleculeModel";
import { getElement } from "@/data/elements";
import { getMoleculeById } from "@/data/molecules";

/**
 * The 3D model is the core "ball-and-stick with CPK colours" requirement. The
 * WebGL canvas cannot run under jsdom, so drei's `Line` is replaced with a DOM
 * stand-in that records its props. The molecule geometry itself is the real
 * component output, so this is component coverage of the render tree, not a
 * browser E2E test.
 */
vi.mock("@react-three/drei", () => ({
  Line: (props: { color?: string; dashed?: boolean }) => (
    <div
      data-testid="line"
      data-color={props.color}
      data-dashed={String(Boolean(props.dashed))}
    />
  ),
}));

const water = getMoleculeById("h2o")!;
const methane = getMoleculeById("ch4")!;
const becl2 = getMoleculeById("becl2")!;

function renderModel(
  molecule: typeof water,
  overrides: Partial<Parameters<typeof MoleculeModel>[0]> = {},
) {
  return render(
    <MoleculeModel
      molecule={molecule}
      showLonePairs={false}
      showBondAngles={false}
      {...overrides}
    />,
  );
}

describe("MoleculeModel", () => {
  it("renders one CPK-coloured sphere per atom", () => {
    const { container } = renderModel(water);
    const spheres = container.querySelectorAll("spheregeometry");
    expect(spheres).toHaveLength(water.atoms.length);

    // Each atom sphere is a <mesh> whose material carries the CPK colour.
    const atomMeshes = [...container.querySelectorAll("mesh")].filter((mesh) =>
      mesh.querySelector("spheregeometry"),
    );
    expect(atomMeshes).toHaveLength(water.atoms.length);
    const colors = atomMeshes.map((mesh) =>
      mesh.querySelector("meshstandardmaterial")?.getAttribute("color"),
    );
    expect(colors).toContain(getElement("O").color);
    expect(colors).toContain(getElement("H").color);
  });

  it("renders a bond mesh for every bond", () => {
    const { container } = renderModel(methane);
    // Methane has 4 single bonds, each drawn as one cylinder.
    expect(container.querySelectorAll("cylindergeometry")).toHaveLength(
      methane.bonds.length,
    );
  });

  it("draws one cylinder per bond order (double and triple bonds)", () => {
    // Ethene has one C=C double bond plus four single bonds: 2 + 4 cylinders.
    const ethene = getMoleculeById("ethene")!;
    const { container: etheneContainer } = renderModel(ethene);
    expect(etheneContainer.querySelectorAll("cylindergeometry")).toHaveLength(
      6,
    );

    // Ethyne has one C≡C triple bond plus two single bonds: 3 + 2 cylinders.
    const ethyne = getMoleculeById("ethyne")!;
    const { container: ethyneContainer } = renderModel(ethyne);
    expect(ethyneContainer.querySelectorAll("cylindergeometry")).toHaveLength(
      5,
    );
  });

  it("renders the default-route molecule with its atoms and bonds", () => {
    // The default route resolves to BeCl2; the acceptance criterion is that the
    // 3D molecule renders with its atoms and bonds, independent of the label
    // toggle that the requested change removes.
    const { container } = renderModel(becl2);
    expect(container.querySelectorAll("spheregeometry")).toHaveLength(
      becl2.atoms.length,
    );
    expect(container.querySelectorAll("cylindergeometry")).toHaveLength(
      becl2.bonds.length,
    );
  });

  it("renders no element-name text on or above the atom balls", () => {
    // The requested change removes the floating atom labels entirely, so the
    // model must not emit any element name/symbol text nodes.
    const { container } = renderModel(water);
    const elementNames = water.atoms.map(
      (atom) => getElement(atom.element).name,
    );
    const elementSymbols = water.atoms.map(
      (atom) => getElement(atom.element).symbol,
    );
    const text = container.textContent ?? "";
    for (const label of [...elementNames, ...elementSymbols]) {
      expect(text).not.toContain(label);
    }
    expect(container.querySelectorAll("span, div")).toHaveLength(0);
  });

  it("draws lone-pair markers only when enabled", () => {
    const { rerender } = renderModel(water);
    expect(screen.queryAllByTestId("line")).toHaveLength(0);

    rerender(
      <MoleculeModel molecule={water} showLonePairs showBondAngles={false} />,
    );
    const lines = screen.getAllByTestId("line");
    expect(lines).toHaveLength(water.lonePairMarkers.length);
    expect(lines[0]).toHaveAttribute("data-dashed", "true");
  });

  it("draws bond-angle arcs only when enabled", () => {
    const { rerender } = renderModel(water);
    expect(screen.queryAllByTestId("line")).toHaveLength(0);

    rerender(
      <MoleculeModel molecule={water} showLonePairs={false} showBondAngles />,
    );
    expect(screen.getAllByTestId("line")).toHaveLength(water.bondAngles.length);
  });
});
