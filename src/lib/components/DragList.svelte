<script>
  import { dndzone, SOURCES, TRIGGERS } from 'svelte-dnd-action';

  // Generic reorderable list (mouse + touch). `values` is the store's own
  // primitive/object array; `onchange` receives the reordered values to commit.
  // Dragging is gated to elements matching `.drag-handle` (svelte-dnd-action has
  // no native handle option — we toggle `dragDisabled` from a delegated
  // pointerdown so checkboxes / inputs inside a row stay usable).
  let {
    values,
    onchange,
    row,
    flipMs = 150,
    listClass = 'space-y-1.5',
  } = $props();

  let items = $state([]);
  let dragDisabled = $state(true);
  let uid = 0;

  function sameSequence(a, b) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
    return true;
  }

  // Resync only when the source diverges from our items (external load/import/
  // add/remove) — never right after our own commit, so ids stay stable across
  // consecutive drags.
  $effect(() => {
    const cur = items.map((it) => it.v);
    if (!sameSequence(cur, values)) {
      items = values.map((v) => ({ id: ++uid, v }));
    }
  });

  // Enable dragging only when the gesture starts on a `.drag-handle`. Attached
  // as an action (not an inline handler) so it doesn't require an ARIA role on
  // the non-interactive list container.
  function handleGate(node) {
    const onpd = (e) => {
      if (e.target.closest?.('.drag-handle')) dragDisabled = false;
    };
    node.addEventListener('pointerdown', onpd);
    return { destroy: () => node.removeEventListener('pointerdown', onpd) };
  }

  function consider(e) {
    items = e.detail.items;
    const { source, trigger } = e.detail.info;
    if (source === SOURCES.KEYBOARD && trigger === TRIGGERS.DRAG_STOPPED)
      dragDisabled = true;
  }
  function finalize(e) {
    items = e.detail.items;
    onchange(items.map((it) => it.v));
    if (e.detail.info.source === SOURCES.POINTER) dragDisabled = true;
  }
</script>

<div
  use:dndzone={{ items, flipDurationMs: flipMs, dragDisabled, dropTargetStyle: {} }}
  use:handleGate
  onconsider={consider}
  onfinalize={finalize}
  class={listClass}
>
  {#each items as item, i (item.id)}
    <div>{@render row(item.v, i)}</div>
  {/each}
</div>
