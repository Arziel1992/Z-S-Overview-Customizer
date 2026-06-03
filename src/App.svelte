<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import MatrixSelector from '$lib/components/MatrixSelector.svelte';
  import FlagPriorities from '$lib/components/FlagPriorities.svelte';
  import ColumnConfig from '$lib/components/ColumnConfig.svelte';
  import ClientHUD from '$lib/components/ClientHUD.svelte';
  import YamlExporter from '$lib/components/YamlExporter.svelte';
  import TabManager from '$lib/components/TabManager.svelte';

  // Svelte 5 local layout states
  let currentTab = $state("tabs");
  let activeFilterTab = $state("types");
  let activeAppearanceTab = $state("colortags");

  // Fallback structures to keep bindings safe if the loaded YAML is missing parameters
  if (!customiser.globalSettings.uiScale) {
    customiser.globalSettings.uiScale = "11px";
  }
  if (!customiser.globalSettings.fontFamily) {
    customiser.globalSettings.fontFamily = "'Inter', sans-serif";
  }
  if (!customiser.globalSettings.exceptions) {
    customiser.globalSettings.exceptions = {
      isFleetMember: 0,
      isCorpMember: 0,
      isAllianceMember: 0,
      isWarTarget: 0,
      hasBadStanding: 0,
      hasNeutralStanding: 0
    };
  }
</script>

<main 
  class="h-screen w-screen bg-[#06080b] text-slate-200 overflow-hidden flex flex-col select-none"
  style="font-size: {customiser.globalSettings.uiScale}; font-family: {customiser.globalSettings.fontFamily};"
