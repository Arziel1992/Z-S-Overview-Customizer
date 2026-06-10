<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { cssToFloatTriplet, floatTripletToCss } from '$lib/utils/eveFormat';
  import { t } from '$lib/i18n/strings';

  function cfgFor(key) {
    if (key == null) return null;
    return customiser.shipLabels[key] ?? null;
  }
  function labelTitle(key) {
    if (key == null) return '(spacer)';
    if (key === 'linebreak') return 'Line break';
    return key;
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('ships.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('ships.help')}</p>
  </div>

  <div class="space-y-1.5">
    {#each customiser.shipLabelOrder as key, i (i)}
      {@const cfg = cfgFor(key)}
      <div class="bg-app-panel2 border border-app-border rounded p-2.5">
        <div class="flex items-center gap-2">
          <span class="text-xs font-semibold text-app-text capitalize flex-1 truncate">{labelTitle(key)}</span>
          <div class="flex items-center gap-0.5">
            <button onclick={() => customiser.reorder(customiser.shipLabelOrder, i, -1)} disabled={i === 0} class="text-app-muted hover:text-app-text disabled:opacity-30 px-1" aria-label="Move up">▲</button>
            <button onclick={() => customiser.reorder(customiser.shipLabelOrder, i, 1)} disabled={i === customiser.shipLabelOrder.length - 1} class="text-app-muted hover:text-app-text disabled:opacity-30 px-1" aria-label="Move down">▼</button>
          </div>
        </div>

        {#if cfg && key !== 'linebreak'}
          <div class="grid grid-cols-2 gap-2 mt-2">
            <label class="flex flex-col gap-1">
              <span class="text-[9px] uppercase text-app-muted">{t('ships.prefix')}</span>
              <input type="text" bind:value={cfg.pre} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-app-accent" />
            </label>
            <label class="flex flex-col gap-1">
              <span class="text-[9px] uppercase text-app-muted">{t('ships.suffix')}</span>
              <input type="text" bind:value={cfg.post} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-app-accent" />
            </label>
          </div>
          <div class="flex items-center gap-2 mt-2 flex-wrap">
            <button onclick={() => cfg.bold = !cfg.bold} class="px-2 py-1 rounded text-[11px] font-bold border transition-colors {cfg.bold ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted'}">B</button>
            <button onclick={() => cfg.italic = !cfg.italic} class="px-2 py-1 rounded text-[11px] italic border transition-colors {cfg.italic ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted'}">I</button>
            <button onclick={() => cfg.underline = !cfg.underline} class="px-2 py-1 rounded text-[11px] underline border transition-colors {cfg.underline ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted'}">U</button>
            <label class="flex items-center gap-1">
              <span class="text-[9px] uppercase text-app-muted">{t('ships.size')}</span>
              <input type="number" min="6" max="24" value={cfg.fontsize ?? ''} oninput={(e) => cfg.fontsize = e.currentTarget.value ? Number(e.currentTarget.value) : null} class="w-12 bg-app-bg border border-app-border rounded px-1.5 py-1 text-xs focus:outline-none focus:border-app-accent" />
            </label>
            <label class="flex items-center gap-1">
              <span class="text-[9px] uppercase text-app-muted">{t('ships.color')}</span>
              <input
                type="color"
                value={Array.isArray(cfg.color) ? floatTripletToCss(cfg.color) : '#ffffff'}
                oninput={(e) => cfg.color = cssToFloatTriplet(e.currentTarget.value)}
                class="w-6 h-5 rounded bg-transparent border border-app-border cursor-pointer"
                aria-label={t('ships.color')}
              />
              {#if Array.isArray(cfg.color)}
                <button onclick={() => cfg.color = null} class="text-[9px] text-app-muted hover:text-app-text underline">clear</button>
              {/if}
            </label>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
