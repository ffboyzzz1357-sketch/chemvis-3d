import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useMoleculeView } from "@/hooks/use-molecule-view";

/**
 * The viewer's transient state machine: which molecule is resolved from the
 * URL-backed id, the search query, the floating-panel visibility, and the
 * render toggles. This is the behavior the layout replacement must preserve,
 * independent of which components render it.
 */
describe("useMoleculeView", () => {
  it("resolves the molecule for the given id", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));
    expect(result.current.molecule.id).toBe("h2o");
    expect(result.current.molecule.name).toBe("Water");
  });

  it("falls back to the first molecule for an unknown id", () => {
    const { result } = renderHook(() => useMoleculeView("does-not-exist"));
    expect(result.current.molecule.id).toBe("becl2");
  });

  it("starts with the documented default toggles", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));
    expect(result.current.toggles).toEqual({
      lonePairs: false,
      bondAngles: false,
      autoRotate: true,
    });
  });

  it("flips a single toggle without disturbing the others", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));

    act(() => {
      result.current.toggle("lonePairs");
    });
    expect(result.current.toggles).toEqual({
      lonePairs: true,
      bondAngles: false,
      autoRotate: true,
    });

    act(() => {
      result.current.toggle("bondAngles");
    });
    expect(result.current.toggles).toEqual({
      lonePairs: true,
      bondAngles: true,
      autoRotate: true,
    });
  });

  it("sets auto-rotation explicitly", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));

    act(() => {
      result.current.setAutoRotate(false);
    });
    expect(result.current.toggles.autoRotate).toBe(false);

    act(() => {
      result.current.setAutoRotate(true);
    });
    expect(result.current.toggles.autoRotate).toBe(true);
  });

  it("owns the search query and the three overlay-sheet visibility flags", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));

    expect(result.current.query).toBe("");
    // The redesigned shell opens every overlay sheet closed by default.
    expect(result.current.controlsOpen).toBe(false);
    expect(result.current.detailsOpen).toBe(false);
    expect(result.current.searchOpen).toBe(false);

    act(() => {
      result.current.setQuery("meth");
    });
    expect(result.current.query).toBe("meth");

    act(() => {
      result.current.setControlsOpen(true);
      result.current.setDetailsOpen(true);
      result.current.setSearchOpen(true);
    });
    expect(result.current.controlsOpen).toBe(true);
    expect(result.current.detailsOpen).toBe(true);
    expect(result.current.searchOpen).toBe(true);
  });

  it("owns the geometry readout and representation style", () => {
    const { result } = renderHook(() => useMoleculeView("h2o"));

    expect(result.current.geometryReadout).toBe("molecular");
    expect(result.current.representation).toBe("balls");

    act(() => {
      result.current.setGeometryReadout("electron");
      result.current.setRepresentation("cpk");
    });
    expect(result.current.geometryReadout).toBe("electron");
    expect(result.current.representation).toBe("cpk");
  });
});
