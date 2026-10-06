import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { TopBar } from "@/components/TopBar";

/**
 * The redesigned top bar: teal atomic-orbit logo badge, "ChemVis 3D" wordmark
 * (the "3D" is a nested span, so the heading is matched by role), and round
 * play/pause and reset icon buttons.
 */
describe("TopBar", () => {
  it("shows the brand badge, wordmark, and reflects the auto-rotate state", () => {
    render(<TopBar autoRotate onToggleRotate={vi.fn()} onReset={vi.fn()} />);

    expect(
      document.querySelector('svg[aria-label="ChemVis 3D atomic orbit logo"]'),
    ).not.toBeNull();
    expect(
      screen.getByRole("heading", { name: "ChemVis 3D" }),
    ).toBeInTheDocument();

    const toggle = screen.getByRole("button", {
      name: "Pause auto-rotation",
    });
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });

  it("offers play when auto-rotation is off and toggles it", async () => {
    const user = userEvent.setup();
    const onToggleRotate = vi.fn();
    render(
      <TopBar
        autoRotate={false}
        onToggleRotate={onToggleRotate}
        onReset={vi.fn()}
      />,
    );
    const toggle = screen.getByRole("button", { name: "Play auto-rotation" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await user.click(toggle);
    expect(onToggleRotate).toHaveBeenCalledTimes(1);
  });

  it("fires the reset control", async () => {
    const user = userEvent.setup();
    const onReset = vi.fn();
    render(<TopBar autoRotate onToggleRotate={vi.fn()} onReset={onReset} />);
    await user.click(screen.getByRole("button", { name: "Reset view" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
