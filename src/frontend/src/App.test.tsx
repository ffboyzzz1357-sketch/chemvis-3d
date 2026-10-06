import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import App from "@/App";

/**
 * The WebGL canvas cannot run under jsdom, so the 3D viewport is replaced with
 * a lightweight stand-in that records the props it receives. Everything else
 * (top bar, search sheet, display sheet, details sheet, URL state) is the real
 * component tree, so this is a component/integration journey, not a browser
 * E2E test.
 */
vi.mock("@/components/MoleculeCanvas", () => ({
  MoleculeCanvas: (props: {
    molecule: { id: string; name: string };
    showLonePairs: boolean;
    showBondAngles: boolean;
    autoRotate: boolean;
    resetSignal: number;
  }) => (
    <div
      data-testid="molecule-canvas"
      data-molecule={props.molecule.id}
      data-lonepairs={String(props.showLonePairs)}
      data-bondangles={String(props.showBondAngles)}
      data-autorotate={String(props.autoRotate)}
      data-resetsignal={String(props.resetSignal)}
    />
  ),
}));

function setUrl(search: string) {
  window.history.replaceState(null, "", `/${search}`);
}

afterEach(() => {
  setUrl("");
});

function ocid(name: string) {
  return document.querySelector(`[data-ocid="${name}"]`) as HTMLElement;
}

