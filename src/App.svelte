<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { t } from '$lib/i18n/strings';
  import TabManager from '$lib/components/TabManager.svelte';
  import PresetEditor from '$lib/components/PresetEditor.svelte';
  import ColumnConfig from '$lib/components/ColumnConfig.svelte';
  import AppearanceConfig from '$lib/components/AppearanceConfig.svelte';
  import ShipLabels from '$lib/components/ShipLabels.svelte';
  import MiscConfig from '$lib/components/MiscConfig.svelte';
  import YamlExporter from '$lib/components/YamlExporter.svelte';
  import OverviewWindow from '$lib/components/OverviewWindow.svelte';
  import SpaceBrackets from '$lib/components/SpaceBrackets.svelte';
  import EntityRoster from '$lib/components/EntityRoster.svelte';

  let section = $state('tabs');

  const NAV = [
    ['tabs', t('tabsNav.tabs')],
    ['presets', t('tabsNav.presets')],
    ['columns', t('tabsNav.columns')],
    ['appearance', t('tabsNav.appearance')],
    ['ships', t('tabsNav.ships')],
    ['misc', t('tabsNav.misc')],
    ['yaml', t('tabsNav.yaml')],
  ];

  // Sections that manage their own internal scroll/height.
  const FULL_HEIGHT = new Set(['appearance', 'yaml']);
</script>

<main
  class="h-screen w-screen flex flex-col overflow-hidden bg-app-bg text-app-text"
  style="font-size: {customiser.uiScale}; font-family: {customiser.fontFamily};"
>
  <!-- Header -->
  <header class="shrink-0 bg-app-panel border-b border-app-border px-4 py-2.5 flex items-center justify-between gap-4">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-8 h-8 rounded bg-app-accent flex items-center justify-center font-bold text-white text-lg shrink-0">Z</div>
      <div class="min-w-0">
        <h1 class="text-sm font-bold leading-none truncate">{t('app.title')}</h1>
        <span class="text-[10px] text-app-muted uppercase tracking-wider">{t('app.subtitle')}</span>
      </div>
    </div>

    <div class="flex items-center gap-3 text-xs shrink-0">
      <div class="hidden md:flex items-center gap-1.5">
        <span class="text-[10px] uppercase text-app-muted">{t('app.base')}</span>
        <button onclick={() => customiser.loadPreset('ccp_default')} class="border border-app-border hover:border-app-accent px-2.5 py-1 rounded transition-colors {customiser.baseProfile === 'ccp_default' ? 'text-app-text border-app-accent' : 'text-app-muted'}">{t('app.loadCcp')}</button>
        <button onclick={() => customiser.loadPreset('zs_core')} class="border border-app-border hover:border-app-accent px-2.5 py-1 rounded transition-colors {customiser.baseProfile === 'zs_core' ? 'text-app-text border-app-accent' : 'text-app-muted'}">{t('app.loadZs')}</button>
      </div>

      <label class="hidden lg:flex items-center gap-1.5">
        <span class="text-[10px] uppercase text-app-muted">{t('app.uiScale')}</span>
        <select bind:value={customiser.uiScale} class="bg-app-bg border border-app-border rounded px-1.5 py-1 focus:outline-none focus:border-app-accent">
          <option value="11px">S</option>
          <option value="12px">M</option>
          <option value="13px">L</option>
        </select>
      </label>

      <button
        onclick={() => customiser.toggleTheme()}
        class="border border-app-border hover:border-app-accent rounded px-2.5 py-1 flex items-center gap-1.5 transition-colors"
        aria-label={t('app.toggleTheme')}
        title={t('app.toggleTheme')}
      >
        <span>{customiser.theme === 'dark' ? '🌙' : '☀️'}</span>
        <span class="hidden sm:inline">{customiser.theme === 'dark' ? t('app.themeDark') : t('app.themeLight')}</span>
      </button>
    </div>
  </header>

  <!-- Workspace -->
  <div class="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
    <!-- Settings panel (EVE Overview Settings window) -->
    <section class="lg:col-span-7 xl:col-span-7 flex flex-col bg-eve-panel border border-eve-border rounded overflow-hidden min-h-0">
      <div class="bg-eve-panel2 px-4 py-2 border-b border-eve-border flex items-center justify-between shrink-0">
        <span class="text-xs font-bold uppercase tracking-wider text-eve-text">{t('settings.windowTitle')}</span>
        <span class="text-[10px] text-eve-muted font-mono bg-black/30 px-2 py-0.5 rounded border border-eve-border">{t('settings.engine')}</span>
      </div>

      <!-- Section nav -->
      <nav class="flex bg-eve-header border-b border-eve-border overflow-x-auto text-[10px] uppercase font-bold tracking-wider shrink-0">
        {#each NAV as [key, label]}
          <button
            onclick={() => section = key}
            class="px-3 py-2.5 transition-colors shrink-0 {section === key ? 'border-b-2 border-eve-accent text-eve-accent' : 'text-eve-muted hover:text-eve-text'}"
          >{label}</button>
        {/each}
      </nav>

      <!-- Section body -->
      <div class="flex-1 min-h-0 {FULL_HEIGHT.has(section) ? 'p-4 flex flex-col' : 'overflow-y-auto p-4'}">
        {#if section === 'tabs'}
          <TabManager />
        {:else if section === 'presets'}
          <PresetEditor />
        {:else if section === 'columns'}
          <ColumnConfig />
        {:else if section === 'appearance'}
          <AppearanceConfig />
        {:else if section === 'ships'}
          <ShipLabels />
        {:else if section === 'misc'}
          <MiscConfig />
        {:else if section === 'yaml'}
          <YamlExporter />
        {/if}
      </div>
    </section>

    <!-- Live preview -->
    <aside class="lg:col-span-5 xl:col-span-5 flex flex-col gap-3 min-h-0">
      <div class="shrink-0 h-[34%] min-h-[160px]">
        <SpaceBrackets />
      </div>
      <div class="flex-1 min-h-0">
        <OverviewWindow />
      </div>
      <div class="shrink-0 h-[30%] min-h-[150px] bg-app-panel border border-app-border rounded p-3 flex flex-col min-h-0">
        <EntityRoster />
      </div>
    </aside>
  </div>
</main>
