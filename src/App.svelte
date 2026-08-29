<!--
  @component
  Application shell. Owns the header (branding, version, base-profile
  selector, history/import + clear-all actions, language / scale / theme
  controls, GitHub link), the two-pane workspace (settings panel with section
  nav | live preview column) and the top-level dialogs (welcome, import,
  history). Also runs the debounced session autosave that makes reloads
  resume where the user left off.

  The workspace is the user's to arrange: a draggable (and arrow-key nudgeable)
  divider sets how much width the settings panel takes, and every one of the
  four panels carries an eye that collapses it to a bar it can be restored
  from. Both live in the store, so both survive a reload.
-->
<script>
import AppearanceConfig from "$lib/components/AppearanceConfig.svelte";
import ColumnConfig from "$lib/components/ColumnConfig.svelte";
import ComparePanel from "$lib/components/ComparePanel.svelte";
import EntityRoster from "$lib/components/EntityRoster.svelte";
import GlossaryDialog from "$lib/components/GlossaryDialog.svelte";
import HistoryDialog from "$lib/components/HistoryDialog.svelte";
import ImportDialog from "$lib/components/ImportDialog.svelte";
import MiscConfig from "$lib/components/MiscConfig.svelte";
import OverviewWindow from "$lib/components/OverviewWindow.svelte";
import PresetEditor from "$lib/components/PresetEditor.svelte";
import PrivacyPanel from "$lib/components/PrivacyPanel.svelte";
import ShipLabels from "$lib/components/ShipLabels.svelte";
import SpaceBrackets from "$lib/components/SpaceBrackets.svelte";
import TabManager from "$lib/components/TabManager.svelte";
import WelcomeModal from "$lib/components/WelcomeModal.svelte";
import YamlExporter from "$lib/components/YamlExporter.svelte";
import {
	getLocale,
	LOCALE_NAMES,
	setLocale,
	t,
} from "$lib/i18n/strings.svelte.js";
import { customiser, SESSION_KEY } from "$lib/stores/customiserStore.svelte";
import { version } from "../package.json";

// Date of the bundled SDE pull (CI refreshes it weekly), fixed YYYY/MM/DD.
const sdeDate = $derived(
	customiser.sdeCompiledAt
		? new Date(customiser.sdeCompiledAt * 1000)
				.toISOString()
				.slice(0, 10)
				.replaceAll("-", "/")
		: null,
);

const REPO = "https://github.com/Arziel1992/Z-S-Overview-Customizer/";

let section = $state("tabs");
let showImport = $state(false);
let showHistory = $state(false);
let showPrivacy = $state(false);
let showGlossary = $state(false);
/** Section id to open the guide at, or null for the whole guide. */
let glossarySection = $state(null);
let menuOpen = $state(false); // header controls sheet, phones only
// Another tab of this site overwrote the shared session autosave.
let otherTabWrote = $state(false);

// Draggable settings/preview divider. The split is a % of the workspace width
// held in the store (persisted), applied through a CSS variable so it only
// takes effect at lg — below that the two stack and the divider is hidden.
let workspace;
const hidden = $derived(customiser.hiddenPanels);

function dragSplit(e) {
	if (!workspace) return;
	e.preventDefault();
	e.currentTarget.setPointerCapture?.(e.pointerId);
	const rect = workspace.getBoundingClientRect();
	const move = (ev) => {
		customiser.setSplit(((ev.clientX - rect.left) / rect.width) * 100);
	};
	const up = () => {
		window.removeEventListener("pointermove", move);
		window.removeEventListener("pointerup", up);
	};
	window.addEventListener("pointermove", move);
	window.addEventListener("pointerup", up);
}

function nudgeSplit(e) {
	const step = { ArrowLeft: -2, ArrowRight: 2, Home: -100, End: 100 }[e.key];
	if (step == null) return;
	e.preventDefault();
	customiser.setSplit(customiser.splitPct + step);
}

// Autosave the working profile and the preview roster (debounced) so a reload
// resumes where it left off. The roster is tracked through its fingerprint
// because the entity editor binds straight to the entities — those edits never
// pass through a store method.
let saveTimer;
$effect(() => {
	customiser.exportYaml(); // read the whole model so this effect tracks it
	customiser.baseProfile;
	customiser.rosterSig;
	clearTimeout(saveTimer);
	saveTimer = setTimeout(() => {
		customiser.saveSession();
		customiser.saveRoster();
	}, 500);
});

