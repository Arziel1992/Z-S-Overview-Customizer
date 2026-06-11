<!--
  @component
  Application shell. Owns the header (branding, version, base-profile
  selector, history/import + clear-all actions, language / scale / theme
  controls, GitHub link), the two-pane workspace (settings panel with section
  nav | live preview column), and the top-level dialogs (welcome, import,
  history). Also runs the debounced session autosave that makes reloads
  resume where the user left off.
-->
<script>
  import AppearanceConfig from "$lib/components/AppearanceConfig.svelte";
  import ColumnConfig from "$lib/components/ColumnConfig.svelte";
  import EntityRoster from "$lib/components/EntityRoster.svelte";
  import HistoryDialog from "$lib/components/HistoryDialog.svelte";
  import ImportDialog from "$lib/components/ImportDialog.svelte";
  import MiscConfig from "$lib/components/MiscConfig.svelte";
  import OverviewWindow from "$lib/components/OverviewWindow.svelte";
  import PresetEditor from "$lib/components/PresetEditor.svelte";
  import ShipLabels from "$lib/components/ShipLabels.svelte";
  import SpaceBrackets from "$lib/components/SpaceBrackets.svelte";
  import TabManager from "$lib/components/TabManager.svelte";
  import WelcomeModal from "$lib/components/WelcomeModal.svelte";
  import YamlExporter from "$lib/components/YamlExporter.svelte";
  import { getLocale, LOCALE_NAMES, setLocale, t } from "$lib/i18n/strings.svelte.js";
  import { customiser } from "$lib/stores/customiserStore.svelte";
  import { version } from "../package.json";

  const REPO = "https://github.com/Arziel1992/Z-S-Overview-Customizer/";

  let section = $state("tabs");
  let showImport = $state(false);
  let showHistory = $state(false);

  // Autosave the working profile (debounced) so a reload resumes where it left off.
  let saveTimer;
  $effect(() => {
    customiser.exportYaml(); // read the whole model so this effect tracks it
    customiser.baseProfile;
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => customiser.saveSession(), 500);
  });

  // Section keys only — captions resolve through t() in the template so they
  // re-render when the locale changes.
  const NAV = ["tabs", "presets", "columns", "appearance", "ships", "misc", "yaml"];
  const FULL_HEIGHT = new Set(["appearance", "yaml"]);

  const SCALES = [
    [0.85, "S"],
    [1, "M"],
    [1.15, "L"],
    [1.3, "XL"],
  ];

  // The two bundled bases selectable from the header. Anything else (imports,
  // snapshots, blank) shows as a transient extra option.
  const BASES = [
    ["fenris_default", "app.loadFenris"],
    ["zs_core", "app.loadZs"],
  ];
  const isBundledBase = $derived(BASES.some(([key]) => key === customiser.baseProfile));

  function onBaseChange(e) {
    const key = e.currentTarget.value;
    if (key && key !== "__current__") customiser.loadPreset(key);
  }
</script>

<!-- Single zoom wrapper so the UI scale affects the header, workspace and dialogs alike. -->
<div style="zoom: {customiser.uiScale};" class="contents">
<main
  class="lg:h-screen lg:overflow-hidden min-h-screen flex flex-col bg-app-bg text-app-text"
