<!--
  @component
  Game-accurate overview list preview. Renders the profile's tab strip (EVE
  markup + optional tab colours, a "+" to add a tab while under the game's
  20-tab cap, and an in-game-style right-click menu to re-point a tab's list /
  bracket presets), the active tab's column set (its own per-tab columns when
  it overrides them, else the profile-wide set) in master order, and one row
  per roster entity that the active tab's *overview* preset lets through —
  with the winning colortag stripe, row background tint and blink resolved by
  customiserStore.resolveEntity(). Deliberately keeps the game's dark chrome
  in both app themes.

  Two reorder controls live in the chrome: a lock on the tab strip, and a
  tri-state control on the column header (locked / this tab / whole profile)
  that decides where a column drop lands. Both explain themselves through a
  tooltip shown on hover and keyboard focus.

  Props: onaddtab — optional; invoked after "+" creates a tab so the shell
  can move focus to the Tab Setup section. onhide — collapses this panel.
-->
<script>
import { flip } from "svelte/animate";
import { dndzone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from "svelte-dnd-action";
import { COLUMN_DEFS } from "$lib/data/stateMatrix";
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser, MAX_TABS } from "$lib/stores/customiserStore.svelte";
import {
	BRACKET_SHOW_ALL,
	floatTripletToCss,
	renderEveMarkup,
	stripEveMarkup,
} from "$lib/utils/eveFormat";

let { onaddtab, onhide } = $props();

// Direct reordering of the tab strip and the column header, each with its own
// control and both off by default, so a stray drag can't rearrange the profile
// while clicking around the preview. Every drop commits through the store —
// the same thing the Tabs and Columns sections read and write — so the two
// views stay in lockstep.
//
// The column control is tri-state because a column drag has two useful
// meanings: rearrange THIS tab (giving it its own columns) or rearrange the
// shared profile order. One button cycling locked -> tab -> profile keeps both
// within reach without a second widget in the preview chrome.
let locked = $state(true);
const COL_MODES = ["locked", "tab", "profile"];
const COL_ICONS = { locked: "🔒", tab: "🔓", profile: "🌐" };
let colMode = $state("locked");
const FLIP_MS = 150;

function cycleColMode() {
	colMode = COL_MODES[(COL_MODES.indexOf(colMode) + 1) % COL_MODES.length];
}

// svelte-dnd-action wants items carrying an `id`; tabs and column names are
// wrapped so the store keeps owning the real values.
let tabItems = $state([]);
let colItems = $state([]);
let dragging = $state(false);

$effect(() => {
	if (dragging) return; // never stomp an in-flight drag
	tabItems = customiser.tabs.map((tb) => ({ id: tb.index, v: tb }));
});
$effect(() => {
	if (dragging) return;
	colItems = visibleColumns.map((col) => ({ id: col, v: col }));
});

function consider(e, which) {
	dragging = true;
	if (which === "tabs") tabItems = e.detail.items;
	else colItems = e.detail.items;
}

function finalizeTabs(e) {
	tabItems = e.detail.items;
	dragging = false;
	customiser.reorderTabs(e.detail.items.map((i) => i.v));
}

function finalizeCols(e) {
	colItems = e.detail.items;
	dragging = false;
	customiser.reorderVisibleColumns(
		customiser.activeTab,
		e.detail.items.map((i) => i.v),
		colMode, // "tab" or "profile" — never "locked", the zone is disabled then
	);
}

// Right-click context target: the tab index whose presets are being picked.
let ctxIndex = $state(null);
let ctxQuery = $state("");
const ctxTab = $derived(
	customiser.tabs.find((tb) => tb.index === ctxIndex) ?? null,
);
// Search matches on the visible (markup-stripped) preset name.
const ctxPresets = $derived.by(() => {
	const q = ctxQuery.trim().toLowerCase();
	if (!q) return customiser.presetNames;
	return customiser.presetNames.filter((n) =>
		stripEveMarkup(n).toLowerCase().includes(q),
	);
});

// Fixed-position coordinates so the menu escapes the panel's overflow-hidden
// and never clips; clamped to keep the whole menu inside the viewport.
let ctxPos = $state({ x: 0, y: 0 });

function openContext(e, tab) {
	e.preventDefault();
	ctxQuery = "";
	// Anchor just under the clicked tab. The app zooms via App.svelte's
	// `zoom` wrapper and this fixed menu lives inside it, so its style px are
	// multiplied by the zoom while getBoundingClientRect()/innerWidth are in
	// real viewport px — divide everything back into zoomed units.
	const z = customiser.uiScale || 1;
	const r = e.currentTarget.getBoundingClientRect();
	ctxPos = {
		x: Math.max(8, Math.min(r.left / z, window.innerWidth / z - 296)),
		y: Math.max(8, Math.min(r.bottom / z + 2, window.innerHeight / z - 340)),
	};
	ctxIndex = tab.index;
}

