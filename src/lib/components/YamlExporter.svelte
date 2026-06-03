<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { buildCompliantYaml } from '$lib/utils/yamlSerializer';

  let compiledCode = '';

  function triggerCompilation() {
    compiledCode = buildCompliantYaml(customiser.globalSettings, customiser.tabs);
  }

  function handleDownload() {
    triggerCompilation();
    const blob = new Blob([compiledCode], { type: 'text/yaml;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Z-S_Custom_Overview.yaml");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<div class="bg-eve-panel border border-eve-border rounded p-4 h-full flex flex-col justify-between">
  <div>
    <h3 class="text-sm font-semibold uppercase text-eve-textMuted tracking-wider mb-2">Export Overview Profile</h3>
    <p class="text-xs text-eve-textMuted">Compiles the active configuration profile to an EVE Online client-compliant XML/YAML file structure.</p>
  </div>

  <div class="my-4 space-y-2">
    <!-- Quick-load actions -->
    <div class="flex flex-col gap-2">
      <!-- FIXED: Changed to execute store YAML fetch trigger pipeline -->
      <button 
        onclick={() => customiser.loadPreset('ccp_default')}
        class="w-full bg-eve-bg border border-eve-border hover:border-gray-600 px-3 py-2 rounded text-xs font-semibold text-gray-300 transition"
      >
        Load Standard CCP Defaults
      </button>
      <button 
        onclick={() => customiser.loadPreset('zs_core')}
        class="w-full bg-eve-accent/20 border border-eve-accent/50 hover:border-eve-accent hover:bg-eve-accent/30 px-3 py-2 rounded text-xs font-semibold text-eve-accentHover transition"
      >
        Load Full Z-S Core Base
      </button>
    </div>
  </div>

  <button 
    onclick={handleDownload}
    class="w-full bg-eve-accent hover:bg-eve-accentHover text-white py-2.5 rounded font-bold text-xs uppercase tracking-wider transition shadow-lg shadow-eve-accent/20"
  >
    Compile and Export Profile (.yaml)
  </button>
</div>