import { CATEGORY_LABELS, searchMolecules } from "@/data/molecules";
import type { Molecule, MoleculeCategory } from "@/types/molecule";
import { Search, X } from "lucide-react";
import { useState } from "react";

interface SearchPanelProps {
  query: string;
  onQueryChange: (value: string) => void;
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

type FilterId = "all" | MoleculeCategory | "hybridization";

const FILTERS: Array<{ id: FilterId; label: string }> = [
  { id: "all", label: "All" },
  { id: "vsepr", label: "VSEPR Shape" },
  { id: "organic", label: "Organic" },
  { id: "inorganic", label: "Inorganic" },
  { id: "hybridization", label: "Hybridization" },
];

const CATEGORY_ORDER: MoleculeCategory[] = ["vsepr", "organic", "inorganic"];

/**
 * Search results sheet: opens over the viewport, with a teal-outlined search
 * field, a filter chip row, and result rows that show the molecule name,
 * formula, and a rounded VSEPR badge behind a left teal accent bar. Selecting a
 * result loads the molecule and closes the sheet; an empty state offers a
 * "Clear search" action.
 */
export function SearchPanel({
  query,
  onQueryChange,
  selectedId,
  onSelect,
  onClose,
}: SearchPanelProps) {
  const [filter, setFilter] = useState<FilterId>("all");

  const results = searchMolecules(query).filter((molecule) => {
    if (filter === "all" || filter === "hybridization") return true;
    return molecule.category === filter;
  });
  const hasResults = results.length > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close search"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        data-ocid="library.backdrop"
      />
      <section
        className="bottom-sheet relative z-10 flex max-h-[86vh] w-full flex-col overflow-hidden"
        aria-label="Molecule library"
        data-ocid="library.panel"
      >
        <div className="flex justify-center pt-2.5">
          <span className="sheet-handle" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Search results
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close library panel"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="library.close_button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="px-4">
          <div className="search-bar border-primary/70 ring-1 ring-primary/40">
            <Search
              className="h-4 w-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Search molecules..."
              aria-label="Search molecules"
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              data-ocid="library.search_input"
            />
            {query.length > 0 && (
              <button
                type="button"
                onClick={() => onQueryChange("")}
                aria-label="Clear search"
                className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-ocid="library.clear_button"
              >
                <X className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        <div className="scrollbar-thin mt-3 flex gap-2 overflow-x-auto px-4 pb-1">
          {FILTERS.map((item) => {
            const active = item.id === filter;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setFilter(item.id)}
                aria-pressed={active}
                className={`chip shrink-0 ${
                  active ? "chip-active" : "hover:text-foreground"
                }`}
                data-ocid={`library.filter.${item.id}`}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="scrollbar-thin mt-2 flex-1 overflow-y-auto px-4 pb-6">
          {hasResults ? (
            CATEGORY_ORDER.map((category) => {
              const items = results.filter(
                (molecule) => molecule.category === category,
              );
              if (items.length === 0) return null;
              return (
                <div key={category} className="mb-3 last:mb-0">
                  <h3 className="px-1 py-1.5 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                    {CATEGORY_LABELS[category]}
                  </h3>
                  <ul className="space-y-1.5">
                    {items.map((molecule: Molecule) => {
                      const active = molecule.id === selectedId;
                      return (
                        <li key={molecule.id}>
                          <button
                            type="button"
                            onClick={() => {
                              onSelect(molecule.id);
                              onClose();
                            }}
                            aria-current={active ? "true" : undefined}
                            className={`surface-row flex w-full items-center gap-3 px-3 py-2.5 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                              active
                                ? "border-primary/60 ring-1 ring-primary/40"
                                : "hover:border-primary/40"
                            }`}
                            data-ocid={`library.item.${molecule.id}`}
                          >
                            <span className="accent-bar h-8 shrink-0" />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-semibold text-foreground">
                                {molecule.name}
                              </span>
                              <span className="block font-mono text-xs text-muted-foreground">
                                {molecule.formula}
                              </span>
                            </span>
                            <span className="shrink-0 rounded-full border border-border/60 bg-background/50 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
                              {molecule.vsepr}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })
          ) : (
            <div
              className="flex flex-col items-center gap-3 px-4 py-10 text-center"
              data-ocid="library.empty_state"
            >
              <Search
                className="h-8 w-8 text-muted-foreground/60"
                aria-hidden="true"
              />
              <div>
                <p className="text-sm font-medium text-foreground">
                  No molecules found
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Nothing matches “{query}”. Try a name or formula.
                </p>
              </div>
              <button
                type="button"
                onClick={() => onQueryChange("")}
                className="rounded-full border border-primary/50 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary transition-smooth hover:bg-primary/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                data-ocid="library.reset_button"
              >
                Clear search
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
