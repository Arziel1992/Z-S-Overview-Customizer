# Z-S Overview Customiser

A web-based editor for **EVE Online Overview profiles**: load a base profile, customise every
parameter the game exposes, watch a live in-game-style preview react, and export a genuine
`.yaml` you can import straight back into the client.

**Quick links:**
[Z-S Overview Pack](https://github.com/Arziel1992/Z-S-Overview-Pack/) ·
[Discord](http://discord.gg/NSfFKcx) ·
[Changelog](./CHANGELOG.md) ·
[Customiser live tool](https://arziel1992.github.io/Z-S-Overview-Customizer/)

---

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

## Features

- **Real EVE format, both ways.** Loads and exports the actual in-game overview
  YAML (ordered-map tuples, integer state ids, `<color=…>` / `<fontsize=…>`
  markup). Both bundled bases — **Fenris Default** and **Z-S Core** — parse through
  the same pipeline, and exports round-trip cleanly back into EVE.
- **1:1 settings mirror.** Tabs, Presets (groups / filtered states / always-shown
  states), Columns, Appearance (colortag + background priority, colour pickers,
  blink), Ship Labels, Misc, and a live YAML view.
- **Customisable live preview.** Add your own entities to the roster and watch
  them update live in a game-accurate overview list and a tactical bracket view
  with a twinkling starfield — including fully styled `shipLabels` bracket text.
- **Import any YAML** (file or paste) with a choice of **Overwrite** or
  **Apply on top** — multi-part packs (like the Z-S pieces) merge onto a core
  profile exactly as they do in-game: same-named presets are replaced, new ones
  appended, and layout sections (tabs, columns, appearance, labels) are
  overwritten when the pack provides them.
- **Version history** saved in your browser (IndexedDB): name, reload, rename,
  delete, re-export, or **share to a public paste** link.
- **Drag-and-drop reordering** (mouse and touch) with a ghost drop-slot and live
  reflow, plus up/down arrows as a mobile-friendly fallback — for columns, state
  priorities, tabs and bracket-label segments.
- **Dark / light theme**, S/M/L/XL UI scale, session restore (resume where you
  left off), first-run welcome, mobile-responsive layout, i18n-ready copy.

---

## How the EVE Overview actually works

The Overview is not a passive list — it is a real-time **boolean filtering
engine** that evaluates every entity on your spatial grid against your profile,
dozens of times per second. Understanding four building blocks explains every
key in the YAML. (For the full research, see
[notes/EVE_Online_Overview_System_Deep_Dive.md](./notes/EVE_Online_Overview_System_Deep_Dive.md).)

### 1. The data foundation: typeID → groupID → categoryID

Every object in EVE has an atomic **`typeID`** (a *Rifter*, a specific asteroid).
Types roll up into **`groupID`s** (*Frigate* = group `25`, *Stargate* = group
`10`), which roll up into **`categoryID`s** (*Ship* = category `6`). Overview
filters operate almost exclusively at the **group** level: white-listing group
`26` shows every Cruiser variant ever added to the game. This data comes from
Fenris' **Static Data Export (SDE)**; the customiser compiles it into
`public/data/matrix_latest.json` via `scripts/build_sde_matrix.py`.

### 2. Presets: the boolean logic engine

A **preset** decides *what renders*. Each one carries three arrays, evaluated
with strict precedence:

1. **`alwaysShownStates`** — supreme override. If an entity matches any state
   here, it renders **no matter what** (e.g. always show Fleet Members).
2. **`filteredStates`** — absolute veto. If an entity matches any state here, it
   is hidden **even if its group is authorised** (e.g. hide friendlies on a
   combat tab to prevent misclicks).
3. **`groups`** — the whitelist of SDE groupIDs the preset may display.

### 3. Tabs: lists and brackets, decoupled

The overview window supports up to **8 tabs**. Each tab points at **two**
presets: `overview` (the flat list) and `bracket` (the floating icons in 3D
space) — independently. A logistics pilot can list only friendlies while still
seeing hostile brackets in space to dodge incoming fire. `bracket: null`
disables space brackets for that tab entirely (a common anti-lag trick).

### 4. The state matrix: colortags, backgrounds, priority

Relationship/legal status is communicated two ways:

- **Colortags (flags)** — small icons by the entity's icon (`flagStates`,
  `flagOrder`).
- **Backgrounds** — full-row highlights for at-a-glance threat
  (`backgroundStates`, `backgroundOrder`).

A pilot can match *many* states at once (fleet member **and** criminal). The
client walks `flagOrder` / `backgroundOrder` **top to bottom and stops at the
first match** — so priority order is everything: existential threats (War
Target, Criminal, Outlaw) belong above friendly affiliations. `stateBlinks`
makes a state flash; `stateColorsNameList` maps each state to a named colour or
`0xAARRGGBB` hex.

---

## YAML config key legend

The complete reference of every key the client parses in an overview `.yaml`
(full notes: [notes/config_keys.md](./notes/config_keys.md)).

### Root keys

| Key                               | Purpose                                                                          |
| --------------------------------- | -------------------------------------------------------------------------------- |
| `flagOrder`                       | Top-to-bottom priority for colortags when multiple states match.                 |
| `flagStates`                      | Whitelist of states allowed to render a colortag at all.                         |
| `backgroundOrder`                 | Priority list for full-row background highlights.                                |
| `backgroundStates`                | Whitelist of states allowed to render a background.                              |
| `stateBlinks`                     | Per-state boolean toggles for rhythmic flashing (`flag_13`, `background_44`, …). |
| `stateColorsNameList`             | Maps states to a named colour (`orange`, `darkBlue`, …) or `0xAARRGGBB` hex.     |
| `overviewColumns` / `columnOrder` | Which telemetry columns show, and in what left-to-right order.                   |
| `presets`                         | The named boolean filters (see Preset variables below).                          |
| `tabSetup`                        | Maps tab indexes 0–7 to presets (see Tab variables below).                       |
| `shipLabelOrder` / `shipLabels`   | Order and styling of the floating bracket label segments.                        |
| `userSettings`                    | Misc client-side settings carried with the profile.                              |

### Telemetry column values

Exact strings accepted inside `overviewColumns` (misspelling breaks rendering):
`ICON`, `NAME`, `TYPE`, `TAG`, `DISTANCE`, `CORPORATION`, `ALLIANCE`, `FACTION`,
`MILITIA`, `SIZE`, `VELOCITY`, `RADIALVELOCITY`, `TRANSVERSALVELOCITY`,
`ANGULARVELOCITY`.

### Preset variables

| Key                 | Effect                                                                                                               |
| ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `alwaysShownStates` | Force-render override — bypasses all other filters.                                                                  |
| `filteredStates`    | Absolute veto — hides matching entities immediately.                                                                 |
| `groups`            | Whitelisted SDE `groupID`s (e.g. `6` Sun, `10` Stargate, `15` Station, `25` Frigate, `26` Cruiser, `27` Battleship). |

### Tab setup variables

| Key        | Effect                                                           |
| ---------- | ---------------------------------------------------------------- |
| `name`     | Tab caption; supports markup like `<color=0xFFFFFFFF>✈</color>`. |
| `overview` | Preset used for the flat list view.                              |
| `bracket`  | Preset used for in-space icons; `null` disables brackets.        |
| `color`    | Optional `[r, g, b]` float triplet tinting the tab text.         |

### The state ID table

Prefix with `flag_` or `background_` when used in `stateBlinks` /
`stateColorsNameList` (e.g. `background_13`).

| ID      | Meaning                                                     |
| ------- | ----------------------------------------------------------- |
| 9       | Neutral standing                                            |
| 10      | Bad standing                                                |
| 11      | In your fleet                                               |
| 12      | Terrible standing (−10)                                     |
| 13      | Criminal / active Suspect-Criminal timer                    |
| 14      | In your faction militia                                     |
| 15      | Excellent standing (+10)                                    |
| 16      | Good standing (+5)                                          |
| 17      | Threat to your corporation                                  |
| 18      | In your corporation                                         |
| 19      | In your alliance                                            |
| 20      | Security threat (legal/standing combos)                     |
| 21      | Has an active bounty                                        |
| 36 / 37 | Legacy veto states (edge-case entities in `filteredStates`) |
| 44      | Outlaw / valid kill right                                   |
| 45      | Low security status                                         |
| 48 / 49 | Agent / VIP entities                                        |
| 50      | Limited engagement (duel)                                   |
| 51      | At war with your militia                                    |
| 52      | Active war target                                           |
| 53      | Secondary militia/war evaluation                            |
| 66 / 68 | Faction / faction-militia states (observed in live exports) |

---

## Using your YAML out of game

Exports from this customiser (and pack files like Z-S) are imported through the
client's overview import pipeline. Adapted from the
[Z-S pack instructions](https://github.com/Arziel1992/Z-S-Overview-Pack/):

1. **Get the file(s).** Export from this app (YAML tab → *Download .yaml*), or
   download a pack release (e.g. Z-S: *Releases* → latest → the `Z-S-….zip`
   asset) and extract it. From a pack you can copy individual **preset packs +
   a layout**, or a single pre-styled **Full pack** file.
2. **Place them in EVE's Overview folder** for your platform:

   | Platform             | Path                                                                                          |
   | -------------------- | --------------------------------------------------------------------------------------------- |
   | Windows              | `%USERPROFILE%\Documents\EVE\Overview`                                                        |
   | macOS                | `~/Documents/EVE/Overview`                                                                    |
   | Linux (Steam/Proton) | `~/.steam/steam/steamapps/compatdata/8500/pfx/drive_c/users/steamuser/Documents/EVE/Overview` |

   If the folder doesn't exist, create it — or better, **export your current
   overview from the game first** (same window, *Export Overview Settings*,
   *Check All*): that backs up your settings **and** creates the folder.
3. **In game:** open the Overview Settings (the `≡` button at the top left of
   the Overview window) → **Misc** tab.
4. Optionally click **Reset All** to start from clean defaults.
5. Click **Import Overview Settings**, select your file in the left list, click
   **Check All**, then **Import**.
6. **Importing pieces?** Repeat step 5 for each preset pack, then the layout —
   that is exactly what this app's *Apply on top* import mode replicates.
7. Some elements may not refresh immediately — **dock and undock** once to
   force the UI to reload everything.

> Tip: profiles can also be shared in game by dragging a saved profile link
> into chat — recipients load it with one click.

---

## Project layout

```text
Z-S-Overview-Customizer/
├── index.html                      # entry HTML (theme bootstrapping, fonts)
├── vite.config.js                  # Vite + base path (GitHub Pages) + aliases
├── tailwind.config.js              # app (theme-aware) + eve (game-chrome) palettes
├── biome.json                      # lint/format config (+ Svelte overrides)
├── scripts/
│   └── build_sde_matrix.py         # Fenris SDE zip → minified matrix_latest.json
├── .github/workflows/
│   └── sde_update.yml              # scheduled CI refresh of the SDE matrix
├── public/
│   ├── data/matrix_latest.json     # categories → groups → types lookup
│   └── defaults/
│       ├── fenris_default.yaml        # stock base (real EVE format)
│       └── zs_core.yaml            # Z-S Core base (real EVE format)
├── notes/                          # research: deep dive, key legend, samples
└── src/
    ├── main.js                     # Svelte 5 mount
    ├── App.svelte                  # shell: header, nav, layout, dialogs, autosave
    ├── assets/tailwind.css         # theme tokens (CSS vars), starfield, blink
    └── lib/
        ├── i18n/strings.js         # all UI copy (locale-ready, t('a.b.c'))
        ├── data/stateMatrix.js     # state-ID taxonomy, colours, column defs
        ├── stores/
        │   └── customiserStore.svelte.js  # reactive profile model + roster + session
        ├── utils/
        │   ├── eveFormat.js        # YAML codec: parse/serialize, markup, colours
        │   ├── merge.js            # "apply on top" pack-merge semantics
        │   ├── history.js          # IndexedDB snapshots + paste sharing
        │   └── labels.js           # shipLabels → styled bracket-label HTML
        └── components/
            ├── TabManager.svelte        # tab setup (names, presets, colours)
            ├── PresetEditor.svelte      # filter logic per preset
            ├── MatrixSelector.svelte    # SDE group browser/search
            ├── ColumnConfig.svelte      # telemetry columns
            ├── AppearanceConfig.svelte  # colortag/background priorities
            ├── ShipLabels.svelte        # bracket-label composer
            ├── MiscConfig.svelte        # profile stats + userSettings
            ├── YamlExporter.svelte      # live YAML + download/copy
            ├── OverviewWindow.svelte    # game-accurate list preview
            ├── SpaceBrackets.svelte     # starfield bracket preview
            ├── EntityRoster.svelte      # preview entities (modal editor)
            ├── ImportDialog.svelte      # file/paste import, overwrite/merge
            ├── HistoryDialog.svelte     # saved versions, share
            ├── WelcomeModal.svelte      # first-run chooser
            ├── DragList.svelte          # reusable DnD + arrows reorder list
            └── Modal.svelte             # shared dialog chrome
```

### Architecture at a glance

TODO
- Add images and descriptions.

---

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
- **localStorage** — theme, UI scale, and session restore.

### Data pipeline (`npm run sde:build`)

- **Python 3** with [PyYAML](https://pyyaml.org/) and
  [Requests](https://requests.readthedocs.io/) — downloads Fenris' official Static
  Data Export and compiles `matrix_latest.json`.

### External services

- Fenris' [Static Data Export](https://developers.eveonline.com/) — ship / group /
  category data.
- [dpaste.org](https://dpaste.org/) — best-effort public paste target for the
  "Share" button (falls back to clipboard if unavailable).

> No analytics, accounts, or backend — everything runs client-side in your
> browser.

---

## Setup

```bash
npm install
```

### Build the SDE lookup (optional refresh)

```bash
npm run sde:build
```

Downloads Fenris' official SDE zip, extracts `categories.yaml`, `groups.yaml`,
`types.yaml`, and writes the minified map to `public/data/matrix_latest.json`.
Requires Python with `pyyaml` and `requests`.

### Develop

```bash
npm run dev      # Vite dev server (http://localhost:3000/Z-S-Overview-Customizer/)
npm run build    # production build to dist/
npm run preview  # preview the production build
```

---

## Using the app

1. On first visit, the **welcome screen** asks what to start from: Z-S Core,
   Fenris Default, an imported `.yaml`, or a blank profile. Your work autosaves to
   the browser, so later visits **resume where you left off**.
2. Configure tabs, presets, columns, appearance, and ship labels in the left
   panel — every applicable EVE parameter is mirrored 1:1.
3. Add entities in **Preview Entities** (type/group, distance, relationship
   states) to see colortags, row backgrounds, blink, and bracket labels resolve
   live under each tab's presets.
4. **Import** more packs via *+ Custom / Import* — choose **Apply on top** to
   layer pack pieces (the in-game multi-import workflow) or **Overwrite** to
   replace everything. Save named **versions**, re-load, export, or share them.
5. Open the **YAML** tab and **Download .yaml**, then import it in game
   (see [Using your YAML out of game](#using-your-yaml-out-of-game)).

---

## Community & support

- **Z-S Overview Pack:** <https://github.com/Arziel1992/Z-S-Overview-Pack/>
- **Discord:** <http://discord.gg/NSfFKcx>
- **Changelog:** [CHANGELOG.md](./CHANGELOG.md)
- Issues and PRs welcome on the
  [customiser repository](https://github.com/Arziel1992/Z-S-Overview-Customizer/).
