<script>
  import { dragHandle, dragHandleZone, SHADOW_ITEM_MARKER_PROPERTY_NAME } from 'svelte-dnd-action';
  import { flip } from 'svelte/animate';
  import { t } from '$lib/i18n/strings';

  // Generic reorderable list. `values` is the store's own primitive/object
  // array; `onchange` receives the reordered values to commit.
  //
  // Interaction model:
  //  - DragList renders its own grab handle per row via the library's
  //    dragHandle/dragHandleZone pair (reliable capture + built-in keyboard
  //    support) — rows passed in via `row` need no handle of their own.
  //  - While dragging, a dashed "ghost" placeholder marks the drop slot and
  //    the other rows reflow live (animate:flip).
  //  - Up/down arrow buttons are rendered per row as a touch-friendly
  //    fallback to drag-and-drop.
  let {
    values,
    onchange,
    row,
    flipMs = 150,
    listClass = 'space-y-1.5',
  } = $props();

  let items = $state([]);
  let dragging = false;
  let uid = 0;

  function sameSequence(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // Resync from the source when it changes externally (load/import/add/remove
  // or an arrow move) — but never mid-drag, when `items` intentionally
  // diverges from `values` (resyncing here stomped active drags, which is why
  // grabs randomly "didn't take").
  $effect(() => {
    const next = values;
    const cur = items.map((it) => it.v);
    if (dragging) return;
    if (!sameSequence(cur, next)) {
      items = next.map((v) => ({ id: ++uid, v }));
    }
  });

  function consider(e) {
    dragging = true;
    items = e.detail.items;
  }

  function finalize(e) {
    items = e.detail.items;
    dragging = false;
    onchange(items.map((it) => it.v));
  }

  function move(i, dir) {
    const arr = items.map((it) => it.v);
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    onchange(arr);
  }
</script>

<div
  use:dragHandleZone={{ items, flipDurationMs: flipMs, dropTargetStyle: {} }}
  onconsider={consider}
  onfinalize={finalize}
  class={listClass}
>
  {#each items as item, i (item.id)}
    <div animate:flip={{ duration: flipMs }} class="flex items-stretch gap-1">
      {#if item[SHADOW_ITEM_MARKER_PROPERTY_NAME]}
        <!-- Drop-slot ghost: the library hides the original; visibility:visible
             re-shows our styled placeholder in its place. -->
        <div class="flex-1 min-w-0 rounded border-2 border-dashed border-app-accent/70 bg-app-accent/10" style="visibility: visible;">
          <div class="opacity-30 pointer-events-none" aria-hidden="true">{@render row(item.v, i)}</div>
        </div>
      {:else}
        <div
          use:dragHandle
          aria-label={t('common.dragHandle')}
          class="flex items-center px-1 rounded text-app-muted hover:text-app-text hover:bg-app-panel2 cursor-grab active:cursor-grabbing touch-none select-none shrink-0"
        >⠿</div>
        <div class="flex-1 min-w-0">{@render row(item.v, i)}</div>
        <div class="flex flex-col justify-center shrink-0">
          <button
            type="button"
            onclick={() => move(i, -1)}
            disabled={i === 0}
            class="text-app-muted hover:text-app-text disabled:opacity-25 px-1 py-0.5 text-[10px] leading-none"
            aria-label={t('common.moveUp')}
          >▲</button>
          <button
            type="button"
            onclick={() => move(i, 1)}
            disabled={i === items.length - 1}
            class="text-app-muted hover:text-app-text disabled:opacity-25 px-1 py-0.5 text-[10px] leading-none"
            aria-label={t('common.moveDown')}
          >▼</button>
        </div>
      {/if}
    </div>
  {/each}
</div>
