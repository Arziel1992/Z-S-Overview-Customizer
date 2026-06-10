# Z-S Overview Customiser

A web-based editor for **EVE Online Overview profiles**. It pulls the latest
ship/group/category data from CCP's Static Data Export, lets you configure an
overview the way you would in-game, previews it live, and exports a genuine
`.yaml` you can import straight back into the client.

## Features

- **Real EVE format, both ways.** Loads and exports the actual in-game overview
  YAML (ordered-map tuples, integer state ids, `<color=…>` tab/preset markup).
  Both bundled bases — **CCP Default** and **Z-S Core** — load through the same
  pipeline, and exports round-trip cleanly back into EVE.
- **1:1 settings mirror.** Tabs, Presets (groups / filtered states / always-shown
  states), Columns, Appearance (colortag + background priority, colour pickers,
  blink), Ship Labels, Misc, and a live YAML view.
- **Customizable live preview.** Add your own entities to the roster and watch
  them update live in a game-accurate overview list and a 3D tactical bracket
  view — including fully-styled `shipLabels` bracket text (colour, weight,
  italic/underline, size, prefix/suffix).
- **Dark / light theme toggle**, persisted across sessions.
- **i18n-ready** UI copy and accessible controls.

## Project layout

```text
public/
  data/matrix_latest.json        # compiled SDE lookup (categories/groups/types)
  defaults/ccp_default.yaml       # stock CCP base (real EVE format)
  defaults/zs_core.yaml           # Z-S Core base (real EVE format)
src/
  lib/utils/eveFormat.js          # YAML codec + colour/markup helpers
  lib/utils/labels.js             # bracket-label HTML builder
  lib/data/stateMatrix.js         # state-id taxonomy + colour table + columns
  lib/stores/customiserStore.svelte.js
  lib/i18n/strings.js             # UI copy
  lib/components/*.svelte         # settings panels + live preview
  App.svelte                      # app shell
```

## Setup

```bash
npm install
```

### Build the SDE lookup (optional refresh)

```bash
npm run sde:build
```

Downloads CCP's official SDE zip, extracts `categories.yaml`, `groups.yaml`,
`types.yaml`, and writes the minified map to `public/data/matrix_latest.json`.
Requires Python with `pyyaml` and `requests`.

### Develop

```bash
npm run dev      # Vite dev server (http://localhost:3000)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Usage

1. Pick a base profile (**CCP Default** or **Z-S Core**) from the header.
2. Configure tabs, presets, columns, appearance, and ship labels in the left
   panel — every applicable EVE parameter is mirrored here.
3. Add entities in the **Preview Entities** roster (set type/group, distance,
   and relationship states) to see colortags, row backgrounds, blink, and
   bracket labels resolve live under each tab's presets.
4. Open the **YAML** tab and **Download .yaml**, then import it in-game via
   *Overview Settings → Misc → Import Overview Settings*.
5. Toggle the theme (🌙 / ☀️) any time; your choice is remembered.

## State-priority model

The client evaluates priority lists top-to-bottom and stops at the first match.
Visibility follows EVE's rules: `alwaysShownStates` (force) overrides
`filteredStates` (veto), which overrides plain `groups` membership. See
`notes/EVE_Online_Overview_System_Deep_Dive.md` and `notes/config_keys.md` for
the full state-id reference.
