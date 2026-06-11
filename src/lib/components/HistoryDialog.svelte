<!--
  @component
  Saved-versions manager backed by IndexedDB (utils/history.js). Save the
  current profile under a name; load a snapshot (overwrite or apply-on-top),
  rename, delete, re-export as .yaml, or "share" — which copies the YAML to
  the clipboard (no third-party paste services by design).
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { deleteSnapshot, listSnapshots, renameSnapshot, saveSnapshot } from '$lib/utils/history';
  import Modal from './Modal.svelte';

  let { onclose, onimport } = $props();

  let snapshots = $state([]);
  let newName = $state('');
  let toast = $state('');

  async function refresh() {
    snapshots = await listSnapshots();
  }
  $effect(() => {
    refresh();
  });

  function flash(msg) {
    toast = msg;
    setTimeout(() => (toast = ''), 1800);
  }

  async function saveCurrent() {
    await saveSnapshot(newName || `${customiser.baseProfile} ${new Date().toLocaleString()}`, customiser.exportYaml(), customiser.baseProfile);
    newName = '';
    flash(t('history.saved'));
    refresh();
  }

  function load(rec, mode) {
    customiser.importYaml(rec.yaml, mode, rec.name);
    onclose?.();
  }

  async function rename(rec) {
    const name = prompt(t('history.rename'), rec.name);
    if (name != null) {
      await renameSnapshot(rec.id, name);
      refresh();
    }
  }

  async function remove(rec) {
    await deleteSnapshot(rec.id);
    refresh();
  }

  function exportRec(rec) {
    const blob = new Blob([rec.yaml], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${rec.name.replace(/[^a-z0-9_-]+/gi, '_')}.yaml`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  async function share(rec) {
    try {
      await navigator.clipboard.writeText(rec.yaml);
      flash(t('history.shared'));
    } catch (e) {
      console.warn('clipboard write failed', e);
      flash(t('history.shareFail'));
    }
  }
</script>

<Modal title={t('history.title')} {onclose} maxWidth="max-w-2xl">
  <div class="space-y-3 text-sm">
    <!-- Save current + import -->
    <div class="flex flex-wrap items-center gap-2">
      <input bind:value={newName} placeholder={t('history.saveName')} class="flex-1 min-w-[140px] bg-app-bg border border-app-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-app-accent" />
      <button onclick={saveCurrent} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-3 py-1.5 rounded transition-colors">💾 {t('app.save')}</button>
      <button onclick={() => onimport?.()} class="text-xs border border-app-border hover:border-app-accent px-3 py-1.5 rounded transition-colors">⬆ {t('app.customShort')}…</button>
    </div>

    {#if toast}<p class="text-[11px] text-emerald-400 break-all">{toast}</p>{/if}

    <!-- List -->
    {#if snapshots.length}
      <div class="space-y-1.5 max-h-[52vh] overflow-y-auto pr-1">
        {#each snapshots as rec (rec.id)}
          <div class="bg-app-panel2 border border-app-border rounded p-2.5">
            <div class="flex items-center gap-2">
              <div class="min-w-0 flex-1">
                <div class="text-xs font-semibold text-app-text truncate">{rec.name}</div>
                <div class="text-[10px] text-app-muted">{new Date(rec.createdAt).toLocaleString()}{rec.base ? ` · ${rec.base}` : ''}</div>
              </div>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-2">
              <button onclick={() => load(rec, 'overwrite')} class="text-[11px] bg-app-accent hover:bg-app-accentHover text-white px-2 py-1 rounded transition-colors">{t('history.load')}</button>
              <button onclick={() => load(rec, 'merge')} class="text-[11px] border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors">+ {t('importer.merge')}</button>
              <button onclick={() => rename(rec)} class="text-[11px] border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors">{t('history.rename')}</button>
              <button onclick={() => exportRec(rec)} class="text-[11px] border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors">{t('history.export')}</button>
              <button onclick={() => share(rec)} class="text-[11px] border border-app-border hover:border-app-accent px-2 py-1 rounded transition-colors">{t('history.share')}</button>
              <button onclick={() => remove(rec)} class="text-[11px] border border-red-500/40 text-red-400 hover:bg-red-500/10 px-2 py-1 rounded transition-colors ml-auto">{t('history.remove')}</button>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <p class="text-xs text-app-muted py-4 text-center">{t('history.empty')}</p>
    {/if}
  </div>
</Modal>
