import { MoleculeCanvas } from "@/components/MoleculeCanvas";
import type { CameraSyncRef } from "@/components/MoleculeCanvas";
import { framingDistance } from "@/lib/view-utils";
import type { Molecule } from "@/types/molecule";
import { ArrowRight, X } from "lucide-react";
import { useRef } from "react";

interface CompareViewProps {
  molecule: Molecule;
  autoRotate: boolean;
  resetSignal: number;
  onExit: () => void;
}

/**
 * Ideal bond angles for the electron-domain geometries the idealised pane can
 * adopt. These are the textbook VSEPR values the repelled shape is compared
 * against.
 */
const IDEAL_ANGLES: Record<string, number> = {
  Linear: 180,
  "Trigonal Planar": 120,
  Tetrahedral: 109.5,
  "Trigonal Bipyramidal": 120,
  Octahedral: 90,
};

/** Formats an angle without a trailing ".0" for whole numbers. */
function formatAngle(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

interface ComparePaneProps {
  label: string;
  geometry: string;
  angle: number | undefined;
  tone: "real" | "ideal";
  molecule: Molecule;
  showLonePairs: boolean;
  autoRotate: boolean;
  resetSignal: number;
  sync: CameraSyncRef;
  syncId: string;
}

/** One half of the split view: a labelled, framed 3D pane. */
function ComparePane({
  label,
  geometry,
  angle,
  tone,
  molecule,
  showLonePairs,
  autoRotate,
  resetSignal,
  sync,
  syncId,
}: ComparePaneProps) {
  const accent = tone === "real" ? "text-primary" : "text-accent-amber";
  const border =
    tone === "real" ? "border-primary/40" : "border-accent-amber/40";

  return (
    <section
      className={`compare-pane relative min-h-0 overflow-hidden rounded-2xl border ${border}`}
      aria-label={label}
      data-ocid={`compare.pane.${tone}`}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col gap-0.5 bg-gradient-to-b from-background/85 to-transparent px-3 pb-6 pt-2.5">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <span
          className={`truncate font-display text-sm font-semibold ${accent}`}
        >
          {geometry}
        </span>
        {angle !== undefined && (
          <span className="font-mono text-xs text-muted-foreground">
            {formatAngle(angle)}°
          </span>
        )}
      </div>

      <MoleculeCanvas
        molecule={molecule}
        showLonePairs={showLonePairs}
        showBondAngles={false}
        autoRotate={autoRotate}
        resetSignal={resetSignal}
        sync={sync}
        syncId={syncId}
      />
    </section>
  );
}

/**
 * Split comparison viewport. The left pane shows the real, repelled shape with
 * its lone-pair markers; the right pane shows the idealised shape the same
 * electron domains would adopt without lone pairs. Both panes render the same
 * molecule and share one camera, so orbiting, zooming, or panning either pane
 * moves the other in lockstep.
 */
export function CompareView({
  molecule,
  autoRotate,
  resetSignal,
  onExit,
}: CompareViewProps) {
  const sync = useRef({
    position: [0, 0, framingDistance(molecule)] as [number, number, number],
    target: [0, 0, 0] as [number, number, number],
    version: 0,
    source: "",
  });

  const realAngle = molecule.bondAngles[0]?.ideal;
  const idealAngle = IDEAL_ANGLES[molecule.idealizedGeometry];

  return (
    <div
      className="flex h-full w-full flex-col gap-2 p-3 pb-24 sm:gap-3 sm:p-4 sm:pb-28"
      data-ocid="compare.view"
    >
      <div className="compare-summary flex shrink-0 flex-col gap-1.5 rounded-2xl border border-border/60 px-3 py-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate font-display text-sm font-semibold text-primary">
              {molecule.molecularGeometry}
            </span>
            <ArrowRight
              className="h-3.5 w-3.5 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <span className="truncate font-display text-sm font-semibold text-accent-amber">
              {molecule.idealizedGeometry}
            </span>
          </div>
          <button
            type="button"
            onClick={onExit}
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-3 py-1.5 text-xs font-medium text-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="compare.exit_button"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
            Exit compare
          </button>
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">
          {molecule.shapeNote}
        </p>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
        <ComparePane
          label="With lone pairs"
          geometry={molecule.molecularGeometry}
          angle={realAngle}
          tone="real"
          molecule={molecule}
          showLonePairs
          autoRotate={autoRotate}
          resetSignal={resetSignal}
          sync={sync}
          syncId="real"
        />
        <ComparePane
          label="Without lone pairs"
          geometry={molecule.idealizedGeometry}
          angle={idealAngle}
          tone="ideal"
          molecule={molecule}
          showLonePairs={false}
          autoRotate={false}
          resetSignal={resetSignal}
          sync={sync}
          syncId="ideal"
        />
      </div>
    </div>
  );
}
