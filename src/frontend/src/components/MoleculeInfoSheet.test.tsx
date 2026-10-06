import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { MoleculeInfoSheet } from "@/components/MoleculeInfoSheet";
import { getMoleculeById } from "@/data/molecules";

const water = getMoleculeById("h2o")!;
const methane = getMoleculeById("ch4")!;
const sf6 = getMoleculeById("sf6")!;

function renderSheet(molecule: typeof water, open = true) {
  return render(
    <MoleculeInfoSheet molecule={molecule} open={open} onClose={vi.fn()} />,
  );
}

function card(name: string) {
  return document.querySelector(`[data-ocid="${name}"]`) as HTMLElement;
}

/**
 * The details bottom sheet. The reopen trigger now lives in the shell's bottom
 * bar, so this component only renders while open and closes via its own
 * controls. The readout cards keep their ocids; the property grid and geometry
 * pair use the redesigned `details.property.*` / `details.geometry.*` ocids.
 */
describe("MoleculeInfoSheet", () => {
  it("renders the Water readout from the acceptance criteria", () => {
    renderSheet(water);

    expect(screen.getByRole("heading", { name: "Water" })).toBeInTheDocument();
    expect(screen.getByText("H₂O")).toBeInTheDocument();
    expect(screen.getByText("VSEPR Geometries")).toBeInTheDocument();

    const central = within(card("details.central_atom_card"));
    expect(central.getByText("Oxygen")).toBeInTheDocument();
    expect(central.getByText("sp³")).toBeInTheDocument();
    expect(central.getByText("AX₂E₂")).toBeInTheDocument();
    expect(central.getByText("Tetrahedral")).toBeInTheDocument();
    expect(central.getByText("Bent")).toBeInTheDocument();

    const hybridization = within(card("details.property.hybridization"));
    expect(hybridization.getByText("sp³")).toBeInTheDocument();
    const vsepr = within(card("details.property.vsepr"));
    expect(vsepr.getByText("AX₂E₂")).toBeInTheDocument();
    const bonding = within(card("details.property.bonding_pairs"));
    expect(bonding.getByText("2")).toBeInTheDocument();
    const lone = within(card("details.property.lone_pairs"));
    expect(lone.getByText("2")).toBeInTheDocument();

    const electron = within(card("details.geometry.electron"));
    expect(electron.getByText("Tetrahedral")).toBeInTheDocument();
    const molecular = within(card("details.geometry.molecular"));
    expect(molecular.getByText("Bent")).toBeInTheDocument();

    const angles = within(card("details.bond_angle_card"));
    expect(angles.getByText("H–O–H")).toBeInTheDocument();
    expect(angles.getByText("104.5°")).toBeInTheDocument();

    const legend = within(card("details.element_legend"));
    expect(legend.getByText("Hydrogen")).toBeInTheDocument();
    expect(legend.getByText("Oxygen")).toBeInTheDocument();
  });

  it("renders the Methane readout with 4 bonding pairs and 0 lone pairs", () => {
    renderSheet(methane);
    const central = within(card("details.central_atom_card"));
    expect(central.getByText("Carbon")).toBeInTheDocument();
    expect(central.getByText("AX₄")).toBeInTheDocument();

    expect(
      within(card("details.property.bonding_pairs")).getByText("4"),
    ).toBeInTheDocument();
    expect(
      within(card("details.property.lone_pairs")).getByText("0"),
    ).toBeInTheDocument();
  });

  it("renders the SF6 readout with 90° and 180° bond angles", () => {
    renderSheet(sf6);
    const central = within(card("details.central_atom_card"));
    expect(central.getByText("Sulfur")).toBeInTheDocument();
    expect(central.getByText("sp³d²")).toBeInTheDocument();
    expect(central.getByText("AX₆")).toBeInTheDocument();
    expect(central.getAllByText("Octahedral")).toHaveLength(2);

    const angles = within(card("details.bond_angle_card"));
    expect(angles.getByText("90°")).toBeInTheDocument();
    expect(angles.getByText("180°")).toBeInTheDocument();
  });

  it("renders nothing while closed", () => {
    renderSheet(water, false);
    expect(screen.queryByRole("region", { name: "Water details" })).toBeNull();
  });

  it("closes from the X button and the Hide details control", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<MoleculeInfoSheet molecule={water} open onClose={onClose} />);

    await user.click(
      screen.getByRole("button", { name: "Close molecule details" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);

    // The backdrop shares the "Hide details" label, so target the header
    // control by its ocid.
    await user.click(card("details.hide_button"));
    expect(onClose).toHaveBeenCalledTimes(2);
  });
});
