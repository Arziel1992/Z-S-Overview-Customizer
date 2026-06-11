<!--
  @component
  First-run chooser shown when no saved session exists. Offers the four
  starting points (Z-S Core / Fenris Default / import / blank); every path
  dismisses the welcome flag so it never reappears once a session is saved.
  `onimport` lets App.svelte chain straight into the ImportDialog.
-->
<script>
  import { t } from "$lib/i18n/strings.svelte.js";
  import { customiser } from "$lib/stores/customiserStore.svelte";
  import Modal from "./Modal.svelte";

  let { onclose, onimport } = $props();

  function choose(action) {
    if (action === "zs") customiser.loadPreset("zs_core");
    else if (action === "fenris") customiser.loadPreset("fenris_default");
    else if (action === "blank") customiser.clearAll();
    customiser.dismissWelcome();
    if (action === "import") {
      onimport?.();
    } else {
      onclose?.();
    }
  }

  // Key-based so captions resolve through t() at render time and follow the
  // active locale.
  const OPTIONS = [
    ["zs", "🛰️", "welcome.zs", "welcome.zsDesc"],
    ["fenris", "🪐", "welcome.fenris", "welcome.fenrisDesc"],
    ["import", "⬆️", "welcome.import", "welcome.importDesc"],
    ["blank", "📄", "welcome.blank", "welcome.blankDesc"],
  ];
</script>

<Modal
  title={t("welcome.title")}
  onclose={() => {
    customiser.dismissWelcome();
    onclose?.();
  }}
  maxWidth="max-w-lg"
>
  <p class="text-xs text-app-muted mb-4">{t("welcome.intro")}</p>
  <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
    {#each OPTIONS as [action, icon, labelKey, descKey]}
      <button
        onclick={() => choose(action)}
        class="text-left bg-app-panel2 border border-app-border hover:border-app-accent rounded-lg p-3 transition-colors"
      >
        <div class="text-xl mb-1">{icon}</div>
        <div class="text-sm font-semibold text-app-text">{t(labelKey)}</div>
        <div class="text-[11px] text-app-muted">{t(descKey)}</div>
      </button>
    {/each}
  </div>
</Modal>
