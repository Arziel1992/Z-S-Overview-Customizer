# Changelog

## 2026-08-29 - 22:40

### Compare fills the space it is given, and folds away when it does not

- **The tables are fluid.** They were laid out at a fixed 176 + 224px per
  profile, so with one file loaded the settings and preset tables stopped
  around 400px and left the rest of the panel empty. Every table is now
  `w-full` over a shared colgroup — fixed label column, the remainder split
  evenly — so they fill the panel at any width and compress as more files
  load. Only when a profile column would fall below 150px does the shared
  wrapper hand the container a horizontal scrollbar.
- **Row highlights stay inside their panel.** The tables were set to the same
  width as their container while the container also carried padding, so every
  highlighted row painted 10px past the panel on each side, over the border.
- **Each of the three sections has an eye.** Inventory, overview settings and
  preset-vs-preset each collapse to their heading, which stays put so bringing
  one back is one click. The state is stored with the rest of the layout, so it
  survives a reload. Following a preset from the inventory re-opens the detail
  section if it was collapsed, rather than looking like the click did nothing.
- **Differences only reads as a toggle.** On a bracket preset the filter takes
  500 rows down to 20, which made it the most useful control in the section and
  the least visible — a small checkbox under a table. It is a pressed-state
  button now, carrying its own count.
- **A "?" on the Compare heading opens a walkthrough.** Six steps: load
  something, read the inventory, check the settings, drill into a pair, turn on
  Differences only, then act on it with a presets-only import. The guide opens
  focused on that section with one click back to the whole thing, and typing in
  the search still reaches every section — a search that could only see one
  section would be a search that lies.

### Internal

- The three Compare sections join the workspace panels in `hiddenPanels`, so
  they persist through the same layout key rather than inventing a second
  mechanism. Existing saved layouts merge forward untouched.
- Every table sits in a `scrollbar-gutter: stable` box. Only the group matrix
  and the inventory actually scroll, but reserving the gutter on all of them is
  what stops the one that scrolls from ending up 9px narrower than the two that
  do not, which would misalign every column.
- 18 browser checks over 2, 3 and 4 loaded profiles, measuring panel-versus-
  table geometry rather than reading screenshots: no dead space, no row
  painting outside its panel, identical column widths across all three tables,
  and the page never scrolls sideways at 900px.

## 2026-08-29 - 13:52

### Comparing and upgrading presets without losing your profile

Prompted by a player keeping a customised fork of the Z-S pack: they wanted to
compare *portions* of an overview — their presets against the newer upstream
ones — rather than whole files, and to pull in a new Z-S release without it
flattening the tabs they had built. Both turned out to be broken in ways worth
writing down.

- **Preset inventory in Compare.** Every preset on both sides at once, paired
  and sorted into *new upstream · changed · only yours · identical*, with the
  group count on each side and how many groups moved. The number on each filter
  button is the short answer to how far behind you are; click a preset to open
  that pair in the detail table below.
- **Presets pair by their visible name.** Preset names carry EVE colour markup,
  and pack maintainers restyle it between releases: between Z-S v9 and v10 only
  **6 of 68** preset names match byte for byte, while **58** match once the
  colours are ignored. Both the merge and Compare now pair on the visible name,
  falling back to appending whenever the visible name is ambiguous — someone
  may deliberately keep two presets that read alike, and collapsing those would
  destroy one rather than duplicate one.
- **Import » Presets only.** A third import mode that takes the file's presets
  and nothing else. Every real pack file — Z-S Core, 1BL, 2BL and Full alike —
  is a complete profile carrying `tabSetup`, columns, colours and ship labels,
  so refreshing your presets from a newer pack used to replace the layout you
  had built around them. It is now the default mode, being the only one that
  cannot cost you an evening's work.
- **Export » Preset pack.** Narrow the export to the presets you tick and drop
  every other section. Send it to someone who wants your filters but not your
  tabs, or keep it as a backup of your own presets before applying an update.
  The client only ever writes whole profiles, which is why this is worth having.
- **Differences only.** A filter on the group matrix that hides every group the
  compared presets agree on — on the Z-S v9/v10 pair that is 137 rows down to
  40.
- **Compare pairs its dropdowns.** Picking a preset in one column pulls the
  others onto their counterpart, and a newly loaded file opens paired to what is
  already on screen, instead of both sides defaulting to whatever happened to be
  first in each list.
- **The guide covers all of it.** Compare had no entry in the glossary at all.
  It now has one, alongside the three new controls and a FAQ answer for keeping
  a customised profile up to date with a pack. English and Spanish.

### Fixes

- **Upgrading a pack no longer doubles every preset.** Merging Z-S v10 over a
  v9-based profile produced **120 presets with 52 visible names appearing
  twice** — one stale, one current, indistinguishable in the client's dropdown.
  It now produces 68, each updated in place.
