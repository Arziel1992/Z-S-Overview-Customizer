<!--
  @component
  Side-by-side profile comparison. Columns are the current working profile
  plus loaded overview files (uploads, drag-and-drop, or bundled bases); the
  first table compares profile-level settings (differing rows highlighted),
  the second drills into preset-vs-preset: one preset picked per profile,
  then the union of every selected group with a per-profile ✓/— matrix.
  All tables share one horizontal scroll container and identical fixed
  column widths so the columns never drift apart; loaded files live in
  module state so they survive section switches (a reload starts fresh).
-->
<script module>
let files = $state([]);
let currentSel = $state("");
</script>

<script>
	import { t } from "$lib/i18n/strings.svelte.js";
	import { customiser } from "$lib/stores/customiserStore.svelte";
	import { parseOverviewYaml, stripEveMarkup } from "$lib/utils/eveFormat";

	let error = $state("");
	let dragOver = $state(false);
	/** Per-setting-row "show more" toggles for long value lists. */
	let expanded = $state({});

	const LABEL_COL = 176; // px — row-label column
	const PROFILE_COL = 224; // px — one column per compared profile

	const BUNDLED = [
		["zs_full_v10.06.09", "app.loadZsFull"],
		["zs_full_v9.00.0347", "app.loadZsFullLegacy"],
		["fenris_default_v24.01", "app.loadFenris"],
	];

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

	const tableWidth = $derived(LABEL_COL + columns.length * PROFILE_COL);

	function selectedPreset(col) {
		const presets = col.model.presets;
		const sel = col.fileIndex == null ? currentSel : files[col.fileIndex].presetSel;
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

	/** Add a parsed model unless a file with that name is already loaded. */
	function addModel(name, model) {
		if (files.some((f) => f.name === name)) return;
		files.push({ name, model, presetSel: model.presets[0]?.name ?? null });
	}

	async function addFileList(list) {
		error = "";
		for (const f of list) {
			if (files.some((x) => x.name === f.name)) continue; // already loaded
			try {
				addModel(f.name, parseOverviewYaml(await f.text()));
			} catch {
				error = t("compare.invalid", { name: f.name });
			}
		}
	}

	async function onFiles(e) {
		const input = e.currentTarget;
		await addFileList(input.files);
		input.value = "";
	}

	async function onDrop(e) {
		e.preventDefault();
		dragOver = false;
		await addFileList(
			[...e.dataTransfer.files].filter((f) => /\.ya?ml$/i.test(f.name)),
		);
	}

	async function addBundled(e) {
		const key = e.currentTarget.value;
		e.currentTarget.value = "";
		if (!key) return;
		const name = t(BUNDLED.find(([k]) => k === key)[1]);
		if (files.some((f) => f.name === name)) return;
		error = "";
		try {
			const res = await fetch(`${import.meta.env.BASE_URL}defaults/${key}.yaml`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			addModel(name, parseOverviewYaml(await res.text()));
		} catch {
			error = t("compare.invalid", { name });
		}
	}

	const sortedIds = (list) =>
		[...list].sort((a, b) => a - b).join(", ") || t("compare.none");
</script>

{#snippet colWidths()}
	<colgroup>
		<col style="width:{LABEL_COL}px" />
		{#each columns as _}
			<col style="width:{PROFILE_COL}px" />
		{/each}
	</colgroup>
{/snippet}

<div class="space-y-3">
	<div>
		<h3 class="text-sm font-semibold text-app-text">{t("compare.heading")}</h3>
		<p class="text-[11px] text-app-muted mt-0.5">{t("compare.help")}</p>
	</div>

	<!-- File loading: upload, bundled bases, loaded-file chips -->
	<div class="flex flex-wrap items-center gap-1.5">
		<label
			class="text-xs bg-app-accent hover:bg-app-accentHover text-white font-semibold px-2.5 py-1 rounded transition-colors cursor-pointer"
		>
			+ {t("compare.load")}
			<input type="file" accept=".yaml,.yml" multiple onchange={onFiles} class="sr-only" />
		</label>
		<select
			value=""
			onchange={addBundled}
			class="text-xs bg-app-bg border border-app-border rounded px-2 py-1 focus:outline-none focus:border-app-accent"
			aria-label={t("compare.bundled")}
		>
			<option value="" disabled>{t("compare.bundled")}</option>
			{#each BUNDLED as [key, labelKey]}
				<option value={key}>{t(labelKey)}</option>
			{/each}
		</select>
		{#each files as file, i}
			<span
				class="flex items-center gap-1 text-[11px] border border-app-border rounded px-2 py-1 font-mono"
			>
				{file.name}
				<button
					onclick={() => files.splice(i, 1)}
					class="text-red-400 hover:text-red-300 px-0.5"
					aria-label={t("compare.removeFile")}
					title={t("compare.removeFile")}
				>✕</button>
			</span>
		{/each}
	</div>

	<!-- Drop zone -->
	<div
		role="region"
		aria-label={t("compare.dropHint")}
		ondragover={(e) => {
			e.preventDefault();
			dragOver = true;
		}}
		ondragleave={() => (dragOver = false)}
		ondrop={onDrop}
		class="border-2 border-dashed rounded p-3 text-center text-[11px] transition-colors {dragOver
			? 'border-app-accent text-app-accent bg-app-accent/5'
			: 'border-app-border text-app-muted'}"
	>
		{t("compare.dropHint")}
	</div>
	{#if error}
		<p class="text-[11px] text-red-400" role="alert">{error}</p>
	{/if}

	{#if files.length > 0}
		<!-- One shared horizontal scroll container: the settings table and the
		     preset-vs-preset tables use identical fixed column widths, so the
		     columns stay perfectly aligned and there is a single h-scrollbar. -->
		<div class="overflow-x-auto">
			<div class="space-y-3" style="width:{tableWidth}px">
				<!-- Profile-level settings -->
				<div class="bg-app-panel2 border border-app-border rounded p-2.5">
					<h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-1.5">
						{t("compare.settings")}
					</h4>
					<table class="text-[11px] border-collapse table-fixed" style="width:{tableWidth}px">
						{@render colWidths()}
						<thead>
							<tr class="text-left text-app-muted">
								<th scope="col" class="py-1 pr-3 font-semibold">{t("compare.setting")}</th>
								{#each columns as col}
									<th scope="col" class="py-1 pr-3 font-semibold break-words">{col.label}</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each SETTING_ROWS as [labelKey, fn]}
								{@const values = columns.map((c) => fn(c.model))}
								{@const diff = differs(values)}
								{@const long = values.some((v) => v.length > 140)}
								<tr
									class="border-t border-app-border align-top {diff ? 'bg-amber-500/10' : ''}"
									title={diff ? t("compare.differs") : undefined}
								>
									<th
										scope="row"
										class="py-1 pr-3 font-medium text-left align-top {diff
											? 'text-amber-500'
											: 'text-app-muted'}"
									>
										{t(labelKey)}
										{#if long}
											<button
												onclick={() => (expanded[labelKey] = !expanded[labelKey])}
												class="block text-[10px] text-app-accent hover:underline font-normal"
											>{expanded[labelKey] ? t("compare.showLess") : t("compare.showMore")}</button>
										{/if}
									</th>
									{#each values as v}
										<td class="py-1 pr-3 break-words">
											<span class={long && !expanded[labelKey] ? "line-clamp-2" : ""}
												>{v || t("compare.none")}</span>
										</td>
									{/each}
								</tr>
							{/each}
						</tbody>
					</table>
				</div>

				<!-- Preset vs preset -->
				<div class="bg-app-panel2 border border-app-border rounded p-2.5">
					<h4 class="text-[10px] uppercase tracking-wider text-app-muted mb-0.5">
						{t("compare.presetCompare")}
					</h4>
					<p class="text-[10px] text-app-muted mb-1.5">{t("compare.presetCompareHelp")}</p>
					<table class="text-[11px] border-collapse table-fixed" style="width:{tableWidth}px">
						{@render colWidths()}
						<thead>
							<tr class="text-left text-app-muted align-top">
								<th scope="col" class="py-1 pr-3 font-semibold">{t("compare.preset")}</th>
								{#each columns as col}
									<th scope="col" class="py-1 pr-3">
										<div class="font-semibold break-words mb-0.5" title={col.label}>
											{col.label}
										</div>
										<select
											value={selectedPreset(col)?.name}
											onchange={(e) => setSelected(col, e.currentTarget.value)}
											class="w-full bg-app-bg border border-app-border rounded px-1.5 py-1 text-[11px] font-normal focus:outline-none focus:border-app-accent"
											aria-label={`${t("compare.preset")} — ${col.label}`}
										>
											{#each [...col.model.presets].sort( (a, b) => stripEveMarkup(a.name).localeCompare(stripEveMarkup(b.name)), ) as p}
												<option value={p.name}>{stripEveMarkup(p.name)}</option>
											{/each}
										</select>
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each [["compare.filtered", "filteredStates"], ["compare.alwaysShown", "alwaysShownStates"]] as [labelKey, field]}
								{@const values = columns.map((c) =>
									sortedIds(selectedPreset(c)?.[field] ?? []),
								)}
								{@const diff = differs(values)}
								<tr class="border-t border-app-border align-top {diff ? 'bg-amber-500/10' : ''}">
									<th
										scope="row"
										class="py-1 pr-3 font-medium text-left {diff
											? 'text-amber-500'
											: 'text-app-muted'}">{t(labelKey)}</th>
									{#each values as v}
										<td class="py-1 pr-3 break-words">{v}</td>
									{/each}
								</tr>
							{/each}
							<tr class="border-t border-app-border">
								<th scope="row" class="py-1 pr-3 font-medium text-left text-app-muted"
									>{t("compare.groupCount")}</th>
								{#each columns as col}
									<td class="py-1 pr-3 font-mono">{selectedPreset(col)?.groups.length ?? 0}</td>
								{/each}
							</tr>
						</tbody>
					</table>

					<!-- Union of selected groups: ✓ per profile. Vertical scroll only —
					     horizontal scrolling is owned by the shared outer container.
					     The wrapper is 20px wider than the table so the vertical
					     scrollbar never eats into the fixed table width (which would
					     spawn a second horizontal scrollbar and break alignment). -->
					<div
						class="mt-2 max-h-vh overflow-y-auto"
						style="--vh-pct: 50; width:{tableWidth + 20}px"
					>
						<table class="text-[11px] border-collapse table-fixed" style="width:{tableWidth}px">
							{@render colWidths()}
							<thead class="sticky top-0 bg-app-panel2 z-10">
								<tr class="text-left text-app-muted border-b border-app-border">
									<th scope="col" class="py-1 pr-3 font-semibold">{t("compare.group")}</th>
									{#each columns as col}
										<th scope="col" class="py-1 pr-3 font-semibold break-words">{col.label}</th>
									{/each}
								</tr>
							</thead>
							<tbody>
								{#each unionGroups as id (id)}
									{@const marks = columns.map(
										(c) => selectedPreset(c)?.groups.includes(id) ?? false,
									)}
									<tr class="border-t border-app-border {differs(marks) ? 'bg-amber-500/10' : ''}">
										<th scope="row" class="py-0.5 pr-3 font-normal text-left break-words">
											<span class="font-mono text-app-muted">{id}</span>
											{groupName(id)}
										</th>
										{#each marks as has}
											<td class="py-0.5 pr-3 {has ? 'text-emerald-400' : 'text-app-muted'}"
												>{has ? "✓" : "—"}</td>
										{/each}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>
