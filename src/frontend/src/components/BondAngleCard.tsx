import type { BondAngle } from "@/types/molecule";

interface BondAngleCardProps {
  angles: BondAngle[];
}

/** Formats an ideal angle without a trailing ".0" for whole numbers. */
function formatAngle(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

/** List of measured bond angles with their ideal values and atom triplets. */
export function BondAngleCard({ angles }: BondAngleCardProps) {
  return (
    <section
      className="rounded-xl border border-border/40 bg-secondary/30 p-3"
      aria-label="Bond angles"
      data-ocid="details.bond_angle_card"
    >
      <h3 className="font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
        Bond angles
      </h3>

      {angles.length > 0 ? (
        <ul className="mt-2 space-y-1.5">
          {angles.map((angle, index) => (
            <li
              key={`${angle.a}-${angle.b}-${angle.c}-${index}`}
              className="flex items-center justify-between gap-3 rounded-lg border border-border/30 bg-background/40 px-2.5 py-1.5"
              data-ocid={`details.bond_angle.${index + 1}`}
            >
              <span className="min-w-0 truncate font-mono text-xs text-foreground">
                {angle.label ?? `${angle.a}–${angle.b}–${angle.c}`}
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold text-primary">
                {formatAngle(angle.ideal)}°
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          No discrete bond angles for this geometry.
        </p>
      )}
    </section>
  );
}
