<!--
  @component
  Side-by-side profile comparison. Columns are the current working profile
  plus any loaded .yaml overview files; the first table compares the
  profile-level settings (rows where values differ are highlighted), the
  second drills into preset-vs-preset: one preset picked per profile, then
  the union of every selected group with a per-profile ✓/— matrix (presets
  rarely map 1:1 across profiles, hence a free dropdown per column).
-->
<script>
import { t } from "$lib/i18n/strings.svelte.js";
import { customiser } from "$lib/stores/customiserStore.svelte";
import { parseOverviewYaml, stripEveMarkup } from "$lib/utils/eveFormat";

/** [{ name, model, presetSel }] — parsed static snapshots of loaded files. */
let files = $state([]);
let currentSel = $state("");
let error = $state("");

// [labelKey, model -> display string] — compared as strings, diff = highlight.
const SETTING_ROWS = [
	[
		"compare.presets",
		(m) =>
			`${m.presets.length} — ${m.presets.map((p) => stripEveMarkup(p.name)).join(", ")}`,
	],
	[
		"compare.tabs",
		(m) =>
			`${m.tabs.length} — ${m.tabs.map((tb) => stripEveMarkup(tb.name)).join(", ")}`,
	],
	["compare.columnsActive", (m) => m.overviewColumns.join(", ")],
	["compare.columnOrder", (m) => m.columnOrder.join(", ")],
	["compare.flagOrder", (m) => m.flagOrder.join(" → ")],
	["compare.backgroundOrder", (m) => m.backgroundOrder.join(" → ")],
	[
		"compare.flagStates",
		(m) => [...m.flagStates].sort((a, b) => a - b).join(", "),
	],
	[
		"compare.backgroundStates",
		(m) => [...m.backgroundStates].sort((a, b) => a - b).join(", "),
	],
	["compare.labelSegments", (m) => String(m.shipLabelOrder.length)],
	["compare.colorOverrides", (m) => String(Object.keys(m.stateColors).length)],
	[
		"compare.blinks",
		(m) => String(Object.values(m.stateBlinks).filter(Boolean).length),
	],
];

// Column 0 is always the live working profile; the rest are loaded files.
const columns = $derived([
	{ label: t("compare.current"), model: customiser.model, fileIndex: null },
	...files.map((f, i) => ({ label: f.name, model: f.model, fileIndex: i })),
]);

function selectedPreset(col) {
	const presets = col.model.presets;
	const sel =
		col.fileIndex == null ? currentSel : files[col.fileIndex].presetSel;
	return presets.find((p) => p.name === sel) ?? presets[0] ?? null;
}

function setSelected(col, name) {
	if (col.fileIndex == null) currentSel = name;
	else files[col.fileIndex].presetSel = name;
}

const groupName = (id) =>
	customiser.sdeMatrix?.groups?.[id]?.name ?? `Group ${id}`;

// Union of every group selected by any chosen preset, sorted by SDE name.
const unionGroups = $derived.by(() => {
	const ids = new Set();
	for (const col of columns) {
		for (const g of selectedPreset(col)?.groups ?? []) ids.add(g);
	}
	return [...ids].sort((a, b) => groupName(a).localeCompare(groupName(b)));
});

function differs(values) {
	return new Set(values).size > 1;
}

async function onFiles(e) {
	const input = e.currentTarget;
	error = "";
	for (const f of input.files) {
		try {
			const model = parseOverviewYaml(await f.text());
			files.push({
				name: f.name,
				model,
				presetSel: model.presets[0]?.name ?? null,
			});
		} catch {
			error = t("compare.invalid", { name: f.name });
		}
	}
	input.value = "";
}

const sortedIds = (list) =>
	[...list].sort((a, b) => a - b).join(", ") || t("compare.none");
</script>

