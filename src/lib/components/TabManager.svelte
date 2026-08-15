<!--
  @component
  Tab Setup editor (up to 20 client tabs). Each card binds a tab's markup name,
  its list (overview) preset, its 3D bracket preset (or none), an optional
  [r,g,b] tab-text colour, and — through the Columns dialog — that tab's own
  column set/order (the in-game tab right-click -> Columns menu). Cards reorder
  via DragList; indexes renumber on commit through the store so tab order
  matches the in-game strip.
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser, MAX_TABS } from "$lib/stores/customiserStore.svelte";
import {
	BRACKET_SHOW_ALL,
	cssToFloatTriplet,
	floatTripletToCss,
	renderEveMarkup,
	stripEveMarkup,
} from "$lib/utils/eveFormat";
import ColumnPicker from "./ColumnPicker.svelte";
import DragList from "./DragList.svelte";
import MarkupInput from "./MarkupInput.svelte";
import Modal from "./Modal.svelte";

// Index of the tab whose columns are being edited (null = dialog closed). The
// editor lives in a dialog rather than inside the card so its 14-row list has
// room, and so its drag-to-reorder never nests inside the tab DragList.
let colIndex = $state(null);
const colTab = $derived(
	customiser.tabs.find((tb) => tb.index === colIndex) ?? null,
);
const ownColumns = $derived(customiser.tabHasOwnColumns(colTab));

function copyFrom(e) {
	const from = Number(e.currentTarget.value);
	e.currentTarget.value = ""; // an action, not a stored value — reset the select
	customiser.copyTabColumns(from, colTab);
}
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('tabs.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('tabs.help')}</p>
  </div>

  <DragList values={customiser.tabs} onchange={(v) => customiser.reorderTabs(v)} row={tabCard} />

  {#if customiser.tabs.length < MAX_TABS}
    <button onclick={() => customiser.addTab()} class="w-full bg-app-accent hover:bg-app-accentHover text-white text-xs font-semibold py-2 rounded transition-colors">+ {t('tabs.add')}</button>
  {:else}
    <p class="text-center text-[11px] text-amber-500">{t('tabs.max')}</p>
  {/if}
</div>

{#snippet tabCard(tab)}
  <div class="bg-app-panel2 border border-app-border rounded p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="text-[10px] text-app-muted w-6 shrink-0">#{tab.index}</span>
      <span class="font-mono text-xs flex-1 truncate" title={stripEveMarkup(tab.name)}>{@html renderEveMarkup(tab.name)}</span>
      {#if customiser.tabs.length > 1}
        <button onclick={() => customiser.removeTab(tab.index)} class="text-red-400 hover:text-red-300 px-1" aria-label={t('tabs.remove')}>✕</button>
      {/if}
    </div>

    <!-- The colour swatch edits the tab's native tabSetup colour field
         (an [r,g,b] triplet — how Z-S and the game colour tabs), not name
         markup, so loaded profiles show their real colour here. -->
    <MarkupInput
      label={t('tabs.name')}
      value={tab.name}
      oncommit={(v) => tab.name = v}
      colorCss={Array.isArray(tab.color) ? floatTripletToCss(tab.color) : null}
      oncolor={(css) => tab.color = css ? cssToFloatTriplet(css) : null}
    />

    <div class="grid grid-cols-[1fr_auto_1fr] gap-1.5 items-end">
      <label class="flex flex-col gap-1 min-w-0">
        <span class="text-[9px] uppercase text-app-muted">{t('tabs.listPreset')}</span>
        <select bind:value={tab.overview} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent">
          {#each customiser.presetNames as name}
            <option value={name}>{stripEveMarkup(name)}</option>
          {/each}
        </select>
      </label>
      <button
        onclick={() => tab.bracket = tab.overview}
        class="border border-app-border rounded px-1.5 py-1 text-xs text-app-muted hover:text-app-text hover:border-app-accent transition-colors"
        aria-label={t('tabs.copyToBracket')}
        title={t('tabs.copyToBracket')}
      >→</button>
      <label class="flex flex-col gap-1 min-w-0">
        <span class="text-[9px] uppercase text-app-muted">{t('tabs.bracketPreset')}</span>
        <select bind:value={tab.bracket} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent">
          <option value={BRACKET_SHOW_ALL}>{t('tabs.bracketShowAll')}</option>
          {#each customiser.presetNames as name}
            <option value={name}>{stripEveMarkup(name)}</option>
          {/each}
        </select>
      </label>
    </div>

    <!-- Per-tab columns (tabColumns / tabColumnOrder) — the in-game tab
         right-click -> Columns menu. Untouched tabs inherit the profile set. -->
    <button
      onclick={() => colIndex = tab.index}
      class="w-full flex items-center justify-between gap-2 border border-app-border rounded px-2 py-1.5 text-[11px] text-app-muted hover:text-app-text hover:border-app-accent transition-colors"
      title={t('tabs.columnsEdit')}
    >
      <span class="uppercase tracking-wider text-[9px]">{t('tabs.columns')}</span>
      {#if customiser.tabHasOwnColumns(tab)}
        <span class="text-app-accent font-semibold">{t('tabs.columnsCustom', { n: customiser.visibleColumnsForTab(tab).length })}</span>
      {:else}
        <span>{t('tabs.columnsInherit')}</span>
      {/if}
    </button>

  </div>
{/snippet}

{#if colTab}
  <Modal
    title={t('tabs.columnsFor', { name: stripEveMarkup(colTab.name) })}
    onclose={() => colIndex = null}
  >
    <div class="space-y-3">
      <label class="flex items-start gap-2 bg-app-panel2 border border-app-border rounded p-2.5">
        <input
          type="checkbox"
          checked={ownColumns}
          onchange={(e) => customiser.setTabColumnsOverride(colTab, e.currentTarget.checked)}
          class="accent-app-accent mt-0.5"
        />
        <span class="min-w-0">
          <span class="text-xs text-app-text block">{t('tabs.columnsOwn')}</span>
          <span class="text-[11px] text-app-muted block mt-0.5">{t('tabs.columnsOwnHelp')}</span>
        </span>
      </label>

      {#if customiser.tabs.length > 1}
        <label class="flex items-center gap-2">
          <span class="text-[9px] uppercase text-app-muted shrink-0">{t('tabs.columnsCopy')}</span>
          <select
            value=""
            onchange={copyFrom}
            class="flex-1 min-w-0 bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent"
          >
            <option value="" disabled>{t('tabs.columnsCopyPick')}</option>
            {#each customiser.tabs.filter((tb) => tb.index !== colTab.index) as other (other.index)}
              <option value={other.index}>
                #{other.index} {stripEveMarkup(other.name)}
                {customiser.tabHasOwnColumns(other) ? '' : `(${t('tabs.columnsInherit')})`}
              </option>
            {/each}
          </select>
        </label>
      {/if}

      <ColumnPicker
        order={customiser.columnOrderForTab(colTab)}
        active={customiser.columnsForTab(colTab)}
        onorder={(v) => colTab.tabColumnOrder = v}
        ontoggle={(col) => customiser.toggleTabColumn(colTab, col)}
        disabled={!ownColumns}
      />
    </div>
  </Modal>
{/if}
