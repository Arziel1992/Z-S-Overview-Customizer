# Changelog

## 2026-06-10 - 17:06

### Overview-system refactor (major)

**Parsing / data model**
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

**UI / UX**
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

**Housekeeping**
- Added `js-yaml` dependency.
- Removed obsolete `yamlSerializer.js`, `FlagPriorities.svelte`,
  `ClientHUD.svelte`, `defaultPresets.js`.
- Added a Biome override so `.svelte` files aren't false-flagged for
  template-only identifier usage.

## 2026 alpha test
- Initial UI restructuring and SDE build pipeline.
