import type { ElementInfo } from "@/types/molecule";

interface ElementLegendProps {
  elements: ElementInfo[];
}

/** CPK colour legend for every element present in the molecule. */
export function ElementLegend({ elements }: ElementLegendProps) {
  return (
    <section
      className="rounded-xl border border-border/40 bg-secondary/30 p-3"
      aria-label="Element legend"
      data-ocid="details.element_legend"
    >
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Element legend
      </h3>
      <ul className="mt-2 flex flex-wrap gap-1.5">
        {elements.map((element) => (
          <li
            key={element.symbol}
            className="flex items-center gap-2 rounded-full border border-border/40 bg-background/40 px-2.5 py-1"
            data-ocid={`details.element.${element.symbol}`}
          >
            <span
              className="cpk-dot"
              style={{ backgroundColor: element.color }}
              aria-hidden="true"
            />
            <span className="font-mono text-xs font-semibold text-foreground">
              {element.symbol}
            </span>
            <span className="text-xs text-muted-foreground">
              {element.name}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
