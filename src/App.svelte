<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import MatrixSelector from '$lib/components/MatrixSelector.svelte';
  import FlagPriorities from '$lib/components/FlagPriorities.svelte';
  import ColumnConfig from '$lib/components/ColumnConfig.svelte';
  import ClientHUD from '$lib/components/ClientHUD.svelte';
  import YamlExporter from '$lib/components/YamlExporter.svelte';
  import TabManager from '$lib/components/TabManager.svelte';
</script>

<main class="min-h-screen flex flex-col">
  <!-- Top Navigation Header bar -->
  <header class="bg-eve-panel border-b border-eve-border px-6 py-4 flex items-center justify-between">
    <div class="flex items-center gap-3">
      <div class="w-8 h-8 rounded bg-eve-accent flex items-center justify-center font-bold text-white text-lg tracking-widest shadow-lg shadow-eve-accent/30">Z</div>
      <div>
        <h1 class="text-md font-bold text-white leading-none">Z-S Overview Customiser</h1>
        <span class="text-[10px] text-eve-textMuted tracking-widest uppercase">EVE Online UI System Modder v2.0</span>
      </div>
    </div>

    <!-- Active SDE Version Metadata badge -->
    <div class="flex items-center gap-4 text-xs">
      <div class="text-right">
        <span class="text-[10px] text-eve-textMuted block uppercase">SDE Build Status</span>
        <span class="text-emerald-400 font-semibold font-mono">ONLINE // AUTO-PATCHING</span>
      </div>
    </div>
  </header>

  <!-- Interactive Sandbox Grid workspace -->
  <div class="flex-1 p-6 space-y-6 max-w-[1600px] mx-auto w-full">
    <!-- Live HUD Preview Section -->
    <section>
      <div class="mb-3">
        <h2 class="text-sm font-bold uppercase tracking-wider text-gray-300">Live Grid System Preview</h2>
      </div>
      <ClientHUD />
    </section>

    <!-- Configuration Settings Workspace -->
    <section class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-2">
        <MatrixSelector />
      </div>

      <div class="lg:col-span-2 flex flex-col gap-6">
        <div class="flex-1 min-h-[250px]">
          <FlagPriorities />
        </div>
        <div class="flex-1 min-h-[250px]">
          <ColumnConfig />
        </div>
      </div>
    </section>

    <!-- Exporter Section -->
    <section class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <div class="lg:col-span-1">
        <YamlExporter />
      </div>
      <div class="lg:col-span-3 bg-eve-panel border border-eve-border p-4 rounded text-xs space-y-3">
        <h3 class="text-sm font-bold text-gray-200">How to load your profile inside the EVE Client:</h3>
        <ol class="list-decimal pl-5 space-y-1.5 text-eve-textMuted">
          <li>Compile and download your customized <code class="text-gray-300 font-mono">Z-S_Custom_Overview.yaml</code> file.</li>
          <li>Locate or create your EVE settings folder. On Windows, this is typically under <code class="text-gray-300 font-mono">C:\Users\&lt;Username&gt;\AppData\Local\CCP\EVE\c_games_eve_sharedcache_tq_tranquility\settings_Default\</code>.</li>
          <li>Create a subdirectory named <code class="text-gray-300 font-mono">Overview</code> if it does not already exist, and drop your downloaded file inside.</li>
          <li>Open your EVE Client, navigate to the <span class="text-white">Overview Settings</span> window, select the <span class="text-white">Import/Export</span> tab, click <span class="text-white">Import Overview Settings</span>, select your profile, and apply it.</li>
        </ol>
      </div>
    </section>
  </div>
</main>