>
  <!-- Header: identity on the left, one compact control cluster on the right. -->
  <header
    class="shrink-0 bg-app-panel border-b border-app-border px-3 sm:px-4 py-2 flex items-center justify-between gap-3 flex-wrap"
  >
    <div class="flex items-center gap-3 min-w-0">
      <div
        class="h-8 px-2 rounded bg-app-accent flex items-center justify-center font-bold text-white text-sm tracking-wider shrink-0"
      >
        Z-SOC
      </div>
      <div class="min-w-0 hidden md:block">
        <h1 class="text-sm font-bold leading-none truncate">
          {t("app.title")}
        </h1>
        <span class="text-[10px] text-app-muted uppercase tracking-wider"
          >{t("app.subtitle")}</span
        >
      </div>
      <a
        href="{REPO}blob/main/CHANGELOG.md"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[10px] font-mono text-app-muted hover:text-app-text border border-app-border rounded px-1.5 py-0.5 shrink-0 transition-colors"
        title="View changelog">v{version}</a
      >
    </div>

    <div class="flex items-center gap-1.5 text-xs">
      <!-- Base profile selector -->
      <label class="flex items-center gap-1">
        <span class="text-[10px] uppercase text-app-muted hidden lg:inline"
          >{t("app.base")}</span
        >
        <select
          value={isBundledBase ? customiser.baseProfile : "__current__"}
          onchange={onBaseChange}
          class="bg-app-bg border border-app-border rounded px-1.5 py-1 max-w-[150px] focus:outline-none focus:border-app-accent"
          aria-label={t("app.base")}
        >
          {#if !isBundledBase}
            <option value="__current__" disabled>{customiser.baseProfile}</option>
          {/if}
          {#each BASES as [key, labelKey]}
            <option value={key}>{t(labelKey)}</option>
          {/each}
        </select>
      </label>

      <!-- Versions / import -->
      <button
        onclick={() => (showHistory = true)}
        class="border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors text-app-muted hover:text-app-text"
        aria-label={t("app.historyTitle")}
        title={t("app.historyTitle")}
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-9L8 5H5a2 2 0 0 0-2 2z" />
          <path d="M12 10v4M10 12h4" />
        </svg>
      </button>

      <!-- Clear all -->
      <button
        onclick={() => customiser.clearAll()}
        class="border border-app-border hover:border-red-500/60 hover:text-red-400 rounded p-1.5 flex items-center transition-colors text-app-muted"
        aria-label={t("app.clearAllTitle")}
        title={t("app.clearAllTitle")}
      >
        <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
          <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M10 11v6M14 11v6" />
        </svg>
      </button>

      <span class="w-px h-5 bg-app-border mx-0.5" aria-hidden="true"></span>

      <!-- Language -->
      <select
        value={getLocale()}
        onchange={(e) => setLocale(e.currentTarget.value)}
        class="bg-app-bg border border-app-border rounded px-1.5 py-1 focus:outline-none focus:border-app-accent"
        aria-label={t("common.language")}
        title={t("common.language")}
      >
        {#each Object.entries(LOCALE_NAMES) as [code, name]}
          <option value={code}>{name}</option>
        {/each}
      </select>

      <!-- UI scale -->
      <select
        value={customiser.uiScale}
        onchange={(e) => customiser.setScale(Number(e.currentTarget.value))}
        class="bg-app-bg border border-app-border rounded px-1.5 py-1 focus:outline-none focus:border-app-accent"
        aria-label={t("app.uiScale")}
        title={t("app.uiScale")}
      >
        {#each SCALES as [val, label]}
          <option value={val}>{label}</option>
        {/each}
      </select>

      <!-- Theme -->
      <button
        onclick={() => customiser.toggleTheme()}
        class="border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors"
        aria-label={t("app.toggleTheme")}
        title={t("app.toggleTheme")}
      >
        <span aria-hidden="true">{customiser.theme === "dark" ? "🌙" : "☀️"}</span>
      </button>

      <!-- GitHub -->
      <a
        href={REPO}
        target="_blank"
        rel="noopener noreferrer"
        class="border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors text-app-muted hover:text-app-text"
        aria-label={t("app.github")}
        title={t("app.github")}
      >
        <svg
          viewBox="0 0 24 24"
          class="w-4 h-4"
          fill="currentColor"
          aria-hidden="true"
          ><path
            d="M12 .5C5.73.5.5 5.74.5 12.02c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.36-3.88-1.36-.53-1.34-1.3-1.7-1.3-1.7-1.06-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.04 1.78 2.73 1.27 3.4.97.1-.76.41-1.27.74-1.56-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.84 1.19 3.1 0 4.43-2.69 5.41-5.25 5.69.42.36.79 1.08.79 2.18v3.23c0 .31.21.67.8.56A11.53 11.53 0 0 0 23.5 12C23.5 5.74 18.27.5 12 .5z"
          /></svg
        >
      </a>
    </div>
  </header>

  <!-- Workspace -->
  <div class="flex-1 min-h-0 lg:overflow-hidden">
    <div class="h-full grid grid-cols-1 lg:grid-cols-12 gap-3 p-3">
      <!-- Settings panel -->
      <section
        class="lg:col-span-7 flex flex-col bg-app-panel border border-app-border rounded-lg overflow-hidden min-h-0 lg:h-full"
      >
        <div
          class="bg-app-panel2 px-4 py-2 border-b border-app-border flex items-center justify-between shrink-0"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-app-text"
            >{t("settings.windowTitle")}</span
          >
          <span
            class="text-[10px] text-app-muted font-mono bg-app-bg px-2 py-0.5 rounded border border-app-border"
            >{t("settings.engine")}</span
          >
        </div>

        <nav
          class="flex bg-app-panel2 border-b border-app-border overflow-x-auto text-[10px] uppercase font-bold tracking-wider shrink-0"
        >
          {#each NAV as key}
            <button
              onclick={() => (section = key)}
              class="px-3 py-2.5 transition-colors shrink-0 {section === key
                ? 'border-b-2 border-app-accent text-app-accent'
                : 'text-app-muted hover:text-app-text'}">{t(`tabsNav.${key}`)}</button
            >
          {/each}
        </nav>

        <div
          class="flex-1 min-h-0 {FULL_HEIGHT.has(section)
            ? 'p-4 flex flex-col'
            : 'overflow-y-auto p-4'}"
        >
          {#if section === "tabs"}<TabManager />
          {:else if section === "presets"}<PresetEditor />
          {:else if section === "columns"}<ColumnConfig />
          {:else if section === "appearance"}<AppearanceConfig />
          {:else if section === "ships"}<ShipLabels />
          {:else if section === "misc"}<MiscConfig />
          {:else if section === "yaml"}<YamlExporter />{/if}
        </div>
      </section>

      <!-- Live preview -->
      <aside class="lg:col-span-5 flex flex-col gap-3 min-h-0 lg:h-full">
        <div class="shrink-0 h-[220px] lg:h-[32%] lg:min-h-[150px]">
          <SpaceBrackets />
        </div>
        <div class="h-[320px] lg:h-auto lg:flex-1 min-h-0">
          <OverviewWindow />
        </div>
        <div
          class="shrink-0 h-[200px] lg:h-[28%] lg:min-h-[140px] bg-app-panel border border-app-border rounded-lg p-3 flex flex-col min-h-0"
        >
          <EntityRoster />
        </div>
      </aside>
    </div>
  </div>
</main>

{#if customiser.showWelcome}
  <WelcomeModal
    onclose={() => customiser.dismissWelcome()}
    onimport={() => {
      customiser.dismissWelcome();
      showImport = true;
    }}
  />
{/if}
{#if showImport}
  <ImportDialog onclose={() => (showImport = false)} />
{/if}
{#if showHistory}
  <HistoryDialog
    onclose={() => (showHistory = false)}
    onimport={() => {
      showHistory = false;
      showImport = true;
    }}
  />
{/if}
</div>