// A storage event only fires in the *other* tabs of a site, so this is exactly
// "somebody else overwrote the shared autosave" — never our own save.
$effect(() => {
	const onStorage = (e) => {
		if (e.key === SESSION_KEY && e.newValue) otherTabWrote = true;
	};
	const onKey = (e) => {
		if (e.key === "Escape") menuOpen = false;
	};
	window.addEventListener("storage", onStorage);
	window.addEventListener("keydown", onKey);
	return () => {
		window.removeEventListener("storage", onStorage);
		window.removeEventListener("keydown", onKey);
	};
});

// Section keys only — captions resolve through t() in the template so they
// re-render when the locale changes.
const NAV = [
	"tabs",
	"presets",
	"columns",
	"appearance",
	"ships",
	"misc",
	"compare",
	"yaml",
];
const FULL_HEIGHT = new Set(["appearance", "yaml"]);

const SCALES = [
	[0.85, "S"],
	[1, "M"],
	[1.15, "L"],
	[1.3, "XL"],
];

// The bundled bases selectable from the header. Anything else (imports,
// snapshots, blank) shows as a transient extra option.
const BASES = [
	["zs_full_v10.06.09", "app.loadZsFull"],
	["zs_full_v9.00.0347", "app.loadZsFullLegacy"],
	["fenris_default_v24.01", "app.loadFenris"],
];
const isBundledBase = $derived(
	BASES.some(([key]) => key === customiser.baseProfile),
);

function onBaseChange(e) {
	const key = e.currentTarget.value;
	if (key && key !== "__current__") customiser.loadPreset(key);
}
</script>

<!-- Single zoom wrapper so the UI scale affects the header, workspace and dialogs alike. -->
<div style="zoom: {customiser.uiScale}; --zoom: {customiser.uiScale};" class="contents">
<main
  class="app-shell lg:overflow-hidden flex flex-col bg-app-bg text-app-text"
