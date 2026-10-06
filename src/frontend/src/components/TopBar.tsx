import { Pause, Play, RotateCcw } from "lucide-react";

interface TopBarProps {
  autoRotate: boolean;
  onToggleRotate: () => void;
  onReset: () => void;
}

/**
 * Teal hexagonal atomic-orbit logo badge, "ChemVis 3D" wordmark with the "3D"
 * in teal, and two round outline icon buttons for play/pause and reset.
 */
export function TopBar({ autoRotate, onToggleRotate, onReset }: TopBarProps) {
  return (
    <header
      className="flex items-center justify-between gap-3"
      data-ocid="topbar.panel"
    >
      <div className="flex min-w-0 items-center gap-2.5">
        <span
          className="badge-orbit relative grid h-10 w-10 shrink-0 place-items-center"
          aria-hidden="true"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-primary-foreground"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            role="img"
            aria-label="ChemVis 3D atomic orbit logo"
          >
            <ellipse cx="12" cy="12" rx="9" ry="3.6" />
            <ellipse
              cx="12"
              cy="12"
              rx="9"
              ry="3.6"
              transform="rotate(60 12 12)"
            />
            <ellipse
              cx="12"
              cy="12"
              rx="9"
              ry="3.6"
              transform="rotate(120 12 12)"
            />
            <circle cx="12" cy="12" r="1.7" fill="currentColor" stroke="none" />
          </svg>
        </span>
        <h1 className="truncate font-display text-lg font-semibold leading-none tracking-tight text-foreground">
          ChemVis <span className="text-primary">3D</span>
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onToggleRotate}
          aria-label={autoRotate ? "Pause auto-rotation" : "Play auto-rotation"}
          aria-pressed={autoRotate}
          className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-surface/60 text-foreground transition-smooth hover:border-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-ocid="topbar.toggle"
        >
          {autoRotate ? (
            <Pause className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Play className="h-4 w-4" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          onClick={onReset}
          aria-label="Reset view"
          className="grid h-10 w-10 place-items-center rounded-full border border-border/70 bg-surface/60 text-foreground transition-smooth hover:border-primary/70 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          data-ocid="topbar.reset_button"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}
