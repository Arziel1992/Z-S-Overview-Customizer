<script>
  import AppearanceConfig from '$lib/components/AppearanceConfig.svelte';
  import ColumnConfig from '$lib/components/ColumnConfig.svelte';
  import EntityRoster from '$lib/components/EntityRoster.svelte';
  import HistoryDialog from '$lib/components/HistoryDialog.svelte';
  import ImportDialog from '$lib/components/ImportDialog.svelte';
  import MiscConfig from '$lib/components/MiscConfig.svelte';
  import OverviewWindow from '$lib/components/OverviewWindow.svelte';
  import PresetEditor from '$lib/components/PresetEditor.svelte';
  import ShipLabels from '$lib/components/ShipLabels.svelte';
  import SpaceBrackets from '$lib/components/SpaceBrackets.svelte';
  import TabManager from '$lib/components/TabManager.svelte';
  import YamlExporter from '$lib/components/YamlExporter.svelte';
  import { t } from '$lib/i18n/strings';
  import { customiser } from '$lib/stores/customiserStore.svelte';

  const REPO = 'https://github.com/Arziel1992/Z-S-Overview-Customizer/';

  let section = $state('tabs');
  let showImport = $state(false);
  let showHistory = $state(false);

  const NAV = [
    ['tabs', t('tabsNav.tabs')],
    ['presets', t('tabsNav.presets')],
    ['columns', t('tabsNav.columns')],
    ['appearance', t('tabsNav.appearance')],
    ['ships', t('tabsNav.ships')],
    ['misc', t('tabsNav.misc')],
    ['yaml', t('tabsNav.yaml')],
  ];
  const FULL_HEIGHT = new Set(['appearance', 'yaml']);

  const SCALES = [['0.85', 'S'], ['1', 'M'], ['1.15', 'L'], ['1.3', 'XL']];
</script>

<main class="lg:h-screen lg:overflow-hidden min-h-screen flex flex-col bg-app-bg text-app-text">
  <!-- Header -->
  <header class="shrink-0 bg-app-panel border-b border-app-border px-3 sm:px-4 py-2 flex items-center justify-between gap-3 flex-wrap">
    <div class="flex items-center gap-3 min-w-0">
      <div class="w-8 h-8 rounded bg-app-accent flex items-center justify-center font-bold text-white text-lg shrink-0">Z</div>
      <div class="min-w-0">
        <h1 class="text-sm font-bold leading-none truncate">{t('app.title')}</h1>
        <span class="text-[10px] text-app-muted uppercase tracking-wider hidden sm:block">{t('app.subtitle')}</span>
      </div>
    </div>

    <div class="flex items-center gap-2 text-xs">
      <div class="flex items-center gap-1">
        <span class="text-[10px] uppercase text-app-muted hidden md:inline mr-1">{t('app.base')}</span>
        <button onclick={() => customiser.loadPreset('ccp_default')} class="border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors {customiser.baseProfile === 'ccp_default' ? 'text-app-text border-app-accent' : 'text-app-muted'}">{t('app.loadCcp')}</button>
        <button onclick={() => customiser.loadPreset('zs_core')} class="border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors {customiser.baseProfile === 'zs_core' ? 'text-app-text border-app-accent' : 'text-app-muted'}">{t('app.loadZs')}</button>
        <button onclick={() => showHistory = true} class="border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors text-app-muted hover:text-app-text">+ {t('app.custom')}</button>
      </div>

      <label class="hidden sm:flex items-center gap-1">
        <span class="text-[10px] uppercase text-app-muted">{t('app.uiScale')}</span>
        <select bind:value={customiser.uiScale} class="bg-app-bg border border-app-border rounded px-1.5 py-1 focus:outline-none focus:border-app-accent">
          {#each SCALES as [val, label]}
            <option value={Number(val)}>{label}</option>
          {/each}
        </select>
      </label>

      <button onclick={() => customiser.toggleTheme()} class="border border-app-border hover:border-app-accent rounded px-2 py-1 flex items-center gap-1.5 transition-colors" aria-label={t('app.toggleTheme')} title={t('app.toggleTheme')}>
        <span>{customiser.theme === 'dark' ? '🌙' : '☀️'}</span>
        <span class="hidden lg:inline">{customiser.theme === 'dark' ? t('app.themeDark') : t('app.themeLight')}</span>
      </button>

      <a href={REPO} target="_blank" rel="noopener noreferrer" class="border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors text-app-muted hover:text-app-text" aria-label={t('app.github')} title={t('app.github')}>
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="currentColor" aria-hidden="true"><path d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5z"/></svg>
      </a>
    </div>
  </header>

  <!-- Workspace (zoom = UI scale) -->
  <div class="flex-1 min-h-0 lg:overflow-hidden" style="zoom: {customiser.uiScale};">
    <div class="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
      <!-- Settings panel -->
      <section class="lg:col-span-7 flex flex-col bg-app-panel border border-app-border rounded-lg overflow-hidden min-h-0 lg:h-full">
        <div class="bg-app-panel2 px-4 py-2 border-b border-app-border flex items-center justify-between shrink-0">
          <span class="text-xs font-bold uppercase tracking-wider text-app-text">{t('settings.windowTitle')}</span>
          <span class="text-[10px] text-app-muted font-mono bg-app-bg px-2 py-0.5 rounded border border-app-border">{t('settings.engine')}</span>
        </div>

        <nav class="flex bg-app-panel2 border-b border-app-border overflow-x-auto text-[10px] uppercase font-bold tracking-wider shrink-0">
          {#each NAV as [key, label]}
            <button onclick={() => section = key} class="px-3 py-2.5 transition-colors shrink-0 {section === key ? 'border-b-2 border-app-accent text-app-accent' : 'text-app-muted hover:text-app-text'}">{label}</button>
          {/each}
        </nav>

        <div class="flex-1 min-h-0 {FULL_HEIGHT.has(section) ? 'p-4 flex flex-col' : 'overflow-y-auto p-4'}">
          {#if section === 'tabs'}<TabManager />
          {:else if section === 'presets'}<PresetEditor />
          {:else if section === 'columns'}<ColumnConfig />
          {:else if section === 'appearance'}<AppearanceConfig />
          {:else if section === 'ships'}<ShipLabels />
          {:else if section === 'misc'}<MiscConfig />
          {:else if section === 'yaml'}<YamlExporter />{/if}
        </div>
      </section>

      <!-- Live preview -->
      <aside class="lg:col-span-5 flex flex-col gap-3 min-h-0 lg:h-full">
        <div class="shrink-0 h-[220px] lg:h-[32%] lg:min-h-[150px]"><SpaceBrackets /></div>
        <div class="h-[320px] lg:h-auto lg:flex-1 min-h-0"><OverviewWindow /></div>
        <div class="shrink-0 h-[200px] lg:h-[28%] lg:min-h-[140px] bg-app-panel border border-app-border rounded-lg p-3 flex flex-col min-h-0"><EntityRoster /></div>
      </aside>
    </div>
  </div>
</main>

{#if showImport}
  <ImportDialog onclose={() => showImport = false} />
{/if}
{#if showHistory}
  <HistoryDialog onclose={() => showHistory = false} onimport={() => { showHistory = false; showImport = true; }} />
{/if}
