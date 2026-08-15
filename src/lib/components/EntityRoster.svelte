<!--
  @component
  Editor for the live-preview entity roster. The list shows each entity's
  name/type plus dots for its first relationship states; add opens a modal
  with a draft (committed on confirm), edit opens the same modal bound
  directly to the store entity so changes preview live as you type. The
  modal's Type field searches the full SDE matrix (every space-relevant
  category), so any real type can be added; picking a match wires up its
  typeId/groupId for the preset group filters. A "Rapid populate" section
  loads, saves, renames, overwrites and deletes named entity groupings
  (built-in samples included) via the store's rosterSets.
-->
<script>
import { STATES } from "$lib/data/stateMatrix";
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";
import Modal from "./Modal.svelte";

// onhide — collapses this panel to a bar in the workspace shell.
let { onhide } = $props();

const STATE_OPTIONS = [9, 10, 11, 12, 13, 14, 18, 19, 44, 45, 50, 51, 52];

let editing = $state(null); // entity ref (edit) or draft (add)
let isNew = $state(false);
let typeQuery = $state(""); // live SDE search text; '' = dropdown closed
let newSetName = $state("");

// Up to 25 SDE types whose name contains the query (across all categories).
const typeMatches = $derived.by(() => {
	const m = customiser.sdeMatrix;
	const q = typeQuery.toLowerCase().trim();
	if (!m || q.length < 2) return [];
	const out = [];
	for (const [tid, tp] of Object.entries(m.types)) {
		if (tp.name.toLowerCase().includes(q)) {
			const g = m.groups[tp.groupId];
			out.push({
				tid: Number(tid),
				name: tp.name,
				groupId: tp.groupId,
				groupName: g?.name ?? String(tp.groupId),
			});
			if (out.length >= 25) break;
		}
	}
	return out;
});

const groupName = $derived(
	customiser.sdeMatrix?.groups[editing?.groupId]?.name ??
		`#${editing?.groupId}`,
);

function pickType(match) {
	editing.type = match.name;
	editing.typeId = match.tid;
	editing.groupId = match.groupId;
	typeQuery = "";
}

function openAdd() {
	isNew = true;
	typeQuery = "";
	editing = {
		pilotName: "New Pilot",
		shipName: "",
		type: "Rifter",
		typeId: 587,
		groupId: 25,
		corp: "—",
		alliance: "—",
		faction: "—",
		militia: "—",
		size: "S",
		states: [],
		distance: 10000,
		velocity: 0,
		radial: 0,
		transversal: 0,
		angular: 0,
	};
}
function openEdit(entity) {
	isNew = false;
	typeQuery = "";
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

function saveNewSet() {
	if (customiser.saveRosterSet(newSetName)) newSetName = "";
}
function renameSet(set) {
	const name = prompt(t("preview.renameSet"), set.name);
	if (name != null) customiser.renameRosterSet(set.name, name);
}
</script>

<div class="flex flex-col h-full min-h-0">
  <div class="flex items-center justify-between mb-2 shrink-0">
    <h3 class="text-xs font-semibold uppercase tracking-wider text-app-muted">{t('preview.roster')}</h3>
    <div class="flex items-center gap-2">
      <button onclick={openAdd} class="text-[11px] font-semibold bg-app-accent hover:bg-app-accentHover text-white px-2.5 py-1 rounded transition-colors">+ {t('preview.addEntity')}</button>
      <button
        onclick={onhide}
        aria-label={t('app.hidePanel')}
        title={t('app.hidePanel')}
        class="text-app-muted hover:text-app-text transition-colors p-0.5"
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
        </svg>
      </button>
    </div>
  </div>

  <details class="shrink-0 mb-2 text-xs">
    <summary class="cursor-pointer select-none text-[11px] text-app-muted hover:text-app-text">⚡ {t('preview.rapidPopulate')}</summary>
    <div class="mt-1.5 space-y-1">
      {#each customiser.rosterSets as set (set.name)}
        <div class="flex items-center gap-1 bg-app-panel2 border border-app-border rounded px-2 py-1">
          <button onclick={() => customiser.loadRosterSet(set.name)} title={t('preview.loadSet')} class="flex-1 min-w-0 text-left truncate text-app-text hover:text-app-accent transition-colors">
            {set.name} <span class="text-app-muted">({set.entities.length})</span>
          </button>
          <button onclick={() => renameSet(set)} title={t('preview.renameSet')} aria-label={t('preview.renameSet')} class="text-app-muted hover:text-app-text px-1">✎</button>
          <button onclick={() => customiser.saveRosterSet(set.name)} title={t('preview.overwriteSet')} aria-label={t('preview.overwriteSet')} class="text-app-muted hover:text-app-text px-1">⟳</button>
          <button onclick={() => customiser.deleteRosterSet(set.name)} title={t('preview.deleteSet')} aria-label={t('preview.deleteSet')} class="text-red-400 hover:text-red-300 px-1">✕</button>
        </div>
      {/each}
      <div class="flex gap-1">
        <input
          bind:value={newSetName}
          placeholder={t('preview.setName')}
          aria-label={t('preview.setName')}
          class="flex-1 min-w-0 bg-app-bg border border-app-border rounded px-2 py-1 text-[11px] focus:outline-none focus:border-app-accent"
        />
        <button onclick={saveNewSet} class="text-[11px] border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors shrink-0">💾 {t('preview.saveSet')}</button>
      </div>
    </div>
  </details>

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
        <label class="flex flex-col gap-1 relative">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.type')}</span>
          <input
            type="text"
            bind:value={editing.type}
            oninput={() => typeQuery = editing.type}
            placeholder={t('preview.typeSearch')}
            class="bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent"
          />
          {#if typeMatches.length}
            <div class="absolute top-full left-0 right-0 z-10 mt-0.5 max-h-44 overflow-y-auto bg-app-panel2 border border-app-border rounded shadow-xl">
              {#each typeMatches as match (match.tid)}
                <button
                  onclick={() => pickType(match)}
                  class="w-full text-left px-2 py-1 text-xs hover:bg-app-accent/15 transition-colors"
                >{match.name} <span class="text-[9px] text-app-muted">· {match.groupName}</span></button>
              {/each}
            </div>
          {/if}
        </label>
        <div class="flex flex-col gap-1">
          <span class="text-[9px] uppercase text-app-muted">{t('preview.group')}</span>
          <span class="px-2 py-1 text-xs text-app-muted border border-app-border/60 rounded bg-app-bg/50 truncate" title="Group {editing.groupId}">{groupName} ({editing.groupId})</span>
        </div>
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
