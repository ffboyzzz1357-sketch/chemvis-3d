import type {
  GeometryReadout,
  Representation,
  ViewToggles,
} from "@/hooks/use-molecule-view";
import type { MoleculeCategory } from "@/types/molecule";
import {
  Atom,
  CircleDot,
  Columns2,
  RotateCw,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import type { ComponentType } from "react";

interface ControlDrawerProps {
  open: boolean;
  onClose: () => void;
  toggles: ViewToggles;
  onToggle: (key: keyof ViewToggles) => void;
  geometryReadout: GeometryReadout;
  onSelectGeometry: (readout: GeometryReadout) => void;
  representation: Representation;
  onSelectRepresentation: (representation: Representation) => void;
  onResetView: () => void;
  category: MoleculeCategory;
  onSelectCategory: (category: MoleculeCategory) => void;
  /** Whether the split comparison view is currently active. */
  compare?: boolean;
  /** Whether the current molecule has a lone pair to compare against. */
  canCompare?: boolean;
  onToggleCompare?: () => void;
}

type IconComponent = ComponentType<{ className?: string }>;

interface ToggleRow {
  key: keyof ViewToggles;
  label: string;
  description: string;
  icon: IconComponent;
}

const TOGGLE_ROWS: ToggleRow[] = [
  {
    key: "bondAngles",
    label: "Bond angles",
    description: "Arc overlays with degree labels",
    icon: CircleDot,
  },
  {
    key: "lonePairs",
    label: "Lone pairs",
    description: "Electron-domain markers",
    icon: Atom,
  },
  {
    key: "autoRotate",
    label: "Auto-rotation",
    description: "Slow continuous spin",
    icon: RotateCw,
  },
];

const GEOMETRY_OPTIONS: Array<{ id: GeometryReadout; label: string }> = [
  { id: "molecular", label: "Molecular" },
  { id: "electron", label: "Electron" },
];

const REPRESENTATIONS: Array<{
  id: Representation;
  label: string;
  icon: IconComponent;
}> = [
  { id: "balls", label: "Balls", icon: CircleDot },
  { id: "cpk", label: "CPK", icon: Atom },
  { id: "wire", label: "Wire", icon: SlidersHorizontal },
  { id: "density", label: "Density", icon: Sparkles },
];

/**
 * DISPLAY bottom sheet: rounded top corners, drag handle, title with close X,
 * three toggle rows, a reset-view pill, an amber segmented geometry readout,
 * and a 2x2 representation-style grid. Collapses to a floating Controls pill.
 */
export function ControlDrawer({
  open,
  onClose,
  toggles,
  onToggle,
  geometryReadout,
  onSelectGeometry,
  representation,
  onSelectRepresentation,
  onResetView,
  category,
  onSelectCategory,
  compare = false,
  canCompare = true,
  onToggleCompare,
}: ControlDrawerProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close view controls"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        data-ocid="controls.backdrop"
      />
      <section
        className="bottom-sheet relative z-10 max-h-[86vh] w-full animate-sheet-up overflow-hidden"
        aria-label="Display controls"
        data-ocid="controls.panel"
      >
        <div className="flex justify-center pt-2.5">
          <span className="sheet-handle" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-2">
          <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Display
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close view controls"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="controls.close_button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="scrollbar-thin max-h-[76vh] overflow-y-auto px-4 pb-6">
          <button
            type="button"
            role="switch"
            aria-checked={compare}
            aria-label="Compare with and without lone pairs"
            disabled={!canCompare}
            onClick={onToggleCompare}
            className={`flex w-full items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
              compare
                ? "border-primary/60 bg-primary/10"
                : "border-border/40 bg-secondary/30"
            } ${
              canCompare
                ? "hover:border-primary/40"
                : "cursor-not-allowed opacity-60"
            }`}
            data-ocid="controls.toggle.compare"
          >
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-smooth ${
                compare
                  ? "border-primary/50 bg-primary/15 text-primary"
                  : "border-border/50 bg-background/40 text-muted-foreground"
              }`}
              aria-hidden="true"
            >
              <Columns2 className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-medium text-foreground">
                Compare
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {canCompare
                  ? "Split view: real vs idealised shape"
                  : "No lone pairs — shape unchanged"}
              </span>
            </span>
            <span
              className={`relative h-5 w-9 shrink-0 rounded-full transition-smooth ${
                compare ? "bg-primary" : "bg-muted"
              }`}
              aria-hidden="true"
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-smooth ${
                  compare ? "left-[1.15rem]" : "left-0.5"
                }`}
              />
            </span>
          </button>

          <div className="mt-1.5 space-y-1.5">
            {TOGGLE_ROWS.map((row) => {
              const active = toggles[row.key];
              const Icon = row.icon;
              return (
                <button
                  key={row.key}
                  type="button"
                  role="switch"
                  aria-checked={active}
                  aria-label={row.label}
                  onClick={() => onToggle(row.key)}
                  className="flex w-full items-center gap-3 rounded-2xl border border-border/40 bg-secondary/30 px-3 py-2.5 text-left transition-smooth hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  data-ocid={`controls.toggle.${row.key}`}
                >
                  <span
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl border transition-smooth ${
                      active
                        ? "border-primary/50 bg-primary/15 text-primary"
                        : "border-border/50 bg-background/40 text-muted-foreground"
                    }`}
                    aria-hidden="true"
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium text-foreground">
                      {row.label}
                    </span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {row.description}
                    </span>
                  </span>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-smooth ${
                      active ? "bg-primary" : "bg-muted"
                    }`}
                    aria-hidden="true"
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-smooth ${
                        active ? "left-[1.15rem]" : "left-0.5"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              if (toggles.bondAngles) onToggle("bondAngles");
              if (toggles.lonePairs) onToggle("lonePairs");
              onResetView();
            }}
            className="mt-3 w-full rounded-full border border-border/60 bg-secondary/40 px-4 py-2.5 text-sm font-medium text-foreground transition-smooth hover:border-primary/60 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="controls.reset_button"
          >
            Reset view
          </button>

          <fieldset className="mt-5">
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Geometry readout
            </legend>
            <div className="segment-track w-full">
              {GEOMETRY_OPTIONS.map((option) => {
                const active = option.id === geometryReadout;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => onSelectGeometry(option.id)}
                    aria-pressed={active}
                    className={`segment flex-1 text-center ${
                      active ? "segment-active" : ""
                    }`}
                    data-ocid={`controls.geometry.${option.id}`}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5">
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Representation style
            </legend>
            <div className="grid grid-cols-2 gap-2">
              {REPRESENTATIONS.map((item) => {
                const active = item.id === representation;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectRepresentation(item.id)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-2 rounded-2xl border px-3 py-3.5 transition-smooth focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                      active
                        ? "border-accent-amber bg-accent-amber/10"
                        : "border-border/50 bg-secondary/30 hover:border-primary/40"
                    }`}
                    data-ocid={`controls.representation.${item.id}`}
                  >
                    <Icon
                      className={`h-5 w-5 ${
                        active ? "text-accent-amber" : "text-muted-foreground"
                      }`}
                    />
                    <span
                      className={`text-xs font-medium ${
                        active ? "text-accent-amber" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          <fieldset className="mt-5 border-t border-border/40 pt-4">
            <legend className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Category
            </legend>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  { id: "vsepr", label: "VSEPR Geometries" },
                  { id: "organic", label: "Organic" },
                  { id: "inorganic", label: "Inorganic" },
                ] as const
              ).map((item) => {
                const active = item.id === category;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelectCategory(item.id)}
                    aria-pressed={active}
                    className={`chip ${
                      active ? "chip-active" : "hover:text-foreground"
                    }`}
                    data-ocid={`controls.category.${item.id}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>
      </section>
    </div>
  );
}
