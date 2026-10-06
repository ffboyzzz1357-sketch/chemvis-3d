import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { BondAngleCard } from "@/components/BondAngleCard";
import { CentralAtomCard } from "@/components/CentralAtomCard";
import { ElementLegend } from "@/components/ElementLegend";
import { getElementsForMolecule, getMoleculeById } from "@/data/molecules";

/**
 * The details readouts are presentational cards that render the molecule
 * metadata. They are the "details readouts" acceptance criterion and are
 * expected to survive the layout replacement, so their observable output is
 * characterized here rather than through the old sheet shell.
 */
const water = getMoleculeById("h2o")!;
const methane = getMoleculeById("ch4")!;
const sf6 = getMoleculeById("sf6")!;

describe("CentralAtomCard", () => {
  it("renders the Water central-atom readout", () => {
    render(<CentralAtomCard molecule={water} />);
    const card = screen.getByRole("region", { name: "Central atom" });
    expect(within(card).getByText("Oxygen")).toBeInTheDocument();
    expect(within(card).getByText("sp³")).toBeInTheDocument();
    expect(within(card).getByText("AX₂E₂")).toBeInTheDocument();
    expect(within(card).getByText("Tetrahedral")).toBeInTheDocument();
    expect(within(card).getByText("Bent")).toBeInTheDocument();
  });

  it("renders the SF6 central-atom readout", () => {
    render(<CentralAtomCard molecule={sf6} />);
    const card = screen.getByRole("region", { name: "Central atom" });
    expect(within(card).getByText("Sulfur")).toBeInTheDocument();
    expect(within(card).getByText("sp³d²")).toBeInTheDocument();
    expect(within(card).getByText("AX₆")).toBeInTheDocument();
    expect(within(card).getAllByText("Octahedral")).toHaveLength(2);
  });
});

describe("BondAngleCard", () => {
  it("formats whole and fractional ideal angles", () => {
    render(<BondAngleCard angles={water.bondAngles} />);
    const card = screen.getByRole("region", { name: "Bond angles" });
    expect(within(card).getByText("H–O–H")).toBeInTheDocument();
    expect(within(card).getByText("104.5°")).toBeInTheDocument();
  });

  it("renders every SF6 angle including the whole-number 90° and 180°", () => {
    render(<BondAngleCard angles={sf6.bondAngles} />);
    const card = screen.getByRole("region", { name: "Bond angles" });
    expect(within(card).getByText("90°")).toBeInTheDocument();
    expect(within(card).getByText("180°")).toBeInTheDocument();
  });

  it("shows an empty state when a geometry has no discrete angles", () => {
    render(<BondAngleCard angles={[]} />);
    expect(
      screen.getByText("No discrete bond angles for this geometry."),
    ).toBeInTheDocument();
  });
});

describe("ElementLegend", () => {
  it("lists the unique CPK elements present in the molecule", () => {
    render(<ElementLegend elements={getElementsForMolecule(methane)} />);
    const legend = screen.getByRole("region", { name: "Element legend" });
    expect(within(legend).getByText("Carbon")).toBeInTheDocument();
    expect(within(legend).getByText("Hydrogen")).toBeInTheDocument();
    expect(within(legend).queryByText("Oxygen")).toBeNull();
  });
});
