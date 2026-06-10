<script>
  import { dndzone } from 'svelte-dnd-action';

  // Generic reorderable list (mouse + touch). `values` is a primitive/array of
  // the store's own values; `onchange` receives the reordered values to commit.
  let {
    values,
    onchange,
    row,
    getId = (v, i) => `${String(v)}#${i}`,
    flipMs = 150,
    listClass = 'space-y-1.5',
    handleSelector = undefined,
  } = $props();

  let items = $state([]);
  let sig = '';

  // Resync from the source only when it changes externally (not from our own
  // commit), avoiding a feedback loop during drags.
  $effect(() => {
    const next = values.map((v, i) => ({ id: getId(v, i), v }));
    const nsig = next.map((n) => n.id).join('|');
    if (nsig !== sig) {
      items = next;
      sig = nsig;
    }
  });

  function consider(e) {
    items = e.detail.items;
  }
  function finalize(e) {
    items = e.detail.items;
    sig = items.map((n) => n.id).join('|');
    onchange(items.map((n) => n.v));
  }

  const zoneOpts = $derived({
    items,
    flipDurationMs: flipMs,
    dropTargetStyle: {},
    ...(handleSelector ? { dragHandleSelector: handleSelector } : {}),
  });
</script>

<div use:dndzone={zoneOpts} onconsider={consider} onfinalize={finalize} class={listClass}>
  {#each items as item, i (item.id)}
    <div>{@render row(item.v, i)}</div>
  {/each}
</div>