- **A merge can no longer drop a preset.** Two incoming presets pairing to the
  same existing one overwrote each other; each incoming preset now claims at
  most one slot and the rest append.
- **Diff colours are readable in the light theme.** The greens and blues marking
  additions and ownership were Tailwind's 400 shades, chosen against a
  near-black panel; on the white one they sat around 1.8:1 and the group
  matrix's ticks were nearly invisible. They are theme tokens now
  (`--added`, `--removed`, `--changed`, `--mine`), measured at 4.8–5.7:1 in
  light and 5.1–9.4:1 in dark — every one clears WCAG AA.

### Internal

- `utils/presets.js` owns preset identity, pairing and diffing, shared by the
  merge and by Compare, with 10 `node --test` cases covering the truth table in
  both directions — including a regression that merges the two real bundled Z-S
  releases and asserts no preset is duplicated and no tab is touched.
- `serializeOverviewYaml` takes a `presetsOnly` option; its yaml dump settings
  are now shared between both paths so they cannot drift apart.
- Verified in a browser across 320–2560px in both locales: 25 behaviour checks
  and 14 layout checks, no failures.

## 2026-08-29 - 11:14

### Fixes

- **Dialogs no longer run off the screen at L and XL scale.** The UI-scale
  wrapper uses CSS `zoom`, which *multiplies* `vh` units instead of dividing
  them, so an `88vh` dialog cap rendered at 114% of the viewport height at XL —
  the glossary was cut off at the top and bottom, and the shell's `100vh`
  height gave the whole page a scrollbar at anything above M. Viewport heights
  inside the wrapper now divide the scale back out (`.app-shell`,
  `.max-h-vh` in `tailwind.css`); every scale from S to XL now puts the dialog
  in the same place with the page not scrolling.

## 2026-08-29 - 11:01

### A guide, coverage counts, and a header that fits a phone

- **Glossary & guide.** A new searchable panel (book icon in the header, and
  offered on first run) covering a six-step walkthrough, the vocabulary of the
  tool and the client alike, what every control does, and the questions players
  keep asking — including what happens with two browser tabs open, where saved
  versions actually live, and how to get a profile into the game. Fully
  translated, English and Spanish.
- **Coverage counts on the category tabs.** The group browser now shows
  *authorised / total* per category — `Ship 50/50`, `Charge 7/8` — mirroring
  the numbers the client's own type tree gives, and turning green when a
  category is fully covered. After an expansion adds a group, the category that
  fell behind is the one whose numbers stop matching. Counts are over *groups*,
  which is what a preset whitelists; the tooltip carries the type total behind
  them.
- **Groups list in columns.** The list is a responsive grid instead of one long
  scroll — four columns on a wide panel, one on a phone. Entity's 415 groups
  are finally browsable.
- **A header that fits every screen.** The control cluster needs about 500px
  and the identity block another 500, so below `lg` it moves into a menu sheet
  behind a hamburger, with a label on every action instead of a bare icon. At
  tablet widths the two used to compete for one row and shred the title into
  one word per line. The SDE date badge steps aside on the narrowest screens
  while the SDE *warning* never does, and both title lines truncate rather than
  wrap. The cluster is defined once and rendered in both places, so the two
  cannot drift apart.
- **Labels beside the icons where there is room.** From `2xl` up, Versions,
  Guide, Clear all and Privacy carry their name next to the glyph — the four
  that are worth naming; theme and GitHub stay as icons. They appear only at a
  width that fits them on one line in every locale, Spanish included.

### Fixes

- **Two tabs no longer overwrite each other in silence.** Every tab of the site
  shares one autosave slot and the last writer wins. When another tab saves
  over it, a notice now offers to load that version — or to carry on here,
  knowing the next edit will win.
- **Saving a version explains its own naming.** Typing a name uses it verbatim;
  leaving the box empty stamps the base profile plus the date and time. That
  rule was invisible, and looked like the tool deciding at random. The dialog
  now says so, above the field.
- **The guide's search folds hyphens**, so looking for "always shown" finds
  "always-shown states" — a search that answers "nothing matches" for a term
  the guide defines is worse than no search.
- **The group browser is translatable at last** — its search box, empty state
  and loading text were hardcoded English.
- **The interface follows the browser's language** on a first visit, before
  falling back to English, instead of always starting in English.
- **Markdownlint's duplicate-heading rule is scoped to siblings**, so a
  changelog may repeat "Fixes" across releases while a real duplicate inside
  one release still fails.

### Internal

- The header is verified with a width sweep (320px to 2560px, both locales)
  rather than at two convenient sizes: at every step the page must not scroll
  sideways, the identity block must stay one line tall, and exactly one of the
  two control layouts must be present. The tablet break got through because the
  previous check only looked at 390px and 1600px.
