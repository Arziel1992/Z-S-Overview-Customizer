<!--
  @component
  SDE group browser bound to the active preset's `groups` whitelist.
  Category tabs come from the compiled matrix; the search box matches both
  group names and individual hull/type names (showing the matching hulls as
  chips under their parent group).

  Each category tab carries a "selected / total" count, mirroring the in-game
  Types tree: matching numbers mean the preset covers that whole category, so
  a post-expansion gap shows up as X/Y at a glance. The list itself is a
  responsive grid — the big categories (Entity has 415 groups) are unusable as
  a single column.
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";

// Pseudo-category spanning every group; safe key, real ids are numeric.
const ALL = "all";

let searchQuery = $state("");
let activeCategory = $state(ALL); // search everything by default

const preset = $derived(customiser.activePreset);
// Stable, keyed category list so the nav doesn't re-render while typing.
const categories = $derived(
	customiser.sdeMatrix ? Object.entries(customiser.sdeMatrix.categories) : [],
);

const filteredGroups = $derived.by(() => {
	const m = customiser.sdeMatrix;
	if (!m) return [];
	const gids =
		activeCategory === ALL
			? Object.values(m.categories).flatMap((c) => c.groups)
			: (m.categories[activeCategory]?.groups ?? []);
	const q = searchQuery.toLowerCase().trim();
	return gids
		.map((gid) => {
			const g = m.groups[gid];
			if (!g) return null;
			const matchGroup = g.name.toLowerCase().includes(q);
			const matchTypes = q
				? g.types
						.filter((tid) => m.types[tid]?.name.toLowerCase().includes(q))
						.map((tid) => m.types[tid].name)
				: [];
			if (!q || matchGroup || matchTypes.length) {
				return { id: gid, name: g.name, matches: matchTypes.slice(0, 6) };
			}
			return null;
		})
		.filter(Boolean);
});

function isOn(gid) {
	return preset?.groups.includes(gid);
}

/**
 * Per-category "selected / total" over *groups*, which is what a preset
 * actually whitelists (and what the client's own numbers count — the Ship
 * category holds exactly 50 of them). Type totals ride along in the tooltip,
 * since the request was phrased in types.
 */
const counts = $derived.by(() => {
	const m = customiser.sdeMatrix;
	const chosen = new Set(preset?.groups ?? []);
	const out = {};
	let onAll = 0;
	let totalAll = 0;
	let typesAll = 0;
	for (const [cid, cat] of Object.entries(m?.categories ?? {})) {
		const on = cat.groups.filter((gid) => chosen.has(gid)).length;
		const types = cat.groups.reduce(
			(n, gid) => n + (m.groups[gid]?.types.length ?? 0),
			0,
		);
		out[cid] = { on, total: cat.groups.length, types };
		onAll += on;
		totalAll += cat.groups.length;
		typesAll += types;
	}
	out[ALL] = { on: onAll, total: totalAll, types: typesAll };
	return out;
});

/** Full coverage is the state worth spotting — it is why the numbers exist. */
function countClass(c) {
	if (!c?.total) return "text-app-muted";
	return c.on === c.total ? "text-emerald-400" : "text-app-muted";
}
function countTitle(c) {
	return c
		? t("presets.countHelp", { on: c.on, total: c.total, types: c.types })
		: "";
}
</script>

<div class="bg-app-panel2 border border-app-border rounded p-2.5 flex flex-col" style="max-height: 360px;">
  <input
    type="text"
    bind:value={searchQuery}
    placeholder={t('presets.groupSearch')}
    aria-label={t('presets.groupSearchLabel')}
    class="w-full shrink-0 bg-app-bg border border-app-border rounded px-2.5 py-1.5 text-xs mb-2 focus:outline-none focus:border-app-accent"
  />

  {#if customiser.sdeMatrix}
    <!-- shrink-0: without it, a long unfiltered group list (flex base height of
         thousands of px) absorbs the container's max-height squeeze
         proportionally and crushes this strip to ~0px — it then only "appeared"
         once a search query made the list short. -->
    <div class="flex gap-1 border-b border-app-border mb-2 overflow-x-auto shrink-0">
      <button
        onclick={() => activeCategory = ALL}
        title={countTitle(counts[ALL])}
        class="px-2.5 py-1 text-[11px] border-b-2 transition-colors shrink-0 {activeCategory === ALL ? 'border-app-accent text-app-text' : 'border-transparent text-app-muted hover:text-app-text'}"
      >{t('presets.allCategories')} <span class="font-mono {countClass(counts[ALL])}">{counts[ALL]?.on ?? 0}/{counts[ALL]?.total ?? 0}</span></button>
      {#each categories as [cid, cat] (cid)}
        <button
          onclick={() => activeCategory = cid}
          title={countTitle(counts[cid])}
          class="px-2.5 py-1 text-[11px] border-b-2 transition-colors shrink-0 {activeCategory === cid ? 'border-app-accent text-app-text' : 'border-transparent text-app-muted hover:text-app-text'}"
        >{cat.name} <span class="font-mono {countClass(counts[cid])}">{counts[cid]?.on ?? 0}/{counts[cid]?.total ?? 0}</span></button>
      {/each}
    </div>

    <!-- Responsive columns: one on a phone, as many as fit on a wide panel. -->
    <div class="flex-1 overflow-y-auto pr-1 grid gap-1 content-start grid-cols-[repeat(auto-fill,minmax(min(210px,100%),1fr))]">
      {#each filteredGroups as group (group.id)}
        <label class="flex items-start gap-2 bg-app-bg border border-app-border rounded px-2.5 py-1.5 cursor-pointer hover:border-app-accent/60 transition-colors">
          <input
            type="checkbox"
            checked={isOn(group.id)}
            onchange={() => customiser.toggleGroupInPreset(group.id)}
            class="mt-0.5 accent-app-accent"
          />
          <div class="min-w-0">
            <span class="text-xs text-app-text">{group.name}</span>
            <span class="text-[9px] text-app-muted block">{t('presets.groupId', { id: group.id })}</span>
            {#if group.matches.length}
              <div class="flex flex-wrap gap-1 mt-1">
                {#each group.matches as tn}
                  <span class="text-[9px] bg-app-accent/15 text-app-accent px-1 py-0.5 rounded">{tn}</span>
                {/each}
              </div>
            {/if}
          </div>
        </label>
      {:else}
        <div class="text-center text-[11px] text-app-muted py-6 col-span-full">{t('presets.noGroups')}</div>
      {/each}
    </div>
  {:else}
    <div class="text-center text-[11px] text-app-muted py-6">{t('presets.loadingSde')}</div>
  {/if}
</div>
