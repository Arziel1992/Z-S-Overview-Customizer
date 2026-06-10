<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { ALL_COLUMNS, COLUMN_DEFS } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings';

  // Master ordered list = columnOrder, with any columns missing from it appended.
  const ordered = $derived.by(() => {
    const seen = new Set(customiser.columnOrder);
    const extra = ALL_COLUMNS.filter((c) => !seen.has(c));
    return [...customiser.columnOrder, ...extra];
  });

  function ensureInColumnOrder(col) {
    if (!customiser.columnOrder.includes(col)) customiser.columnOrder.push(col);
  }

  function toggleActive(col) {
    ensureInColumnOrder(col);
    customiser.toggleMember(customiser.overviewColumns, col);
  }

  function move(col, dir) {
    ensureInColumnOrder(col);
    const i = customiser.columnOrder.indexOf(col);
    customiser.reorder(customiser.columnOrder, i, dir);
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('columns.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('columns.help')}</p>
  </div>

  <div class="space-y-1.5">
    {#each ordered as col, i (col)}
      {@const active = customiser.overviewColumns.includes(col)}
      <div class="flex items-center gap-2 bg-app-panel2 border border-app-border rounded px-2.5 py-1.5">
        <input type="checkbox" checked={active} onchange={() => toggleActive(col)} class="accent-app-accent" aria-label={COLUMN_DEFS[col]?.label} />
        <div class="flex-1 min-w-0">
          <span class="text-xs text-app-text">{COLUMN_DEFS[col]?.label ?? col}</span>
          <span class="text-[9px] text-app-muted block truncate">{COLUMN_DEFS[col]?.desc ?? ''}</span>
        </div>
        <div class="flex items-center gap-0.5">
          <button onclick={() => move(col, -1)} disabled={i === 0} class="text-app-muted hover:text-app-text disabled:opacity-30 px-1" aria-label="Move up">▲</button>
          <button onclick={() => move(col, 1)} disabled={i === ordered.length - 1} class="text-app-muted hover:text-app-text disabled:opacity-30 px-1" aria-label="Move down">▼</button>
        </div>
      </div>
    {/each}
  </div>
</div>
