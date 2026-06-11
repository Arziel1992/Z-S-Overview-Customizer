<!--
  @component
  SDE group browser bound to the active preset's `groups` whitelist.
  Category tabs come from the compiled matrix; the search box matches both
  group names and individual hull/type names (showing the matching hulls as
  chips under their parent group).
-->
<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';

  let searchQuery = $state('');
  let activeCategory = $state('6'); // Ships by default

  const preset = $derived(customiser.activePreset);
  // Stable, keyed category list so the nav doesn't re-render while typing.
  const categories = $derived(customiser.sdeMatrix ? Object.entries(customiser.sdeMatrix.categories) : []);

  const filteredGroups = $derived.by(() => {
    const m = customiser.sdeMatrix;
    if (!m) return [];
    const cat = m.categories[activeCategory];
    if (!cat) return [];
    const q = searchQuery.toLowerCase().trim();
    return cat.groups
      .map((gid) => {
        const g = m.groups[gid];
        if (!g) return null;
        const matchGroup = g.name.toLowerCase().includes(q);
        const matchTypes = q
          ? g.types.filter((tid) => m.types[tid]?.name.toLowerCase().includes(q)).map((tid) => m.types[tid].name)
          : [];
        if (!q || matchGroup || matchTypes.length) {
          return { id: gid, name: g.name, matches: matchTypes.slice(0, 6) };
        }
        return null;
      })
      .filter(Boolean);
  });

  function isOn(gid) {
    return preset?.groups.includes(gid);
  }
</script>

<div class="bg-app-panel2 border border-app-border rounded p-2.5 flex flex-col" style="max-height: 360px;">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder="Search group or hull (e.g. Frigate, Rifter)…"
    aria-label="Search groups"
    class="w-full bg-app-bg border border-app-border rounded px-2.5 py-1.5 text-xs mb-2 focus:outline-none focus:border-app-accent"
  />

  {#if customiser.sdeMatrix}
    <div class="flex gap-1 border-b border-app-border mb-2 overflow-x-auto">
      {#each categories as [cid, cat] (cid)}
        <button
          onclick={() => activeCategory = cid}
          class="px-2.5 py-1 text-[11px] border-b-2 transition-colors shrink-0 {activeCategory === cid ? 'border-app-accent text-app-text' : 'border-transparent text-app-muted hover:text-app-text'}"
        >{cat.name}</button>
      {/each}
    </div>

    <div class="flex-1 overflow-y-auto space-y-1 pr-1">
      {#each filteredGroups as group (group.id)}
        <label class="flex items-start gap-2 bg-app-bg border border-app-border rounded px-2.5 py-1.5 cursor-pointer hover:border-app-accent/60 transition-colors">
          <input
            type="checkbox"
            checked={isOn(group.id)}
            onchange={() => customiser.toggleGroupInPreset(group.id)}
            class="mt-0.5 accent-app-accent"
          />
          <div class="min-w-0">
            <span class="text-xs text-app-text">{group.name}</span>
            <span class="text-[9px] text-app-muted block">Group {group.id}</span>
            {#if group.matches.length}
              <div class="flex flex-wrap gap-1 mt-1">
                {#each group.matches as tn}
                  <span class="text-[9px] bg-app-accent/15 text-app-accent px-1 py-0.5 rounded">{tn}</span>
                {/each}
              </div>
            {/if}
          </div>
        </label>
      {:else}
        <div class="text-center text-[11px] text-app-muted py-6">No matching groups.</div>
      {/each}
    </div>
  {:else}
    <div class="text-center text-[11px] text-app-muted py-6">Loading SDE…</div>
  {/if}
</div>
