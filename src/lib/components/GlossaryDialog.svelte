<!--
  @component
  Glossary & guide: a walkthrough, the vocabulary (the tool's and the game's),
  what every control does, and the questions players keep asking.

  The structure — which sections exist and which entries they hold — comes
  from data/glossary.js, so a self-check can hold it against the locale file.
  Every string resolves through t(), so a locale
  that hasn't translated an entry falls back to English per-key rather than
  showing a gap. The filter matches term and body alike, since people search
  for the thing they read ("always shown"), not its key.
-->
<script>
import { GLOSSARY_SECTIONS, glossaryMatches } from "$lib/data/glossary";
import { t } from "$lib/i18n/strings.svelte.js";
import Modal from "./Modal.svelte";

let { onclose } = $props();

let query = $state("");

// Resolve everything up front: the filter needs the rendered text, and the
// list is small enough that rebuilding it per keystroke costs nothing.
const sections = $derived.by(() => {
	const q = query;
	return GLOSSARY_SECTIONS.map((s) => ({
		...s,
		title: t(`glossary.${s.id}.title`),
		intro: t(`glossary.${s.id}.intro`),
		entries: s.keys
			.map((k) => ({
				key: k,
				term: t(`glossary.${s.id}.${k}T`),
				body: t(`glossary.${s.id}.${k}D`),
			}))
			.filter((e) => glossaryMatches(e, q)),
	})).filter((s) => s.entries.length);
});

const hits = $derived(sections.reduce((n, s) => n + s.entries.length, 0));
</script>

<Modal title={t('glossary.title')} {onclose} maxWidth="max-w-3xl">
  <div class="space-y-4 text-sm">
    <p class="text-xs text-app-muted leading-relaxed">{t('glossary.intro')}</p>

    <div class="sticky top-0 z-10 -mt-1 pt-1 pb-2 bg-app-panel">
      <input
        type="search"
        bind:value={query}
        placeholder={t('glossary.search')}
        aria-label={t('glossary.search')}
        class="w-full bg-app-bg border border-app-border rounded px-2.5 py-1.5 text-xs focus:outline-none focus:border-app-accent"
      />
      {#if query}
        <p class="text-[10px] text-app-muted mt-1" role="status">{t('glossary.hits', { n: hits })}</p>
      {/if}
    </div>

    {#each sections as section (section.id)}
      <section>
        <h3 class="text-xs font-bold uppercase tracking-wider text-app-accent">{section.title}</h3>
        {#if !query}
          <p class="text-[11px] text-app-muted mt-0.5 mb-2 leading-relaxed">{section.intro}</p>
        {/if}

        {#if section.ordered}
          <ol class="space-y-1.5 mt-2 list-decimal pl-5 marker:text-app-muted marker:text-[11px]">
            {#each section.entries as entry (entry.key)}
              <li class="bg-app-panel2 border border-app-border rounded px-2.5 py-2">
                <span class="text-xs font-semibold text-app-text">{entry.term}</span>
                <p class="text-[11px] text-app-muted leading-relaxed mt-0.5">{entry.body}</p>
              </li>
            {/each}
          </ol>
        {:else}
          <dl class="grid gap-1.5 mt-2 grid-cols-[repeat(auto-fill,minmax(min(280px,100%),1fr))]">
            {#each section.entries as entry (entry.key)}
              <div class="bg-app-panel2 border border-app-border rounded px-2.5 py-2">
                <dt class="text-xs font-semibold text-app-text">{entry.term}</dt>
                <dd class="text-[11px] text-app-muted leading-relaxed mt-0.5">{entry.body}</dd>
              </div>
            {/each}
          </dl>
        {/if}
      </section>
    {:else}
      <p class="text-xs text-app-muted py-6 text-center">{t('glossary.noHits')}</p>
    {/each}
  </div>
</Modal>
