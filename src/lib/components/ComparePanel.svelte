<!--
  @component
  Side-by-side profile comparison. Columns are the current working profile
  plus loaded overview files (uploads, drag-and-drop, or bundled bases).

  Three sections, coarse to fine, each collapsible by its own eye:
   1. Preset inventory — every preset on either side, paired and classified
      (new upstream / only yours / identical / changed). This is the "where am
      I falling behind" view; the two below answer "how".
   2. Profile settings — differing rows highlighted.
   3. Preset vs preset — one preset picked per profile, then the union of
      their groups with a per-profile check/dash matrix.

  Pairing ignores EVE colour markup, because packs restyle preset names
  between releases (see utils/presets.js). Picking a preset in one column
  pulls the others onto its counterpart, so the detail table opens on a real
  pair rather than on whatever happened to be first in each list.

  Sizing: the tables are fluid. Every one is `w-full table-fixed` over the
  same colgroup — a fixed label column, the rest split evenly by calc() — so
  they fill the panel at any width and compress as more files load, and the
  three stay column-aligned with each other. Only when the columns would fall
  below PROFILE_MIN does the shared wrapper's min-width kick in and hand the
  outer container a horizontal scrollbar. Every table sits in its own
  scrollbar-gutter:stable box so that the one table which *does* scroll
  vertically cannot end up narrower than the two that do not.

  Loaded files live in module state so they survive section switches (a
  reload starts fresh).
-->
<script module>
let files = $state([]);
let currentSel = $state("");
</script>

