import { MOLECULES } from "@/data/molecules";
import type { MoleculeCategory } from "@/types/molecule";
import { useCallback, useEffect, useState } from "react";

const CATEGORIES: MoleculeCategory[] = ["vsepr", "organic", "inorganic"];

function isCategory(value: string | null): value is MoleculeCategory {
  return value !== null && (CATEGORIES as string[]).includes(value);
}

interface UrlState {
  moleculeId: string;
  category: MoleculeCategory;
  /** True when the split comparison view is active. */
  compare: boolean;
}

function readParams(): UrlState {
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get("molecule");
  const requestedCategory = params.get("category");

  const molecule =
    MOLECULES.find((entry) => entry.id === requestedId) ?? MOLECULES[0];
  const category = isCategory(requestedCategory)
    ? requestedCategory
    : molecule.category;

  // The comparison is only meaningful for molecules with a lone pair, so a
  // stale `compare=1` on a molecule without one is ignored.
  const compare = params.get("compare") === "1" && molecule.lonePairs > 0;

  return { moleculeId: molecule.id, category, compare };
}

/**
 * Persists the selected molecule id and active category in the page URL so a
 * refresh restores the exact view. Uses the History API directly to avoid
 * pulling the whole router into a single-route tool.
 */
export function useUrlState() {
  const [state, setState] = useState(readParams);

  useEffect(() => {
    const onPopState = () => setState(readParams());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const update = useCallback(
    (next: {
      moleculeId?: string;
      category?: MoleculeCategory;
      compare?: boolean;
    }) => {
      setState((current) => {
        const merged = { ...current, ...next };
        const params = new URLSearchParams(window.location.search);
        params.set("molecule", merged.moleculeId);
        params.set("category", merged.category);
        if (merged.compare) {
          params.set("compare", "1");
        } else {
          params.delete("compare");
        }
        const query = params.toString();
        window.history.replaceState(
          null,
          "",
          `${window.location.pathname}?${query}`,
        );
        return merged;
      });
    },
    [],
  );

  const selectMolecule = useCallback(
    (moleculeId: string) => {
      const molecule = MOLECULES.find((entry) => entry.id === moleculeId);
      update({
        moleculeId,
        ...(molecule ? { category: molecule.category } : {}),
        // Leaving a lone-pair molecule drops the comparison so the URL never
        // claims a split view the new molecule cannot show.
        ...(molecule && molecule.lonePairs === 0 ? { compare: false } : {}),
      });
    },
    [update],
  );

  const selectCategory = useCallback(
    (category: MoleculeCategory) => {
      const first = MOLECULES.find((entry) => entry.category === category);
      update({
        category,
        moleculeId: first?.id,
        ...(first && first.lonePairs === 0 ? { compare: false } : {}),
      });
    },
    [update],
  );

  const setCompare = useCallback(
    (compare: boolean) => {
      update({ compare });
    },
    [update],
  );

  return { ...state, selectMolecule, selectCategory, setCompare };
}
