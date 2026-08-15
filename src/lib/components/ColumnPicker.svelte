<!--
  @component
  Reusable column chooser: a drag-reorderable list of every telemetry column,
  each with a checkbox for "shown". Used for the profile-wide columns and,
  with the same interaction, for a single tab's column override.

  Props:
    order    — master left-to-right order (columns it omits are appended)
    active   — the columns currently shown
    onorder  — receives the reordered master list
    ontoggle — receives the column whose checkbox was clicked
    disabled — render read-only (a tab that inherits the profile columns)
-->
<script>
import { ALL_COLUMNS, COLUMN_DEFS } from "$lib/data/stateMatrix";
import DragList from "./DragList.svelte";

let { order, active, onorder, ontoggle, disabled = false } = $props();

// Master ordered list = `order`, with any columns missing from it appended, so
// a profile that never mentions a column can still switch it on.
const ordered = $derived.by(() => {
	const seen = new Set(order);
	return [...order, ...ALL_COLUMNS.filter((c) => !seen.has(c))];
});
</script>

{#if disabled}
  <div class="space-y-1.5 opacity-60 pointer-events-none" aria-disabled="true">
    {#each ordered as col (col)}
      {@render column(col)}
    {/each}
  </div>
{:else}
  <DragList values={ordered} onchange={onorder} row={column} />
{/if}

{#snippet column(col)}
  {@const on = active.includes(col)}
  <div class="flex items-center gap-2 bg-app-panel2 border border-app-border rounded px-2 py-1.5">
    <input
      type="checkbox"
      checked={on}
      disabled={disabled}
      onchange={() => ontoggle(col)}
      class="accent-app-accent"
      aria-label={COLUMN_DEFS[col]?.label ?? col}
    />
    <div class="flex-1 min-w-0">
      <span class="text-xs text-app-text">{COLUMN_DEFS[col]?.label ?? col}</span>
      <span class="text-[9px] text-app-muted block truncate">{COLUMN_DEFS[col]?.desc ?? ''}</span>
    </div>
  </div>
{/snippet}
