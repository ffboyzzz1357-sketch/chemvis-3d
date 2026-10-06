import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Layout } from "@/components/Layout";

/**
 * The full-bleed shell composition. The requested change adds a molecule-name
 * heading at the top of the grid area and removes the floating atom labels, so
 * this characterizes the parts of the shell that must survive: the search slot
 * sits above the viewport, the floating Controls pill and Show details bar are
 * anchored below it, and overlay sheets mount above everything. This is
 * component coverage of the layout contract, not a browser E2E test.
 */
function renderLayout(moleculeName = "Water") {
  return render(
    <Layout
      moleculeName={moleculeName}
      topBar={<div data-testid="top-bar">top</div>}
      search={<div data-testid="search-slot">search</div>}
      viewport={<div data-testid="viewport-slot">viewport</div>}
      controlsTrigger={<button type="button">Controls</button>}
      detailsTrigger={<button type="button">Show details</button>}
      overlays={<div data-testid="overlay-slot">overlay</div>}
    />,
  );
}

describe("Layout", () => {
  it("renders the top bar, search slot, and viewport", () => {
    renderLayout();
    expect(screen.getByTestId("top-bar")).toBeInTheDocument();
    expect(screen.getByTestId("search-slot")).toBeInTheDocument();
    expect(screen.getByTestId("viewport-slot")).toBeInTheDocument();
  });

  it("shows the molecule name as a heading at the top of the grid area", () => {
    renderLayout("Methane");
    const heading = screen.getByRole("heading", { name: "Methane" });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveAttribute("data-ocid", "molecule.name_heading");
  });

  it("places the molecule-name heading above the viewport in document order", () => {
    renderLayout("Methane");
    const heading = screen.getByRole("heading", { name: "Methane" });
    const viewport = screen.getByTestId("viewport-slot");
    expect(
      heading.compareDocumentPosition(viewport) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("places the search slot above the viewport in document order", () => {
    renderLayout();
    const search = screen.getByTestId("search-slot");
    const viewport = screen.getByTestId("viewport-slot");
    // Node.DOCUMENT_POSITION_FOLLOWING === 4: viewport comes after search.
    expect(
      search.compareDocumentPosition(viewport) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
  });

  it("renders the floating controls and details triggers", () => {
    renderLayout();
    expect(
      screen.getByRole("button", { name: "Controls" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Show details" }),
    ).toBeInTheDocument();
  });

  it("mounts overlay sheets above the shell", () => {
    renderLayout();
    expect(screen.getByTestId("overlay-slot")).toBeInTheDocument();
  });
});
