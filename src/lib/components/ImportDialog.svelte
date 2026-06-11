<!--
  @component
  YAML import dialog: file picker or pasted text, validated through the codec
  before anything is applied. The mode radio mirrors the in-game workflow —
  "Apply on top" (merge, for pack pieces) vs "Overwrite" (full replace).
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { parseOverviewYaml } from '$lib/utils/eveFormat';
  import Modal from './Modal.svelte';

  let { onclose, presetLabel = 'custom' } = $props();

  let text = $state('');
  let mode = $state('merge');
  let error = $state('');
  let fileName = $state('');

  async function onFile(e) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    fileName = file.name;
    text = await file.text();
    error = '';
  }

  function apply() {
    if (!text.trim()) {
      error = t('importer.invalid');
      return;
    }
    try {
      parseOverviewYaml(text); // validate first
      customiser.importYaml(text, mode, fileName ? fileName.replace(/\.ya?ml$/i, '') : presetLabel);
      onclose?.();
    } catch (e) {
      console.warn(e);
      error = t('importer.invalid');
    }
  }
</script>

<Modal title={t('importer.title')} {onclose} maxWidth="max-w-xl">
  <div class="space-y-4 text-sm">
    <div>
      <label class="inline-flex items-center gap-2 cursor-pointer text-xs bg-app-panel2 border border-app-border rounded px-3 py-2 hover:border-app-accent transition-colors">
        <input type="file" accept=".yaml,.yml,text/yaml" onchange={onFile} class="hidden" />
        <span>📄 {t('importer.file')}</span>
        {#if fileName}<span class="text-app-muted">{fileName}</span>{/if}
      </label>
    </div>

    <label class="flex flex-col gap-1">
      <span class="text-[10px] uppercase text-app-muted">{t('importer.paste')}</span>
      <textarea bind:value={text} rows="8" spellcheck="false" class="bg-app-bg border border-app-border rounded px-2 py-1.5 font-mono text-[11px] focus:outline-none focus:border-app-accent resize-y"></textarea>
    </label>

    <fieldset class="space-y-2">
      <legend class="text-[10px] uppercase text-app-muted mb-1">{t('importer.mode')}</legend>
      <label class="flex items-start gap-2 cursor-pointer bg-app-panel2 border rounded p-2.5 transition-colors {mode === 'merge' ? 'border-app-accent' : 'border-app-border'}">
        <input type="radio" name="mode" value="merge" bind:group={mode} class="mt-0.5 accent-app-accent" />
        <div>
          <div class="text-xs font-semibold text-app-text">{t('importer.merge')}</div>
          <div class="text-[11px] text-app-muted">{t('importer.mergeHelp')}</div>
        </div>
      </label>
      <label class="flex items-start gap-2 cursor-pointer bg-app-panel2 border rounded p-2.5 transition-colors {mode === 'overwrite' ? 'border-app-accent' : 'border-app-border'}">
        <input type="radio" name="mode" value="overwrite" bind:group={mode} class="mt-0.5 accent-app-accent" />
        <div>
          <div class="text-xs font-semibold text-app-text">{t('importer.overwrite')}</div>
          <div class="text-[11px] text-app-muted">{t('importer.overwriteHelp')}</div>
        </div>
      </label>
    </fieldset>

    {#if error}<p class="text-xs text-red-400">{error}</p>{/if}

    <div class="flex justify-end gap-2 pt-1">
      <button onclick={() => onclose?.()} class="text-xs border border-app-border hover:border-app-accent px-3 py-1.5 rounded transition-colors">{t('importer.cancel')}</button>
      <button onclick={apply} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-4 py-1.5 rounded transition-colors">{t('importer.apply')}</button>
    </div>
  </div>
</Modal>
