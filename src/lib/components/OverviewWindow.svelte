<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { renderEveMarkup, floatTripletToCss } from '$lib/utils/eveFormat';
  import { COLUMN_DEFS } from '$lib/data/stateMatrix';

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

<div class="bg-eve-panel border border-eve-border rounded flex flex-col overflow-hidden font-mono text-[11px] text-eve-text h-full">
  <!-- Tab strip -->
  <div class="flex bg-eve-header border-b border-eve-border overflow-x-auto whitespace-nowrap shrink-0">
    {#each customiser.tabs as tab (tab.index)}
      <button
        onclick={() => customiser.activeTabId = tab.index}
        style={tabStyle(tab)}
        class="px-3 py-1.5 text-xs border-b-2 transition-colors shrink-0 {customiser.activeTabId === tab.index ? 'border-eve-accent bg-eve-panel' : 'border-transparent hover:bg-white/5'}"
      >{@html renderEveMarkup(tab.name)}</button>
    {/each}
  </div>

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
      <div class="text-center text-eve-muted text-[10px] py-8">No entities match this tab's preset.</div>
    {/each}
  </div>
</div>
