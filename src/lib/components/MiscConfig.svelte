<!--
  @component
  Profile dashboard: headline counts for each model section plus a raw dump
  of `userSettings` (opaque client-side settings carried through untouched).
-->
<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { t } from '$lib/i18n/strings.svelte.js';

  // Locale-key based so the captions follow the active language.
  const stats = $derived([
    ['misc.statPresets', customiser.presets.length],
    ['misc.statTabs', customiser.tabs.length],
    ['misc.statFlags', customiser.flagStates.length],
    ['misc.statBackgrounds', customiser.backgroundStates.length],
    ['misc.statColumns', customiser.overviewColumns.length],
    ['misc.statLabels', customiser.shipLabelOrder.length],
  ]);
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('misc.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('misc.help')}</p>
  </div>

  <div class="grid grid-cols-2 gap-2">
    {#each stats as [labelKey, value]}
      <div class="bg-app-panel2 border border-app-border rounded px-3 py-2">
        <div class="text-lg font-semibold text-app-text">{value}</div>
        <div class="text-[10px] uppercase tracking-wider text-app-muted">{t(labelKey)}</div>
      </div>
    {/each}
  </div>

  <div class="bg-app-panel2 border border-app-border rounded p-3">
    <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5">{t('misc.rawHeading')}</h4>
    {#if customiser.userSettings.length}
      <pre class="text-[10px] text-app-muted font-mono overflow-x-auto">{JSON.stringify(customiser.userSettings, null, 2)}</pre>
    {:else}
      <p class="text-[11px] text-app-muted">{t('misc.rawEmpty')}</p>
    {/if}
  </div>
</div>
