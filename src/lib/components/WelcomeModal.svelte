<script>
  import { t } from "$lib/i18n/strings";
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

  const OPTIONS = [
    ["zs", "🛰️", t("welcome.zs"), t("welcome.zsDesc")],
    ["fenris", "🪐", t("welcome.fenris"), t("welcome.fenrisDesc")],
    ["import", "⬆️", t("welcome.import"), t("welcome.importDesc")],
    ["blank", "📄", t("welcome.blank"), t("welcome.blankDesc")],
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
    {#each OPTIONS as [action, icon, label, desc]}
      <button
        onclick={() => choose(action)}
        class="text-left bg-app-panel2 border border-app-border hover:border-app-accent rounded-lg p-3 transition-colors"
      >
        <div class="text-xl mb-1">{icon}</div>
        <div class="text-sm font-semibold text-app-text">{label}</div>
        <div class="text-[11px] text-app-muted">{desc}</div>
      </button>
    {/each}
  </div>
</Modal>