>
  <!-- Top Navigation Header -->
  <header class="bg-[#0a0d13] border-b border-[#202a3a] px-6 py-3.5 flex items-center justify-between shrink-0">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded bg-[#1e468a] flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-lg shadow-blue-900/30">Z</div>
      <div>
        <h1 class="text-xs font-bold text-white leading-none tracking-wide">Z-S Overview Customiser</h1>
        <span class="text-[9px] text-[#8b9bb4] tracking-widest uppercase">EVE Online UI System Modder</span>
      </div>
    </div>

    <!-- Active Font and Scale Config Selectors -->
    <div class="flex items-center gap-4 text-xs font-semibold">
      <div class="flex items-center gap-2">
        <span class="text-[#8b9bb4] uppercase text-[9px] tracking-wider">UI Scale</span>
        <select 
          bind:value={customiser.globalSettings.uiScale}
          class="bg-[#0a0d13] border border-[#202a3a] rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#00d2ff]"
        >
          <option value="10px">Compact (10px)</option>
          <option value="11px">Normal (11px)</option>
          <option value="12px">Comfortable (12px)</option>
          <option value="13px">Large (13px)</option>
        </select>
      </div>

      <div class="flex items-center gap-2">
        <span class="text-[#8b9bb4] uppercase text-[9px] tracking-wider">Font Family</span>
        <select 
          bind:value={customiser.globalSettings.fontFamily}
          class="bg-[#0a0d13] border border-[#202a3a] rounded px-2.5 py-1 text-slate-200 text-xs focus:outline-none focus:border-[#00d2ff]"
        >
          <option value="'Inter', sans-serif">Inter Sans</option>
          <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
          <option value="system-ui, sans-serif">System UI</option>
        </select>
      </div>
    </div>
  </header>

  <!-- Non-Scrollable Primary Grid Workspace -->
  <div class="flex-1 p-5 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0">
    
    <!-- LEFT COLUMN: The elegant Photon UI Settings Window Frame -->
    <div class="lg:col-span-7 xl:col-span-8 flex flex-col bg-[#0a0d13] border border-[#202a3a] rounded shadow-2xl backdrop-blur-md overflow-hidden min-h-0">
      
      <!-- Photon Window Header -->
      <div class="bg-[#111621] p-3 px-4 border-b border-[#202a3a] flex items-center justify-between select-none shrink-0">
        <div class="flex items-center gap-2.5">
          <!-- Inline SVG representing Sliders icon -->
          <svg class="w-4 h-4 text-[#00d2ff]" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
          <span class="text-xs font-bold uppercase tracking-wider text-slate-200">Overview Settings</span>
        </div>
        
        <div class="flex items-center gap-4 text-[10px] text-[#8b9bb4]">
          <span class="font-mono bg-black/40 px-2 py-0.5 rounded border border-[#202a3a]">Z-S Client Engine</span>
        </div>
      </div>

      <!-- Settings Window Tab Navigation (Matching Game 1:1) -->
      <div class="flex bg-[#0d101a] border-b border-[#202a3a] select-none shrink-0 overflow-x-auto text-[10px] uppercase font-bold tracking-wider">
        <button onclick={() => currentTab = "tabs"} class="flex-1 py-2.5 text-center transition {currentTab === 'tabs' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">Tabs</button>
        <button onclick={() => currentTab = "filters"} class="flex-1 py-2.5 text-center transition {currentTab === 'filters' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">Filters</button>
        <button onclick={() => currentTab = "appearance"} class="flex-1 py-2.5 text-center transition {currentTab === 'appearance' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">Appearance</button>
        <button onclick={() => currentTab = "ships"} class="flex-1 py-2.5 text-center transition {currentTab === 'ships' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">Ships</button>
        <button onclick={() => currentTab = "misc"} class="flex-1 py-2.5 text-center transition {currentTab === 'misc' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">Misc</button>
        <button onclick={() => currentTab = "yaml"} class="flex-1 py-2.5 text-center transition {currentTab === 'yaml' ? 'border-b-2 border-[#00d2ff] text-[#00d2ff] bg-[#1b222f]/40' : 'text-[#8b9bb4] hover:text-white'}">YAML</button>
      </div>

      <!-- Settings Panel Body - Internally Scrollable to keep the view fixed -->
      <div class="flex-1 overflow-y-auto p-5 space-y-4 min-h-0 bg-[#0d101a]/30">
        
        <!-- 1. TABS CONFIGURATION -->
        {#if currentTab === "tabs"}
          <div class="grid grid-cols-1 xl:grid-cols-2 gap-5 h-full">
            <TabManager />
            <ColumnConfig />
          </div>
        {/if}

        <!-- 2. FILTERS CONFIGURATION (Types Shown & Exceptions) -->
        {#if currentTab === "filters"}
          <div class="space-y-4">
            <div class="flex gap-4 border-b border-[#202a3a] pb-1 text-xs font-bold uppercase tracking-wider">
              <button onclick={() => activeFilterTab = "types"} class="pb-1 transition {activeFilterTab === 'types' ? 'text-[#00d2ff] border-b border-[#00d2ff]' : 'text-[#8b9bb4]' }">Types Shown</button>
              <button onclick={() => activeFilterTab = "exceptions"} class="pb-1 transition {activeFilterTab === 'exceptions' ? 'text-[#00d2ff] border-b border-[#00d2ff]' : 'text-[#8b9bb4]' }">Exceptions</button>
            </div>

            {#if activeFilterTab === "types"}
              <div class="h-[400px] overflow-hidden flex flex-col">
                <MatrixSelector />
              </div>
            {:else}
              <!-- Tri-State Exceptions Interface matching {1EB1997E-A93A-4191-8057-F504CA64ADB4}.jpg -->
              <div class="space-y-2 bg-black/20 p-4 rounded border border-[#202a3a]">
                <div class="flex justify-between items-center text-[10px] font-bold text-[#8b9bb4] tracking-wider uppercase border-b border-[#202a3a] pb-1.5">
                  <span>Exception Type Constraint</span>
                  <div class="flex gap-6 pr-3">
                    <span class="text-emerald-400">Show</span>
                    <span class="text-red-400">Hide</span>
                    <span>Default</span>
                  </div>
                </div>

                <div class="space-y-1.5 max-h-[320px] overflow-y-auto pr-1">
                  {#each Object.entries(customiser.globalSettings.exceptions) as [exKey, state]}
                    <div class="flex items-center justify-between text-xs py-2 border-b border-[#202a3a]/40">
                      <span class="text-slate-300 capitalize">{exKey.replace(/([A-Z])/g, ' $1')}</span>
                      <div class="flex gap-7 pr-4">
                        <input type="radio" name={`ex-${exKey}`} checked={state === 1} onclick={() => customiser.globalSettings.exceptions[exKey] = 1} class="text-emerald-500 focus:ring-0 cursor-pointer" />
                        <input type="radio" name={`ex-${exKey}`} checked={state === -1} onclick={() => customiser.globalSettings.exceptions[exKey] = -1} class="text-red-500 focus:ring-0 cursor-pointer" />
                        <input type="radio" name={`ex-${exKey}`} checked={state === 0} onclick={() => customiser.globalSettings.exceptions[exKey] = 0} class="text-slate-500 focus:ring-0 cursor-pointer" />
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- 3. APPEARANCE STATE CONFIG -->
        {#if currentTab === "appearance"}
          <div class="space-y-4 h-full flex flex-col min-h-0">
            <div class="flex gap-4 border-b border-[#202a3a] pb-1 text-xs font-bold uppercase tracking-wider shrink-0">
              <button onclick={() => activeAppearanceTab = "colortags"} class="pb-1 transition {activeAppearanceTab === 'colortags' ? 'text-[#00d2ff] border-b border-[#00d2ff]' : 'text-[#8b9bb4]' }">Colortag Priorities</button>
              <button onclick={() => activeAppearanceTab = "backgrounds"} class="pb-1 transition {activeAppearanceTab === 'backgrounds' ? 'text-[#00d2ff] border-b border-[#00d2ff]' : 'text-[#8b9bb4]' }">Background Priorities</button>
            </div>

            <div class="flex-1 overflow-hidden min-h-0">
              <FlagPriorities />
            </div>
          </div>
        {/if}

        <!-- 4. SHIPS TYPOGRAPHY EDITOR -->
        {#if currentTab === "ships"}
          <div class="space-y-4">
            <div class="space-y-1">
              <span class="text-xs font-bold text-slate-200">Typography Setup (shipLabelOrder)</span>
              <p class="text-[10px] text-[#8b9bb4]">Alter spacing prefixes, styles, and order variables for floating visual brackets in 3D space grids.</p>
            </div>
            
            <div class="space-y-2 bg-black/20 p-4 rounded border border-[#202a3a]">
              {#each customiser.globalSettings.shipLabelOrder as labelKey}
                {@const conf = customiser.globalSettings.shipLabels[labelKey]}
                {#if conf}
                  <div class="flex items-center justify-between text-xs p-2.5 bg-[#111621]/60 rounded border border-[#202a3a]/60">
                    <div class="flex items-center gap-2">
                      <input type="checkbox" bind:checked={conf.active} class="rounded bg-black border-[#202a3a] text-[#00d2ff] focus:ring-0" />
                      <span class="font-bold text-slate-200 capitalize">{labelKey}</span>
                    </div>

                    <div class="flex items-center gap-3">
                      <input type="text" bind:value={conf.prefix} placeholder="Pre" class="w-10 bg-black border border-[#202a3a] rounded p-1 text-center font-mono text-[10px]" />
                      <input type="text" bind:value={conf.suffix} placeholder="Post" class="w-10 bg-black border border-[#202a3a] rounded p-1 text-center font-mono text-[10px]" />
                      <button onclick={() => conf.bold = !conf.bold} class="p-1 px-2.5 rounded font-bold transition {conf.bold ? 'bg-[#00d2ff] text-black' : 'bg-slate-900 text-slate-400'}">B</button>
                      <button onclick={() => conf.italic = !conf.italic} class="p-1 px-2.5 rounded italic transition {conf.italic ? 'bg-[#00d2ff] text-black' : 'bg-slate-900 text-slate-400'}">I</button>
                    </div>
                  </div>
                {/if}
              {/each}
            </div>
          </div>
        {/if}

        <!-- 5. MISCELLANEOUS SETTINGS -->
        {#if currentTab === "misc"}
          <div class="space-y-4 text-xs text-slate-200">
            <div class="space-y-3 bg-black/20 p-4 rounded border border-[#202a3a]">
              <h4 class="text-xs font-bold text-[#00d2ff] border-b border-[#202a3a] pb-1 uppercase tracking-wider">Broadcasting and Behavior</h4>
              
              <label class="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" bind:checked={customiser.globalSettings.alwaysShowBroadcasts} class="rounded bg-black border-[#202a3a] text-[#00d2ff] focus:ring-0" />
                <span>Always show broadcasted targets at top of layout</span>
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" bind:checked={customiser.globalSettings.applyToAllTabs} class="rounded bg-black border-[#202a3a] text-[#00d2ff] focus:ring-0" />
                <span>Apply priority profiles and backgrounds across all client tabs</span>
              </label>

              <label class="flex items-center gap-2.5 cursor-pointer py-1">
                <input type="checkbox" bind:checked={customiser.globalSettings.showBracketsInSpace} class="rounded bg-black border-[#202a3a] text-[#00d2ff] focus:ring-0" />
                <span>Display 3D tactical ship brackets in space viewports</span>
              </label>
            </div>
          </div>
        {/if}

        <!-- 6. RAW COMPILED YAML -->
        {#if currentTab === "yaml"}
          <div class="h-full flex flex-col min-h-0">
            <YamlExporter />
          </div>
        {/if}

      </div>

      <!-- Photon Window Footer Action Bar -->
      <div class="bg-[#111621] p-3 border-t border-[#202a3a] flex items-center justify-between select-none shrink-0">
        <div class="text-[10px] text-[#8b9bb4] font-semibold">
          Z-S Svelte 5 Customiser
        </div>
        <div class="flex gap-2">
          <button 
            onclick={() => customiser.loadPreset('ccp_default')}
            class="bg-[#1b222f] border border-[#202a3a] hover:border-slate-500 text-slate-200 text-xs py-1 px-4 rounded transition"
          >
            CCP Default
          </button>
          <button 
            onclick={() => customiser.loadPreset('zs_core')}
            class="bg-[#245eb2] hover:bg-[#3c7be6] text-white text-xs font-bold py-1 px-4 rounded transition shadow shadow-blue-500/10"
          >
            Load Z-S Profile
          </button>
        </div>
      </div>

    </div>

    <!-- RIGHT COLUMN: Pinned EVE Client HUD & rows simulator (Non-scrollable, fits page height) -->
    <div class="lg:col-span-5 xl:col-span-4 flex flex-col gap-5 min-h-0 overflow-hidden">
      <ClientHUD />
    </div>

  </div>
</main>