- Locale parity is now a `node --test` check: every English key must have a
  Spanish translation, no locale may carry a key English lacks, and no value
  may be empty. The glossary gets the same treatment in both directions — an
  entry the UI asks for with no text, or text nothing renders, fails the build.

## 2026-08-25 - 10:57

### Preview entities: nothing is lost, and every state is there

Three reports from players, in order.

- **Unsaved work is no longer thrown away.** Loading a grouping used to replace
  the roster outright, so clicking one to cross-check something silently
  discarded whatever had just been added. Now the entities on screen are
  *parked* under the grouping they came from before another one loads, and
  restored — verbatim — when you come back. A dot marks the grouping holding
  them, and an amber **Unsaved** button in the panel header saves them back in
  one click.
- **The roster itself persists.** It was rebuilt from a random sample on every
  page load; it now survives a reload (and a closed tab) under a new
  `zs-overview-roster` item, listed in the privacy panel's storage inventory
  like every other stored item.
- **The export view warns** when preview entities have unsaved changes — as a
  banner, not a block: they are workbench data and are never part of the
  exported YAML.
- **Every state the client knows is offered when editing an entity** — the
  editor carried a hand-written list of 13 ids that had drifted from the state
  matrix, missing the standings (15 Excellent, 16 Good, 17 Neutral, 48 No
  Standing) among others. It now reads the matrix directly, so it cannot drift
  again, and the badges use the preset editor's equal-width grid so a state
  sits in the same place in both lists.

### The always-shown override no longer beats the type filter

Reported by a player running ship-specific tabs: war targets and limited
engagements were showing up on a logi tab whatever hull they were flying.

- **`alwaysShownStates` is now scoped to states**, matching EVE University's
  description of the always-shown column — *"Entities with this state will
  always be shown regardless of the display setting of additional **states**
  they may have"*. The preset's `groups` whitelist is evaluated first and
  nothing overrides it, so a tab that lists only logistics hulls shows only
  logistics hulls; within those hulls, an always-shown state still rescues an
  entity a `filteredStates` entry would have hidden.
- Previously the override bypassed the group whitelist as well, on the reading
  in this project's own research notes. No YAML changes: both keys round-trip
  verbatim, so this only affects what the preview renders.
- **Rescued rows are marked** with a small `*` next to the colortag — the row
  is on screen because the override outranked a veto, while its siblings on the
  same tab are hidden.

### Internal

- Entity defaults and the "has this changed?" fingerprint moved to
  `src/lib/utils/roster.js`, plain and rune-free, and gained a `node --test`
  self-check covering both directions: a freshly loaded grouping must not read
  as unsaved, and every edit the modal can make must be detected.
- The visibility rule moved to `src/lib/utils/visibility.js`, equally plain,
  behind a truth table covering every combination of the two gates — so the
  cell that changed here cannot be flipped back by accident.

## 2026-08-16 - 00:31

### Fixes

- **Build is warning-free again.** The new panel divider raised two
  `vite-plugin-svelte` a11y warnings (`a11y_no_noninteractive_tabindex`,
  `a11y_no_noninteractive_element_interactions`). The markup implements the ARIA
  *window splitter* pattern — a separator that is focusable, which the spec
  treats as a widget — and Svelte's rules model `separator` as always
  non-interactive, flagging the correct shape (and flagging
  `<button role="separator">` from the other side). The two rules are now
  silenced on that one element with a comment explaining why, and the splitter
  gained the `aria-controls` the pattern asks for.

## 2026-08-15 - 23:21

### An arrangeable workspace

- **Resizable split.** The divider between the settings panel and the preview
  column can be dragged to rebalance them — double-click resets it, and it is
  keyboard-operable (focus it, then arrow keys; Home/End for the extremes).
  Clamped so neither side can be squeezed away.
- **Hide any panel.** All four panels — settings, tactical brackets, overview
  list, preview entities — carry an **👁 eye** that collapses them to a labelled
  bar (a rail, for the settings panel) that brings them straight back. The
  remaining panels take the freed space.
- Both the split and the hidden panels persist per browser under a new
  `zs-overview-layout` item, which is listed in the in-app privacy panel's
  storage inventory like every other stored item.
- The decorative "Z-S Client Engine" badge is gone from the settings header;
  the panel's eye now sits in its place.

## 2026-08-15 - 23:01

### Reorder tabs and columns straight from the preview

- **Reorder lock in the overview preview.** A small 🔒/🔓 button at the end of
  the preview's tab strip opens direct dragging of **both** the tab strip and
  the column header, so the layout can be arranged where you are looking at it
  instead of in the settings sections. Locked by default, so a stray drag can't
  rearrange a profile while you click around the preview.
