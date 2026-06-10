<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { STATES } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings';

  // Curated groups that are meaningful to preview (id -> label).
  const GROUP_OPTIONS = [
    [25, 'Frigate'], [26, 'Cruiser'], [27, 'Battleship'], [28, 'Hauler'],
    [419, 'Combat Battlecruiser'], [540, 'Command Ship'], [547, 'Carrier'],
    [30, 'Titan'], [90, 'Capsule (Pod)'], [10, 'Stargate'], [15, 'Station'],
    [6, 'Sun'], [1657, 'Citadel'], [365, 'Control Tower'],
  ];

  // The relationship states most useful for previewing colortags/backgrounds.
  const STATE_OPTIONS = [9, 10, 11, 12, 13, 14, 18, 19, 44, 45, 50, 51, 52];

  let expanded = $state(null);

  function toggleState(entity, id) {
    const i = entity.states.indexOf(id);
    if (i > -1) entity.states.splice(i, 1);
    else entity.states.push(id);
  }
</script>

<div class="flex flex-col h-full">
  <div class="flex items-center justify-between mb-2 shrink-0">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-app-muted">{t('preview.roster')}</h3>
    <button
      onclick={() => customiser.addEntity()}
      class="text-[11px] font-semibold bg-app-accent hover:bg-app-accentHover text-white px-2.5 py-1 rounded transition-colors"
    >+ {t('preview.addEntity')}</button>
  </div>
  <p class="text-[10px] text-app-muted mb-2 shrink-0">{t('preview.rosterHelp')}</p>

  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1">
    {#each customiser.roster as entity (entity.id)}
      <div class="bg-app-panel2 border border-app-border rounded text-xs">
        <div class="flex items-center gap-2 p-2">
          <input
            type="text"
            bind:value={entity.pilotName}
            aria-label="Pilot name"
            class="flex-1 min-w-0 bg-app-bg border border-app-border rounded px-2 py-1 text-app-text focus:outline-none focus:border-app-accent"
          />
          <button
            onclick={() => expanded = expanded === entity.id ? null : entity.id}
            class="text-app-muted hover:text-app-text px-1"
            aria-expanded={expanded === entity.id}
            aria-label="Edit entity"
          >{expanded === entity.id ? '▴' : '▾'}</button>
          <button
            onclick={() => customiser.removeEntity(entity.id)}
            class="text-red-400 hover:text-red-300 px-1"
            aria-label={t('preview.remove')}
          >✕</button>
        </div>

        {#if expanded === entity.id}
          <div class="px-2 pb-2 space-y-2 border-t border-app-border/60 pt-2">
            <div class="grid grid-cols-2 gap-2">
              <label class="flex flex-col gap-1">
                <span class="text-[9px] uppercase text-app-muted">Type</span>
                <input type="text" bind:value={entity.type} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[9px] uppercase text-app-muted">Group</span>
                <select bind:value={entity.groupId} class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent">
                  {#each GROUP_OPTIONS as [gid, label]}
                    <option value={gid}>{label} ({gid})</option>
                  {/each}
                </select>
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[9px] uppercase text-app-muted">{t('preview.distance')}</span>
                <input type="number" bind:value={entity.distance} min="0" class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
              </label>
              <label class="flex flex-col gap-1">
                <span class="text-[9px] uppercase text-app-muted">Corp / Alliance</span>
                <div class="flex gap-1">
                  <input type="text" bind:value={entity.corp} aria-label="Corporation" class="w-1/2 bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
                  <input type="text" bind:value={entity.alliance} aria-label="Alliance" class="w-1/2 bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent" />
                </div>
              </label>
            </div>

            <div>
              <span class="text-[9px] uppercase text-app-muted">{t('preview.states')}</span>
              <div class="flex flex-wrap gap-1 mt-1">
                {#each STATE_OPTIONS as id}
                  {@const on = entity.states.includes(id)}
                  <button
                    onclick={() => toggleState(entity, id)}
                    class="px-1.5 py-0.5 rounded text-[10px] border transition-colors {on ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted hover:text-app-text'}"
                    title={`${id}: ${STATES[id]?.name}`}
                  >{STATES[id]?.name ?? id}</button>
                {/each}
              </div>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
</div>
