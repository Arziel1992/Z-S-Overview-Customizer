<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
</script>

<div class="bg-eve-panel border border-eve-border rounded p-4 h-full flex flex-col">
  <div class="mb-4">
    <h3 class="text-sm font-semibold uppercase text-eve-textMuted tracking-wider">Standings & Background Priorities</h3>
    <p class="text-xs text-eve-textMuted mt-1">EVE processes states from top to bottom. Items higher in the list override colors below them.</p>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-hidden">
    <!-- Background Order Column -->
    <div class="flex flex-col h-full overflow-hidden">
      <h4 class="text-xs font-semibold text-gray-300 mb-2 border-b border-eve-border pb-1">Row Background Priority</h4>
      <div class="space-y-1 overflow-y-auto flex-1 pr-1">
        {#each customiser.globalSettings.backgroundOrder as stateKey, i}
          {@const state = customiser.globalSettings.backgroundStates[stateKey]}
          <div class="flex items-center justify-between bg-eve-bg border border-eve-border px-3 py-2 rounded text-xs">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                bind:checked={state.active}
                class="rounded bg-black border-eve-border text-eve-accent focus:ring-0"
              />
              <span class="w-3 h-3 rounded" style="background-color: {state.color}"></span>
              <span class="font-medium text-gray-200">{state.name}</span>
            </div>

            <div class="flex items-center gap-1">
              <!-- Blink state toggle -->
              <button 
                onclick={() => state.blink = !state.blink}
                class="px-1.5 py-0.5 rounded text-[10px] border transition {state.blink ? 'border-red-500 text-red-500 bg-red-950/20' : 'border-eve-border text-eve-textMuted'}"
                title="Toggle Blinking Highlight"
              >
                BLINK
              </button>
              
              <!-- Reordering arrows -->
              <button 
                disabled={i === 0}
                onclick={() => customiser.reorderPriority('background', i, -1)}
                class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1"
              >
                ▲
              </button>
              <button 
                disabled={i === customiser.globalSettings.backgroundOrder.length - 1}
                onclick={() => customiser.reorderPriority('background', i, 1)}
                class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1"
              >
                ▼
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>

    <!-- Color Flag Column -->
    <div class="flex flex-col h-full overflow-hidden">
      <h4 class="text-xs font-semibold text-gray-300 mb-2 border-b border-eve-border pb-1">Standing Tag Priority</h4>
      <div class="space-y-1 overflow-y-auto flex-1 pr-1">
        {#each customiser.globalSettings.flagOrder as stateKey, i}
          {@const state = customiser.globalSettings.flagStates[stateKey]}
          <div class="flex items-center justify-between bg-eve-bg border border-eve-border px-3 py-2 rounded text-xs">
            <div class="flex items-center gap-2">
              <input 
                type="checkbox" 
                bind:checked={state.active}
                class="rounded bg-black border-eve-border text-eve-accent focus:ring-0"
              />
              <span class="w-1.5 h-3 rounded-sm" style="background-color: {state.color}"></span>
              <span class="font-medium text-gray-200">{state.name}</span>
            </div>

            <div class="flex items-center gap-1">
              <button 
                disabled={i === 0}
                onclick={() => customiser.reorderPriority('flag', i, -1)}
                class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1"
              >
                ▲
              </button>
              <button 
                disabled={i === customiser.globalSettings.flagOrder.length - 1}
                onclick={() => customiser.reorderPriority('flag', i, 1)}
                class="text-eve-textMuted hover:text-white disabled:opacity-30 px-1"
              >
                ▼
              </button>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
</div>