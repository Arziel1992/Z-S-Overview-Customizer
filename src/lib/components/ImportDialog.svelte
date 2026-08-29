<!--
  @component
  YAML import dialog: multi-file picker / drag-and-drop or pasted text,
  validated through the codec before anything is applied. The mode radio
  mirrors the in-game workflow — "Apply on top" (merge, for pack pieces) vs
  "Overwrite" (full replace) — plus "Presets only", which the client has no
  equivalent for because the client always exports a whole profile. Multiple
  files apply in queue order (the in-game multi-piece pack workflow); pasted
  text applies last.
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";
import { parseOverviewYaml } from "$lib/utils/eveFormat";
import Modal from "./Modal.svelte";

let { onclose, presetLabel = "custom" } = $props();

// [value, label key, help key] — order is the order they are offered in.
// "presets" is listed first: it is the safe one, and the only one that cannot
// cost you a tab layout you spent an evening on.
const MODES = [
	["presets", "importer.presetsOnly", "importer.presetsOnlyHelp"],
	["merge", "importer.merge", "importer.mergeHelp"],
	["overwrite", "importer.overwrite", "importer.overwriteHelp"],
];

let text = $state("");
let mode = $state("presets");
let error = $state("");
/** [{ name, text }] — selected/dropped files, applied in this order. */
let queue = $state([]);
let dragOver = $state(false);

async function addFiles(list) {
	error = "";
	for (const file of list) {
		if (queue.some((q) => q.name === file.name)) continue; // already queued
		queue.push({ name: file.name, text: await file.text() });
	}
}

async function onFiles(e) {
	const input = e.currentTarget;
	await addFiles(input.files);
	input.value = "";
}

async function onDrop(e) {
	e.preventDefault();
	dragOver = false;
	await addFiles(
		[...e.dataTransfer.files].filter((f) => /\.ya?ml$/i.test(f.name)),
	);
}

function apply() {
	const pieces = [
		...queue.map((q) => ({ ...q })),
		...(text.trim() ? [{ name: null, text }] : []),
	];
	if (pieces.length === 0) {
		error = t("importer.invalid");
		return;
	}
	try {
		for (const p of pieces) parseOverviewYaml(p.text); // validate all first
	} catch (e) {
		console.warn(e);
		error = t("importer.invalid");
		return;
	}
	for (const p of pieces) {
		customiser.importYaml(
			p.text,
			mode,
			p.name ? p.name.replace(/\.ya?ml$/i, "") : presetLabel,
		);
	}
	onclose?.();
}
</script>

<Modal title={t('importer.title')} {onclose} maxWidth="max-w-xl">
  <div class="space-y-4 text-sm">
    <!-- Multi-file picker doubling as a drag-and-drop target -->
    <div
      role="region"
      aria-label={t('importer.dropHint')}
      ondragover={(e) => { e.preventDefault(); dragOver = true; }}
      ondragleave={() => (dragOver = false)}
      ondrop={onDrop}
      class="border-2 border-dashed rounded p-3 text-center transition-colors {dragOver ? 'border-app-accent bg-app-accent/5' : 'border-app-border'}"
    >
      <label class="inline-flex items-center gap-2 cursor-pointer text-xs bg-app-panel2 border border-app-border rounded px-3 py-2 hover:border-app-accent transition-colors">
        <input type="file" accept=".yaml,.yml,text/yaml" multiple onchange={onFiles} class="hidden" />
        <span>📄 {t('importer.file')}</span>
      </label>
      <p class="text-[11px] text-app-muted mt-2">{t('importer.dropHint')}</p>
      {#if queue.length > 0}
        <div class="flex flex-wrap justify-center gap-1.5 mt-2">
          {#each queue as q, i}
            <span class="flex items-center gap-1 text-[11px] border border-app-border rounded px-2 py-1 font-mono">
              {q.name}
              <button
                onclick={() => queue.splice(i, 1)}
                class="text-red-400 hover:text-red-300 px-0.5"
                aria-label={t('importer.removeFile')}
                title={t('importer.removeFile')}
              >✕</button>
            </span>
          {/each}
        </div>
      {/if}
    </div>

    <label class="flex flex-col gap-1">
      <span class="text-[10px] uppercase text-app-muted">{t('importer.paste')}</span>
      <textarea bind:value={text} rows="8" spellcheck="false" class="bg-app-bg border border-app-border rounded px-2 py-1.5 font-mono text-[11px] focus:outline-none focus:border-app-accent resize-y"></textarea>
    </label>

    <fieldset class="space-y-2">
      <legend class="text-[10px] uppercase text-app-muted mb-1">{t('importer.mode')}</legend>
      {#each MODES as [value, labelKey, helpKey]}
        <label class="flex items-start gap-2 cursor-pointer bg-app-panel2 border rounded p-2.5 transition-colors {mode === value ? 'border-app-accent' : 'border-app-border'}">
          <input type="radio" name="mode" {value} bind:group={mode} class="mt-0.5 accent-app-accent" />
          <div>
            <div class="text-xs font-semibold text-app-text">{t(labelKey)}</div>
            <div class="text-[11px] text-app-muted">{t(helpKey)}</div>
          </div>
        </label>
      {/each}
    </fieldset>

    {#if error}<p class="text-xs text-red-400">{error}</p>{/if}

    <div class="flex justify-end gap-2 pt-1">
      <button onclick={() => onclose?.()} class="text-xs border border-app-border hover:border-app-accent px-3 py-1.5 rounded transition-colors">{t('importer.cancel')}</button>
      <button onclick={apply} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-4 py-1.5 rounded transition-colors">{t('importer.apply')}</button>
    </div>
  </div>
</Modal>