<div class="space-y-3">
  <div>
    <h3 class="text-sm font-semibold text-app-text">{t('compare.heading')}</h3>
    <p class="text-[11px] text-app-muted mt-0.5">{t('compare.help')}</p>
  </div>

  <!-- File loading -->
  <div class="flex flex-wrap items-center gap-1.5">
    <label class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer">
      + {t('compare.load')}
      <input type="file" accept=".yaml,.yml" multiple onchange={onFiles} class="sr-only" />
    </label>
    {#each files as file, i}
      <span class="flex items-center gap-1 text-[11px] border border-app-border rounded px-2 py-1 font-mono">
        {file.name}
        <button
          onclick={() => files.splice(i, 1)}
          class="text-red-400 hover:text-red-300 px-0.5"
          aria-label={t('compare.removeFile')}
          title={t('compare.removeFile')}
        >✕</button>
      </span>
    {/each}
  </div>
  {#if error}
    <p class="text-[11px] text-red-400" role="alert">{error}</p>
  {/if}

  {#if files.length === 0}
    <p class="text-[11px] text-app-muted border border-dashed border-app-border rounded p-3">{t('compare.emptyHint')}</p>
  {:else}
    <!-- Profile-level settings -->
    <div class="bg-app-panel2 border border-app-border rounded p-2.5">
      <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5">{t('compare.settings')}</h4>
      <div class="overflow-x-auto">
        <table class="w-full text-[11px] border-collapse">
          <thead>
            <tr class="text-left text-app-muted">
              <th scope="col" class="py-1 pr-3 font-semibold whitespace-nowrap">{t('compare.setting')}</th>
              {#each columns as col}
                <th scope="col" class="py-1 pr-3 font-semibold min-w-[160px]">{col.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each SETTING_ROWS as [labelKey, fn]}
              {@const values = columns.map((c) => fn(c.model))}
              {@const diff = differs(values)}
              <tr class="border-t border-app-border align-top {diff ? 'bg-amber-500/10' : ''}" title={diff ? t('compare.differs') : undefined}>
                <th scope="row" class="py-1 pr-3 font-medium text-left whitespace-nowrap {diff ? 'text-amber-500' : 'text-app-muted'}">{t(labelKey)}</th>
                {#each values as v}
                  <td class="py-1 pr-3">{v || t('compare.none')}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Preset vs preset -->
    <div class="bg-app-panel2 border border-app-border rounded p-2.5">
      <h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-0.5">{t('compare.presetCompare')}</h4>
      <p class="text-[10px] text-app-muted mb-1.5">{t('compare.presetCompareHelp')}</p>
      <div class="overflow-x-auto">
        <table class="w-full text-[11px] border-collapse">
          <thead>
            <tr class="text-left text-app-muted">
              <th scope="col" class="py-1 pr-3 font-semibold whitespace-nowrap">{t('compare.preset')}</th>
              {#each columns as col}
                <th scope="col" class="py-1 pr-3 min-w-[160px]">
                  <select
                    value={selectedPreset(col)?.name}
                    onchange={(e) => setSelected(col, e.currentTarget.value)}
                    class="w-full bg-app-bg border border-app-border rounded px-1.5 py-1 text-[11px] font-normal focus:outline-none focus:border-app-accent"
                    aria-label={`${t('compare.preset')} — ${col.label}`}
                  >
                    {#each col.model.presets as p}
                      <option value={p.name}>{stripEveMarkup(p.name)}</option>
                    {/each}
                  </select>
                </th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each [['compare.filtered', 'filteredStates'], ['compare.alwaysShown', 'alwaysShownStates']] as [labelKey, field]}
              {@const values = columns.map((c) => sortedIds(selectedPreset(c)?.[field] ?? []))}
              {@const diff = differs(values)}
              <tr class="border-t border-app-border align-top {diff ? 'bg-amber-500/10' : ''}">
                <th scope="row" class="py-1 pr-3 font-medium text-left whitespace-nowrap {diff ? 'text-amber-500' : 'text-app-muted'}">{t(labelKey)}</th>
                {#each values as v}
                  <td class="py-1 pr-3">{v}</td>
                {/each}
              </tr>
            {/each}
            <tr class="border-t border-app-border">
              <th scope="row" class="py-1 pr-3 font-medium text-left whitespace-nowrap text-app-muted">{t('compare.groupCount')}</th>
              {#each columns as col}
                <td class="py-1 pr-3 font-mono">{selectedPreset(col)?.groups.length ?? 0}</td>
              {/each}
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Union of selected groups: ✓ per profile -->
      <div class="mt-2 max-h-[50vh] overflow-y-auto overflow-x-auto border border-app-border rounded">
        <table class="w-full text-[11px] border-collapse">
          <thead class="sticky top-0 bg-app-panel2">
            <tr class="text-left text-app-muted">
              <th scope="col" class="py-1 px-2 font-semibold">{t('compare.group')}</th>
              {#each columns as col}
                <th scope="col" class="py-1 px-2 font-semibold min-w-[100px]">{col.label}</th>
              {/each}
            </tr>
          </thead>
          <tbody>
            {#each unionGroups as id (id)}
              {@const marks = columns.map((c) => selectedPreset(c)?.groups.includes(id) ?? false)}
              <tr class="border-t border-app-border {differs(marks) ? 'bg-amber-500/10' : ''}">
                <th scope="row" class="py-0.5 px-2 font-normal text-left whitespace-nowrap">
                  <span class="font-mono text-app-muted">{id}</span>
                  {groupName(id)}
                </th>
                {#each marks as has}
                  <td class="py-0.5 px-2 {has ? 'text-emerald-400' : 'text-app-muted'}">{has ? '✓' : '—'}</td>
                {/each}
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}
</div>