>
  <!-- Header: identity on the left, one control cluster on the right. The
       cluster needs about 500px and the identity block another 500, so below
       lg it moves into a sheet behind a menu button — at tablet widths the two
       used to compete for one row and shred the title. The cluster itself is
       one snippet rendered in both places, laid out differently, rather than
       two copies drifting apart. -->
  <header
    class="shrink-0 bg-app-panel border-b border-app-border px-3 sm:px-4 py-2 flex items-center justify-between gap-2 relative"
  >
    <div class="flex items-center gap-2 sm:gap-3 min-w-0">
      <div
        class="h-8 px-2 rounded bg-app-accent flex items-center justify-center font-bold text-white text-sm tracking-wider shrink-0"
      >
        Z-SOC
      </div>
      <!-- Both lines truncate: a wrapping subtitle stacks one word per line
           and pushes the whole header apart. -->
      <div class="min-w-0 hidden sm:block">
        <h1 class="text-sm font-bold leading-none truncate">
          {t("app.title")}
        </h1>
        <span class="block truncate text-[10px] text-app-muted uppercase tracking-wider"
          >{t("app.subtitle")}</span
        >
      </div>
      <a
        href="{REPO}blob/main/CHANGELOG.md"
        target="_blank"
        rel="noopener noreferrer"
        class="text-[10px] font-mono text-app-muted hover:text-app-text border border-app-border rounded px-1.5 py-0.5 shrink-0 transition-colors"
        title={t("app.changelog")}>v{version}</a
      >
      <!-- SDE freshness: shows the tool self-updates; warns when the pull
           failed. The warning matters on a phone, the date does not. -->
      {#if customiser.sdeError}
        <span
          class="text-[10px] font-mono text-amber-400 border border-amber-500/50 bg-amber-500/10 rounded px-1.5 py-0.5 shrink-0 inline-flex items-center gap-1"
          title={t("app.sdeErrorHelp")}
          role="status"
        >⚠ {t("app.sdeError")}</span>
      {:else if sdeDate}
        <span
          class="text-[10px] font-mono text-app-muted border border-app-border rounded px-1.5 py-0.5 shrink-0 hidden sm:inline-flex items-center gap-1"
          title={t("app.sdeUpdatedHelp", { date: sdeDate })}
        >🛰 {t("app.sdeUpdated", { date: sdeDate })}</span>
      {/if}
    </div>

    <!-- Wide: the cluster inline. -->
    <div class="hidden lg:flex items-center gap-1.5 text-xs">
      {@render controls(false)}
    </div>

    <!-- Narrow and mid-size: one button, and the same cluster in a sheet. -->
    <button
      onclick={() => (menuOpen = !menuOpen)}
      class="lg:hidden border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors text-app-muted hover:text-app-text shrink-0"
      aria-label={t("app.menu")}
      aria-expanded={menuOpen}
      aria-controls="app-menu"
    >
      <svg viewBox="0 0 24 24" class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
        {#if menuOpen}
          <path d="M18 6 6 18M6 6l12 12" />
        {:else}
          <path d="M3 6h18M3 12h18M3 18h18" />
        {/if}
      </svg>
    </button>
  </header>

  {#if menuOpen}
    <!-- Click-away closes; Escape is handled on the panel itself. -->
    <button
      class="lg:hidden fixed inset-0 z-30 cursor-default"
      aria-label={t("common.close")}
      onclick={() => (menuOpen = false)}
    ></button>
    <div
      id="app-menu"
      class="lg:hidden absolute right-2 top-14 z-40 w-[min(20rem,calc(100vw-1rem))] bg-app-panel border border-app-border rounded-lg shadow-2xl p-2.5 flex flex-col gap-1.5 text-xs"
    >
      {@render controls(true)}
    </div>
  {/if}

  {#if otherTabWrote}
    <!-- Every tab of this site shares one autosave slot, so the last writer
         wins. Say so rather than letting one workspace quietly eat another. -->
    <div role="status" class="shrink-0 bg-amber-500/10 border-b border-amber-500/40 px-3 sm:px-4 py-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-amber-300">
      <span class="flex-1 min-w-[12rem]">{t("app.multiTab")}</span>
      <button
        onclick={() => location.reload()}
        class="border border-amber-500/50 hover:bg-amber-500/15 rounded px-2 py-0.5 transition-colors"
      >{t("app.multiTabReload")}</button>
      <button
        onclick={() => (otherTabWrote = false)}
        class="text-amber-300/70 hover:text-amber-200 px-1 transition-colors"
      >{t("app.multiTabDismiss")}</button>
    </div>
  {/if}

  <!-- Workspace -->
  <div class="flex-1 min-h-0 lg:overflow-hidden">
    <div
      bind:this={workspace}
      class="h-full flex flex-col lg:flex-row gap-3 p-3"
      style="--split: {customiser.splitPct}%"
    >
      <!-- Settings panel -->
      {#if hidden.settings}
        {@render collapsed("settings", t("settings.windowTitle"), true)}
      {:else}
      <section
        id="workspace-settings"
        class="flex-1 lg:flex-none lg:basis-[var(--split)] lg:min-w-[16rem] flex flex-col bg-app-panel border border-app-border rounded-lg overflow-hidden min-h-0 lg:h-full"
      >
        <div
          class="bg-app-panel2 px-4 py-2 border-b border-app-border flex items-center justify-between shrink-0"
        >
          <span class="text-xs font-bold uppercase tracking-wider text-app-text"
            >{t("settings.windowTitle")}</span
          >
          {@render eye("settings")}
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
          {:else if section === "compare"}<ComparePanel
              onguide={() => {
                glossarySection = "compare";
                showGlossary = true;
              }}
            />
          {:else if section === "yaml"}<YamlExporter />{/if}
        </div>
      </section>

      <!-- Divider: drag (or arrow-key) to rebalance settings vs preview.

           This is the ARIA window-splitter pattern: a separator that is
           focusable, which the spec defines as a widget (hence the tabindex,
           the value range and the key handling). Svelte's a11y rules model
           `separator` as always non-interactive, so they flag this shape — and
           flag `<button role="separator">` just as loudly from the other side.
           The pattern is correct as written, so the two rules are silenced
           here, deliberately and only here. -->
      <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
      <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
      <div
        role="separator"
        aria-orientation="vertical"
        aria-label={t("app.resizePanels")}
        title={t("app.resizePanels")}
        aria-controls="workspace-settings"
        aria-valuenow={customiser.splitPct}
        aria-valuemin="25"
        aria-valuemax="75"
        tabindex="0"
        onpointerdown={dragSplit}
        ondblclick={() => customiser.setSplit(58)}
        onkeydown={nudgeSplit}
        class="hidden lg:flex w-1.5 shrink-0 -mx-1 items-center justify-center cursor-col-resize group focus:outline-none"
      >
        <div
          class="w-0.5 h-10 rounded-full bg-app-border group-hover:bg-app-accent group-focus:bg-app-accent transition-colors"
        ></div>
      </div>
      {/if}

      <!-- Live preview -->
      <aside class="flex-1 min-w-0 flex flex-col gap-3 min-h-0 lg:h-full">
        {#if hidden.brackets}
          {@render collapsed("brackets", t("preview.spaceView"))}
        {:else}
          <div class="h-[220px] lg:h-auto lg:basis-[32%] lg:grow lg:min-h-[150px] shrink-0 lg:shrink">
            <SpaceBrackets onhide={() => customiser.togglePanel("brackets")} />
          </div>
        {/if}
        {#if hidden.overview}
          {@render collapsed("overview", t("preview.listView"))}
        {:else}
          <div class="h-[320px] lg:h-auto lg:basis-[40%] lg:grow min-h-0">
            <OverviewWindow
              onaddtab={() => (section = "tabs")}
              onhide={() => customiser.togglePanel("overview")}
            />
          </div>
        {/if}
        {#if hidden.roster}
          {@render collapsed("roster", t("preview.roster"))}
        {:else}
          <div
            class="h-[200px] lg:h-auto lg:basis-[28%] lg:grow lg:min-h-[140px] shrink-0 lg:shrink bg-app-panel border border-app-border rounded-lg p-3 flex flex-col min-h-0"
          >
            <EntityRoster onhide={() => customiser.togglePanel("roster")} />
          </div>
        {/if}
      </aside>
    </div>
  </div>
</main>

<!-- Eye toggle carried by every panel's own chrome -->
{#snippet eye(key)}
  <button
    onclick={() => customiser.togglePanel(key)}
    aria-label={t("app.hidePanel")}
    title={t("app.hidePanel")}
    class="text-app-muted hover:text-app-text transition-colors p-0.5 -m-0.5"
  >
    <svg viewBox="0 0 24 24" class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" /><circle cx="12" cy="12" r="3" />
    </svg>
  </button>
{/snippet}

<!-- A hidden panel keeps a bar (a rail beside the preview on wide screens) so
     it is always one click from coming back. -->
{#snippet collapsed(key, label, isSettings = false)}
  <button
    onclick={() => customiser.togglePanel(key)}
    aria-label={t("app.showPanel", { panel: label })}
    title={t("app.showPanel", { panel: label })}
    class="shrink-0 flex items-center gap-2 bg-app-panel border border-app-border rounded-lg text-app-muted hover:text-app-text hover:border-app-accent transition-colors px-3 py-1.5 {isSettings
      ? 'lg:flex-col lg:w-10 lg:h-full lg:px-0 lg:py-3 lg:justify-start'
      : ''}"
  >
    <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
    <span class="text-[10px] uppercase tracking-wider truncate {isSettings ? 'lg:hidden' : ''}">{label}</span>
  </button>
{/snippet}

{#if customiser.showWelcome}
  <WelcomeModal
    onclose={() => customiser.dismissWelcome()}
    onimport={() => {
      customiser.dismissWelcome();
      showImport = true;
    }}
    onglossary={() => { glossarySection = null; showGlossary = true; }}
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
{#if showGlossary}
  <GlossaryDialog section={glossarySection} onclose={() => (showGlossary = false)} />
{/if}
<PrivacyPanel bind:open={showPrivacy} />
</div>

<!-- Header controls, rendered inline on a wide screen and stacked inside the
     menu sheet on a phone. `stacked` only changes layout and reveals the
     labels that icons carry as tooltips on desktop — the controls themselves
     are defined once. -->
{#snippet controls(stacked)}
  {@const btn = stacked
    ? "w-full justify-start gap-2 px-2 py-2 border border-app-border hover:border-app-accent rounded flex items-center transition-colors text-app-muted hover:text-app-text"
    : "border border-app-border hover:border-app-accent rounded p-1.5 flex items-center transition-colors text-app-muted hover:text-app-text"}
  {@const btnWide = stacked
    ? "w-full justify-start gap-2 px-2 py-2 border border-app-border hover:border-app-accent rounded flex items-center transition-colors text-app-muted hover:text-app-text"
    : "border border-app-border hover:border-app-accent rounded p-1.5 2xl:px-2 2xl:gap-1.5 flex items-center transition-colors text-app-muted hover:text-app-text"}
  {@const field = stacked
    ? "w-full bg-app-bg border border-app-border rounded px-2 py-2 focus:outline-none focus:border-app-accent"
    : "bg-app-bg border border-app-border rounded px-1.5 py-1 focus:outline-none focus:border-app-accent"}

  <!-- Base profile selector -->
  <label class="flex items-center gap-1 {stacked ? 'flex-col items-stretch gap-1' : ''}">
    <span class="text-[10px] uppercase text-app-muted {stacked ? '' : 'hidden lg:inline'}"
      >{t("app.base")}</span
    >
    <select
      value={isBundledBase ? customiser.baseProfile : "__current__"}
      onchange={onBaseChange}
      class="{field} {stacked ? '' : 'max-w-[150px]'}"
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
    onclick={() => { showHistory = true; menuOpen = false; }}
    class={btnWide}
    aria-label={t("app.historyTitle")}
    title={t("app.historyTitle")}
  >
    <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-9L8 5H5a2 2 0 0 0-2 2z" />
      <path d="M12 10v4M10 12h4" />
    </svg>
    {#if stacked}
      <span aria-hidden="true">{t("app.historyTitle")}</span>
    {:else}
      <span class="hidden 2xl:inline whitespace-nowrap" aria-hidden="true">{t("app.versionsShort")}</span>
    {/if}
  </button>

  <!-- Glossary & guide -->
  <button
    onclick={() => { glossarySection = null; showGlossary = true; menuOpen = false; }}
    class={btnWide}
    aria-label={t("glossary.title")}
    title={t("glossary.title")}
  >
    <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
      <path d="M9 7h7M9 11h5" />
    </svg>
    {#if stacked}
      <span aria-hidden="true">{t("glossary.title")}</span>
    {:else}
      <span class="hidden 2xl:inline whitespace-nowrap" aria-hidden="true">{t("glossary.short")}</span>
    {/if}
  </button>

  <!-- Clear all -->
  <button
    onclick={() => { customiser.clearAll(); menuOpen = false; }}
    class="{btnWide} hover:border-red-500/60 hover:text-red-400"
    aria-label={t("app.clearAllTitle")}
    title={t("app.clearAllTitle")}
  >
    <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
    {#if stacked}
      <span aria-hidden="true">{t("app.clearAll")}</span>
    {:else}
      <span class="hidden 2xl:inline whitespace-nowrap" aria-hidden="true">{t("app.clearAll")}</span>
    {/if}
  </button>

  {#if !stacked}
    <span class="w-px h-5 bg-app-border mx-0.5" aria-hidden="true"></span>
  {/if}

  <div class="flex gap-1.5 {stacked ? 'w-full' : ''}">
    <!-- Language -->
    <select
      value={getLocale()}
      onchange={(e) => setLocale(e.currentTarget.value)}
      class="{field} {stacked ? 'flex-1' : ''}"
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
      class="{field} {stacked ? 'flex-1' : ''}"
      aria-label={t("app.uiScale")}
      title={t("app.uiScale")}
    >
      {#each SCALES as [val, label]}
        <option value={val}>{label}</option>
      {/each}
    </select>
  </div>

  <div class="flex gap-1.5 {stacked ? 'w-full' : 'contents'}">
    <!-- Theme -->
    <button
      onclick={() => customiser.toggleTheme()}
      class="{btn} {stacked ? 'flex-1 justify-center' : ''}"
      aria-label={t("app.toggleTheme")}
      title={t("app.toggleTheme")}
    >
      <span aria-hidden="true">{customiser.theme === "dark" ? "🌙" : "☀️"}</span>
    </button>

    <!-- Privacy, data & licences -->
    <button
      onclick={() => { showPrivacy = true; menuOpen = false; }}
      class="{stacked ? btn : btnWide} {stacked ? 'flex-1 justify-center' : ''}"
      aria-label={t("privacy.openPanel")}
      title={t("privacy.openPanel")}
    >
      <svg viewBox="0 0 24 24" class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
      {#if !stacked}
        <span class="hidden 2xl:inline whitespace-nowrap" aria-hidden="true">{t("privacy.short")}</span>
      {/if}
    </button>

    <!-- GitHub -->
    <a
      href={REPO}
      target="_blank"
      rel="noopener noreferrer"
      class="{btn} {stacked ? 'flex-1 justify-center' : ''}"
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
{/snippet}
