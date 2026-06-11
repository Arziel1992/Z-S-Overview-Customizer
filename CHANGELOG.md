# Changelog

## 2026-06-11 - 22:20

### Iteration 5 — theme-aware YAML panel, clipboard-only sharing, README polish

- **Export Profile panel is now theme-aware** (was stuck dark in light mode) and
  shows **line numbers** in a sticky, non-copyable gutter.
- **Removed the dpaste.org integration** — the history "Share" button now copies
  the YAML straight to the clipboard; no third-party APIs remain.
- **README:** embedded the eight rendered flow diagrams from `images/` (replacing
  references to the gitignored `notes/` files), marked `notes/` as a local-only
  workspace in the project tree, updated sharing wording, and added the standard
  **Fenris hf. copyright notice** (adapted from the Z-S pack) at the end.

## 2026-06-11 - 21:39

### Iteration 4 — drag-and-drop UX, version display, documentation

- **Drag-and-drop reworked** on the library's purpose-built
  `dragHandleZone`/`dragHandle` API: grabs are captured reliably every time
  (the old `dragDisabled` gating missed gestures, and a resync effect was
  stomping in-flight drags), a **dashed ghost placeholder** marks the drop slot,
  and other rows **reflow live** (`animate:flip`). DragList now renders its own
  handle, so row snippets are simpler.
- **Up/down arrow buttons** added to every reorderable row as a mobile-friendly
  fallback to drag-and-drop.
- **App version is displayed in the header** (read from `package.json`), linking
  to the changelog.