- **Two views, one source.** Dragging in the preview commits through the same
  store methods the Tabs and Columns sections use, so both stay in step in both
  directions — reorder a tab in the preview and its Tab Setup card moves too,
  and vice versa.
- **Two controls, not one.** The tab strip keeps a plain lock. The column
  header gets its own **tri-state** control, because a column drag has two
  useful meanings: 🔒 locked · 🔓 **this tab** — the drop gives this tab its own
  column set (seeded from what it already showed), leaving every other tab
  alone · 🌐 **whole profile** — the drop rearranges the shared `columnOrder`
  that every tab without its own set follows, and the tab you are looking at
  keeps in step so the drag never looks like it did nothing.
- Columns switched **off** keep their slots in the master order in every mode,
  rather than drifting to the end.
- Both controls carry a tooltip spelling all of this out, with the live state
  highlighted, shown on hover **and** on keyboard focus (a native `title`
  never reaches keyboard users).

## 2026-08-15 - 22:35

### Per-tab columns, dependency & security sweep

- **Per-tab columns (player request).** Tabs can now carry their own column set
  and order — the client's `tabColumns` / `tabColumnOrder` keys, written in game
  by right-clicking a tab and using its **Columns** menu. Previously the tool
  parsed neither key, so a profile with per-tab columns lost them on export and
  had to be patched back by hand in a text editor.
  - Each card in **Tab Setup** gains a **Columns** button showing whether that
    tab inherits the profile columns or carries its own; it opens a picker with
    the same tick-and-drag editing as the global Columns section.
  - **Copy from another tab** in that dialog clones a tab's whole column choice
    and order in one step.
  - The live overview preview now renders the active tab's own columns, so the
    layout you see per tab is the layout the client will show.
  - Tabs left untouched export with no column keys at all — writing them
    everywhere would pin every tab's columns in game. A round-trip self-check
    (`pnpm test`, `node --test` — no test framework added) covers both
    directions.
  - The profile-wide **Columns** section flags how many tabs override it.
