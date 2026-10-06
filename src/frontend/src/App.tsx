import { CompareView } from "@/components/CompareView";
import { ControlDrawer } from "@/components/ControlDrawer";
import { Layout } from "@/components/Layout";
import { MoleculeCanvas } from "@/components/MoleculeCanvas";
import { MoleculeInfoSheet } from "@/components/MoleculeInfoSheet";
import { SearchPanel } from "@/components/SearchPanel";
import { TopBar } from "@/components/TopBar";
import { useMoleculeView } from "@/hooks/use-molecule-view";
import { useUrlState } from "@/hooks/use-url-state";
import { ChevronUp, Columns2, Search, SlidersHorizontal } from "lucide-react";
import { useCallback, useState } from "react";

export default function App() {
  const {
    moleculeId,
    category,
    compare,
    selectMolecule,
    selectCategory,
    setCompare,
  } = useUrlState();
  const {
    molecule,
    canCompare,
    query,
    setQuery,
    toggles,
    toggle,
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
  } = useMoleculeView(moleculeId);
  const [resetSignal, setResetSignal] = useState(0);

  const handleReset = useCallback(() => {
    setResetSignal((value) => value + 1);
  }, []);

  const compareActive = compare && canCompare;

  return (
    <Layout
      moleculeName={molecule.name}
      topBar={
        <TopBar
          autoRotate={toggles.autoRotate}
          onToggleRotate={() => toggle("autoRotate")}
          onReset={handleReset}
        />
      }
      search={
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="search-bar w-full text-left transition-smooth hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Search molecules"
          data-ocid="search.open_button"
        >
          <Search
            className="h-4 w-4 shrink-0 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="truncate text-sm text-muted-foreground">
            Search molecules...
          </span>
        </button>
      }
      viewport={
        compareActive ? (
          <CompareView
            molecule={molecule}
            autoRotate={toggles.autoRotate}
            resetSignal={resetSignal}
            onExit={() => setCompare(false)}
          />
        ) : (
          <MoleculeCanvas
            molecule={molecule}
            showLonePairs={toggles.lonePairs}
            showBondAngles={toggles.bondAngles}
            autoRotate={toggles.autoRotate}
            resetSignal={resetSignal}
          />
        )
      }
      controlsTrigger={
        <button
          type="button"
          onClick={() => setControlsOpen(true)}
          className="surface-card flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-foreground shadow-card transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Open display controls"
          data-ocid="controls.open_button"
        >
          <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
          Controls
        </button>
      }
      compareTrigger={
        canCompare ? (
          <button
            type="button"
            onClick={() => setCompare(!compareActive)}
            aria-pressed={compareActive}
            aria-label="Compare with and without lone pairs"
            className={`surface-card flex items-center gap-2 px-4 py-2.5 text-sm font-medium shadow-card transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              compareActive
                ? "border-primary/70 text-primary"
                : "text-foreground hover:border-primary/60 hover:text-primary"
            }`}
            data-ocid="compare.toggle_button"
          >
            <Columns2 className="h-4 w-4" aria-hidden="true" />
            Compare
          </button>
        ) : (
          <span
            className="surface-card flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-muted-foreground"
            data-ocid="compare.disabled_message"
          >
            No lone pairs — shape unchanged
          </span>
        )
      }
      detailsTrigger={
        <button
          type="button"
          onClick={() => setDetailsOpen(true)}
          className="surface-card flex w-full items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-foreground shadow-card transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Show details for ${molecule.name}`}
          data-ocid="details.open_button"
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
          Show details
        </button>
      }
      overlays={
        <>
          <ControlDrawer
            open={controlsOpen}
            onClose={() => setControlsOpen(false)}
            toggles={toggles}
            onToggle={toggle}
            geometryReadout={geometryReadout}
            onSelectGeometry={setGeometryReadout}
            representation={representation}
            onSelectRepresentation={setRepresentation}
            onResetView={handleReset}
            category={category}
            onSelectCategory={selectCategory}
            compare={compareActive}
            canCompare={canCompare}
            onToggleCompare={() => setCompare(!compareActive)}
          />
          <MoleculeInfoSheet
            molecule={molecule}
            open={detailsOpen}
            onClose={() => setDetailsOpen(false)}
          />
          {searchOpen && (
            <SearchPanel
              query={query}
              onQueryChange={setQuery}
              selectedId={molecule.id}
              onSelect={selectMolecule}
              onClose={() => setSearchOpen(false)}
            />
          )}
        </>
      }
    />
  );
}
