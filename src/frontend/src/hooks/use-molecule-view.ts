import { MOLECULES, getMoleculeById } from "@/data/molecules";
import type { Molecule } from "@/types/molecule";
import { useCallback, useMemo, useState } from "react";

export interface ViewToggles {
  lonePairs: boolean;
  bondAngles: boolean;
  autoRotate: boolean;
}

export type GeometryReadout = "molecular" | "electron";
export type Representation = "balls" | "cpk" | "wire" | "density";

const DEFAULT_TOGGLES: ViewToggles = {
  lonePairs: false,
  bondAngles: false,
  autoRotate: true,
};

/**
 * Owns the transient viewer state: which molecule is selected, the search
 * query, the floating-sheet visibility, and the render toggles. URL-backed
 * selection lives in `useUrlState`; this hook layers the local UI state on top.
 *
 * The shell exposes three independent overlay sheets — controls, details, and
 * search — so each can be opened and dismissed without disturbing the others.
 */
export function useMoleculeView(moleculeId: string) {
  const [query, setQuery] = useState("");
  const [toggles, setToggles] = useState<ViewToggles>(DEFAULT_TOGGLES);
  const [geometryReadout, setGeometryReadout] =
    useState<GeometryReadout>("molecular");
  const [representation, setRepresentation] = useState<Representation>("balls");
  const [controlsOpen, setControlsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const molecule: Molecule = useMemo(
    () => getMoleculeById(moleculeId) ?? MOLECULES[0],
    [moleculeId],
  );

  /**
   * The comparison view only makes sense when the central atom carries at least
   * one lone pair; without one the real and idealised shapes are identical.
   */
  const canCompare = molecule.lonePairs > 0;

  const toggle = useCallback((key: keyof ViewToggles) => {
    setToggles((current) => ({ ...current, [key]: !current[key] }));
  }, []);

  const setAutoRotate = useCallback((value: boolean) => {
    setToggles((current) => ({ ...current, autoRotate: value }));
  }, []);

  return {
    molecule,
    canCompare,
    query,
    setQuery,
    toggles,
    toggle,
    setAutoRotate,
    geometryReadout,
    setGeometryReadout,
    representation,
    setRepresentation,
    controlsOpen,
    setControlsOpen,
    detailsOpen,
    setDetailsOpen,
    searchOpen,
    setSearchOpen,
  };
}
