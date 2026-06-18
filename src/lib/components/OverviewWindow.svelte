<!--
  @component
  Game-accurate overview list preview. Renders the profile's tab strip (EVE
  markup + optional tab colours, a "+" to add a tab while under the game's
  20-tab cap, and an in-game-style right-click menu to re-point a tab's list /
  bracket presets), the active column set in columnOrder order, and one row
  per roster entity that the active tab's *overview* preset lets through —
  with the winning colortag stripe, row background tint and blink resolved by
  customiserStore.resolveEntity(). Deliberately keeps the game's dark chrome
  in both app themes.

  Props: onaddtab — optional; invoked after "+" creates a tab so the shell
  can move focus to the Tab Setup section.
-->
<script>
  import { COLUMN_DEFS } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser, MAX_TABS } from '$lib/stores/customiserStore.svelte';
  import { floatTripletToCss, renderEveMarkup, stripEveMarkup } from '$lib/utils/eveFormat';

  let { onaddtab } = $props();

  // Right-click context target: the tab index whose presets are being picked.
  let ctxIndex = $state(null);
  const ctxTab = $derived(customiser.tabs.find((tb) => tb.index === ctxIndex) ?? null);

  function openContext(e, tab) {
    e.preventDefault();
    ctxIndex = tab.index;
  }

  function addTab() {
    customiser.addTab();
    onaddtab?.();
  }

  // Columns shown, in master order, filtered to the active set.
  const visibleColumns = $derived.by(() => {
    const order = customiser.columnOrder.length ? customiser.columnOrder : customiser.overviewColumns;
    const active = new Set(customiser.overviewColumns);
    const cols = order.filter((c) => active.has(c));
    return cols.length ? cols : customiser.overviewColumns;
  });

  const overviewPreset = $derived(customiser.presetByName(customiser.activeTab?.overview));

  const rows = $derived.by(() =>
    customiser.roster
      .map((e) => ({ entity: e, res: customiser.resolveEntity(e, overviewPreset) }))
      .filter((r) => r.res.visible)
  );

  function fmtDistance(m) {
    if (m == null) return '';
    if (m >= 1000) return `${(m / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })} km`;
    return `${Math.round(m).toLocaleString()} m`;
  }
  function tabStyle(tab) {
    return Array.isArray(tab.color) ? `color:${floatTripletToCss(tab.color)}` : '';
  }
  function cellValue(col, e) {
    switch (col) {
      case 'NAME': return e.pilotName;
      case 'TYPE': return e.type;
      case 'TAG': return e.tag ?? '';
      case 'DISTANCE': return fmtDistance(e.distance);
      case 'CORPORATION': return e.corp;
      case 'ALLIANCE': return e.alliance;
      case 'FACTION': return e.faction;
      case 'MILITIA': return e.militia;
      case 'SIZE': return e.size;
      case 'VELOCITY': return `${e.velocity} m/s`;
      case 'RADIALVELOCITY': return `${e.radial} m/s`;
      case 'TRANSVERSALVELOCITY': return `${e.transversal} m/s`;
      case 'ANGULARVELOCITY': return `${e.angular} rad/s`;
      default: return '';
    }
  }
</script>

<div class="bg-eve-panel border border-eve-border rounded-lg flex flex-col overflow-hidden font-mono text-[11px] text-eve-text h-full relative">
  <!-- Tab strip (left-click activates, right-click opens the preset menu) -->
  <div class="flex bg-eve-header border-b border-eve-border overflow-x-auto whitespace-nowrap shrink-0">
    {#each customiser.tabs as tab (tab.index)}
      <button
        onclick={() => customiser.activeTabId = tab.index}
        oncontextmenu={(e) => openContext(e, tab)}
        style={tabStyle(tab)}
        class="px-3 py-1.5 text-xs border-b-2 transition-colors shrink-0 {customiser.activeTabId === tab.index ? 'border-eve-accent bg-eve-panel' : 'border-transparent hover:bg-white/5'}"
      >{@html renderEveMarkup(tab.name)}</button>
    {/each}
    {#if customiser.tabs.length < MAX_TABS}
      <button
        onclick={addTab}
        class="px-2.5 py-1.5 text-xs text-eve-muted hover:text-eve-text hover:bg-white/5 transition-colors shrink-0"
        aria-label={t('tabs.add')}
        title={t('tabs.add')}
      >+</button>
    {/if}
  </div>

  <!-- In-game-style tab context menu: pick this tab's list + bracket presets -->
  {#if ctxTab}
    <button class="fixed inset-0 z-20 cursor-default" aria-label={t('common.close')} onclick={() => ctxIndex = null} oncontextmenu={(e) => { e.preventDefault(); ctxIndex = null; }}></button>
    <div
      class="absolute z-30 top-8 left-2 w-72 max-w-[calc(100%-1rem)] bg-eve-panel2 border border-eve-border rounded-lg shadow-2xl p-2 font-sans"
      role="menu"
      aria-label={stripEveMarkup(ctxTab.name)}
    >
      <div class="flex items-center justify-between gap-2 px-1 pb-1.5 border-b border-eve-border mb-1.5">
        <span class="font-mono text-xs truncate">{@html renderEveMarkup(ctxTab.name)}</span>
        <button onclick={() => ctxIndex = null} class="text-eve-muted hover:text-eve-text px-1" aria-label={t('common.close')}>✕</button>
      </div>

      <div class="grid grid-cols-2 gap-2">
        <div class="min-w-0">
          <div class="text-[9px] uppercase tracking-wider text-eve-muted px-1 mb-1">{t('tabs.listPreset')}</div>
          <div class="max-h-44 overflow-y-auto space-y-0.5 pr-0.5">
            {#each customiser.presetNames as name}
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
              aria-checked={ctxTab.bracket === null}
              onclick={() => { ctxTab.bracket = null; ctxIndex = null; }}
              class="w-full text-left text-[11px] px-1.5 py-1 rounded truncate transition-colors {ctxTab.bracket === null ? 'bg-eve-accent/20 text-eve-text' : 'text-eve-muted hover:text-eve-text hover:bg-white/5'}"
            >{t('tabs.bracketNone')}</button>
            {#each customiser.presetNames as name}
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

  <!-- Column header -->
  <div class="flex bg-eve-panel2 border-b border-eve-border text-eve-muted uppercase text-[9px] tracking-wide select-none shrink-0">
    {#each visibleColumns as col (col)}
      <div class="px-1.5 py-1 truncate {col === 'ICON' ? 'w-7 shrink-0 text-center' : 'flex-1 min-w-0'}" title={COLUMN_DEFS[col]?.desc ?? col}>
        {col === 'ICON' ? '' : (COLUMN_DEFS[col]?.label ?? col)}
      </div>
    {/each}
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
            </div>
          {:else}
            <div class="flex-1 min-w-0 px-1.5 py-1 truncate {col === 'NAME' ? 'text-eve-text' : 'text-eve-muted'}">
              {cellValue(col, entity)}
            </div>
          {/if}
        {/each}
      </div>
    {:else}
      <div class="text-center text-eve-muted text-[10px] py-8">{t('preview.noEntities')}</div>
    {/each}
  </div>
</div>
