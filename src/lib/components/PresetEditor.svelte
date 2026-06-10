<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { ALL_STATE_IDS, STATES } from '$lib/data/stateMatrix';
  import { stripEveMarkup } from '$lib/utils/eveFormat';
  import { t } from '$lib/i18n/strings';
  import MatrixSelector from './MatrixSelector.svelte';

  const preset = $derived(customiser.activePreset);

  function toggle(list, id) {
    const i = list.indexOf(id);
    if (i > -1) list.splice(i, 1);
    else list.push(id);
  }
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('presets.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('presets.help')}</p>
  </div>

  <label class="flex items-center gap-2">
    <span class="text-[10px] uppercase text-app-muted shrink-0">{t('presets.select')}</span>
    <select
      value={customiser.activePresetName}
      onchange={(e) => customiser.activePresetName = e.currentTarget.value}
      class="flex-1 bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent"
    >
      {#each customiser.presetNames as name}
        <option value={name}>{stripEveMarkup(name)}</option>
      {/each}
    </select>
  </label>

  {#if preset}
    <!-- State filters -->
    <div class="grid grid-cols-1 gap-3">
      <div class="bg-app-panel2 border border-app-border rounded p-2.5">
        <h4 class="text-[10px] uppercase tracking-wider text-red-400 mb-1.5">{t('presets.filtered')}</h4>
        <div class="flex flex-wrap gap-1">
          {#each ALL_STATE_IDS as id}
            {@const on = preset.filteredStates.includes(id)}
            <button onclick={() => toggle(preset.filteredStates, id)} title={`${id}: ${STATES[id]?.name}`}
              class="px-1.5 py-0.5 rounded text-[10px] border transition-colors {on ? 'bg-red-500/80 border-red-500 text-white' : 'border-app-border text-app-muted hover:text-app-text'}">{id}</button>
          {/each}
        </div>
      </div>

      <div class="bg-app-panel2 border border-app-border rounded p-2.5">
        <h4 class="text-[10px] uppercase tracking-wider text-emerald-400 mb-1.5">{t('presets.alwaysShown')}</h4>
        <div class="flex flex-wrap gap-1">
          {#each ALL_STATE_IDS as id}
            {@const on = preset.alwaysShownStates.includes(id)}
            <button onclick={() => toggle(preset.alwaysShownStates, id)} title={`${id}: ${STATES[id]?.name}`}
              class="px-1.5 py-0.5 rounded text-[10px] border transition-colors {on ? 'bg-emerald-500/80 border-emerald-500 text-white' : 'border-app-border text-app-muted hover:text-app-text'}">{id}</button>
          {/each}
        </div>
      </div>
    </div>

    <!-- Groups -->
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <h4 class="text-[10px] uppercase tracking-wider text-app-muted">{t('presets.groups')}</h4>
        <span class="text-[10px] text-app-muted">{t('presets.groupCount', { n: preset.groups.length })}</span>
      </div>
      <MatrixSelector />
    </div>
  {/if}
</div>
