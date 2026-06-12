<!--
  @component
  Preset manager + filter-logic editor — the core of the overview system.
  Create, duplicate, rename and delete presets (rename cascades into the tabs
  that reference them; delete remaps those tabs), then edit the selected
  preset's filteredStates (red veto chips), alwaysShownStates (green override
  chips) and authorised SDE groups (via MatrixSelector). Chips show
  "id · name" so the numeric ids stay visible alongside their meaning.
-->
<script>
  import { ALL_STATE_IDS, STATES } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { stripEveMarkup } from '$lib/utils/eveFormat';
  import MarkupInput from './MarkupInput.svelte';
  import MatrixSelector from './MatrixSelector.svelte';

  const preset = $derived(customiser.activePreset);

  // Rename works on a draft committed via the store (NOT bind:value on
  // preset.name) because tabs reference presets by name — a live binding
  // would desync tab.overview/tab.bracket on every keystroke.
  let nameDraft = $state('');
  let nameError = $state('');
  $effect(() => {
    nameDraft = preset?.name ?? '';
    nameError = '';
  });

  function commitRename() {
    nameError = '';
    if (!preset || nameDraft === preset.name) return;
    if (!customiser.renamePreset(preset.name, nameDraft)) {
      nameError = nameDraft.trim() ? t('presets.nameTaken') : '';
      nameDraft = preset.name; // restore the valid name
    }
  }

  function removeCurrent() {
    if (!customiser.removePreset()) nameError = t('presets.lastPreset');
  }

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

  <!-- Preset selection + lifecycle actions -->
  <div class="flex flex-wrap items-center gap-1.5">
    <label class="flex items-center gap-2 flex-1 min-w-[200px]">
      <span class="text-[10px] uppercase text-app-muted shrink-0">{t('presets.select')}</span>
      <select
        value={customiser.activePresetName}
        onchange={(e) => customiser.activePresetName = e.currentTarget.value}
        class="flex-1 min-w-0 bg-app-bg border border-app-border rounded px-2 py-1 text-xs focus:outline-none focus:border-app-accent"
      >
        {#each customiser.presetNames as name}
          <option value={name}>{stripEveMarkup(name)}</option>
        {/each}
      </select>
    </label>
    <button
      onclick={() => customiser.addPreset()}
      class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-2.5 py-1 rounded transition-colors"
    >+ {t('presets.add')}</button>
    <button
      onclick={() => customiser.duplicatePreset()}
      class="text-xs border border-app-border hover:border-app-accent px-2.5 py-1 rounded transition-colors text-app-muted hover:text-app-text"
    >{t('presets.duplicate')}</button>
    <button
      onclick={removeCurrent}
      disabled={customiser.presets.length <= 1}
      title={customiser.presets.length <= 1 ? t('presets.lastPreset') : t('presets.removeNote')}
      class="text-xs border border-red-500/40 text-red-400 hover:bg-red-500/10 px-2.5 py-1 rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >{t('presets.remove')}</button>
  </div>

  {#if preset}
    <!-- Rename (commits on change/Enter so tab references stay in sync) -->
    <div class="bg-app-panel2 border border-app-border rounded p-2.5 space-y-1.5">
      <MarkupInput
        label={t('presets.name')}
        value={nameDraft}
        oncommit={(v) => nameDraft = v}
        onfinish={commitRename}
      />
      <p class="text-[10px] text-app-muted">{t('presets.nameHelp')}</p>
      {#if nameError}
        <p class="text-[11px] text-red-400" role="alert">{nameError}</p>
      {/if}
    </div>
  {/if}

  {#if preset}
    <!-- State filters -->
    <div class="grid grid-cols-1 gap-3">
      <div class="bg-app-panel2 border border-app-border rounded p-2.5">
        <h4 class="text-[10px] uppercase tracking-wider text-red-400 mb-1.5">{t('presets.filtered')}</h4>
        <div class="flex flex-wrap gap-1">
          {#each ALL_STATE_IDS as id}
            {@const on = preset.filteredStates.includes(id)}
            <button onclick={() => toggle(preset.filteredStates, id)}
              class="px-1.5 py-0.5 rounded text-[10px] border transition-colors text-left {on ? 'bg-red-500/80 border-red-500 text-white' : 'border-app-border text-app-muted hover:text-app-text'}"><span class="font-mono opacity-70">{id}</span> {STATES[id]?.name ?? `State ${id}`}</button>
          {/each}
        </div>
      </div>

      <div class="bg-app-panel2 border border-app-border rounded p-2.5">
        <h4 class="text-[10px] uppercase tracking-wider text-emerald-400 mb-1.5">{t('presets.alwaysShown')}</h4>
        <div class="flex flex-wrap gap-1">
          {#each ALL_STATE_IDS as id}
            {@const on = preset.alwaysShownStates.includes(id)}
            <button onclick={() => toggle(preset.alwaysShownStates, id)}
              class="px-1.5 py-0.5 rounded text-[10px] border transition-colors text-left {on ? 'bg-emerald-500/80 border-emerald-500 text-white' : 'border-app-border text-app-muted hover:text-app-text'}"><span class="font-mono opacity-70">{id}</span> {STATES[id]?.name ?? `State ${id}`}</button>
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
