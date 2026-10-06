import { getElement } from "@/data/elements";
import type { Molecule } from "@/types/molecule";

interface CentralAtomCardProps {
  molecule: Molecule;
}

interface Readout {
  label: string;
  value: string;
}

/**
 * Central-atom summary: element identity, hybridisation, VSEPR notation, and
 * the electron-domain vs. molecular geometry pair.
 */
export function CentralAtomCard({ molecule }: CentralAtomCardProps) {
  const central =
    molecule.atoms.find((atom) => atom.isCentral) ?? molecule.atoms[0];
  const element = getElement(central.element);

  const readouts: Readout[] = [
    { label: "Hybridisation", value: molecule.hybridization },
    { label: "VSEPR", value: molecule.vsepr },
    { label: "Electron geometry", value: molecule.electronGeometry },
    { label: "Molecular geometry", value: molecule.molecularGeometry },
  ];

  return (
    <section
      className="rounded-xl border border-border/40 bg-secondary/30 p-3"
      aria-label="Central atom"
      data-ocid="details.central_atom_card"
    >
      <div className="flex items-center gap-3">
        <span
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-border/50 font-display text-lg font-semibold text-foreground"
          style={{ backgroundColor: `${element.color}22` }}
          aria-hidden="true"
        >
          {element.symbol}
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
            Central atom
          </p>
          <p className="truncate font-display text-sm font-semibold text-foreground">
            {element.name}
          </p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-2">
        {readouts.map((readout) => (
          <div
            key={readout.label}
            className="rounded-lg border border-border/30 bg-background/40 px-2.5 py-2"
          >
            <dt className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {readout.label}
            </dt>
            <dd className="mt-0.5 truncate text-sm font-medium text-foreground">
              {readout.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
