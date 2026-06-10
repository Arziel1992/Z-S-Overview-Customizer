<script>
  import { t } from '$lib/i18n/strings';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { cssToFloatTriplet, floatTripletToCss, renderEveMarkup, stripEveMarkup } from '$lib/utils/eveFormat';

  function setTabColor(tab, css) {
    tab.color = cssToFloatTriplet(css);
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('tabs.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('tabs.help')}</p>
  </div>

  <div class="space-y-2">
    {#each customiser.tabs as tab (tab.index)}
      <div class="bg-app-panel2 border border-app-border rounded p-3 space-y-2">
        <div class="flex items-center gap-2">
          <span class="text-[10px] text-app-muted w-6 shrink-0">#{tab.index}</span>
          <span class="font-mono text-xs flex-1 truncate" title={stripEveMarkup(tab.name)}>{@html renderEveMarkup(tab.name)}</span>
          {#if customiser.tabs.length > 1}
            <button onclick={() => customiser.removeTab(tab.index)} class="text-red-400 hover:text-red-300 px-1" aria-label={t('tabs.remove')}>✕</button>
          {/if}
        </div>

        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('tabs.name')}</span>
          <input type="text" bind:value={tab.name} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-app-accent" />
        </label>

        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1">
            <span class="text-[9px] uppercase text-app-muted">{t('tabs.listPreset')}</span>
            <select bind:value={tab.overview} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent">
              {#each customiser.presetNames as name}
                <option value={name}>{stripEveMarkup(name)}</option>
              {/each}
            </select>
          </label>
          <label class="flex flex-col gap-1">
            <span class="text-[9px] uppercase text-app-muted">{t('tabs.bracketPreset')}</span>
            <select bind:value={tab.bracket} class="bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent">
              <option value={null}>{t('tabs.bracketNone')}</option>
              {#each customiser.presetNames as name}
                <option value={name}>{stripEveMarkup(name)}</option>
              {/each}
            </select>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-[9px] uppercase text-app-muted">{t('tabs.tabColor')}</span>
          <input
            type="color"
            value={Array.isArray(tab.color) ? floatTripletToCss(tab.color) : '#ffffff'}
            oninput={(e) => setTabColor(tab, e.currentTarget.value)}
            class="w-7 h-6 rounded bg-transparent border border-app-border cursor-pointer"
            aria-label={t('tabs.tabColor')}
          />
          {#if Array.isArray(tab.color)}
            <button onclick={() => tab.color = null} class="text-[10px] text-app-muted hover:text-app-text underline">clear</button>
          {/if}
        </div>
      </div>
    {/each}
  </div>

  {#if customiser.tabs.length < 8}
    <button onclick={() => customiser.addTab()} class="w-full bg-app-accent hover:bg-app-accentHover text-white text-xs font-semibold py-2 rounded transition-colors">+ {t('tabs.add')}</button>
  {:else}
    <p class="text-center text-[11px] text-amber-500">{t('tabs.max')}</p>
  {/if}
</div>
