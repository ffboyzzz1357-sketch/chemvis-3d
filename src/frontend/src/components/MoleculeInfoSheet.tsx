import { BondAngleCard } from "@/components/BondAngleCard";
import { CentralAtomCard } from "@/components/CentralAtomCard";
import { ElementLegend } from "@/components/ElementLegend";
import { CATEGORY_LABELS, getElementsForMolecule } from "@/data/molecules";
import type { Molecule } from "@/types/molecule";
import { ChevronDown, X } from "lucide-react";

interface MoleculeInfoSheetProps {
  molecule: Molecule;
  open: boolean;
  onClose: () => void;
}

/**
 * Details bottom sheet: rounded top corners, drag handle, "Hide details" header
 * with chevron and close X, molecule name/formula/category chip, an element
 * legend, a 2x2 property grid, and side-by-side electron/molecular geometry
 * cards. The reopen trigger lives in the shell's bottom bar.
 */
export function MoleculeInfoSheet({
  molecule,
  open,
  onClose,
}: MoleculeInfoSheetProps) {
  if (!open) {
    return null;
  }

  const elements = getElementsForMolecule(molecule);

  const properties = [
    { label: "Hybridization", value: molecule.hybridization, amber: false },
    { label: "VSEPR", value: molecule.vsepr, amber: false },
    {
      label: "Bonding pairs",
      value: String(molecule.bondingPairs),
      amber: false,
    },
    { label: "Lone pairs", value: String(molecule.lonePairs), amber: true },
  ];

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center">
      <button
        type="button"
        aria-label="Hide details"
        onClick={onClose}
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        data-ocid="details.backdrop"
      />
      <section
        className="bottom-sheet relative z-10 max-h-[82vh] w-full animate-sheet-up overflow-hidden"
        aria-label={`${molecule.name} details`}
        data-ocid="details.sheet"
      >
        <div className="flex justify-center pt-2.5">
          <span className="sheet-handle" aria-hidden="true" />
        </div>

        <div className="flex items-center justify-between gap-3 px-4 pb-1 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="details.hide_button"
          >
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
            Hide details
          </button>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close molecule details"
            className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-smooth hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            data-ocid="details.close_button"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="scrollbar-thin max-h-[72vh] overflow-y-auto px-4 pb-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate font-display text-xl font-semibold text-foreground">
              {molecule.name}
            </h2>
            <span className="shrink-0 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-0.5 font-mono text-[11px] text-primary">
              {CATEGORY_LABELS[molecule.category]}
            </span>
          </div>
          <p className="mt-0.5 font-mono text-sm text-muted-foreground">
            {molecule.formula}
          </p>

          <div className="mt-4">
            <ElementLegend elements={elements} />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            {properties.map((property) => (
              <div
                key={property.label}
                className={`rounded-2xl border bg-secondary/30 px-3 py-2.5 ${
                  property.amber ? "border-accent-amber/40" : "border-border/40"
                }`}
                data-ocid={`details.property.${property.label
                  .toLowerCase()
                  .replace(/\s+/g, "_")}`}
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  {property.label}
                </p>
                <p
                  className={`mt-1 font-display text-lg font-semibold ${
                    property.amber ? "text-accent-amber" : "text-foreground"
                  }`}
                >
                  {property.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4">
            <h3 className="mb-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Geometry
            </h3>
            <div className="grid grid-cols-2 gap-2">
              <div
                className="rounded-2xl border border-primary/40 bg-secondary/30 px-3 py-2.5"
                data-ocid="details.geometry.molecular"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Actual shape
                </p>
                <p className="mt-1 font-display text-base font-semibold text-primary">
                  {molecule.molecularGeometry}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  after lone-pair repulsion
                </p>
              </div>
              <div
                className="rounded-2xl border border-accent-amber/40 bg-secondary/30 px-3 py-2.5"
                data-ocid="details.geometry.electron"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  Idealised
                </p>
                <p className="mt-1 font-display text-base font-semibold text-accent-amber">
                  {molecule.idealizedGeometry}
                </p>
                <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                  if lone pairs were bonding
                </p>
              </div>
            </div>

            <div
              className="mt-2 flex flex-wrap items-center gap-2 rounded-2xl border border-border/40 bg-secondary/30 px-3 py-2"
              data-ocid="details.geometry.cause"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                Cause
              </span>
              <span className="rounded-full border border-border/50 bg-background/40 px-2.5 py-0.5 font-mono text-[11px] text-foreground">
                {molecule.bondingPairs} bonding pairs
              </span>
              <span className="rounded-full border border-accent-amber/50 bg-accent-amber/10 px-2.5 py-0.5 font-mono text-[11px] text-accent-amber">
                {molecule.lonePairs} lone pairs
              </span>
            </div>

            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {molecule.shapeNote}
            </p>
          </div>

          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <CentralAtomCard molecule={molecule} />
            <BondAngleCard angles={molecule.bondAngles} />
          </div>

          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {molecule.description}
          </p>
        </div>
      </section>
    </div>
  );
}
