# Z-S Overview Customiser

## A 10th-anniversary gift to the EVE community

Life has a strange way of closing loops. Early in **June 2026**, a change in my
circumstances led me back to a game I hadn't logged into for the better part of a
decade — EVE Online. Not long after I undocked, **Kismeteer**, the volunteer who
currently keeps the Z-S Overview pack alive, noticed I was around. We got to
chatting; he walked me through the state of Z-S today and, almost in passing,
reminded me just how many years had gone by since I'd last been in New Eden.

That sent me digging, and I found it: my **first ever commit to Z-S, on June 9th,
2016**. Ten years, almost to the day. Seeing that timestamp reignited something —
including the memory of a customiser tool I'd started building for the pack years
ago and never finished.

So I finished it. This project is my **Z-S 10th-anniversary gift to the EVE
community** — for everyone who's ever fought, hauled, ratted, or run for their pod
behind a Z-S overview. Fly safe. o7

---

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
- **Import any YAML** (file or paste) with a choice of **Overwrite** or
  **Apply on top** — so multi-part packs (like the Z-S add-on pieces) merge onto
  a core profile exactly as they do in-game.
- **Version history** saved in your browser (IndexedDB): name, reload, rename,
  delete, re-export, or **share to a public paste** link.
- **Drag-and-drop reordering** (mouse and touch) for columns, state priorities,
  and bracket-label segments.
- **Dark / light theme toggle** and an S/M/L/XL UI scale, persisted across
  sessions. Mobile-responsive layout.
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

## Tech stack

For full disclosure, the libraries and tooling this project depends on:

### Runtime dependencies

- [Svelte 5](https://svelte.dev/) (`^5`) — UI framework (runes-based reactivity).
- [js-yaml](https://github.com/nodeca/js-yaml) (`^4.2`) — YAML parse/dump powering
  the EVE overview codec.
- [svelte-dnd-action](https://github.com/isaacHagoel/svelte-dnd-action) (`^0.9`)
  — accessible, touch-friendly drag-and-drop reordering.

### Build / dev tooling

- [Vite](https://vitejs.dev/) (`^8`) + [@sveltejs/vite-plugin-svelte](https://github.com/sveltejs/vite-plugin-svelte) — dev server and bundler.
- [Tailwind CSS](https://tailwindcss.com/) (`^3.3`) with
  [PostCSS](https://postcss.org/) + [Autoprefixer](https://github.com/postcss/autoprefixer) — styling, themed via CSS custom properties.
- [Biome](https://biomejs.dev/) (`2.4`) — linter / formatter.

### Browser platform APIs

- **IndexedDB** — local, named version history (no backend).
- **Clipboard API** — copy YAML / share links.

### Data pipeline (`npm run sde:build`)

- **Python 3** with [PyYAML](https://pyyaml.org/) and
  [Requests](https://requests.readthedocs.io/) — downloads CCP's official Static
  Data Export and compiles `matrix_latest.json`.

### External services

- CCP's [Static Data Export](https://developers.eveonline.com/) — ship / group /
  category data.
- [dpaste.org](https://dpaste.org/) — best-effort public paste target for the
  "Share" button (falls back to clipboard if unavailable).

> No analytics, accounts, or backend — everything runs client-side in your
> browser.

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
