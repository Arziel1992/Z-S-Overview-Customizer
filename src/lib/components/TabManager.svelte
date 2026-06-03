<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';

  let newTabName = '';

  function handleCreateTab() {
    if (!newTabName.trim() || customiser.tabs.length >= 8) return;
    
    const newId = Math.max(...customiser.tabs.map(t => t.id), 0) + 1;
    customiser.tabs.push({
      id: newId,
      name: newTabName.trim(),
      overviewGroups: [],
      bracketGroups: []
    });
    
    customiser.activeTabId = newId;
    newTabName = '';
  }

  function handleDeleteTab(tabId) {
    if (customiser.tabs.length <= 1) return; // Must keep at least one tab
    
    const index = customiser.tabs.findIndex(t => t.id === tabId);
    if (index > -1) {
      customiser.tabs.splice(index, 1);
      // Fallback active tab pointer if the deleted one was selected
      if (customiser.activeTabId === tabId) {
        customiser.activeTabId = customiser.tabs[0].id;
      }
    }
  }

  // Parses hex markup colors to render on screen
  function parseHtmlPreview(rawName) {
    let text = rawName;
    const colorRegex = /<color=(0x[0-9a-fA-F]+)>(.*?)<\/color>/g;
    return text.replace(colorRegex, (match, hex, content) => {
      const cleanHex = hex.replace("0x", "");
      const rgbHex = cleanHex.length === 8 ? cleanHex.substring(2) : cleanHex;
      return `<span style="color: #${rgbHex}">${content}</span>`;
    });
  }
</script>

<div class="bg-eve-panel border border-eve-border rounded p-4 h-full flex flex-col justify-between">
  <div>
    <div class="flex items-center justify-between mb-2">
      <h3 class="text-sm font-semibold uppercase text-eve-textMuted tracking-wider">Tab Configurations</h3>
      <span class="text-xs text-eve-textMuted">{customiser.tabs.length}/8 Active</span>
    </div>
    <p class="text-xs text-eve-textMuted mb-4">Manage up to 8 custom in-game tabs. Name your tabs using EVE's color markup tags (e.g. <code class="text-gray-300 font-mono">&lt;color=0xffff3333&gt;★ PVP&lt;/color&gt;</code>).</p>

    <!-- List of active tabs -->
    <div class="space-y-2 max-h-[180px] overflow-y-auto mb-4 pr-1">
      {#each customiser.tabs as tab}
        <div class="flex items-center justify-between bg-eve-bg border border-eve-border p-2.5 rounded text-xs">
          <div class="flex items-center gap-2">
            <button 
              onclick={() => customiser.activeTabId = tab.id}
              class="font-mono text-left truncate max-w-[150px] transition hover:text-white {customiser.activeTabId === tab.id ? 'text-white font-bold' : 'text-eve-textMuted'}"
            >
              {@html parseHtmlPreview(tab.name)}
            </button>
          </div>

          <div class="flex items-center gap-2">
            <span class="text-[10px] text-eve-textMuted">{tab.overviewGroups.length} grps</span>
            {#if customiser.tabs.length > 1}
              <button 
                onclick={() => handleDeleteTab(tab.id)}
                class="text-red-500 hover:text-red-400 font-bold px-1"
                title="Delete Tab"
              >
                ✕
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Add Tab Input -->
  {#if customiser.tabs.length < 8}
    <div class="pt-3 border-t border-eve-border flex gap-2">
      <input 
        type="text" 
        bind:value={newTabName}
        placeholder="New Tab Name (supports tags)" 
        class="flex-1 bg-eve-bg border border-eve-border rounded px-2.5 py-1.5 text-xs text-gray-200 focus:outline-none focus:border-eve-accent"
        onkeydown={(e) => e.key === 'Enter' && handleCreateTab()}
      />
      <button 
        onclick={handleCreateTab}
        class="bg-eve-accent hover:bg-eve-accentHover text-white px-3 py-1.5 rounded text-xs font-bold transition"
      >
        Add
      </button>
    </div>
  {:else}
    <div class="text-center text-[11px] text-yellow-500 bg-yellow-950/20 py-2 rounded border border-yellow-800/30">
      Maximum tab limit reached (8/8)
    </div>
  {/if}
</div>