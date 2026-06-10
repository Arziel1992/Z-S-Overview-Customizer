<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { t } from '$lib/i18n/strings';

  const stats = $derived([
    ['Presets', customiser.presets.length],
    ['Tabs', customiser.tabs.length],
    ['Colortag states', customiser.flagStates.length],
    ['Background states', customiser.backgroundStates.length],
    ['Columns active', customiser.overviewColumns.length],
    ['Label segments', customiser.shipLabelOrder.length],
  ]);
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('misc.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('misc.help')}</p>
  </div>

  <div class="grid grid-cols-2 gap-2">
    {#each stats as [label, value]}
      <div class="bg-app-panel2 border border-app-border rounded px-3 py-2">
        <div class="text-lg font-semibold text-app-text">{value}</div>
        <div class="text-[10px] uppercase tracking-wider text-app-muted">{label}</div>
      </div>
    {/each}
  </div>

  <div class="bg-app-panel2 border border-app-border rounded p-3">
    <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5">userSettings (raw)</h4>
    {#if customiser.userSettings.length}
      <pre class="text-[10px] text-app-muted font-mono overflow-x-auto">{JSON.stringify(customiser.userSettings, null, 2)}</pre>
    {:else}
      <p class="text-[11px] text-app-muted">Empty — this profile carries no extra client-side settings.</p>
    {/if}
  </div>
</div>
