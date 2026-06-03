<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';

  const colDefinitions = {
    icon: { name: "Icon", desc: "Object ship or entity profile glyph." },
    distance: { name: "Distance", desc: "True range from your pilot hull." },
    name: { name: "Name", desc: "Pilot or unique entity moniker." },
    type: { name: "Type", desc: "Specific class structure hull (e.g. Slasher)." },
    velocity: { name: "Velocity", desc: "Absolute tracking speed through grid coordinates." },
    radialVelocity: { name: "Radial Velocity", desc: "Speed directly closing or opening relative range." },
    transversalVelocity: { name: "Transversal Velocity", desc: "Speed intersecting perpendicular angle." }
  };

  function toggleColumn(colKey) {
    const list = customiser.globalSettings.overviewColumns;
    const index = list.indexOf(colKey);
    if (index > -1) {
      list.splice(index, 1);
    } else {
      list.push(colKey);
    }
  }

  function reorderColumn(index, direction) {
    const list = customiser.globalSettings.columnOrder;
    const target = index + direction;
    if (target < 0 || target >= list.length) return;
    
    const temp = list[index];
    list[index] = list[target];
    list[target] = temp;
  }
</script>

<div class="bg-eve-panel border border-eve-border rounded p-4 h-full flex flex-col">
  <div class="mb-4">
    <h3 class="text-sm font-semibold uppercase text-eve-textMuted tracking-wider">Columns Config & Placement</h3>
    <p class="text-xs text-eve-textMuted mt-1">Configure layout sequence order inside the primary overview spreadsheet window.</p>
  </div>

  <div class="flex-1 overflow-y-auto space-y-1.5 pr-1">
    {#each customiser.globalSettings.columnOrder as colKey, i}
      {@const active = customiser.globalSettings.overviewColumns.includes(colKey)}
      {@const def = colDefinitions[colKey]}
      
      <div class="bg-eve-bg border border-eve-border p-3 rounded flex items-center justify-between text-xs hover:border-gray-700 transition">
        <div class="flex items-center gap-3">
          <input 
            type="checkbox" 
            checked={active}
            onchange={() => toggleColumn(colKey)}
            class="rounded bg-black border-eve-border text-eve-accent focus:ring-0"
          />
          <div>
            <span class="font-medium text-gray-200 block">{def?.name || colKey}</span>
            <span class="text-[10px] text-eve-textMuted">{def?.desc || ''}</span>
          </div>
        </div>

        <div class="flex items-center gap-1">
          <button 
            disabled={i === 0}
            onclick={() => reorderColumn(i, -1)}
            class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1 py-0.5"
          >
            ▲
          </button>
          <button 
            disabled={i === customiser.globalSettings.columnOrder.length - 1}
            onclick={() => reorderColumn(i, 1)}
            class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1 py-0.5"
          >
            ▼
          </button>
        </div>
      </div>
    {/each}
  </div>
</div>