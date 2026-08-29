<!--
  @component
  Live export view: the exact game-importable YAML for the current model,
  rendered with a sticky, selection-excluded line-number gutter, plus
  download and copy-to-clipboard actions.

  Two shapes of export. The default is the whole profile — what you put in
  the EVE Overview folder. "Preset pack" narrows it to the presets you tick
  and drops every other section, so importing it elsewhere refreshes those
  presets and leaves the receiving profile's tabs, columns and colours alone.
  The client itself only ever writes whole profiles, which is precisely why
  packs are worth making here.
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";
import { stripEveMarkup } from "$lib/utils/eveFormat";

let packMode = $state(false);
/** Preset names in the pack. Null means "not chosen yet" — all of them. */
let picked = $state(null);

const allNames = $derived(customiser.presets.map((p) => p.name));
const chosen = $derived(picked ?? allNames);
const chosenSet = $derived(new Set(chosen));

const yamlText = $derived(
	packMode
		? customiser.exportYaml({ presetsOnly: true, presetNames: chosen })
		: customiser.exportYaml(),
);
const lines = $derived(yamlText.split("\n"));
// Gutter width sized to the largest line number (in ch) so it never shifts
// mid-scroll; the gutter itself is select-none so copying lines from the
// panel never grabs the numbers.
const gutterCh = $derived(String(lines.length).length);
let copied = $state(false);

function toggle(name) {
	const next = new Set(chosenSet);
	if (next.has(name)) next.delete(name);
	else next.add(name);
	// Keep profile order rather than click order, so the pack diffs cleanly.
	picked = allNames.filter((n) => next.has(n));
}

function download() {
	const blob = new Blob([yamlText], { type: "text/yaml;charset=utf-8" });
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = `${customiser.baseProfile}${packMode ? "_presets" : "_custom"}.yaml`;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
}

async function copy() {
	try {
		await navigator.clipboard.writeText(yamlText);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	} catch (e) {
		console.warn("Clipboard write failed", e);
	}
}
</script>

<div class="flex flex-col h-full min-h-0">
  <div class="shrink-0 mb-2 flex items-start justify-between gap-2">
    <div>
      <h3 class="text-sm font-semibold text-app-text">{t('yaml.heading')}</h3>
      <p class="text-[11px] text-app-muted mt-0.5">{packMode ? t('yaml.packHelp') : t('yaml.help')}</p>
    </div>
    <div class="flex gap-2 shrink-0">
      <button onclick={copy} class="text-xs border border-app-border hover:border-app-accent text-app-text px-3 py-1.5 rounded transition-colors">{copied ? t('yaml.copied') : t('yaml.copy')}</button>
      <button onclick={download} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-3 py-1.5 rounded transition-colors">{t('yaml.download')}</button>
    </div>
  </div>

  <div class="shrink-0 mb-2">
    <label class="flex items-center gap-1.5 w-fit text-[11px] text-app-muted cursor-pointer">
      <input type="checkbox" bind:checked={packMode} class="accent-app-accent" />
      {t('yaml.packMode')}
    </label>

    {#if packMode}
      <div class="mt-1.5 border border-app-border rounded p-2 bg-app-panel2">
        <div class="flex flex-wrap items-center gap-2 mb-1.5">
          <span class="text-[10px] text-app-muted">
            {t('yaml.packCount', { n: chosen.length, m: allNames.length })}
          </span>
          <button onclick={() => (picked = null)} class="text-[10px] text-app-accent hover:underline">{t('yaml.packAll')}</button>
          <button onclick={() => (picked = [])} class="text-[10px] text-app-accent hover:underline">{t('yaml.packNone')}</button>
        </div>
        <div class="max-h-vh overflow-y-auto grid gap-0.5 content-start grid-cols-[repeat(auto-fill,minmax(min(220px,100%),1fr))]" style="--vh-pct: 22">
          {#each customiser.presets as preset (preset.name)}
            <label class="flex items-center gap-1.5 text-[11px] cursor-pointer hover:text-app-accent">
              <input
                type="checkbox"
                checked={chosenSet.has(preset.name)}
                onchange={() => toggle(preset.name)}
                class="accent-app-accent shrink-0"
              />
              <span class="truncate" title={stripEveMarkup(preset.name)}>{stripEveMarkup(preset.name)}</span>
            </label>
          {/each}
        </div>
        {#if chosen.length === 0}
          <p role="alert" class="mt-1.5 text-[11px] text-amber-400">{t('yaml.packEmpty')}</p>
        {/if}
      </div>
    {/if}
  </div>

  {#if customiser.rosterDirty}
    <!-- Preview entities are workbench data, not part of the profile — so this
         warns rather than blocks: the export is complete either way. -->
    <p role="status" class="shrink-0 mb-2 text-[11px] text-amber-400 border border-amber-500/40 bg-amber-500/5 rounded px-2.5 py-1.5">
      <span aria-hidden="true">●</span> {t('yaml.rosterDirty')}
    </p>
  {/if}

  <div class="flex-1 overflow-auto bg-app-bg border border-app-border rounded py-2 text-[10px] leading-relaxed font-mono text-app-text min-h-0">
    {#each lines as line, i (i)}
      <div class="flex hover:bg-app-panel2/60">
        <span
          class="select-none text-right pr-3 pl-2 text-app-muted/70 shrink-0 sticky left-0 bg-app-bg"
          style="min-width: {gutterCh + 2}ch;"
          aria-hidden="true"
        >{i + 1}</span>
        <span class="whitespace-pre pr-3">{line}</span>
      </div>
    {/each}
  </div>
</div>
