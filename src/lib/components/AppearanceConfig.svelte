<!--
  @component
  Colortag + background priority editor — two DragLists over flagOrder and
  backgroundOrder. Per state: an authorise checkbox (flagStates /
  backgroundStates whitelists), a colour picker writing 0xAARRGGBB into
  stateColorsNameList, and a blink toggle. Top-to-bottom order is the
  evaluation priority (first match wins).
-->
<script>
  import { STATES } from '$lib/data/stateMatrix';
  import { t } from '$lib/i18n/strings.svelte.js';
  import { customiser } from '$lib/stores/customiserStore.svelte';
  import DragList from './DragList.svelte';
</script>

{#snippet stateRow(kind, authorized, id)}
  <div class="flex items-center gap-2 bg-app-panel2 border border-app-border rounded px-2 py-1.5 text-xs">
    <input
      type="checkbox"
      checked={authorized.includes(id)}
      onchange={() => customiser.toggleMember(authorized, id)}
      class="accent-app-accent"
      aria-label={`${t('appearance.authorised')} ${STATES[id]?.name}`}
    />
    <input
      type="color"
      value={customiser.stateColor(kind, id)}
      oninput={(e) => customiser.setStateColor(kind, id, e.currentTarget.value)}
      class="w-6 h-5 rounded bg-transparent border border-app-border cursor-pointer shrink-0"
      aria-label={`${t('appearance.color')} ${STATES[id]?.name}`}
    />
    <span class="flex-1 min-w-0 truncate text-app-text">{id} · {STATES[id]?.name ?? `State ${id}`}</span>
    <button
      onclick={() => customiser.toggleBlink(kind, id)}
      class="px-1.5 py-0.5 rounded text-[9px] border transition-colors {customiser.stateBlink(kind, id) ? 'border-red-500 text-red-400 bg-red-500/10' : 'border-app-border text-app-muted'}"
    >{t('appearance.blink')}</button>
  </div>
{/snippet}

{#snippet flagRow(id)}{@render stateRow('flag', customiser.flagStates, id)}{/snippet}
{#snippet bgRow(id)}{@render stateRow('background', customiser.backgroundStates, id)}{/snippet}

<div class="flex flex-col h-full min-h-0">
  <div class="shrink-0 mb-2">
    <h3 class="text-sm font-semibold text-app-text">{t('appearance.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('appearance.help')}</p>
  </div>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 min-h-0">
    <div class="flex flex-col min-h-0">
      <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5 border-b border-app-border pb-1 shrink-0">{t('appearance.colortags')}</h4>
      <div class="flex-1 overflow-y-auto pr-1">
        <DragList values={customiser.flagOrder} onchange={(v) => customiser.flagOrder = v} listClass="space-y-1" row={flagRow} />
      </div>
    </div>
    <div class="flex flex-col min-h-0">
      <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5 border-b border-app-border pb-1 shrink-0">{t('appearance.backgrounds')}</h4>
      <div class="flex-1 overflow-y-auto pr-1">
        <DragList values={customiser.backgroundOrder} onchange={(v) => customiser.backgroundOrder = v} listClass="space-y-1" row={bgRow} />
      </div>
    </div>
  </div>
</div>
