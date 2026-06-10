<script>
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import { t } from '$lib/i18n/strings';

  const yamlText = $derived(customiser.exportYaml());
  let copied = $state(false);

  function download() {
    const blob = new Blob([yamlText], { type: 'text/yaml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${customiser.baseProfile}_custom.yaml`;
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
      console.warn('Clipboard write failed', e);
    }
  }
</script>

<div class="flex flex-col h-full min-h-0">
  <div class="shrink-0 mb-2 flex items-start justify-between gap-2">
    <div>
      <h3 class="text-sm font-semibold text-app-text">{t('yaml.heading')}</h3>
      <p class="text-[11px] text-app-muted mt-0.5">{t('yaml.help')}</p>
    </div>
    <div class="flex gap-2 shrink-0">
      <button onclick={copy} class="text-xs border border-app-border hover:border-app-accent text-app-text px-3 py-1.5 rounded transition-colors">{copied ? t('yaml.copied') : t('yaml.copy')}</button>
      <button onclick={download} class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-3 py-1.5 rounded transition-colors">{t('yaml.download')}</button>
    </div>
  </div>

  <pre class="flex-1 overflow-auto bg-eve-bg border border-app-border rounded p-3 text-[10px] leading-relaxed font-mono text-eve-text min-h-0">{yamlText}</pre>
</div>