/** Focus the search box as soon as the context menu renders it. */
function focusOnMount(el) {
	el.focus();
}

function addTab() {
	customiser.addTab();
	onaddtab?.();
}

// Columns shown, in master order, filtered to the active set — the active
// tab's own columns when it overrides them, otherwise the profile-wide pair.
const visibleColumns = $derived(
	customiser.visibleColumnsForTab(customiser.activeTab),
);

const overviewPreset = $derived(
	customiser.presetByName(customiser.activeTab?.overview),
);

const rows = $derived.by(() =>
	customiser.roster
		.map((e) => ({
			entity: e,
			res: customiser.resolveEntity(e, overviewPreset),
		}))
		.filter((r) => r.res.visible),
);

function fmtDistance(m) {
	if (m == null) return "";
	if (m >= 1000)
		return `${(m / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
	return `${Math.round(m).toLocaleString()} m`;
}
function tabStyle(tab) {
	return Array.isArray(tab.color)
		? `color:${floatTripletToCss(tab.color)}`
		: "";
}
function cellValue(col, e) {
	switch (col) {
		case "NAME":
			return e.pilotName;
		case "TYPE":
			return e.type;
		case "TAG":
			return e.tag ?? "";
		case "DISTANCE":
			return fmtDistance(e.distance);
		case "CORPORATION":
			return e.corp;
		case "ALLIANCE":
			return e.alliance;
		case "FACTION":
			return e.faction;
		case "MILITIA":
			return e.militia;
		case "SIZE":
			return e.size;
		case "VELOCITY":
			return `${e.velocity} m/s`;
		case "RADIALVELOCITY":
			return `${e.radial} m/s`;
		case "TRANSVERSALVELOCITY":
			return `${e.transversal} m/s`;
		case "ANGULARVELOCITY":
			return `${e.angular} rad/s`;
		default:
			return "";
	}
}
</script>

<div class="bg-eve-panel border border-eve-border rounded-lg flex flex-col overflow-hidden font-mono text-[11px] text-eve-text h-full relative">
  <!-- Tab strip (left-click activates, right-click opens the preset menu; drag
       to reorder once the lock is open) -->
  <div class="flex bg-eve-header border-b border-eve-border shrink-0">
    <div class="flex overflow-x-auto whitespace-nowrap flex-1 min-w-0">
      <div
        class="flex"
        use:dndzone={{ items: tabItems, dragDisabled: locked, flipDurationMs: FLIP_MS, dropTargetStyle: {} }}
        onconsider={(e) => consider(e, 'tabs')}
        onfinalize={finalizeTabs}
      >
        {#each tabItems as item (item.id)}
          {@const tab = item.v}
          <button
            animate:flip={{ duration: FLIP_MS }}
            onclick={() => customiser.activeTabId = tab.index}
            oncontextmenu={(e) => openContext(e, tab)}
            style={tabStyle(tab)}
            class="px-3 py-1.5 text-xs border-b-2 transition-colors shrink-0 {customiser.activeTabId === tab.index ? 'border-eve-accent bg-eve-panel' : 'border-transparent hover:bg-white/5'} {locked ? '' : 'cursor-grab active:cursor-grabbing'} {item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? 'opacity-40' : ''}"
          >{@html renderEveMarkup(tab.name)}</button>
        {/each}
      </div>
      {#if customiser.tabs.length < MAX_TABS}
        <button
          onclick={addTab}
          class="px-2.5 py-1.5 text-xs text-eve-muted hover:text-eve-text hover:bg-white/5 transition-colors shrink-0"
          aria-label={t('tabs.add')}
          title={t('tabs.add')}
        >+</button>
      {/if}
    </div>

    <!-- Tab reorder lock. The tooltip shows on hover *and* keyboard focus
         (focus-within), since a native title attribute never reaches keyboard
         users. -->
    <div class="relative group shrink-0 flex">
      <button
        onclick={() => locked = !locked}
        aria-pressed={!locked}
        aria-label={locked ? t('preview.unlockTabs') : t('preview.lockTabs')}
        aria-describedby="reorder-tip-tabs"
        class="px-2.5 py-1.5 text-xs border-l border-eve-border transition-colors {locked ? 'text-eve-muted hover:text-eve-text hover:bg-white/5' : 'text-eve-accent bg-eve-accent/10'}"
      ><span aria-hidden="true">{locked ? '🔒' : '🔓'}</span></button>

      {@render tip('reorder-tip-tabs', t('preview.tipTabsTitle'), [
        [t('preview.tipTabs'), false],
        [t('preview.tipSync'), false],
      ])}
    </div>

    <button
      onclick={onhide}
      aria-label={t('app.hidePanel')}
      title={t('app.hidePanel')}
      class="px-2 py-1.5 shrink-0 border-l border-eve-border text-eve-muted hover:text-eve-text hover:bg-white/5 transition-colors"
    >
      <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  </div>

  <!-- In-game-style tab context menu: pick this tab's list + bracket presets -->
  {#if ctxTab}
    <button class="fixed inset-0 z-40 cursor-default" aria-label={t('common.close')} onclick={() => ctxIndex = null} oncontextmenu={(e) => { e.preventDefault(); ctxIndex = null; }}></button>
    <div
      style="left:{ctxPos.x}px; top:{ctxPos.y}px"
      class="fixed z-50 w-72 max-w-[calc(100vw-1rem)] bg-eve-panel2 border border-eve-border rounded-lg shadow-2xl p-2 font-sans"
      role="menu"
      aria-label={stripEveMarkup(ctxTab.name)}
    >
      <div class="flex items-center justify-between gap-2 px-1 pb-1.5 border-b border-eve-border mb-1.5">
        <span class="font-mono text-xs truncate">{@html renderEveMarkup(ctxTab.name)}</span>
        <button onclick={() => ctxIndex = null} class="text-eve-muted hover:text-eve-text px-1" aria-label={t('common.close')}>✕</button>
      </div>

      <!-- Search: filters both preset columns by visible name -->
      <input
        type="search"
        bind:value={ctxQuery}
        use:focusOnMount
        onkeydown={(e) => { if (e.key === 'Escape') ctxIndex = null; }}
        placeholder={t('tabs.presetSearch')}
        aria-label={t('tabs.presetSearch')}
        class="w-full mb-1.5 bg-eve-panel border border-eve-border rounded px-2 py-1 text-[11px] text-eve-text placeholder:text-eve-muted focus:outline-none focus:border-eve-accent"
      />

      <div class="grid grid-cols-2 gap-2">
        <div class="min-w-0">
          <div class="text-[9px] uppercase tracking-wider text-eve-muted px-1 mb-1">{t('tabs.listPreset')}</div>
          <div class="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
            {#each ctxPresets as name}
              <button
                role="menuitemradio"
                aria-checked={ctxTab.overview === name}
                onclick={() => { ctxTab.overview = name; ctxIndex = null; }}
                title={stripEveMarkup(name)}
                class="w-full text-left text-[11px] font-mono px-1.5 py-1 rounded truncate transition-colors {ctxTab.overview === name ? 'bg-eve-accent/20 text-eve-text' : 'text-eve-muted hover:text-eve-text hover:bg-white/5'}"
              >{@html renderEveMarkup(name)}</button>
            {/each}
          </div>
        </div>
        <div class="min-w-0">
          <div class="text-[9px] uppercase tracking-wider text-eve-muted px-1 mb-1">{t('tabs.bracketPreset')}</div>
          <div class="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
            <button
              role="menuitemradio"
              aria-checked={ctxTab.bracket === BRACKET_SHOW_ALL}
              onclick={() => { ctxTab.bracket = BRACKET_SHOW_ALL; ctxIndex = null; }}
              class="w-full text-left text-[11px] px-1.5 py-1 rounded truncate transition-colors {ctxTab.bracket === BRACKET_SHOW_ALL ? 'bg-eve-accent/20 text-eve-text' : 'text-eve-muted hover:text-eve-text hover:bg-white/5'}"
            >{t('tabs.bracketShowAll')}</button>
            {#each ctxPresets as name}
              <button
                role="menuitemradio"
                aria-checked={ctxTab.bracket === name}
                onclick={() => { ctxTab.bracket = name; ctxIndex = null; }}
                title={stripEveMarkup(name)}
                class="w-full text-left text-[11px] font-mono px-1.5 py-1 rounded truncate transition-colors {ctxTab.bracket === name ? 'bg-eve-accent/20 text-eve-text' : 'text-eve-muted hover:text-eve-text hover:bg-white/5'}"
              >{@html renderEveMarkup(name)}</button>
            {/each}
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Column header. Its own control decides whether a drop rearranges just
       this tab (giving it its own columns) or the shared profile order; the
       trailing gutter is mirrored by every row below so the grid stays aligned. -->
  <div class="flex bg-eve-panel2 border-b border-eve-border text-eve-muted uppercase text-[9px] tracking-wide select-none shrink-0">
    <div
      class="flex flex-1 min-w-0"
      use:dndzone={{ items: colItems, dragDisabled: colMode === 'locked', flipDurationMs: FLIP_MS, dropTargetStyle: {} }}
      onconsider={(e) => consider(e, 'cols')}
      onfinalize={finalizeCols}
    >
      {#each colItems as item (item.id)}
        {@const col = item.v}
        <div
          animate:flip={{ duration: FLIP_MS }}
          class="px-1.5 py-1 truncate {col === 'ICON' ? 'w-7 shrink-0 text-center' : 'flex-1 min-w-0'} {colMode === 'locked' ? '' : 'cursor-grab active:cursor-grabbing'} {item[SHADOW_ITEM_MARKER_PROPERTY_NAME] ? 'opacity-40' : ''}"
          title={COLUMN_DEFS[col]?.desc ?? col}
        >
          {col === 'ICON' ? '' : (COLUMN_DEFS[col]?.label ?? col)}
        </div>
      {/each}
    </div>

    <div class="relative group shrink-0 flex">
      <button
        onclick={cycleColMode}
        aria-label={t(`preview.colMode.${colMode}`)}
        aria-describedby="reorder-tip-cols"
        class="w-7 py-1 text-[11px] leading-none border-l border-eve-border transition-colors {colMode === 'locked' ? 'text-eve-muted hover:text-eve-text hover:bg-white/5' : 'text-eve-accent bg-eve-accent/10'}"
      ><span aria-hidden="true">{COL_ICONS[colMode]}</span></button>

      {@render tip('reorder-tip-cols', t('preview.tipColsTitle'), [
        [t('preview.tipColLocked'), colMode === 'locked'],
        [t('preview.tipColTab'), colMode === 'tab'],
        [t('preview.tipColProfile'), colMode === 'profile'],
        [t('preview.tipHidden'), false],
      ])}
    </div>
  </div>

  <!-- Rows -->
  <div class="flex-1 overflow-y-auto">
    {#each rows as { entity, res } (entity.id)}
      <div
        class="flex items-center border-b border-eve-border/40 relative hover:bg-white/5 {res.bgBlink ? 'eve-blink' : ''}"
        style={res.bgColor ? `background-color:${res.bgColor}33` : ''}
      >
        {#if res.flagColor}
          <span class="absolute left-0 top-0 bottom-0 w-[3px] {res.flagBlink ? 'eve-blink' : ''}" style="background-color:{res.flagColor}"></span>
        {/if}
        {#each visibleColumns as col (col)}
          {#if col === 'ICON'}
            <div class="w-7 shrink-0 text-center py-1">
              <span style="color:{res.flagColor ?? '#9fb2c8'}">▲</span>
              {#if res.forcedOverVeto}
                <!-- On screen because an always-shown state outranked a state
                     that would otherwise have hidden it. -->
                <span
                  class="text-eve-accent text-[9px] align-super"
                  title={t('preview.forcedOverVeto')}
                  aria-label={t('preview.forcedOverVeto')}
                >*</span>
              {/if}
            </div>
          {:else}
            <div class="flex-1 min-w-0 px-1.5 py-1 truncate {col === 'NAME' ? 'text-eve-text' : 'text-eve-muted'}">
              {cellValue(col, entity)}
            </div>
          {/if}
        {/each}
        <!-- Gutter matching the header's column-mode button, so cells line up -->
        <div class="w-7 shrink-0" aria-hidden="true"></div>
      </div>
    {:else}
      <div class="text-center text-eve-muted text-[10px] py-8">{t('preview.noEntities')}</div>
    {/each}
  </div>
</div>

<!-- Hover/focus tooltip used by both reorder controls. `lines` is
     [text, isCurrentState] — the live state is highlighted so a tri-state
     button explains itself. -->
{#snippet tip(id, title, lines)}
  <div
    {id}
    role="tooltip"
    class="pointer-events-none absolute right-0 top-full mt-1 z-50 w-72 max-w-[calc(100vw-2rem)] rounded-lg border border-eve-border bg-eve-panel2 p-2.5 shadow-2xl font-sans text-[11px] normal-case tracking-normal leading-snug text-eve-muted opacity-0 invisible transition-opacity group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible"
  >
    <p class="text-eve-text font-semibold mb-1">{title}</p>
    <ul class="space-y-1 list-disc pl-3.5">
      {#each lines as [text, active]}
        <li class={active ? 'text-eve-text font-medium' : ''}>{text}</li>
      {/each}
    </ul>
  </div>
{/snippet}
