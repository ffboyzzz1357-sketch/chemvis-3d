# Project Guidance

## User Preferences

- Dark theme throughout
- Teal/cyan accent color for the logo badge and active states
- Amber/orange accent for selected segmented controls and lone-pair emphasis
- Full 360-degree free orbit (pitch, yaw, roll, zoom, pan)
- CPK atom coloring
- Dismissible floating panels with X close buttons
- Molecule name shown at the top of the grid area, not on the atom balls
- UI must match the provided reference screenshots exactly
- Ring/aromatic molecules (e.g. benzene) use smaller atom balls so bonds stay visible

## Verified Commands

- **typecheck**: `pnpm typecheck`
- **fix**: `pnpm fix`
- **build**: `pnpm build`

## Learnings

- Dark theme activation belongs in main.tsx before render when tailwind darkMode is ['class']; index.html alone leaves the light :root tokens active.
- The app is a static-data 3D molecule viewer: molecule data lives in src/frontend/src/data/molecules.ts (26 molecules) and elements in src/frontend/src/data/elements.ts; no backend API is used.
- The details sheet is a flex column sibling of the viewport in Layout.tsx, capped at 42vh scroll; CPK colors are hex strings applied inline.
- three-stdlib is not a direct dependency; type the drei OrbitControls ref as React.ComponentRef<typeof OrbitControls> instead of importing OrbitControlsImpl.
- useUrlState uses the History API (replaceState + popstate) for single-route URL persistence, avoiding a full TanStack Router setup.
- Frontend test stack is Vitest 3 + jsdom + @testing-library/react; run the suite with pnpm --dir app test.
- The redesigned ChemVis 3D shell is mobile-first: Layout owns the single Controls pill and Show details bar triggers; ControlDrawer and MoleculeInfoSheet return null when closed and mount as fixed overlays above the viewport.
- useMoleculeView exposes molecule, query, setQuery, toggles, toggle, setAutoRotate, geometryReadout, representation, controlsOpen, detailsOpen, searchOpen; the DISPLAY sheet's geometry/representation selection drives only the active highlight, not the 3D render.
- selectMolecule in use-url-state.ts writes both the molecule and its category param so the URL and category chip stay consistent after refresh.
- Reference bonds are light-blue metallic gray (#c3ccd6), not the teal accent; atom labels use 'Element (Symbol)' for outer atoms and 'Element Symbol' for the central atom.
- pnpm typecheck includes test files; production-only tsc excluding src/**/*.test.ts(x) and src/test/** exits 0, and pnpm fix + pnpm build pass independently.
- The floating 3D atom labels were removed: AtomLabel.tsx is deleted, MoleculeModel/MoleculeCanvas no longer take a showLabels prop, and use-molecule-view no longer exposes an atomLabels toggle.
- The current molecule's name is shown as an h1 (data-ocid molecule.name_heading) at the top of the grid area in Layout.tsx, between the top bar and the search bar, threaded from App.tsx via a moleculeName prop.
- pnpm build is vite build only (no tsc), so test-file type errors do not block the production build; pnpm typecheck is the step that includes test files.
- Compare mode is persisted as ?compare=1 in use-url-state and re-derived against molecule.lonePairs > 0 on read, so a stale compare param on a no-lone-pair molecule is ignored.
- Molecule now carries idealizedGeometry and shapeNote on all 26 entries; idealizedGeometry equals molecularGeometry when lonePairs === 0, and shapeNote carries the 'No lone pairs - shape unchanged' copy.
- CompareView's pane grid uses grid-cols-1 sm:grid-cols-2 so the two 3D panes stack on mobile and sit side-by-side on wider screens.
- Camera sync between two r3f canvases uses a shared mutable ref carrying {position,target,version,source}: each canvas applies states whose version is newer and whose source differs, guarded by an applying flag plus a 1e-4 epsilon check to stop echo loops.
- MoleculeInfoSheet's details.geometry.molecular / details.geometry.electron ocids are asserted by tests, so the real-vs-idealised relabelling reuses those ocids rather than introducing new ones.
- The R3F jsdom stderr noise (unrecognized <mesh>/<sphereGeometry> tags, non-boolean transparent) is expected in MoleculeModel tests and does not indicate failure.
