<script>
  import { ALL_COLUMNS, COLUMN_DEFS } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import DragList from './DragList.svelte';

  // Master ordered list = columnOrder, with any columns missing from it appended.
  const ordered = $derived.by(() => {
    const seen = new Set(customiser.columnOrder);
    const extra = ALL_COLUMNS.filter((c) => !seen.has(c));
    return [...customiser.columnOrder, ...extra];
  });

  function commitOrder(values) {
    customiser.columnOrder = values;
  }
  function toggleActive(col) {
    if (!customiser.columnOrder.includes(col)) customiser.columnOrder.push(col);
    customiser.toggleMember(customiser.overviewColumns, col);
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('columns.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('columns.help')}</p>
  </div>

  <DragList values={ordered} onchange={commitOrder} row={column} />
</div>

{#snippet column(col)}
  {@const active = customiser.overviewColumns.includes(col)}
  <div class="flex items-center gap-2 bg-app-panel2 border border-app-border rounded px-2 py-1.5">
    <button class="drag-handle cursor-grab active:cursor-grabbing text-app-muted hover:text-app-text px-0.5 touch-none" aria-label="Drag to reorder">⠿</button>
    <input type="checkbox" checked={active} onchange={() => toggleActive(col)} class="accent-app-accent" aria-label={COLUMN_DEFS[col]?.label} />
    <div class="flex-1 min-w-0">
      <span class="text-xs text-app-text">{COLUMN_DEFS[col]?.label ?? col}</span>
      <span class="text-[9px] text-app-muted block truncate">{COLUMN_DEFS[col]?.desc ?? ''}</span>
    </div>
  </div>
{/snippet}
