import type { ReactNode } from "react";

interface LayoutProps {
  /** Name of the currently selected molecule, shown at the top of the grid. */
  moleculeName: string;
  /** Top bar: logo badge, wordmark, and playback controls. */
  topBar: ReactNode;
  /** Full-width search bar directly below the top bar. */
  search: ReactNode;
  /** The 3D viewport that fills the remaining space. */
  viewport: ReactNode;
  /** Floating "Controls" pill anchored bottom-left of the viewport. */
  controlsTrigger: ReactNode;
  /** Optional "Compare" pill or disabled message beside the Controls pill. */
  compareTrigger?: ReactNode;
  /** Wide "Show details" bar anchored to the bottom of the viewport. */
  detailsTrigger: ReactNode;
  /** Overlay sheets (controls, details, search) mounted above the viewport. */
  overlays?: ReactNode;
}

/**
 * Mobile-first full-bleed shell: a full-screen 3D viewport sits on a subtle
 * teal grid, with the top bar and search bar stacked above it and floating
 * controls anchored to the bottom. Overlay sheets mount above everything.
 * On desktop the viewport simply fills the available width.
 */
export function Layout({
  moleculeName,
  topBar,
  search,
  viewport,
  controlsTrigger,
  compareTrigger,
  detailsTrigger,
  overlays,
}: LayoutProps) {
  return (
    <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-background">
      <div className="grid-background absolute inset-0" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,oklch(var(--background))_100%)]"
        aria-hidden="true"
      />

      <div className="relative z-10 flex min-h-0 flex-1 flex-col">
        <div className="shrink-0 px-3 pt-3 sm:px-4 sm:pt-4">{topBar}</div>
        <div className="shrink-0 px-3 pt-3 sm:px-4">
          <h1
            className="truncate font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl"
            data-ocid="molecule.name_heading"
          >
            {moleculeName}
          </h1>
        </div>
        <div className="shrink-0 px-3 pt-2.5 sm:px-4">{search}</div>

        <div className="relative min-h-0 flex-1">
          <div className="absolute inset-0">{viewport}</div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex flex-col gap-2 p-3 sm:p-4">
            <div className="flex items-end justify-between gap-3">
              <div className="pointer-events-auto flex flex-wrap items-center gap-2">
                {controlsTrigger}
                {compareTrigger}
              </div>
            </div>
            <div className="pointer-events-auto">{detailsTrigger}</div>
          </div>
        </div>
      </div>

      {overlays}
    </div>
  );
}
