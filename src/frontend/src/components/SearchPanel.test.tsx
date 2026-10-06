import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { SearchPanel } from "@/components/SearchPanel";

function renderPanel(
  overrides: Partial<Parameters<typeof SearchPanel>[0]> = {},
) {
  const props = {
    query: "",
    onQueryChange: vi.fn(),
    selectedId: "h2o",
    onSelect: vi.fn(),
    onClose: vi.fn(),
    ...overrides,
  };
  render(<SearchPanel {...props} />);
  return props;
}

/** Controlled harness so typing actually updates the rendered list. */
function ControlledPanel({
  onSelect = vi.fn(),
}: {
  onSelect?: (id: string) => void;
}) {
  const [query, setQuery] = useState("");
  return (
    <SearchPanel
      query={query}
      onQueryChange={setQuery}
      selectedId="h2o"
      onSelect={onSelect}
      onClose={vi.fn()}
    />
  );
}

describe("SearchPanel", () => {
  it("groups the library by category and marks the selected molecule", () => {
    renderPanel();
    expect(
      screen.getByRole("heading", { name: "VSEPR Geometries" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Organic" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Inorganic" }),
    ).toBeInTheDocument();

    // Water appears in both VSEPR and Inorganic; the selected one is h2o.
    const water = document.querySelector('[data-ocid="library.item.h2o"]');
    expect(water).toHaveAttribute("aria-current", "true");
  });

  it("filters the list live as the query changes", async () => {
    const user = userEvent.setup();
    render(<ControlledPanel />);
    const input = screen.getByRole("searchbox", { name: "Search molecules" });
    await user.type(input, "CH4");
    expect(input).toHaveValue("CH4");
    expect(
      document.querySelector('[data-ocid="library.item.ch4"]'),
    ).toBeInTheDocument();
    expect(document.querySelector('[data-ocid="library.item.h2o"]')).toBeNull();
  });

  it("shows a no-results message with a clear action for an unmatched query", async () => {
    const user = userEvent.setup();
    const { onQueryChange } = renderPanel({ query: "zzz" });
    expect(screen.getByText("No molecules found")).toBeInTheDocument();
    expect(document.querySelector('[data-ocid="library.item.h2o"]')).toBeNull();

    // The empty state's reset button shares its "Clear search" label with the
    // input's clear icon, so target the empty-state action by its ocid.
    await user.click(
      document.querySelector(
        '[data-ocid="library.reset_button"]',
      ) as HTMLElement,
    );
    expect(onQueryChange).toHaveBeenCalledWith("");
  });

  it("selects a molecule when its list item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<ControlledPanel onSelect={onSelect} />);
    const methane = document.querySelector('[data-ocid="library.item.ch4"]');
    expect(methane).not.toBeNull();
    await user.click(methane as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith("ch4");
  });

  it("closes the panel from the close button", async () => {
    const user = userEvent.setup();
    const { onClose } = renderPanel();
    await user.click(
      screen.getByRole("button", { name: "Close library panel" }),
    );
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