<script>
	import { t } from "$lib/i18n/strings.svelte.js";
	import { customiser } from "$lib/stores/customiserStore.svelte";
	import { parseOverviewYaml, stripEveMarkup } from "$lib/utils/eveFormat";
	import { NO_MATCH, diffPresets, presetMatcher } from "$lib/utils/presets";

	let { onguide } = $props();

	let error = $state("");
	let dragOver = $state(false);
	/** Per-setting-row "show more" toggles for long value lists. */
	let expanded = $state({});
	/** Which loaded file the inventory compares the working profile against. */
	let againstIndex = $state(0);
	/** Inventory status filter — one of STATUSES, or "" for everything. */
	let statusFilter = $state("");
	/** Hide group rows every profile agrees on. */
	let diffOnly = $state(false);

	// Collapse state lives in the store with the other panel eyes, so it
	// persists with the rest of the layout instead of resetting every visit.
	const hidden = $derived(customiser.hiddenPanels);

	const LABEL_COL = 176; // px — the row-label column, fixed at every width
	const PROFILE_MIN = 150; // px — squeeze a profile column no further than this

	const BUNDLED = [
		["zs_full_v10.06.09", "app.loadZsFull"],
		["zs_full_v9.00.0347", "app.loadZsFullLegacy"],
		["fenris_default_v24.01", "app.loadFenris"],
	];

	// [status, label key, tailwind text colour] — offered most actionable
	// first: what you are missing, then what moved under you.
	const STATUSES = [
		["onlyB", "compare.statusOnlyB", "text-app-added"],
		["differs", "compare.statusDiffers", "text-app-changed"],
		["onlyA", "compare.statusOnlyA", "text-app-mine"],
		["same", "compare.statusSame", "text-app-muted"],
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

	/** Below this the columns stop compressing and the container scrolls. */
	const minWidth = $derived(LABEL_COL + columns.length * PROFILE_MIN);
	/** Width of one profile column: whatever is left over, split evenly. */
	const profileWidth = $derived(
		`calc((100% - ${LABEL_COL}px) / ${columns.length})`,
	);

	function differs(values) {
		return new Set(values).size > 1;
	}

	/* ------------------------------ inventory ------------------------------ */

	const against = $derived(files[againstIndex] ?? files[0] ?? null);

	const inventory = $derived(
		against ? diffPresets(customiser.model.presets, against.model.presets) : [],
	);

	const statusCounts = $derived(
		inventory.reduce((acc, row) => {
			acc[row.status] = (acc[row.status] ?? 0) + 1;
			return acc;
		}, {}),
	);

	const inventoryRows = $derived(
		statusFilter ? inventory.filter((r) => r.status === statusFilter) : inventory,
	);

	const statusMeta = (status) => STATUSES.find(([s]) => s === status);

	/** Open a row's pair in the preset-vs-preset table below. */
	function openPair(row) {
		if (row.a) currentSel = row.a.name;
		if (row.b && against) against.presetSel = row.b.name;
		// Following a row into a section the user has collapsed would look like
		// the click did nothing.
		if (hidden.cmpPresets) customiser.togglePanel("cmpPresets");
	}

	/* --------------------------- preset vs preset --------------------------- */

	function selectedPreset(col) {
		const presets = col.model.presets;
		const sel = col.fileIndex == null ? currentSel : files[col.fileIndex].presetSel;
		return presets.find((p) => p.name === sel) ?? presets[0] ?? null;
	}

	/**
	 * Pick a preset in one column and pull every other column onto its
	 * counterpart. A column with no counterpart keeps what it had — moving it
	 * to an unrelated preset would be worse than leaving it put.
	 */
	function setSelected(col, name) {
		if (col.fileIndex == null) currentSel = name;
		else files[col.fileIndex].presetSel = name;

		for (const other of columns) {
			if (other.fileIndex === col.fileIndex) continue;
			const i = presetMatcher(other.model.presets)(name);
			if (i === NO_MATCH) continue;
			const paired = other.model.presets[i].name;
			if (other.fileIndex == null) currentSel = paired;
			else files[other.fileIndex].presetSel = paired;
		}
	}

	const groupName = (id) =>
		customiser.sdeMatrix?.groups?.[id]?.name ?? `Group ${id}`;

	// Union of every group selected by any chosen preset, sorted by SDE name,
	// each carrying its per-profile marks so rows can be filtered on whether
	// the profiles actually disagree.
	const groupRows = $derived.by(() => {
		const ids = new Set();
		for (const col of columns) {
			for (const g of selectedPreset(col)?.groups ?? []) ids.add(g);
		}
		return [...ids]
			.sort((a, b) => groupName(a).localeCompare(groupName(b)))
			.map((id) => {
				const marks = columns.map(
					(c) => selectedPreset(c)?.groups.includes(id) ?? false,
				);
				return { id, marks, differs: differs(marks) };
			});
	});

	const differingGroupCount = $derived(groupRows.filter((r) => r.differs).length);

	const shownGroupRows = $derived(
		diffOnly ? groupRows.filter((r) => r.differs) : groupRows,
	);

	/* ------------------------------ file loading ---------------------------- */

	/** Add a parsed model unless a file with that name is already loaded. */
	function addModel(name, model) {
		if (files.some((f) => f.name === name)) return;
		// A newly loaded file starts paired to whatever is already on screen,
		// so the detail table below opens on a real pair.
		const i = presetMatcher(model.presets)(
			selectedPreset(columns[0])?.name ?? "",
		);
		files.push({
			name,
			model,
			presetSel:
				i === NO_MATCH ? (model.presets[0]?.name ?? null) : model.presets[i].name,
		});
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

	function removeFile(i) {
		files.splice(i, 1);
		if (againstIndex >= files.length) againstIndex = Math.max(0, files.length - 1);
	}

	const sortedIds = (list) =>
		[...list].sort((a, b) => a - b).join(", ") || t("compare.none");
</script>

{#snippet colWidths()}
	<colgroup>
		<col style="width:{LABEL_COL}px" />
		{#each columns as _}
			<col style="width:{profileWidth}" />
		{/each}
	</colgroup>
{/snippet}

<!-- Section chrome: the title, an optional trailing control, and the eye that
     collapses the body. The header always stays, so a collapsed section is
     one click from coming back without needing a separate restore bar. -->
{#snippet sectionHead(titleKey, panelKey)}
	<h4 class="text-[10px] uppercase tracking-wider text-app-muted">
		{t(titleKey)}
	</h4>
	<button
		onclick={() => customiser.togglePanel(panelKey)}
		aria-expanded={!hidden[panelKey]}
		aria-label={hidden[panelKey] ? t("compare.showSection") : t("compare.hideSection")}
		title={hidden[panelKey] ? t("compare.showSection") : t("compare.hideSection")}
		class="shrink-0 text-app-muted hover:text-app-text transition-colors p-0.5 -m-0.5"
	>
		<svg
			viewBox="0 0 24 24"
			class="w-4 h-4"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
			<circle cx="12" cy="12" r="3" />
			{#if hidden[panelKey]}<line x1="1" y1="1" x2="23" y2="23" />{/if}
		</svg>
	</button>
{/snippet}

<div class="space-y-3">
	<div class="flex items-start justify-between gap-2">
		<div>
			<h3 class="text-sm font-semibold text-app-text">{t("compare.heading")}</h3>
			<p class="text-[11px] text-app-muted mt-0.5">{t("compare.help")}</p>
		</div>
		<button
			onclick={() => onguide?.()}
			aria-label={t("compare.guide")}
			title={t("compare.guide")}
			class="shrink-0 w-6 h-6 grid place-items-center rounded-full border border-app-border text-app-muted hover:text-app-accent hover:border-app-accent transition-colors text-xs font-bold"
		>?</button>
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
					onclick={() => removeFile(i)}
					class="text-app-removed hover:opacity-70 px-0.5"
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
		<p class="text-[11px] text-app-removed" role="alert">{error}</p>
	{/if}

	{#if files.length > 0}
		<!-- Preset inventory: the roll-up. Pairwise by nature, so it sits outside
		     the shared N-column scroll container below. -->
		<div class="bg-app-panel2 border border-app-border rounded p-2.5">
			<div class="flex flex-wrap items-center justify-between gap-2">
				{@render sectionHead("compare.inventory", "cmpInventory")}
			</div>

			{#if !hidden.cmpInventory}
				<div class="flex flex-wrap items-baseline justify-between gap-2 mt-1">
					<p class="text-[10px] text-app-muted flex-1 min-w-[16rem]">
						{t("compare.inventoryHelp")}
					</p>
					{#if files.length > 1}
						<label class="flex items-center gap-1.5 text-[10px] text-app-muted">
							{t("compare.inventoryAgainst")}
							<select
								bind:value={againstIndex}
								class="bg-app-bg border border-app-border rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:border-app-accent"
							>
								{#each files as file, i}
									<option value={i}>{file.name}</option>
								{/each}
							</select>
						</label>
					{/if}
				</div>

				<!-- The status filter doubles as the summary: the counts are the answer
				     to "how far behind am I", so they belong on the buttons. -->
				<div
					class="flex flex-wrap gap-1.5 my-2"
					role="group"
					aria-label={t("compare.statusFilter")}
				>
					<button
						onclick={() => (statusFilter = "")}
						aria-pressed={statusFilter === ""}
						class="text-[10px] border rounded px-2 py-1 transition-colors {statusFilter === ''
							? 'border-app-accent text-app-accent'
							: 'border-app-border text-app-muted hover:border-app-accent'}"
					>
						{t("compare.statusAll")}
						<span class="font-mono">{inventory.length}</span>
					</button>
					{#each STATUSES as [status, labelKey, tone]}
						<button
							onclick={() => (statusFilter = statusFilter === status ? "" : status)}
							aria-pressed={statusFilter === status}
							class="text-[10px] border rounded px-2 py-1 transition-colors {tone} {statusFilter ===
							status
								? 'border-app-accent'
								: 'border-app-border hover:border-app-accent'}"
						>
							{t(labelKey)}
							<span class="font-mono">{statusCounts[status] ?? 0}</span>
						</button>
					{/each}
				</div>

				{#if inventoryRows.length === 0}
					<p class="text-[11px] text-app-muted py-2">{t("compare.inventoryEmpty")}</p>
				{:else}
					<div class="max-h-vh overflow-y-auto [scrollbar-gutter:stable]" style="--vh-pct: 42">
						<table class="w-full text-[11px] border-collapse">
							<thead class="sticky top-0 bg-app-panel2 z-10">
								<tr class="text-left text-app-muted border-b border-app-border">
									<th scope="col" class="py-1 pr-3 font-semibold">{t("compare.preset")}</th>
									<th scope="col" class="py-1 pr-3 font-semibold w-28">{t("compare.status")}</th>
									<th scope="col" class="py-1 pr-3 font-semibold w-16 text-right"
										>{t("compare.inventoryMine")}</th>
									<th scope="col" class="py-1 pr-3 font-semibold w-16 text-right"
										>{t("compare.inventoryTheirs")}</th>
									<th scope="col" class="py-1 font-semibold w-28">{t("compare.groupDelta")}</th>
								</tr>
							</thead>
							<tbody>
								{#each inventoryRows as row (row.key)}
									{@const meta = statusMeta(row.status)}
									<tr
										class="border-t border-app-border hover:bg-app-accent/5 {row.status ===
										'differs'
											? 'bg-app-changed/5'
											: ''}"
									>
										<th scope="row" class="py-0.5 pr-3 font-normal text-left break-words">
											<button
												onclick={() => openPair(row)}
												class="text-left hover:text-app-accent hover:underline"
												title={t("compare.openPair")}>{stripEveMarkup(row.name)}</button>
										</th>
										<td class="py-0.5 pr-3 {meta[2]}">{t(meta[1])}</td>
										<td class="py-0.5 pr-3 text-right font-mono"
											>{row.a ? row.a.groups.length : t("compare.none")}</td>
										<td class="py-0.5 pr-3 text-right font-mono"
											>{row.b ? row.b.groups.length : t("compare.none")}</td>
										<td class="py-0.5 font-mono">
											{#if row.added.length}
												<span
													class="text-app-added"
													title={t("compare.addedHelp", { n: row.added.length })}
													>+{row.added.length}</span>
											{/if}
											{#if row.removed.length}
												<span
													class="text-app-removed ml-1.5"
													title={t("compare.removedHelp", { n: row.removed.length })}
													>−{row.removed.length}</span>
											{/if}
											{#if row.statesMoved}
												<span
													class="text-app-changed ml-1.5"
													title={t("compare.statesMovedHelp")}
													>{t("compare.statesMovedShort")}</span>
											{/if}
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{/if}
			{/if}
		</div>

		<!-- One shared horizontal scroll container. Every table inside is
		     `w-full table-fixed` over the same colgroup, so they fill the panel
		     and stay aligned with each other; the wrapper's min-width is the
		     floor below which the columns stop compressing and this scrolls. -->
		<div class="overflow-x-auto">
			<div class="space-y-3" style="min-width:{minWidth}px">
				<!-- Profile-level settings -->
				<div class="bg-app-panel2 border border-app-border rounded p-2.5">
					<div class="flex items-center justify-between gap-2 mb-1.5">
						{@render sectionHead("compare.settings", "cmpSettings")}
					</div>
					{#if !hidden.cmpSettings}
						<!-- Not scrollable in practice (11 rows), but it reserves the same
						     scrollbar gutter as the group table below, which is the only
						     way the two stay exactly column-aligned once that one scrolls. -->
						<div class="overflow-y-auto [scrollbar-gutter:stable]">
							<table class="w-full text-[11px] border-collapse table-fixed">
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
											class="border-t border-app-border align-top {diff
												? 'bg-app-changed/10'
												: ''}"
											title={diff ? t("compare.differs") : undefined}
										>
											<th
												scope="row"
												class="py-1 pr-3 font-medium text-left align-top {diff
													? 'text-app-changed'
													: 'text-app-muted'}"
											>
												{t(labelKey)}
												{#if long}
													<button
														onclick={() => (expanded[labelKey] = !expanded[labelKey])}
														class="block text-[10px] text-app-accent hover:underline font-normal"
														>{expanded[labelKey]
															? t("compare.showLess")
															: t("compare.showMore")}</button>
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
					{/if}
				</div>

				<!-- Preset vs preset -->
				<div class="bg-app-panel2 border border-app-border rounded p-2.5">
					<div class="flex items-center justify-between gap-2">
						{@render sectionHead("compare.presetCompare", "cmpPresets")}
					</div>
					{#if !hidden.cmpPresets}
						<p class="text-[10px] text-app-muted mt-0.5 mb-1.5">
							{t("compare.presetCompareHelp")}
						</p>
						<div class="overflow-y-auto [scrollbar-gutter:stable]">
							<table class="w-full text-[11px] border-collapse table-fixed">
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
										<tr
											class="border-t border-app-border align-top {diff
												? 'bg-app-changed/10'
												: ''}"
										>
											<th
												scope="row"
												class="py-1 pr-3 font-medium text-left {diff
													? 'text-app-changed'
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
						</div>

						<!-- The single most useful control in this section on a 500-row
						     matrix, so it reads as a toggle button rather than a
						     checkbox lost under a table. -->
						<button
							onclick={() => (diffOnly = !diffOnly)}
							aria-pressed={diffOnly}
							class="flex items-center gap-2 mt-2 text-[11px] font-semibold border rounded px-2.5 py-1.5 transition-colors {diffOnly
								? 'border-app-accent text-app-accent bg-app-accent/10'
								: 'border-app-border text-app-muted hover:border-app-accent hover:text-app-text'}"
						>
							<span aria-hidden="true" class="font-mono">{diffOnly ? "◉" : "○"}</span>
							{t("compare.diffOnly")}
							<span class="font-mono opacity-80"
								>{differingGroupCount}/{groupRows.length}</span>
						</button>

						<!-- Union of selected groups: a mark per profile. Vertical scroll
						     only — horizontal scrolling is owned by the shared outer
						     container. -->
						<div
							class="mt-1.5 max-h-vh overflow-y-auto [scrollbar-gutter:stable]"
							style="--vh-pct: 50"
						>
							<table class="w-full text-[11px] border-collapse table-fixed">
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
									{#each shownGroupRows as row (row.id)}
										<tr
											class="border-t border-app-border {row.differs
												? 'bg-app-changed/10'
												: ''}"
										>
											<th scope="row" class="py-0.5 pr-3 font-normal text-left break-words">
												<span class="font-mono text-app-muted">{row.id}</span>
												{groupName(row.id)}
											</th>
											{#each row.marks as has}
												<td class="py-0.5 pr-3 {has ? 'text-app-added' : 'text-app-muted'}"
													>{has ? "✓" : "—"}</td>
											{/each}
										</tr>
									{/each}
								</tbody>
							</table>
							{#if shownGroupRows.length === 0}
								<p class="text-[11px] text-app-muted py-2">{t("compare.groupsAllSame")}</p>
							{/if}
						</div>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>
