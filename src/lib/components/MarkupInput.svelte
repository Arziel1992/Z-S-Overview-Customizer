<!--
  @component
  Unified editor for text fields that accept EVE inline markup (tab names,
  preset names, …). One raw-markup text input plus the same toolbar style as
  the ship-label segment editor — B / I / U toggles, a px size field and a
  colour picker — wrapping/unwrapping the *outermost* tags via
  analyzeMarkup/composeMarkup so hand-written inner markup is never touched.
  Includes the "?" legend popover and a live-rendered preview.

  Props:
    label      — field caption
    value      — current raw markup string (controlled)
    oncommit   — called with the new raw string on every edit (live)
    onfinish   — optional; called on change/Enter (blur) for commit-style
                 consumers like preset rename
    colorCss   — optional external colour (CSS hex or null). When given, the
                 swatch edits this through `oncolor` instead of wrapping
                 <color> markup — used for tab text colour, which the game
                 stores as a separate tabSetup field, not name markup.
    oncolor    — (cssHex|null) => void; required with colorCss
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

  let {
    label = '',
    value = '',
    oncommit,
    onfinish,
    placeholder = '',
    colorCss = undefined,
    oncolor = undefined,
  } = $props();

  const externalColor = $derived(oncolor !== undefined);

  // Local raw text mirrors `value`; the effect seeds it on mount and resyncs
  // whenever the parent changes it (e.g. a failed rename restoring the name).
  let raw = $state('');
  $effect(() => {
    raw = value;
  });

  const parsed = $derived(analyzeMarkup(raw));

  // Swatch value: external field when provided, else the markup colour wrap.
  const swatchCss = $derived(
    externalColor
      ? (colorCss ?? '#ffffff')
      : parsed.flags.color
        ? argbHexToCss(parsed.flags.color)
        : '#ffffff'
  );
  const colorActive = $derived(externalColor ? colorCss != null : parsed.flags.color != null);

  function update(next) {
    raw = next;
    oncommit?.(next);
  }

  function setFlags(mutate) {
    const { inner, flags } = analyzeMarkup(raw);
    mutate(flags);
    update(composeMarkup(inner, flags));
  }

  function setColor(css) {
    if (externalColor) oncolor(css);
    else setFlags((f) => { f.color = cssToArgbHex(css).replace('0xff', '0xFF'); });
  }

  function clearColor() {
    if (externalColor) oncolor(null);
    else setFlags((f) => { f.color = null; });
  }

  // Same button styling as the ship-label segment editor (the reference look).
  function styleBtn(active) {
    return `px-2 py-1 rounded text-[11px] border transition-colors ${active ? 'bg-app-accent border-app-accent text-white' : 'border-app-border text-app-muted'}`;
  }
</script>

<div class="space-y-1.5">
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

  <div class="flex items-center gap-2 flex-wrap">
    <button type="button" onclick={() => setFlags((f) => { f.b = !f.b; })} class="{styleBtn(parsed.flags.b)} font-bold" aria-pressed={parsed.flags.b} title={t('markup.toolbarBold')}>B</button>
    <button type="button" onclick={() => setFlags((f) => { f.i = !f.i; })} class="{styleBtn(parsed.flags.i)} italic" aria-pressed={parsed.flags.i} title={t('markup.toolbarItalic')}>I</button>
    <button type="button" onclick={() => setFlags((f) => { f.u = !f.u; })} class="{styleBtn(parsed.flags.u)} underline" aria-pressed={parsed.flags.u} title={t('markup.toolbarUnderline')}>U</button>

    <label class="flex items-center gap-1">
      <span class="text-[9px] uppercase text-app-muted">{t('ships.size')}</span>
      <input
        type="number"
        min="6"
        max="24"
        value={parsed.flags.fontsize ?? ''}
        oninput={(e) => setFlags((f) => { f.fontsize = e.currentTarget.value ? Number(e.currentTarget.value) : null; })}
        class="w-12 bg-app-bg border border-app-border rounded px-1.5 py-1 text-xs focus:outline-none focus:border-app-accent"
      />
    </label>

    <label class="flex items-center gap-1">
      <span class="text-[9px] uppercase text-app-muted">{t('ships.color')}</span>
      <input
        type="color"
        value={swatchCss}
        oninput={(e) => setColor(e.currentTarget.value)}
        class="w-6 h-5 rounded bg-transparent border border-app-border cursor-pointer"
        aria-label={t('markup.toolbarColor')}
        title={t('markup.toolbarColor')}
      />
      {#if colorActive}
        <button type="button" onclick={clearColor} class="text-[9px] text-app-muted hover:text-app-text underline" title={t('markup.toolbarColorClear')}>{t('common.clear')}</button>
      {/if}
    </label>

    <!-- Live preview -->
    <span class="ml-auto flex items-baseline gap-1.5 min-w-0">
      <span class="text-[9px] uppercase text-app-muted shrink-0">{t('markup.preview')}</span>
      <span
        class="font-mono text-xs truncate bg-eve-bg border border-app-border rounded px-1.5 py-0.5 text-eve-text"
        style={externalColor && colorCss ? `color:${colorCss}` : ''}
      >{@html renderEveMarkup(raw)}</span>
    </span>
  </div>
</div>
