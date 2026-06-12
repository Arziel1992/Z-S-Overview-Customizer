<!--
  @component
  Unified editor for text fields that accept EVE inline markup (tab names,
  preset names, …). One raw-markup text input plus a formatting toolbar —
  colour picker, B / I / U toggles — that wraps/unwraps the *outermost* tags
  via analyzeMarkup/composeMarkup, leaving any hand-written inner markup
  untouched. Includes the "?" legend popover and a live-rendered preview.

  Props:
    label     — field caption
    value     — current raw markup string (controlled)
    oncommit  — called with the new raw string on every edit (live)
    onfinish  — optional; called on change/Enter (blur) for commit-style
                consumers like preset rename
-->
<script>
  import { t } from '$lib/i18n/strings.svelte.js';
  import {
    analyzeMarkup,
    argbHexToCss,
    composeMarkup,
    cssToArgbHex,
    renderEveMarkup,
  } from '$lib/utils/eveFormat';
  import MarkupHint from './MarkupHint.svelte';

  let { label = '', value = '', oncommit, onfinish, placeholder = '' } = $props();

  // Local raw text mirrors `value`; the effect seeds it on mount and resyncs
  // whenever the parent changes it (e.g. a failed rename restoring the name).
  let raw = $state('');
  $effect(() => {
    raw = value;
  });

  const parsed = $derived(analyzeMarkup(raw));

  function update(next) {
    raw = next;
    oncommit?.(next);
  }

  function toggleTag(tag) {
    const { inner, flags } = analyzeMarkup(raw);
    flags[tag] = !flags[tag];
    update(composeMarkup(inner, flags));
  }

  function setColor(css) {
    const { inner, flags } = analyzeMarkup(raw);
    // cssToArgbHex emits 0xff…, matching the uppercase-insensitive game format.
    flags.color = cssToArgbHex(css).replace("0xff", "0xFF");
    update(composeMarkup(inner, flags));
  }

  function clearColor() {
    const { inner, flags } = analyzeMarkup(raw);
    flags.color = null;
    update(composeMarkup(inner, flags));
  }

  function toolbarBtn(active) {
    return `px-1.5 py-0.5 rounded text-[11px] border transition-colors ${active ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted hover:text-app-text'}`;
  }
</script>

<div class="space-y-1">
  <div class="flex items-center gap-1.5">
    <span class="text-[9px] uppercase text-app-muted">{label}</span>
    <MarkupHint />
  </div>

  <input
    type="text"
    value={raw}
    {placeholder}
    oninput={(e) => update(e.currentTarget.value)}
    onchange={() => onfinish?.()}
    onkeydown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
    class="w-full bg-app-bg border border-app-border rounded px-2 py-1 text-xs font-mono focus:outline-none focus:border-app-accent"
    aria-label={label}
  />

  <div class="flex items-center gap-1.5 flex-wrap">
    <!-- Colour wrap -->
    <input
      type="color"
      value={parsed.flags.color ? argbHexToCss(parsed.flags.color) : '#ffffff'}
      oninput={(e) => setColor(e.currentTarget.value)}
      class="w-6 h-5 rounded bg-transparent border border-app-border cursor-pointer"
      aria-label={t('markup.toolbarColor')}
      title={t('markup.toolbarColor')}
    />
    {#if parsed.flags.color}
      <button type="button" onclick={clearColor} class="text-[9px] text-app-muted hover:text-app-text underline" title={t('markup.toolbarColorClear')}>{t('common.clear')}</button>
    {/if}

    <!-- Style wraps -->
    <button type="button" onclick={() => toggleTag('b')} class="{toolbarBtn(parsed.flags.b)} font-bold" aria-pressed={parsed.flags.b} title={t('markup.toolbarBold')}>B</button>
    <button type="button" onclick={() => toggleTag('i')} class="{toolbarBtn(parsed.flags.i)} italic" aria-pressed={parsed.flags.i} title={t('markup.toolbarItalic')}>I</button>
    <button type="button" onclick={() => toggleTag('u')} class="{toolbarBtn(parsed.flags.u)} underline" aria-pressed={parsed.flags.u} title={t('markup.toolbarUnderline')}>U</button>

    <!-- Live preview -->
    <span class="ml-auto flex items-baseline gap-1.5 min-w-0">
      <span class="text-[9px] uppercase text-app-muted shrink-0">{t('markup.preview')}</span>
      <span class="font-mono text-xs truncate bg-eve-bg border border-app-border rounded px-1.5 py-0.5 text-eve-text">{@html renderEveMarkup(raw)}</span>
    </span>
  </div>
</div>