- **Security: 5 advisories cleared, 0 remaining** (`pnpm audit`).
  - `js-yaml` 4.3.0 → **4.3.1**, fixing quadratic CPU consumption in `!!omap`
    resolution (GHSA-5p4m-2wfm-xmqj, high) — patched *inside* 4.x, so the
    deferred 5.x major (YAML 1.2 CORE loader vs. the client's YAML 1.1) stays
    deferred.
  - `vite` 8.1.3 → **8.2.1** pulls patched transitive `postcss`
    (GHSA-r28c-9q8g-f849 path traversal, high; GHSA-fxqj-rqcc-2cmp source-map
    read, moderate) and `nanoid` (GHSA-28wg-ghj8-5hjv and GHSA-2v37-7h3g-55p8,
    both high). No overrides needed.
- **Toolchain:** Volta pins move to Node **24.19.0** (from 24.18.0, picking up
  the 24.18.1 security release) and pnpm **11.21.0** (`packageManager` pin
  updated to match).
- **Dependencies refreshed:** svelte 5.56.4 → 5.56.9, svelte-dnd-action 0.9.70 →
  0.9.78, Inter/JetBrains Mono 5.2.8 → 5.3.0, Biome 2.5.3 → 2.5.8 (schema
  pinned to match), Tailwind + `@tailwindcss/vite` 4.3.2 → 4.3.3,
  `@sveltejs/vite-plugin-svelte` 7.2.0 → 7.3.0.
- Column editing moved into a shared `ColumnPicker` component used by both the
  profile-wide section and the per-tab dialog, so the two can't drift.
- Docs: README documents `tabColumns` / `tabColumnOrder`, and the tab-variable
  table no longer claims `bracket: null` disables brackets (it resolves to
  "show all"). `.markdownlintignore` added so the gitignored `notes/` drafts
  stop reporting prose warnings.

## 2026-07-09 - 22:55

- **Right-click preset menu anchoring fixed.** The menu now opens directly
  under the clicked tab and compensates for the app's UI-scale zoom wrapper
  (fixed-position pixels are multiplied by `zoom`, so coordinates are divided
  back into zoomed units) — previously it appeared severely offset at any
  scale other than 100 %.

## 2026-07-09 - 22:47

### Game-accurate brackets, preset-copy arrow, pnpm migration

- **"None (no brackets)" removed.** The game has no such tab state — its YAML
  stores either a preset name or `_BracketFilterShowAll`. Both bracket pickers
  (Tab Setup panel and the preview's right-click menu) now default to **"Show
  all brackets"**; profiles whose tabs carried a null bracket (older sessions,
  deleted presets) are coerced to "show all" on load and export.
- **Copy-preset arrow (player QoL request).** A **→** button between the two
  Tab Setup dropdowns copies the selected list (overview) preset straight into
  the brackets slot — no more hunting for the same name in a long list.
- **Right-click preset menu un-clipped.** The preview's tab context menu now
  opens at the cursor and renders above everything else instead of being cut
  off by the overview panel's bounds.
- **npm → pnpm migration.** Lockfile converted (`pnpm import`), Node 24.18 and
  pnpm 11.10 pinned via Volta (+ `packageManager` field), CI deploy workflow
  and README switched to pnpm. `pnpm audit`: no known vulnerabilities.
- `.gitattributes` added (`* text=auto eol=lf`) — line endings normalised.
- Biome updated 2.4.16 → 2.5.3. **Deferred:** js-yaml 5.x (major rewrite that
  changes the default loader schema to YAML 1.2 CORE; the EVE client emits
  YAML 1.1, so the round-trip codec stays on 4.x until verified).

## 2026-07-06 - 14:56

### Preset search, privacy & licences panel, self-hosted fonts

- **Preset search in the preview's right-click menu.** The tab context menu
  (re-pointing a tab's list / bracket presets) gains a search box that filters
  both preset columns by their visible (markup-stripped) names — big preset
  packs no longer mean endless scrolling. Auto-focused on open; Escape closes.
- **Privacy, data & licences panel.** New first-visit notice (bottom banner)
  plus a full in-app privacy panel, reopenable any time via the new shield
  button in the header. It inventories every locally stored item (localStorage
  keys + the IndexedDB snapshot store) with its purpose, explains the network
  posture (everything same-origin; GitHub Pages hosting), offers one-click
  **"Delete all locally stored data"**, and carries the third-party licence
  attribution (MIT libraries, OFL fonts, Fenris hf. SDE data — all verified
  AGPL-3.0-compatible). Fully localised (EN/ES). No accept/reject pair by
  design: nothing optional is stored, so there is nothing to consent to — the
  panel says so and cites the ePrivacy strict-necessity exemption.
- **Fonts self-hosted.** Inter and JetBrains Mono now ship in the bundle via
  Fontsource (SIL OFL 1.1) instead of loading from the Google Fonts CDN —
  visitor IPs no longer reach Google (GDPR: LG München I, 3 O 17493/20). Zero
  third-party requests remain at runtime.
- **SDE badge on mobile.** The SDE freshness / SDE-offline badge was hidden on
  small screens; it now shows alongside the version badge on all viewports.
- Bundled base-profile YAMLs re-serialised so the defaults load better.

## 2026-07-05 - 18:02

### Compare panel polish + multi-file drag-and-drop imports

- **Compare: bundled bases loadable.** An "Add bundled base…" selector loads
  any of the three shipped profiles straight into the comparison, next to
  file upload.
- **Compare: drag & drop.** A dashed drop zone accepts one or many `.yaml`
  files at once; files already loaded (same name) are skipped, so nothing
  loads twice.
- **Compare: columns never drift.** The settings table and the
  preset-vs-preset tables now share one horizontal scroll container with
  identical fixed column widths — a single scrollbar, perfectly aligned
  columns, and each preset dropdown is captioned with its profile's file
  name. The group-union list keeps its own vertical scroll without spawning
  a second horizontal bar.
- **Compare: loads survive section switches.** Loaded files live in module
  state now — leaving and re-entering the Compare tab keeps everything; only
  a page reload starts fresh (comparisons are deliberately temporary,
  unlike profile imports).
- **Compare: "Show more".** Long value lists (e.g. 68 preset names in a big
  pack) clamp to two lines with a per-row Show more / Show less toggle.
- **Import dialog: multiple files + drag & drop.** The base-profile importer
  accepts several `.yaml` files at once (queued as removable chips, applied
  in order — the in-game multi-piece pack workflow) and doubles as a drop
  target; pasted YAML still works and applies last.
- **Preset dropdowns sort like the client.** All preset selectors now sort by
  the visible (markup-stripped) name at display time — in-game exports
  serialise presets unsorted (the v10.06.09 pack showed up jumbled), while
  the client sorts its menus for display. Export order stays untouched.
- **Authorised Groups opens on "All"** instead of the Ship category, so a
  search covers everything by default.

## 2026-07-05 - 17:40

### Compare panel, new base profiles, show-all brackets, exact in-game group parity

- **New "Compare" panel.** Load one or more overview `.yaml` files and diff
  their settings side by side against the current profile — rows that differ
  are highlighted. A preset-vs-preset sub-view lets you pick one preset per
  profile (they rarely map 1:1) and shows the union of every selected group
  with a per-profile ✓/— matrix, plus each preset's filtered / always-shown
  states.
- **Base profiles reworked and version-suffixed.** New first-load default:
  **Z-S Full v10.06.09** (in-game-only release). **Fenris Default v24.01**
  replaces the old stock profile (full default preset set, re-exported from
  the current client). **Z-S Full v9.00.0347** — the last git-tracked pack —
  stays for compatibility/history. Z-S Core has been retired.
- **"Show all brackets" tab option** (`_BracketFilterShowAll`). The client
  sentinel used by the new default tabs is now a selectable option in the tab
  editor's bracket dropdown, and the tactical preview renders every roster
  entity when it's active.
- **SDE matrix now matches the in-game group set 1:1** (validated against an
  in-game "every group" preset export, game v24.01, committed under
  `scripts/reference/`; the weekly build warns on drift). Compressed /
  batch-compressed ore, ice and moon-ore variants — hangar items sharing a
  group with real asteroids (e.g. *Batch Compressed Veldspar II-Grade*) — are
  filtered at type level; 33 unloadable groups dropped (legacy POS modules,
  fighter-drone relics, unreleased Upwell hulls, Station Services…); 3 valid
  groups restored/added, including *Homefront Operations Commodity* (new
  Commodity category). Net: **678 → 648 groups, 12,075 → 11,730 types**.
- **Equal-width state chips.** The filtered / always-shown state badges in the
  preset editor now sit in a uniform grid (sized to the longest label), so
  each state keeps a stable position at every viewport width.
- **Bracket-label fidelity fixes.** The null "spacer" segment now renders its
  pre/post text — real Z-S exports use it to carry the `]` that closes the
  corp ticker, which the tactical preview was silently dropping. Literal
  newlines inside segment pre/post strings (how the game encodes the Z-S
  1BL/2BL bracket-line variants) now render as line breaks too.
- **Rotating preview cast.** The seed roster's friendly and war-target slots
  now draw randomly from the sample cast on every load.
- README: features, base-profile list, SDE pipeline and project layout
  updated; Spanish locale covers all new strings. Repo-wide Biome formatting
  pass — every component now formats clean.

## 2026-07-04 - 00:39

### SDE matrix cleaned of inventory-only and render-only entities

- **Inventory items no longer pollute the type search.** The Charge category
  is now whitelisted to the 8 groups that can genuinely appear on the
  overview (bombs, scanner/survey/interdiction probes, interdiction burst
  probes); ammo, missiles, mining crystals (e.g. *Veldspar Mining Crystal I*),
  module scripts and burst charges — ~1,100 cargo/fitting-only types — are
  excluded at matrix-build time.
- **Render-/map-only scenery dropped** from Celestial and Asteroid: dust
  clouds, non-interactable objects, invisible beacons, map hierarchy
  (Region/Constellation/Solar System) and decorative asteroids — ~3,100 types.
- **Planetary Industry bases added.** Category 41 joins the matrix,
  whitelisted to *Mercenary Bases* (1081) and *Capsuleer Bases* (1082) — real
  space structures referenced by Z-S profiles that previously didn't resolve
  in the group browser. On-planet PI pins stay excluded.
- Net effect: **766 → 678 groups, 16,288 → 12,075 types (−26%)** across 14
  categories; smaller payload, faster startup fetch. Every group referenced
  by the bundled profiles still resolves (except two ids Fenris has removed from
  the game).
- README: SDE pipeline section documents the filtering.

## 2026-07-04 - 00:26

### Richer preview samples + README screenshots

- **Preview samples reworked.** The *Mining fleet* sample now contains an
  actual asteroid belt (Veldspar, Scordite, Plagioclase, Pyroxeres, Kernite,
  Bezdnacine) alongside the barges, and every sample got a fresh crew — keep an
  eye on local, you might recognise a name or two. o7
- Corrected several seed-roster type ids that predated the full-SDE matrix
  (the war-target cruiser, the criminal frigate, the Guristas scout and the
  stargate now carry their real `typeId`/`groupId`).
- Stored roster sets migrate once to the reworked built-in samples;
  user-saved groupings carry over untouched.
- **README screenshots.** New Screenshots section with section-cropped shots
  of the editor (dark + light), the live preview column, rapid populate and
  the tactical brackets.

## 2026-07-03 - 22:53

### Full-SDE preview entities, rapid populate, saved groupings + Z-S Full base

- **Preview entities can now be anything in space.** The add/edit entity
  modal's Type field live-searches the full SDE matrix (all 13 space-relevant
  categories — 16,000+ types); picking a match wires up the correct
  `typeId`/`groupId` so the preset group filters, the live overview list and
  the tactical bracket renderer resolve it exactly like the client would. The
  old hardcoded 14-group dropdown is gone.
- **Rapid populate.** New collapsible section in the Preview Entities panel
  with named entity groupings; loading one clears the roster and populates it
  in a click. Ships with four built-in samples spanning the new categories:
  *Fleet skirmish*, *Mining fleet* (Veldspar/Bezdnacine asteroids, barges,
  Orca, a suspect), *Structure bash* (Astrahus, Fortizar, POCO, Sov Hub,
  Skyhook, a war target) and *NPC site* (Guristas rats, wreck, MTU, drone).
- **Saved entity groupings.** Save the current roster under a name, load,
  rename, overwrite and delete any grouping — built-in samples included —
  persisted in the browser (`localStorage`).
- **Z-S Full bundled base.** `defaults/zs_full.yaml` added and selectable from
  the header Base dropdown alongside Fenris Default and Z-S Core.
- The header's SDE pull-date badge now always shows `YYYY/MM/DD` (UTC) instead
  of a locale-dependent format.
- README: features and usage updated; both locales (en/es) extended.

## 2026-07-03 - 21:59

### SDE matrix covers all space-relevant categories + "All" tab in the group browser

- **SDE matrix expanded** (user reports: citadels, sov hubs, skyhooks, POCOs
  and asteroids/ores missing). `build_sde_matrix.py` now extracts every
  category that can appear in space on the overview — mirroring the game's
  overview-settings tree: Celestial (2), Station (3), Ship (6), Charge (8),
  Entity/NPCs (11), Drone (18), Deployable (22), Starbase (23), Asteroid (25),
  Sovereignty Structures (40), Orbitals/POCOs (46), Structure/Upwell (65),
  Fighter (87). Previously only 2/3/6/18 were shipped. Also fixed the stale
  comment that mislabelled category 2 as "Modules". Regenerated
  `matrix_latest.json` (0.46 → 1.05 MB; 766 groups, 16 288 types) — Veldspar,
  Bezdnacine, Citadel, Sovereignty Hub, Skyhook and Customs Office (group
  "Orbital Infrastructure") all verified present.
- **"All" tab** added ahead of the category tabs in the authorised-groups
  browser (`MatrixSelector`), searching/listing groups across every category.
  Label localised (EN/ES).
- **README:** documented the category coverage in the SDE pipeline section.

## 2026-06-18 - 20:09

### State matrix corrected to Tomas Iridium's canonical taxonomy + 20-tab cap

- **State IDs realigned to the in-game truth.** The previous `STATES` map had
  most IDs mislabelled/shifted (e.g. 9 was "Neutral Standing", actually
  "security status below -5"; 17 was "Corp Threat", actually "Neutral
  Standing"; 66/68 were guessed as faction states, actually "Non Capsuleer
  corporation" / "retribution timer"). Every ID 9–68 has been corrected
  against Tomas Iridium's canonical
  [`states_all.yaml`](https://github.com/iridiumops/overview/blob/main/parts/states_all.yaml),
  and each `name` is now the **verbatim** game/Iridium label so the UI text
  matches the client exactly. `kind`/`color` defaults were re-bucketed to suit.
- **Wreck IDs 36 / 37 flagged `filterOnly`.** Per Tomas, these are honoured only
  in `filteredStates` / `alwaysShownStates`, never as a colortag or background.
  Added `APPEARANCE_STATE_IDS` and `isFilterOnlyState()` so appearance-facing UI
  can exclude them; the preset filter UI still lists them.
- **ID 20 retained as a reserved passthrough** — no observed in-game meaning but
  it surfaces in YAML exports, so it round-trips losslessly.
- **Tab cap raised 8 → 20** to match the current client. Introduced a single
  `MAX_TABS` constant (store) consumed by `TabManager` and `OverviewWindow`;
  updated EN/ES strings and all docs/comments referencing the old limit.
- **README:** rewrote the state-ID table with the exact Iridium wording and the
  filter-only / reserved annotations; updated the 20-tab references.

## 2026-06-13 - 01:12

### Bugfix & housekeeping — group-browser category strip, README TOC, CI on push

- **Bugfix:** the Celestial / Station / Ship / Drone category tabs in the
  Authorised Groups browser only appeared while a search query was active.
  Cause: a flexbox squeeze — inside the browser's max-height container, the
  unfiltered group list's huge flex base height absorbed the shrink
  proportionally and crushed the strip to ~0px; a search made the list short
  enough to release it. Fixed with `shrink-0` on the category strip (and the
  search input).
- **README:** added a table of contents.
- **CI:** the SDE Update workflow now also triggers on **push to main** —
  pushes skip the weekly SDE re-download and deploy the site directly (the
  bot's own `[skip ci]` commit cannot re-trigger it).
- **Header SDE freshness chip** next to the version: shows the date the ship
  database was last pulled from the Static Data Export (🛰 SDE {date},
  locale-aware, tooltip explaining the tool self-updates). If the matrix
  fetch fails, an amber **⚠ SDE offline** warning appears instead, noting the
  app is running on the minimal built-in fallback. Translated in EN/ES.

## 2026-06-12 - 11:32

### Iteration 9 — editor unification, overview tab interactions, Tailwind 4

- **MarkupInput restyled on the ship-label editor's controls** (the preferred
  look): same B / I / U buttons, plus a **px size field** (wrapping
  `<fontsize=NN>`, now understood by the wrap/unwrap codec) and the colour
  picker.
- **Tab colour unified — and the "Z-S doesn't load" mystery solved:** Z-S (and
  the game) colour tabs via the separate `tabSetup.color` field, not name
  markup, which is why the markup swatch looked empty on load. The tab-name
  editor's swatch now drives that native field directly (shown in the live
  preview chip), and the legacy bottom colour-picker row is gone.
- **Overview panel "+"** after the last tab (while under the game's 8-tab cap):
  adds a tab and moves focus to the Tab Setup section to edit it.
- **In-game-style right-click on overview tabs:** a context menu to re-point
  the tab's **list preset** and **bracket preset** (incl. "None") without
  leaving the preview; closes on pick / Escape / outside click. Preset entries
  render with their **styled names** (colour/bold markup), matching how the
  packs colour-code preset roles, with plain-text tooltips for truncated ones.
- **Tailwind CSS migrated to v4** (dependency bump to `^4.3`): switched to the
  first-party `@tailwindcss/vite` plugin, CSS-first `@theme inline` tokens
  (runtime dark/light switching preserved), removed `tailwind.config.js`,
  `postcss.config.js`, and the autoprefixer/postcss dev-dependencies; verified
  all custom utilities and opacity modifiers in the production bundle.

## 2026-06-12 - 11:14

### Iteration 8 — unified markup editing UX

- **New shared `MarkupInput` component** for every text field that accepts EVE
  inline markup: raw-text input plus a formatting toolbar — **colour picker and
  B / I / U toggles** that wrap/unwrap the *outermost* tags
  (`analyzeMarkup`/`composeMarkup` in the codec; hand-written inner markup is
  never touched, and unbalanced same-tag patterns are guarded against) — with a
  live-rendered preview.
- **New `MarkupHint` legend popover** ("?" icon): lists all supported tags
  (`<color=0xAARRGGBB>`, `<b>`, `<i>`, `<u>`, `<fontsize=NN>`) with
  live-rendered examples; keyboard accessible (Escape / focus-out closes).
- **Unified across the app:** tab names and preset names now share the same
  editor (preset names gained the colour picker and style toggles tab names
  had been missing — and vice versa); ship-label prefix/suffix fields carry
  the formatting legend.
- All new UI copy translated in **English and Español**.

## 2026-06-12 - 10:47

### Iteration 7 — preset management, per-file locales

- **Preset create / duplicate / rename / delete** — the missing core of the
  overview system — added to the Presets panel and the store:
  - **New** creates an empty preset (collision-safe naming) and selects it;
    **Duplicate** deep-copies filters and groups under a "(copy)" name.
  - **Rename** commits through the store (not a live binding) and **cascades
    into every tab** whose `overview`/`bracket` points at the old name, with
    duplicate-name validation and an EVE-markup live preview of the name.
  - **Delete** refuses to remove the last preset; tabs that used the deleted
    preset fall back (list views → first remaining preset, brackets → none).
- **i18n restructured into one file per language** under
  `src/lib/i18n/locales/` (`en.js` reference, `es.js`), with
  `strings.svelte.js` reduced to the reactive runtime (locale state,
  persistence, fallback resolution). README translation guide updated for the
  new copy-one-file workflow.

## 2026-06-11 - 22:49

### Iteration 6 — Spanish localisation, navbar redesign, docs

- **i18n completed:** the locale is now reactive Svelte 5 `$state`
  (`src/lib/i18n/strings.svelte.js`) — switching language re-renders instantly,
  persists to localStorage, and falls back to English for untranslated keys.
  Added a full **Español (Spanish)** translation and swept the remaining
  hardcoded strings (roster fields, misc stats, empty states, modal close,
  "clear" buttons) into the locale file.
- **Language selector** added to the header.
- **Navbar redesigned:** base profiles collapse into a single **Base dropdown**
  (imports/snapshots show as a transient entry), versions/import and clear-all
  become **icon buttons** with tooltips, and the language/scale/theme/GitHub
  controls form one compact cluster. The **UI scale now affects the whole app**
  — header and dialogs included (zoom wrapper moved to the root).
- **README:** new **Contributing translations** guide (step-by-step for adding
  a language) and a **License** section (AGPL-3.0, linking to `LICENSE`) just
  before the copyright notice.
- **Documentation pass across the codebase:** every Svelte component now opens
  with an `@component` doc block (purpose, bindings, behaviour); the store,
  codec, merge/history/labels utils and entry/config files gained detailed
  JSDoc — including a full specification of `resolveEntity()`'s visibility and
  priority rules and the YAML serialisation faithfulness guarantees.

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
