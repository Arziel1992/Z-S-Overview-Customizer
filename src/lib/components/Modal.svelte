<script>
  let { title = '', onclose, children, maxWidth = 'max-w-lg' } = $props();

  function onkeydown(e) {
    if (e.key === 'Escape') onclose?.();
  }
</script>

<svelte:window onkeydown={onkeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title}>
  <button class="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-label="Close" onclick={() => onclose?.()}></button>
  <div class="relative w-full {maxWidth} max-h-[88vh] flex flex-col bg-app-panel border border-app-border rounded-lg shadow-2xl overflow-hidden">
    <div class="flex items-center justify-between px-4 py-3 border-b border-app-border shrink-0">
      <h2 class="text-sm font-semibold text-app-text">{title}</h2>
      <button onclick={() => onclose?.()} class="text-app-muted hover:text-app-text text-lg leading-none px-1" aria-label="Close">✕</button>
    </div>
    <div class="overflow-y-auto p-4">
      {@render children?.()}
    </div>
  </div>
</div>