describe("App integration", () => {
  it("loads the shell with the top bar, search bar, and a rendered molecule", () => {
    setUrl("");
    render(<App />);

    expect(
      screen.getByRole("heading", { name: "ChemVis 3D" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Search molecules" }),
    ).toBeInTheDocument();
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-molecule",
      "becl2",
    );
    // The current molecule's name is shown at the top of the grid area.
    expect(
      screen.getByRole("heading", { name: "Beryllium Chloride" }),
    ).toHaveAttribute("data-ocid", "molecule.name_heading");
    // The details sheet starts closed; the reopen bar is present instead.
    expect(
      screen.queryByRole("region", { name: "Beryllium Chloride details" }),
    ).toBeNull();
    expect(
      screen.getByRole("button", {
        name: "Show details for Beryllium Chloride",
      }),
    ).toBeInTheDocument();
  });

  it("searches for water, selects it, and reads its details sheet", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Search molecules" }));
    const input = screen.getByRole("searchbox", { name: "Search molecules" });
    await user.type(input, "water");

    const library = screen.getByRole("region", { name: "Molecule library" });
    const waterItem = library.querySelector(
      '[data-ocid="library.item.h2o"]',
    ) as HTMLElement;
    await user.click(waterItem);

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-molecule",
      "h2o",
    );
    // The heading updates to the newly selected molecule.
    expect(screen.getByRole("heading", { name: "Water" })).toHaveAttribute(
      "data-ocid",
      "molecule.name_heading",
    );
    expect(window.location.search).toContain("molecule=h2o");

    await user.click(
      screen.getByRole("button", { name: "Show details for Water" }),
    );
    const sheet = screen.getByRole("region", { name: "Water details" });
    // AX₂E₂ appears in both the property grid and the central-atom card.
    expect(within(sheet).getAllByText("AX₂E₂").length).toBeGreaterThan(0);
    expect(within(sheet).getAllByText("Bent").length).toBeGreaterThan(0);
    expect(within(sheet).getByText("104.5°")).toBeInTheDocument();
  });

  it("shows a no-results state and clears the query", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Search molecules" }));
    const input = screen.getByRole("searchbox", { name: "Search molecules" });
    await user.type(input, "zzz");
    expect(screen.getByText("No molecules found")).toBeInTheDocument();

    await user.click(ocid("library.reset_button"));
    expect(input).toHaveValue("");
    expect(screen.queryByText("No molecules found")).toBeNull();
  });

  it("opens the DISPLAY sheet and toggles bond angles and lone pairs", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-bondangles",
      "false",
    );
    await user.click(
      screen.getByRole("button", { name: "Open display controls" }),
    );

    const panel = screen.getByRole("region", { name: "Display controls" });
    expect(within(panel).getByText("Display")).toBeInTheDocument();

    await user.click(screen.getByRole("switch", { name: "Bond angles" }));
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-bondangles",
      "true",
    );

    await user.click(screen.getByRole("switch", { name: "Lone pairs" }));
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-lonepairs",
      "true",
    );
  });

  it("dismisses and restores the details sheet", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=ch4&category=vsepr");
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Show details for Methane" }),
    );
    expect(
      screen.getByRole("region", { name: "Methane details" }),
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Close molecule details" }),
    );
    expect(
      screen.queryByRole("region", { name: "Methane details" }),
    ).toBeNull();

    await user.click(
      screen.getByRole("button", { name: "Show details for Methane" }),
    );
    expect(
      screen.getByRole("region", { name: "Methane details" }),
    ).toBeInTheDocument();
  });

  it("toggles auto-rotation from the top bar", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-autorotate",
      "true",
    );
    await user.click(
      screen.getByRole("button", { name: "Pause auto-rotation" }),
    );
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-autorotate",
      "false",
    );
  });

  it("resets the view from the top bar by advancing the reset signal", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-resetsignal",
      "0",
    );
    await user.click(screen.getByRole("button", { name: "Reset view" }));
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-resetsignal",
      "1",
    );
  });

  it("switches category from the display sheet and updates the URL", async () => {
    const user = userEvent.setup();
    setUrl("");
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Open display controls" }),
    );
    await user.click(ocid("controls.category.organic"));

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-molecule",
      "methane",
    );
    expect(window.location.search).toContain("category=organic");
  });

  it("restores the selected molecule and category from the URL", () => {
    setUrl("?molecule=sf6&category=vsepr");
    render(<App />);

    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-molecule",
      "sf6",
    );
    expect(
      screen.getByRole("button", {
        name: "Show details for Sulfur Hexafluoride",
      }),
    ).toBeInTheDocument();
  });

  it("enables Compare on Water and shows the split view with both geometries", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=h2o&category=vsepr");
    render(<App />);

    const compare = screen.getByRole("button", {
      name: "Compare with and without lone pairs",
    });
    expect(compare).toHaveAttribute("aria-pressed", "false");

    await user.click(compare);

    expect(compare).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("region", { name: "With lone pairs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Without lone pairs" }),
    ).toBeInTheDocument();
    expect(window.location.search).toContain("compare=1");
  });

  it("restores the Compare split view from the URL on load", () => {
    setUrl("?molecule=h2o&category=vsepr&compare=1");
    render(<App />);

    expect(
      screen.getByRole("region", { name: "With lone pairs" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Without lone pairs" }),
    ).toBeInTheDocument();
  });

  it("disables Compare and shows the no-lone-pairs message on Methane", () => {
    setUrl("?molecule=ch4&category=vsepr");
    render(<App />);

    expect(
      screen.queryByRole("button", {
        name: "Compare with and without lone pairs",
      }),
    ).toBeNull();
    expect(
      screen.getByText("No lone pairs — shape unchanged"),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("region", { name: "With lone pairs" }),
    ).toBeNull();
  });

  it("exits the Compare split view back to the single canvas", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=h2o&category=vsepr&compare=1");
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Exit compare" }));

    expect(
      screen.queryByRole("region", { name: "With lone pairs" }),
    ).toBeNull();
    expect(screen.getByTestId("molecule-canvas")).toHaveAttribute(
      "data-molecule",
      "h2o",
    );
    expect(window.location.search).not.toContain("compare=1");
  });

  it("shows the final shape as the headline and the idealised shape as the comparison", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=h2o&category=vsepr");
    render(<App />);

    await user.click(
      screen.getByRole("button", { name: "Show details for Water" }),
    );
    const sheet = screen.getByRole("region", { name: "Water details" });

    const molecular = within(sheet).getByText("Actual shape").closest("div");
    expect(
      within(molecular as HTMLElement).getByText("Bent"),
    ).toBeInTheDocument();
    expect(
      within(molecular as HTMLElement).getByText("after lone-pair repulsion"),
    ).toBeInTheDocument();

    const idealised = within(sheet).getByText("Idealised").closest("div");
    expect(
      within(idealised as HTMLElement).getByText("Tetrahedral"),
    ).toBeInTheDocument();
    expect(
      within(idealised as HTMLElement).getByText("if lone pairs were bonding"),
    ).toBeInTheDocument();

    // The cause row lists the central atom's bonding and lone pairs.
    const cause = ocid("details.geometry.cause");
    expect(within(cause).getByText("2 bonding pairs")).toBeInTheDocument();
    expect(within(cause).getByText("2 lone pairs")).toBeInTheDocument();
  });

  it("shows the final shape as the headline and the idealised shape as the comparison for SF4", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=sf4&category=vsepr");
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Show details for Sulfur Tetrafluoride",
      }),
    );
    const sheet = screen.getByRole("region", {
      name: "Sulfur Tetrafluoride details",
    });

    const molecular = within(sheet).getByText("Actual shape").closest("div");
    expect(
      within(molecular as HTMLElement).getByText("Seesaw"),
    ).toBeInTheDocument();
    expect(
      within(molecular as HTMLElement).getByText("after lone-pair repulsion"),
    ).toBeInTheDocument();

    const idealised = within(sheet).getByText("Idealised").closest("div");
    expect(
      within(idealised as HTMLElement).getByText("Trigonal Bipyramidal"),
    ).toBeInTheDocument();
    expect(
      within(idealised as HTMLElement).getByText("if lone pairs were bonding"),
    ).toBeInTheDocument();

    const cause = ocid("details.geometry.cause");
    expect(within(cause).getByText("4 bonding pairs")).toBeInTheDocument();
    expect(within(cause).getByText("1 lone pairs")).toBeInTheDocument();
  });

  it("enables Compare on Ammonia and shows its split-view geometries", async () => {
    const user = userEvent.setup();
    setUrl("?molecule=nh3&category=vsepr");
    render(<App />);

    await user.click(
      screen.getByRole("button", {
        name: "Compare with and without lone pairs",
      }),
    );

    const real = screen.getByRole("region", { name: "With lone pairs" });
    expect(within(real).getByText("Trigonal Pyramidal")).toBeInTheDocument();
    const ideal = screen.getByRole("region", { name: "Without lone pairs" });
    expect(within(ideal).getByText("Tetrahedral")).toBeInTheDocument();
    expect(window.location.search).toContain("compare=1");
  });
});
