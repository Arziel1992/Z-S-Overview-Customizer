<!--
  @component
  "ⓘ" formatting-legend popover for fields that accept EVE inline markup.
  Click (or focus + Enter) toggles a small panel listing the supported tags
  with live-rendered examples; closes on Escape or when focus leaves it.
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import { renderEveMarkup } from '$lib/utils/eveFormat';

  let open = $state(false);

  // [raw example, i18n description key]
  const TAGS = [
    ['<color=0xFF66CCFF>text</color>', 'markup.colorTag'],
    ['<b>text</b>', 'markup.boldTag'],
    ['<i>text</i>', 'markup.italicTag'],
    ['<u>text</u>', 'markup.underlineTag'],
    ['<fontsize=12>text</fontsize>', 'markup.fontsizeTag'],
  ];

  function onfocusout(e) {
    // Close only when focus truly leaves the widget (not moving within it).
    if (!e.currentTarget.contains(e.relatedTarget)) open = false;
  }
</script>

<span class="relative inline-flex" onfocusout={onfocusout}>
  <button
    type="button"
    onclick={() => (open = !open)}
    onkeydown={(e) => e.key === 'Escape' && (open = false)}
    aria-expanded={open}
    aria-label={t('markup.hint')}
    title={t('markup.hint')}
    class="w-4 h-4 rounded-full border border-app-border text-app-muted hover:text-app-text hover:border-app-accent text-[9px] leading-none flex items-center justify-center transition-colors"
  >?</button>

  {#if open}
    <div class="absolute z-30 top-5 left-0 w-72 bg-app-panel border border-app-border rounded-lg shadow-xl p-3 text-left">
      <p class="text-[10px] text-app-muted mb-2">{t('markup.intro')}</p>
      <ul class="space-y-1">
        {#each TAGS as [example, descKey]}
          <li class="flex items-baseline gap-2 text-[10px]">
            <code class="font-mono bg-app-bg border border-app-border rounded px-1 py-0.5 whitespace-nowrap">{example}</code>
            <span class="text-app-muted flex-1">{t(descKey)}</span>
            <span class="shrink-0">{@html renderEveMarkup(example)}</span>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</span>