- **README overhaul:** how the Overview engine works (presets, tabs, state
  matrix), the complete YAML config-key legend incl. the full state-ID table,
  cross-platform **out-of-game import instructions** (Windows/macOS/Linux
  Overview folders), a detailed project layout, an architecture flowchart
  (Mermaid), and links to the
  [Z-S Overview Pack](https://github.com/Arziel1992/Z-S-Overview-Pack/),
  Discord, and this changelog.
- **Renamed CCP to Fenris**
- **Mermaid Diagrams** added: eight detailed Mermaid diagrams covering startup/
  session lifecycle, import pipeline, data model, preview render pipeline,
  label styling, reorder UX, history/sharing, and the SDE CI pipeline.

## 2026-06-10 - 19:31

### Bugfix — 404s on GitHub Pages for data/preset fetches

- Runtime `fetch()` calls for `matrix_latest.json` and default preset YAMLs
  now use `import.meta.env.BASE_URL` instead of hardcoded root-relative paths.
  Fixes HTTP 404 errors when the app is served under the
  `/Z-S-Overview-Customizer/` subpath on GitHub Pages.

## 2026-06-10 - 19:29

### CI — Node 24 action compatibility

- Bumped `actions/checkout` from `v4` → `v5`.
- Bumped `actions/setup-node` from `v4` → `v6`.
- Bumped `actions/upload-pages-artifact` from `v3` → `v4`.
- Bumped `actions/deploy-pages` from `v4` → `v5`.
- Added workflow-level `FORCE_JAVASCRIPT_ACTIONS_TO_NODE24=true` env var for
  `actions/setup-python@v5` and `actions/configure-pages@v5` which haven't
  yet released Node 24-native major versions.

## 2026-06-10 - 19:23

### CI — SDE auto-update & GitHub Pages deploy

- **New workflow:** `.github/workflows/sde_update.yml` runs the SDE matrix
  builder weekly (Monday 06:00 UTC) and on manual `workflow_dispatch`.
- **Auto-commit:** when CCP's Static Data Export changes, the refreshed
  `matrix_latest.json` is committed directly to `main`.
- **GitHub Pages deploy:** after the SDE update, the site is built with Vite
  and deployed via `actions/deploy-pages`. On schedule, deploy only runs when
  new data is detected; on manual dispatch it always deploys.
- **Vite `base` path:** set to `/Z-S-Overview-Customizer/` so assets resolve
  correctly under the GitHub Pages subpath.

## 2026-06-10 - 19:02

### Iteration 3 — fixes & polish

- **`<fontsize=NN>` markup now renders** — bracket labels and tab/preset names
  from real Z-S exports no longer show raw `<fontsize=…>` / `<color=…>` text.
- **Drag-and-drop fixed:** reordering now works repeatedly (the list rebuilt its
  item ids on every commit, breaking the second drag) and uses a proper
  **`.drag-handle`** via `dragDisabled` — clears the `dndzone will ignore unknown
  options` console warning.
- **Tab Setup is now reorderable** (drag-and-drop) with index renumbering.
- **Import "Apply on top" semantics corrected:** presets are appended; tabs,
  columns, priorities and **ship labels are overwritten** when the incoming pack
  provides them (true Z-S core + layout-pack workflow).
- **Group filter category nav no longer flickers** while searching (keyed list).
- **Renderer:** entities are clamped inside the viewport (no more off-screen
  brackets) and the background is a softer space-blue with a twinkling
  **starfield** (respects `prefers-reduced-motion`).
- **Softer dark chrome** for the overview/preview panels (was near-black);
  unified **panel border radius** (`rounded-lg`) across settings, overview,
  brackets and roster.
- **First-run welcome modal** (Z-S Core / CCP / Import / Blank); the working
  profile autosaves to `localStorage`, so return visits **resume where you left
  off**.
- **Base bar:** added **Clear all** (blank profile); header logo is now
  **Z-SOC**; UI scale persists.
- Preset **filtered / always-shown** chips were already labelled; entity-state
  chips now show names too.

## 2026-06-10 - 18:27

### Iteration 2 — import/history, drag-and-drop, theming & docs

- **Markup renderer fix:** `renderEveMarkup` now balances *unclosed* `<color>` /
  `<b>` / `<i>` / `<u>` tags (EVE markup is stateful), so bracket labels render
  styled instead of showing literal `<color=…>` text.
- **Import dialog:** import a profile by file or paste, choosing **Overwrite** or
  **Apply on top** (merge) — pack-piece support via `src/lib/utils/merge.js`.
- **Version history (IndexedDB):** named save / load (overwrite or on-top) /
  rename / delete / export / **share to public paste** (dpaste.org, clipboard
  fallback) in `src/lib/utils/history.js` + `HistoryDialog.svelte`.
- **Drag-and-drop reordering** (mouse + touch) for Columns, Appearance
  priorities and Ship Labels via `svelte-dnd-action` + new `DragList.svelte`
  (replaces up/down arrows).
- **Ship Labels:** add/remove segments — fields, line breaks and spacers.
- **Preset editor:** filtered / always-shown state chips now show full labels,
  not just on hover.
- **Theming fix:** the settings panel is now theme-aware (was stuck dark in light
  mode); the live overview preview intentionally keeps game-accurate dark chrome.
- **UI scale** now uses real zoom (S/M/L/XL) instead of a few-pixel font tweak.
- **Header:** GitHub repo link/icon, and a **Custom / Import** entry that opens
  the version history + import.
- **Entity roster:** "Add entity" now opens a focused modal (reusable
  `Modal.svelte`) instead of an inline expander.
- Improved screen real-estate usage and **mobile responsiveness**.
- **README:** 10th-anniversary story and a **Tech Stack** disclosure section.
- Added `svelte-dnd-action` dependency.

## 2026-06-10 - 17:06

### Overview-system refactor (major)

#### Parsing / data model

- Replaced the fragile hand-rolled YAML parser with a robust codec
  (`src/lib/utils/eveFormat.js`) built on `js-yaml`. It correctly handles the
  real in-game export format — ordered-map "tuple" structures and preset/tab
  names containing `:` and `<color=…>` markup — so **`zs_core.yaml` now loads**
  (previously failed).
- Added `src/lib/data/stateMatrix.js` as the single source of truth for the
  EVE state-id taxonomy, fixing the previously mis-shifted state map
  (`9=Neutral, 11=Fleet, 13=Criminal, 18=Corp, 19=Alliance, 44=Outlaw,
  52=War Target`, …) per `notes/config_keys.md`.
- Rewrote `customiserStore.svelte.js` to model the profile natively (states
  keyed by integer id) with EVE-accurate visibility resolution
  (`alwaysShownStates` > `filteredStates` > group membership) and
  flag/background priority walking.
- Profiles now **round-trip** to a genuine, in-game-importable `.yaml`.
- Regenerated `public/defaults/ccp_default.yaml` in the real EVE format so both
  bases share one pipeline.

#### UI / UX

- Full UI overhaul with a **dark/light theme toggle** (CSS-variable tokens,
  persisted to `localStorage`).
- Settings panel now mirrors EVE's Overview Settings window: Tabs, Presets,
  Columns, Appearance (colortag + background priority, colour pickers, blink),
  Ship Labels, Misc, YAML.
- New **live preview**: a game-accurate overview list (`OverviewWindow`), a 3D
  tactical bracket view (`SpaceBrackets`) that now renders the **fully-styled
  `shipLabels` bracket text** (colour, bold/italic/underline, font size,
  prefix/suffix — previously dropped), and a customizable **entity roster**
  (`EntityRoster`) so users add entities and watch parameter changes apply live.
- Centralised UI copy in `src/lib/i18n/strings.js` (i18n-ready), added focus-
  visible styling and aria labels.

#### Housekeeping

- Added `js-yaml` dependency.
- Removed obsolete `yamlSerializer.js`, `FlagPriorities.svelte`,
  `ClientHUD.svelte`, `defaultPresets.js`.
- Added a Biome override so `.svelte` files aren't false-flagged for
  template-only identifier usage.

## 2026 alpha test

- Initial UI restructuring and SDE build pipeline.
