<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  
  let searchQuery = '';
  let activeCategoryTab = '6'; // Ships default

  // Helper mapping search queries fuzzy-style to parent groups
  function getFilteredGroups(catId, query) {
    if (!customiser.sdeMatrix) return [];
    const cat = customiser.sdeMatrix.categories[catId];
    if (!cat) return [];
    
    // CORRECTED: Replaced Python's .strip() with JavaScript's native .trim()
    const lowerQuery = query.toLowerCase().trim();
    return cat.groups.map(gid => {
      const g = customiser.sdeMatrix.groups[gid];
      if (!g) return null;
      
      // Match Group Name or any individual child Type name
      const matchesGroup = g.name.toLowerCase().includes(lowerQuery);
      const matchingTypes = g.types.filter(tid => {
        const t = customiser.sdeMatrix.types[tid];
        return t && t.name.toLowerCase().includes(lowerQuery);
      });
      
      if (matchesGroup || matchingTypes.length > 0 || !lowerQuery) {
        return {
          id: gid,
          name: g.name,
          matchingTypes: lowerQuery ? matchingTypes.map(t => customiser.sdeMatrix.types[t].name) : []
        };
      }
      return null;
    }).filter(Boolean);
  }
</script>

<div class="bg-eve-panel border border-eve-border rounded p-4 h-full flex flex-col">
  <div class="flex items-center justify-between mb-3">
    <h3 class="text-sm font-semibold uppercase text-eve-textMuted tracking-wider">Group & Category Filter</h3>
    <span class="text-xs bg-eve-border px-2 py-0.5 rounded text-gray-400">Target Config: {customiser.activeTab?.name || 'None'}</span>
  </div>

  <!-- Search Matrix Input -->
  <div class="relative mb-4">
    <input 
      type="text" 
      bind:value={searchQuery}
      placeholder="Search ship name, group (e.g. Rifter, Frigate)..." 
      class="w-full bg-eve-bg border border-eve-border rounded px-3 py-2 text-sm text-gray-200 focus:outline-none focus:border-eve-accent"
    />
  </div>

  <!-- Category Nav Tabs -->
  {#if customiser.sdeMatrix}
    <div class="flex gap-1 border-b border-eve-border mb-3">
      {#each Object.entries(customiser.sdeMatrix.categories) as [cid, cat]}
        <button 
          onclick={() => activeCategoryTab = cid}
          class="px-3 py-1.5 text-xs font-medium border-b-2 transition-all {activeCategoryTab === cid ? 'border-eve-accent text-white' : 'border-transparent text-eve-textMuted hover:text-gray-200'}"
        >
          {cat.name}
        </button>
      {/each}
    </div>

    <!-- Active List -->
    <div class="flex-1 overflow-y-auto space-y-2 pr-1 text-sm">
      {#each getFilteredGroups(activeCategoryTab, searchQuery) as group}
        <div class="bg-eve-bg border border-eve-border p-3 rounded hover:border-gray-700 transition">
          <div class="flex items-center justify-between">
            <div>
              <span class="font-medium text-gray-200">{group.name}</span>
              <span class="text-[10px] text-eve-textMuted block">Group ID: {group.id}</span>
            </div>
            
            <div class="flex items-center gap-3">
              <!-- Overview toggle -->
              <label class="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={customiser.activeTab?.overviewGroups.includes(group.id)}
                  onchange={() => customiser.toggleGroupInActiveTab(group.id, 'overview')}
                  class="rounded bg-black border-eve-border text-eve-accent focus:ring-0 focus:ring-offset-0"
                />
                <span class="text-xs text-eve-textMuted">Overview</span>
              </label>

              <!-- Brackets toggle -->
              <label class="flex items-center gap-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={customiser.activeTab?.bracketGroups.includes(group.id)}
                  onchange={() => customiser.toggleGroupInActiveTab(group.id, 'bracket')}
                  class="rounded bg-black border-eve-border text-eve-accent focus:ring-0 focus:ring-offset-0"
                />
                <span class="text-xs text-eve-textMuted">Brackets</span>
              </label>
            </div>
          </div>

          <!-- Highlight matching children -->
          {#if group.matchingTypes.length > 0}
            <div class="mt-2 pt-2 border-t border-eve-border/50 flex flex-wrap gap-1">
              {#each group.matchingTypes as tName}
                <span class="text-[10px] bg-eve-border/40 text-eve-accent px-1.5 py-0.5 rounded">{tName}</span>
              {/each}
            </div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-8 text-eve-textMuted text-xs">No matching database groups found</div>
      {/each}
    </div>
  {:else}
    <div class="flex-1 flex items-center justify-center text-xs text-eve-textMuted">Loading SDE schemas...</div>
  {/if}
</div>