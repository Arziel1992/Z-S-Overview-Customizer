<!--
  @component
  Tab Setup editor (up to 20 client tabs). Each card binds a tab's markup name,
  its list (overview) preset, its 3D bracket preset (or none), and an optional
  [r,g,b] tab-text colour. Cards reorder via DragList; indexes renumber on
  commit through the store so tab order matches the in-game strip.
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser, MAX_TABS } from '$lib/stores/customiserStore.svelte';
  import { cssToFloatTriplet, floatTripletToCss, renderEveMarkup, stripEveMarkup } from '$lib/utils/eveFormat';
  import DragList from './DragList.svelte';
  import MarkupInput from './MarkupInput.svelte';
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('tabs.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('tabs.help')}</p>
  </div>

  <DragList values={customiser.tabs} onchange={(v) => customiser.reorderTabs(v)} row={tabCard} />

  {#if customiser.tabs.length < MAX_TABS}
    <button onclick={() => customiser.addTab()} class="w-full bg-app-accent hover:bg-app-accentHover text-white text-xs font-semibold py-2 rounded transition-colors">+ {t('tabs.add')}</button>
  {:else}
    <p class="text-center text-[11px] text-amber-500">{t('tabs.max')}</p>
  {/if}
</div>

{#snippet tabCard(tab)}
  <div class="bg-app-panel2 border border-app-border rounded p-3 space-y-2">
    <div class="flex items-center gap-2">
      <span class="text-[10px] text-app-muted w-6 shrink-0">#{tab.index}</span>
      <span class="font-mono text-xs flex-1 truncate" title={stripEveMarkup(tab.name)}>{@html renderEveMarkup(tab.name)}</span>
      {#if customiser.tabs.length > 1}
        <button onclick={() => customiser.removeTab(tab.index)} class="text-red-400 hover:text-red-300 px-1" aria-label={t('tabs.remove')}>✕</button>
      {/if}
    </div>

    <!-- The colour swatch edits the tab's native tabSetup colour field
         (an [r,g,b] triplet — how Z-S and the game colour tabs), not name
         markup, so loaded profiles show their real colour here. -->
    <MarkupInput
      label={t('tabs.name')}
      value={tab.name}
      oncommit={(v) => tab.name = v}
      colorCss={Array.isArray(tab.color) ? floatTripletToCss(tab.color) : null}
      oncolor={(css) => tab.color = css ? cssToFloatTriplet(css) : null}
    />

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

  </div>
{/snippet}
