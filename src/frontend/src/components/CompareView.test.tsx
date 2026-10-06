import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CompareView } from "@/components/CompareView";
import { getMoleculeById } from "@/data/molecules";

/**
 * The split comparison viewport. The WebGL canvas cannot run under jsdom, so
 * `MoleculeCanvas` is replaced with a DOM stand-in that records the props it
 * receives, including the shared camera-sync ref and its pane id. Everything
 * else (summary strip, pane labels, geometry names, angle values, exit control)
 * is the real component output, so this is component/integration coverage of
 * the compare contract, not a browser E2E test.
 */
vi.mock("@/components/MoleculeCanvas", () => ({
  MoleculeCanvas: (props: {
    molecule: { id: string };
    showLonePairs: boolean;
    showBondAngles: boolean;
    autoRotate: boolean;
    syncId?: string;
    sync?: { current: { version: number; source: string } };
  }) => (
    <div
      data-testid={`canvas-${props.syncId ?? "solo"}`}
      data-molecule={props.molecule.id}
      data-lonepairs={String(props.showLonePairs)}
      data-bondangles={String(props.showBondAngles)}
      data-autorotate={String(props.autoRotate)}
      data-has-sync={String(Boolean(props.sync))}
    />
  ),
}));

const water = getMoleculeById("h2o")!;

function renderCompare(
  overrides: Partial<Parameters<typeof CompareView>[0]> = {},
) {
  const props = {
    molecule: water,
    autoRotate: true,
    resetSignal: 0,
    onExit: vi.fn(),
    ...overrides,
  };
  render(<CompareView {...props} />);
  return props;
}

describe("CompareView", () => {
  it("renders two side-by-side panes labelled with and without lone pairs", () => {
    renderCompare();

    const real = screen.getByRole("region", { name: "With lone pairs" });
    const ideal = screen.getByRole("region", { name: "Without lone pairs" });
    expect(real).toBeInTheDocument();
    expect(ideal).toBeInTheDocument();

    // Both panes render the same molecule.
    expect(within(real).getByTestId("canvas-real")).toHaveAttribute(
      "data-molecule",
      "h2o",
    );
    expect(within(ideal).getByTestId("canvas-ideal")).toHaveAttribute(
      "data-molecule",
      "h2o",
    );
  });

  it("shows each pane's geometry name and defined bond angle", () => {
    renderCompare();

    const real = screen.getByRole("region", { name: "With lone pairs" });
    expect(within(real).getByText("Bent")).toBeInTheDocument();
    expect(within(real).getByText("104.5°")).toBeInTheDocument();

    const ideal = screen.getByRole("region", { name: "Without lone pairs" });
    expect(within(ideal).getByText("Tetrahedral")).toBeInTheDocument();
    expect(within(ideal).getByText("109.5°")).toBeInTheDocument();
  });

  it("names both geometries and the bond-angle change in the summary strip", () => {
    renderCompare();

    const summary = document.querySelector(
      '[data-ocid="compare.view"] .compare-summary',
    ) as HTMLElement;
    expect(within(summary).getByText("Bent")).toBeInTheDocument();
    expect(within(summary).getByText("Tetrahedral")).toBeInTheDocument();
    // The shape note states the angle change from 109.5° to 104.5°.
    expect(summary.textContent).toContain("109.5°");
    expect(summary.textContent).toContain("104.5°");
  });

  it("shows lone-pair markers only on the real pane", () => {
    renderCompare();

    expect(screen.getByTestId("canvas-real")).toHaveAttribute(
      "data-lonepairs",
      "true",
    );
    expect(screen.getByTestId("canvas-ideal")).toHaveAttribute(
      "data-lonepairs",
      "false",
    );
  });

  it("joins both panes to one shared camera-sync group", () => {
    renderCompare();

    expect(screen.getByTestId("canvas-real")).toHaveAttribute(
      "data-has-sync",
      "true",
    );
    expect(screen.getByTestId("canvas-ideal")).toHaveAttribute(
      "data-has-sync",
      "true",
    );
  });

  it("exits the comparison from the Exit compare control", async () => {
    const user = userEvent.setup();
    const { onExit } = renderCompare();

    await user.click(screen.getByRole("button", { name: "Exit compare" }));
    expect(onExit).toHaveBeenCalledTimes(1);
  });
});

/**
 * The acceptance criteria name the real/idealised geometry pair for several
 * molecules, not only Water. The split view must label each pane with the
 * molecule's own geometry names, so a data or wiring regression on any of them
 * fails here rather than only in the library data test.
 */
const NAMED_CASES: Array<{
  id: string;
  name: string;
  molecular: string;
  idealized: string;
}> = [
  {
    id: "nh3",
    name: "Ammonia",
    molecular: "Trigonal Pyramidal",
    idealized: "Tetrahedral",
  },
  {
    id: "sf4",
    name: "Sulfur Tetrafluoride",
    molecular: "Seesaw",
    idealized: "Trigonal Bipyramidal",
  },
  {
    id: "xef4",
    name: "Xenon Tetrafluoride",
    molecular: "Square Planar",
    idealized: "Octahedral",
  },
];

describe("CompareView named molecules", () => {
  for (const entry of NAMED_CASES) {
    it(`labels both panes for ${entry.name}`, () => {
      const molecule = getMoleculeById(entry.id)!;
      renderCompare({ molecule });

      const real = screen.getByRole("region", { name: "With lone pairs" });
      expect(within(real).getByText(entry.molecular)).toBeInTheDocument();

      const ideal = screen.getByRole("region", { name: "Without lone pairs" });
      expect(within(ideal).getByText(entry.idealized)).toBeInTheDocument();

      // Both panes render the same molecule.
      expect(within(real).getByTestId("canvas-real")).toHaveAttribute(
        "data-molecule",
        entry.id,
      );
      expect(within(ideal).getByTestId("canvas-ideal")).toHaveAttribute(
        "data-molecule",
        entry.id,
      );
    });
  }

  it("shows the idealised pane's ideal angle for a molecule with no discrete real angle", () => {
    // Xenon Tetrafluoride's real shape is square planar; the idealised pane
    // still carries the octahedral 90° ideal angle.
    const molecule = getMoleculeById("xef4")!;
    renderCompare({ molecule });

    const ideal = screen.getByRole("region", { name: "Without lone pairs" });
    expect(within(ideal).getByText("90°")).toBeInTheDocument();
  });
});
