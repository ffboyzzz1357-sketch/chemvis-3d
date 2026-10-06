import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ControlDrawer } from "@/components/ControlDrawer";
import type { ViewToggles } from "@/hooks/use-molecule-view";

const toggles: ViewToggles = {
  lonePairs: false,
  bondAngles: false,
  autoRotate: true,
};

function renderDrawer(
  overrides: Partial<Parameters<typeof ControlDrawer>[0]> = {},
) {
  const props = {
    open: true,
    onClose: vi.fn(),
    toggles,
    onToggle: vi.fn(),
    geometryReadout: "molecular" as const,
    onSelectGeometry: vi.fn(),
    representation: "balls" as const,
    onSelectRepresentation: vi.fn(),
    onResetView: vi.fn(),
    category: "vsepr" as const,
    onSelectCategory: vi.fn(),
    ...overrides,
  };
  render(<ControlDrawer {...props} />);
  return props;
}

function ocid(name: string) {
  return document.querySelector(`[data-ocid="${name}"]`) as HTMLElement;
}

/**
 * The DISPLAY bottom sheet. It renders nothing while closed (the floating
 * Controls pill lives in the shell), and when open exposes the three view
 * toggles, a reset-view action, the Molecular/Electron segmented readout, and
 * the Balls/CPK/Wire/Density representation grid.
 */
describe("ControlDrawer", () => {
  it("renders nothing while closed", () => {
    renderDrawer({ open: false });
    expect(
      screen.queryByRole("region", { name: "Display controls" }),
    ).toBeNull();
    expect(ocid("controls.panel")).toBeNull();
  });

  it("exposes the three view toggles as switches reflecting their state", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();
    renderDrawer({ onToggle });

    const bondAngles = screen.getByRole("switch", { name: "Bond angles" });
    expect(bondAngles).toHaveAttribute("aria-checked", "false");
    const lonePairs = screen.getByRole("switch", { name: "Lone pairs" });
    expect(lonePairs).toHaveAttribute("aria-checked", "false");
    const autoRotate = screen.getByRole("switch", { name: "Auto-rotation" });
    expect(autoRotate).toHaveAttribute("aria-checked", "true");

    await user.click(lonePairs);
    expect(onToggle).toHaveBeenCalledWith("lonePairs");
  });

  it("selects the geometry readout and marks the active segment", async () => {
    const user = userEvent.setup();
    const onSelectGeometry = vi.fn();
    renderDrawer({ onSelectGeometry });

    expect(ocid("controls.geometry.molecular")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(ocid("controls.geometry.electron"));
    expect(onSelectGeometry).toHaveBeenCalledWith("electron");
  });

  it("selects a representation style from the grid", async () => {
    const user = userEvent.setup();
    const onSelectRepresentation = vi.fn();
    renderDrawer({ onSelectRepresentation });

    expect(ocid("controls.representation.balls")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(ocid("controls.representation.wire"));
    expect(onSelectRepresentation).toHaveBeenCalledWith("wire");
  });

  it("resets the view and clears the overlay toggles", async () => {
    const user = userEvent.setup();
    const onResetView = vi.fn();
    const onToggle = vi.fn();
    renderDrawer({
      onResetView,
      onToggle,
      toggles: { ...toggles, bondAngles: true, lonePairs: true },
    });

    await user.click(ocid("controls.reset_button"));
    expect(onToggle).toHaveBeenCalledWith("bondAngles");
    expect(onToggle).toHaveBeenCalledWith("lonePairs");
    expect(onResetView).toHaveBeenCalledTimes(1);
  });

  it("selects a category and marks the active one", async () => {
    const user = userEvent.setup();
    const onSelectCategory = vi.fn();
    renderDrawer({ onSelectCategory });

    expect(ocid("controls.category.vsepr")).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(ocid("controls.category.organic"));
    expect(onSelectCategory).toHaveBeenCalledWith("organic");
  });

  it("closes from the close button", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    renderDrawer({ onClose });
    await user.click(ocid("controls.close_button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("offers an enabled Compare switch when the molecule has a lone pair", async () => {
    const user = userEvent.setup();
    const onToggleCompare = vi.fn();
    renderDrawer({ canCompare: true, compare: false, onToggleCompare });

    const compare = screen.getByRole("switch", {
      name: "Compare with and without lone pairs",
    });
    expect(compare).not.toBeDisabled();
    expect(compare).toHaveAttribute("aria-checked", "false");
    expect(
      screen.getByText("Split view: real vs idealised shape"),
    ).toBeInTheDocument();

    await user.click(compare);
    expect(onToggleCompare).toHaveBeenCalledTimes(1);
  });

  it("disables Compare and explains why when there are no lone pairs", () => {
    renderDrawer({ canCompare: false, compare: false });

    const compare = screen.getByRole("switch", {
      name: "Compare with and without lone pairs",
    });
    expect(compare).toBeDisabled();
    expect(
      screen.getByText("No lone pairs — shape unchanged"),
    ).toBeInTheDocument();
  });
});
