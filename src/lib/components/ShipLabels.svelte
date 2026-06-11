<script>
  import { t } from '$lib/i18n/strings';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { cssToFloatTriplet, floatTripletToCss } from '$lib/utils/eveFormat';
  import DragList from './DragList.svelte';

  const FIELD_TYPES = ['ship type', 'ship name', 'pilot name', 'alliance', 'corporation', 'faction', 'militia'];

  const availableFields = $derived(FIELD_TYPES.filter((f) => !customiser.shipLabelOrder.includes(f)));

  function configKey(value) {
    return value == null ? '__null__' : value;
  }
  function title(value) {
    if (value == null) return t('ships.addSpacer');
    if (value === 'linebreak') return t('ships.addBreak');
    return value;
  }
  function addField(e) {
    const v = e.currentTarget.value;
    if (v) customiser.addShipLabel(v);
    e.currentTarget.value = '';
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('ships.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('ships.help')}</p>
  </div>

  <!-- Add controls -->
  <div class="flex flex-wrap items-center gap-2 bg-app-panel2 border border-app-border rounded p-2">
    <span class="text-[10px] uppercase text-app-muted">{t('ships.add')}</span>
    <select onchange={addField} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent" aria-label={t('ships.addField')}>
      <option value="">{t('ships.addField')}…</option>
      {#each availableFields as f}
        <option value={f}>{f}</option>
      {/each}
    </select>
    <button onclick={() => customiser.addShipLabel('linebreak')} class="text-xs border border-app-border hover:border-app-accent rounded px-2 py-1 transition-colors">+ {t('ships.addBreak')}</button>
    <button onclick={() => customiser.addShipLabel('spacer')} class="text-xs border border-app-border hover:border-app-accent rounded px-2 py-1 transition-colors">+ {t('ships.addSpacer')}</button>
  </div>

  <DragList values={customiser.shipLabelOrder} onchange={(v) => customiser.shipLabelOrder = v} row={segment} />
</div>

{#snippet segment(value, index)}
  {@const cfg = customiser.shipLabels[configKey(value)]}
  <div class="bg-app-panel2 border border-app-border rounded p-2.5">
    <div class="flex items-center gap-2">
      <span class="text-xs font-semibold text-app-text capitalize flex-1 truncate">{title(value)}</span>
      <button onclick={() => customiser.removeShipLabelAt(index)} class="text-red-400 hover:text-red-300 px-1" aria-label={t('ships.remove')}>✕</button>
    </div>

    {#if cfg && value != null && value !== 'linebreak'}
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
{/snippet}
