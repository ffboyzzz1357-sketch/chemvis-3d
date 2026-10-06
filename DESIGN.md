# Design Brief

## Direction

ChemVis 3D — a mobile-first, deep-navy "lab instrument" that renders molecules on a teal grid, with teal/cyan as the instrument signal and amber as the warning-mark accent.

## Tone

Refined industrial/scientific: near-black navy canvas, precise teal glow, generous rounded surfaces — reads like a calibrated scientific instrument, not a web page.

## Differentiation

The 3D molecule is the only luminous object in a dark field: floating translucent atom labels, a faint teal grid, and chrome that recedes into dark rounded cards and a bottom sheet.

## Color Palette

| Token              | OKLCH          | Role                                              |
| ------------------ | -------------- | ------------------------------------------------- |
| background         | 0.16 0.02 258  | Deep navy-black app canvas (#0A0F1A)              |
| foreground         | 0.97 0.006 230 | High-contrast near-white primary text             |
| card               | 0.21 0.022 256 | Card / popover surface                            |
| surface            | 0.24 0.024 256 | Row + input surface                               |
| surface-2          | 0.29 0.026 256 | Elevated inner row                                |
| sheet              | 0.21 0.022 256 | Bottom-sheet surface                              |
| primary            | 0.78 0.15 215  | Teal/cyan accent — logo, active chips, bars       |
| accent             | 0.82 0.17 80   | Amber accent — selected segments, lone pairs      |
| muted-foreground   | 0.66 0.014 240 | Secondary gray labels                             |
| border             | 0.32 0.024 256 | Hairline borders                                  |
| destructive        | 0.65 0.19 22   | Close / destructive actions                       |

## Typography

- Display: Space Grotesk — wordmark, molecule names, panel headings
- Body: DM Sans — labels, chips, search, list text
- Mono: JetBrains Mono — formulas, VSEPR notation, numeric readouts
- Scale: molecule name `text-lg font-bold`, value `text-xl font-bold`, section label `text-xs font-semibold tracking-widest uppercase`, body `text-sm`, readout `text-sm font-mono tabular-nums`

## Elevation & Depth

Depth is layered: flat navy canvas with a faint teal grid, dark rounded cards with hairline borders, and a bottom sheet with rounded top corners lifted by a soft dark shadow.

## Structural Zones

| Zone            | Background                  | Border                        | Notes                                          |
| --------------- | --------------------------- | ----------------------------- | ---------------------------------------------- |
| Top bar         | transparent over canvas     | none                          | Teal atom badge + "ChemVis 3D" wordmark        |
| Search          | `.search-bar` surface       | border-border/80              | 20px radius, magnifier icon, placeholder       |
| Filter chips    | `.chip` / `.chip-active`    | teal outline when active      | Pill row, horizontally scrollable              |
| 3D viewport     | `.grid-background` navy     | —                             | 44px teal grid, floating atom labels           |
| Molecule list   | dark rows                   | `.accent-bar` teal left edge  | Name bold, formula gray, AXnEm pill badge      |
| Bottom sheet    | `.bottom-sheet`             | border-t, rounded top 24px    | Drag handle, "Hide details", detail cards      |

## Spacing & Rhythm

Panels inset 16px from viewport edges; card padding 16px; 8px micro-gap between chips, 12px between rows, 24px between sections.

## Component Patterns

- Buttons: rounded-2xl dark surface or teal fill; active segments amber fill with near-black text; icon buttons 36px
- Cards: rounded-2xl (16px), `.surface-card` / `.surface-row`, hairline border, `shadow-card`
- Badges: pill (full radius), AXnEm mono text, muted surface fill with border
- Chips: `.chip` rounded-full, teal outline + tint when active
- Segmented controls: `.segment-track` inset dark track, `.segment-active` amber
- Toggles: teal active track, muted inactive, 0.2s transition
- Atom labels: `.atom-label` translucent mono pill, pointer-events-none, floats over 3D atoms

## Motion

- Entrance: panels `animate-slide-up` 0.35s, canvas `animate-fade-in` 0.4s, sheet `animate-sheet-up` 0.4s
- Hover: `transition-smooth` (0.3s cubic-bezier) on borders, backgrounds, shadows
- Decorative: `animate-pulse-ring` on logo badge, `animate-orbit-spin` on orbit ring, `animate-chip-pop` on chip select

## Constraints

- Dark theme only — no light mode toggle
- Teal/cyan accent for branding, active chips, list bars, active toggles; amber reserved for selected segments and lone-pair emphasis
- Glassmorphism reserved for floating overlays only; never on the canvas itself
- Canvas/WebGL may use literal CPK hex values; DOM must use semantic tokens only
- No side-by-side comparison, snapshot export, or sharing UI

## Signature Detail

The teal atomic-orbit logo badge with a slow `pulse-ring` glow, mirrored by the faint teal grid under the molecule — a small instrument light that anchors the whole lab-equipment identity.
