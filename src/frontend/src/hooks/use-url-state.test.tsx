import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { useUrlState } from "@/hooks/use-url-state";

function setUrl(search: string) {
  window.history.replaceState(null, "", `/${search}`);
}

afterEach(() => {
  setUrl("");
});

describe("useUrlState", () => {
  it("defaults to the first molecule when the URL has no params", () => {
    setUrl("");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.moleculeId).toBe("becl2");
    expect(result.current.category).toBe("vsepr");
  });

  it("restores the selected molecule and category from the URL", () => {
    setUrl("?molecule=sf6&category=vsepr");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.moleculeId).toBe("sf6");
    expect(result.current.category).toBe("vsepr");
  });

  it("ignores an unknown molecule id and falls back to the default", () => {
    setUrl("?molecule=nope&category=organic");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.moleculeId).toBe("becl2");
    expect(result.current.category).toBe("organic");
  });

  it("writes the selection into the URL on selectMolecule", () => {
    setUrl("");
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.selectMolecule("ch4");
    });
    expect(result.current.moleculeId).toBe("ch4");
    expect(window.location.search).toContain("molecule=ch4");
  });

  it("selects the first molecule of a category when the category changes", () => {
    setUrl("");
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.selectCategory("organic");
    });
    expect(result.current.category).toBe("organic");
    expect(result.current.moleculeId).toBe("methane");
    expect(window.location.search).toContain("category=organic");
  });

  it("restores the selection when the user navigates back or forward", () => {
    setUrl("?molecule=h2o&category=vsepr");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.moleculeId).toBe("h2o");

    // replaceState does not emit popstate, so dispatch it explicitly to model
    // a browser back/forward navigation to a different selection.
    act(() => {
      setUrl("?molecule=ch4&category=vsepr");
      window.dispatchEvent(new PopStateEvent("popstate"));
    });
    expect(result.current.moleculeId).toBe("ch4");
    expect(result.current.category).toBe("vsepr");
  });

  it("preserves unrelated query params when the selection changes", () => {
    setUrl("?foo=bar");
    const { result } = renderHook(() => useUrlState());
    act(() => {
      result.current.selectMolecule("ch4");
    });
    const params = new URLSearchParams(window.location.search);
    expect(params.get("foo")).toBe("bar");
    expect(params.get("molecule")).toBe("ch4");
  });

  it("defaults compare to false and restores compare=1 from the URL", () => {
    setUrl("?molecule=h2o&category=vsepr");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.compare).toBe(false);

    setUrl("?molecule=h2o&category=vsepr&compare=1");
    const restored = renderHook(() => useUrlState());
    expect(restored.result.current.compare).toBe(true);
  });

  it("writes and clears the compare param through setCompare", () => {
    setUrl("?molecule=h2o&category=vsepr");
    const { result } = renderHook(() => useUrlState());

    act(() => {
      result.current.setCompare(true);
    });
    expect(result.current.compare).toBe(true);
    expect(window.location.search).toContain("compare=1");

    act(() => {
      result.current.setCompare(false);
    });
    expect(result.current.compare).toBe(false);
    expect(window.location.search).not.toContain("compare=1");
  });

  it("ignores a stale compare=1 on a molecule with no lone pairs", () => {
    setUrl("?molecule=ch4&category=vsepr&compare=1");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.moleculeId).toBe("ch4");
    expect(result.current.compare).toBe(false);
  });

  it("drops the comparison when switching to a molecule with no lone pairs", () => {
    setUrl("?molecule=h2o&category=vsepr&compare=1");
    const { result } = renderHook(() => useUrlState());
    expect(result.current.compare).toBe(true);

    act(() => {
      result.current.selectMolecule("ch4");
    });
    expect(result.current.compare).toBe(false);
    expect(window.location.search).not.toContain("compare=1");
  });

  it("keeps the comparison when switching between lone-pair molecules", () => {
    setUrl("?molecule=h2o&category=vsepr&compare=1");
    const { result } = renderHook(() => useUrlState());

    act(() => {
      result.current.selectMolecule("nh3");
    });
    expect(result.current.moleculeId).toBe("nh3");
    expect(result.current.compare).toBe(true);
    expect(window.location.search).toContain("compare=1");
  });
});
