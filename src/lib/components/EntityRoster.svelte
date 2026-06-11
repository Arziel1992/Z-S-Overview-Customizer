<!--
  @component
  Editor for the live-preview entity roster. The list shows each entity's
  name/type plus dots for its first relationship states; add opens a modal
  with a draft (committed on confirm), edit opens the same modal bound
  directly to the store entity so changes preview live as you type.
-->
<script>
  import { STATES } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import Modal from './Modal.svelte';

  const GROUP_OPTIONS = [
    [25, 'Frigate'], [26, 'Cruiser'], [27, 'Battleship'], [28, 'Hauler'],
    [419, 'Combat Battlecruiser'], [540, 'Command Ship'], [547, 'Carrier'],
    [30, 'Titan'], [90, 'Capsule (Pod)'], [10, 'Stargate'], [15, 'Station'],
    [6, 'Sun'], [1657, 'Citadel'], [365, 'Control Tower'],
  ];
  const STATE_OPTIONS = [9, 10, 11, 12, 13, 14, 18, 19, 44, 45, 50, 51, 52];

  let editing = $state(null); // entity ref (edit) or draft (add)
  let isNew = $state(false);

  function openAdd() {
    isNew = true;
    editing = {
      pilotName: 'New Pilot', shipName: '', type: 'Rifter', typeId: 587, groupId: 25,
      corp: '—', alliance: '—', faction: '—', militia: '—', size: 'S',
      states: [], distance: 10000, velocity: 0, radial: 0, transversal: 0, angular: 0,
    };
  }
  function openEdit(entity) {
    isNew = false;
    editing = entity;
  }
  function close() {
    editing = null;
  }
  function confirmAdd() {
    customiser.addEntity(editing);
    close();
  }
  function toggleState(id) {
    const i = editing.states.indexOf(id);
    if (i > -1) editing.states.splice(i, 1);
    else editing.states.push(id);
  }
</script>

<div class="flex flex-col h-full min-h-0">
  <div class="flex items-center justify-between mb-2 shrink-0">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-app-muted">{t('preview.roster')}</h3>
    <button onclick={openAdd} class="text-[11px] font-semibold bg-app-accent hover:bg-app-accentHover text-white px-2.5 py-1 rounded transition-colors">+ {t('preview.addEntity')}</button>
  </div>

  <div class="flex-1 overflow-y-auto space-y-1 pr-1">
    {#each customiser.roster as entity (entity.id)}
      <div class="flex items-center gap-2 bg-app-panel2 border border-app-border rounded px-2.5 py-1.5 text-xs">
        <span class="flex-1 min-w-0 truncate text-app-text">{entity.pilotName} <span class="text-app-muted">· {entity.type}</span></span>
        <div class="flex gap-1">
          {#each entity.states.slice(0, 3) as s}
            <span class="w-2 h-2 rounded-full" style="background:{customiser.stateColor('flag', s)}" title={STATES[s]?.name}></span>
          {/each}
        </div>
        <button onclick={() => openEdit(entity)} class="text-app-muted hover:text-app-text px-1" aria-label={t('preview.edit')}>✎</button>
        <button onclick={() => customiser.removeEntity(entity.id)} class="text-red-400 hover:text-red-300 px-1" aria-label={t('preview.remove')}>✕</button>
      </div>
    {/each}
  </div>
</div>

{#if editing}
  <Modal title={isNew ? t('preview.addEntity') : editing.pilotName} onclose={close} maxWidth="max-w-md">
    <div class="space-y-3 text-sm">
      <div class="grid grid-cols-2 gap-2">
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.pilot')}</span>
          <input type="text" bind:value={editing.pilotName} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.type')}</span>
          <input type="text" bind:value={editing.type} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.group')}</span>
          <select bind:value={editing.groupId} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent">
            {#each GROUP_OPTIONS as [gid, label]}
              <option value={gid}>{label} ({gid})</option>
            {/each}
          </select>
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.distance')}</span>
          <input type="number" bind:value={editing.distance} min="0" class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.corporation')}</span>
          <input type="text" bind:value={editing.corp} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.alliance')}</span>
          <input type="text" bind:value={editing.alliance} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
        </label>
      </div>

      <div>
        <span class="text-[9px] uppercase text-app-muted">{t('preview.states')}</span>
        <div class="flex flex-wrap gap-1 mt-1">
          {#each STATE_OPTIONS as id}
            {@const on = editing.states.includes(id)}
            <button onclick={() => toggleState(id)} class="px-1.5 py-0.5 rounded text-[10px] border transition-colors text-left {on ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted hover:text-app-text'}"><span class="font-mono opacity-70">{id}</span> {STATES[id]?.name ?? id}</button>
          {/each}
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-1">
        <button onclick={close} class="text-xs border border-app-border hover:border-app-accent px-3 py-1.5 rounded transition-colors">{isNew ? t('importer.cancel') : t('common.done')}</button>
        {#if isNew}
          <button onclick={confirmAdd} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-4 py-1.5 rounded transition-colors">+ {t('preview.addEntity')}</button>
        {/if}
      </div>
    </div>
  </Modal>
{/if}
