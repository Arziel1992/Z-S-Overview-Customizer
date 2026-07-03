/**
 * Central reactive store for the Z-S Overview Customiser (singleton).
 *
 * This is the single source of truth the whole app reads and mutates:
 *
 *  - The **profile model** — a 1:1 normalized mirror of an EVE overview .yaml
 *    (presets, tabs, columns, flag/background priorities, blink/colour maps,
 *    ship labels, userSettings). All states are keyed by the client's *integer*
 *    state ids (see stateMatrix.js); nothing here invents its own taxonomy.
 *  - The **SDE matrix** — the categories→groups→types lookup fetched at
 *    startup, used by the group browser.
 *  - The **preview roster** — user-defined mock entities that the live
 *    OverviewWindow / SpaceBrackets render through `resolveEntity()`.
 *  - **UI preferences** — theme, zoom scale, base-profile name, first-run flag
 *    — persisted to localStorage alongside the working-session YAML.
 *
 * All YAML I/O goes through eveFormat.js; "apply on top" imports go through
 * merge.js. Every field is Svelte 5 `$state`, so components mutate the store
 * directly (e.g. `customiser.flagOrder = …`) and the UI follows.
 */

import { resolveStateColor, STATES } from "$lib/data/stateMatrix";
import { parseOverviewYaml, serializeOverviewYaml } from "$lib/utils/eveFormat";
import { mergeModel } from "$lib/utils/merge";

// localStorage keys. SESSION_KEY holds the full working profile as YAML —
// reusing the export format means session restore exercises the same codec
// path as a user import (one format, no second serialisation scheme).
// The EVE client now exposes up to 20 overview tabs (historically 8). This is
// the single source of truth for the cap — UI and store both read it.
export const MAX_TABS = 20;

const THEME_KEY = "zs-overview-theme";
const SCALE_KEY = "zs-overview-scale";
const SESSION_KEY = "zs-overview-session";
const BASE_KEY = "zs-overview-base";
// v2: sample rosters were reworked (easter-egg pilots, real asteroid belt).
// Bumping the key refreshes the built-ins; user-made groupings migrate over.
const SETS_KEY = "zs-overview-rostersets-v2";
const SETS_KEY_V1 = "zs-overview-rostersets";

/**
 * Default preview roster so the renderer is populated on first load.
 * Covers the interesting cases out of the box: a fleet/corp friendly (11+18),
 * a war target (52), a neutral NPC (9), a criminal outlaw (13+44), and a
 * stateless celestial (stargate) that only group filters can show/hide.
 * Pilot names throughout the samples are a tip of the hat to New Eden. o7
 */
function seedRoster() {
	return [
		{
			id: 1,
			pilotName: "Zirio",
			shipName: "Whirlwind",
			type: "Rifter",
			typeId: 587,
			groupId: 25,
			corp: "PROMP",
			alliance: "Z-S",
			faction: "—",
			militia: "—",
			size: "S",
			states: [11, 18],
			distance: 14250,
			velocity: 340,
			radial: -120,
			transversal: 318,
			angular: 0.042,
		},
		{
			id: 2,
			pilotName: "The Mittani",
			shipName: "Sins of a Solar Spymaster",
			type: "Rupture",
			typeId: 629,
			groupId: 26,
			corp: "GoonWaffe",
			alliance: "CONDI",
			faction: "—",
			militia: "—",
			size: "M",
			states: [52],
			distance: 28910,
			velocity: 120,
			radial: 10,
			transversal: 119,
			angular: 0.004,
		},
		{
			id: 3,
			pilotName: "Guristas Scout",
			shipName: "",
			type: "Pithi Arrogator",
			typeId: 16981,
			groupId: 615,
			corp: "Guristas",
			alliance: "—",
			faction: "Guristas",
			militia: "—",
			size: "S",
			states: [9],
			distance: 45210,
			velocity: 450,
			radial: -450,
			transversal: 0,
			angular: 0.0,
		},
		{
			id: 4,
			pilotName: "Rixx Javix",
			shipName: "Stay Frosty",
			type: "Federation Navy Comet",
			typeId: 17841,
			groupId: 25,
			corp: "Stay Frosty.",
			alliance: "ABA",
			faction: "—",
			militia: "—",
			size: "S",
			states: [13, 44],
			distance: 5420,
			velocity: 280,
			radial: -180,
			transversal: 214,
			angular: 0.061,
		},
		{
			id: 5,
			pilotName: "Suitonia",
			shipName: "EVE is Easy",
			type: "Kestrel",
			typeId: 602,
			groupId: 25,
			corp: "—",
			alliance: "—",
			faction: "—",
			militia: "—",
			size: "S",
			states: [50],
			distance: 61200,
			velocity: 780,
			radial: -620,
			transversal: 95,
			angular: 0.002,
		},
		{
			id: 6,
			pilotName: "—",
			shipName: "",
			type: "Stargate (Caldari System)",
			typeId: 16,
			groupId: 10,
			corp: "—",
			alliance: "—",
			faction: "—",
			militia: "—",
			size: "XL",
			states: [],
			distance: 152400000,
			velocity: 0,
			radial: 0,
			transversal: 0,
			angular: 0,
		},
	];
}

/**
 * Built-in rapid-populate samples: named entity groupings covering the main
 * overview use cases across the full SDE category range (ships, NPCs,
 * asteroids, Upwell/sov structures, drones, deployables, wrecks). They seed
 * the persisted roster-set list on first run; after that the user owns them —
 * every set (sample or saved) can be renamed, overwritten or deleted.
 * Entities are partial: addEntity() fills the remaining fields.
 */
function sampleSets() {
	return [
		{
			name: "Fleet skirmish",
			entities: seedRoster().map(({ id, ...rest }) => rest),
		},
		{
			name: "Mining fleet",
			entities: [
				{
					pilotName: "—",
					type: "Veldspar",
					typeId: 1230,
					groupId: 462,
					size: "S",
					distance: 12800,
				},
				{
					pilotName: "—",
					type: "Scordite",
					typeId: 1228,
					groupId: 460,
					size: "S",
					distance: 14100,
				},
				{
					pilotName: "—",
					type: "Plagioclase",
					typeId: 18,
					groupId: 458,
					size: "S",
					distance: 15600,
				},
				{
					pilotName: "—",
					type: "Pyroxeres",
					typeId: 1224,
					groupId: 459,
					size: "S",
					distance: 16900,
				},
				{
					pilotName: "—",
					type: "Kernite",
					typeId: 20,
					groupId: 457,
					size: "S",
					distance: 17700,
				},
				{
					pilotName: "—",
					type: "Bezdnacine",
					typeId: 52316,
					groupId: 4031,
					size: "S",
					distance: 18400,
				},
				{
					pilotName: "Chribba",
					shipName: "Veldnaught",
					type: "Revelation",
					typeId: 19720,
					groupId: 485,
					corp: "Otherworld Enterprises",
					size: "XL",
					distance: 12950,
					velocity: 0,
				},
				{
					pilotName: "Kismeteer",
					shipName: "Ore Hound",
					type: "Retriever",
					typeId: 17478,
					groupId: 463,
					corp: "PROMP",
					alliance: "Z-S",
					size: "M",
					states: [11, 12],
					distance: 9200,
					velocity: 15,
				},
				{
					pilotName: "Deuce Syundai",
					type: "Hulk",
					typeId: 22544,
					groupId: 543,
					corp: "PROMP",
					alliance: "Z-S",
					size: "M",
					states: [11],
					distance: 11300,
					velocity: 20,
				},
				{
					pilotName: "Tomas Iridium",
					type: "Orca",
					typeId: 28606,
					groupId: 941,
					corp: "PROMP",
					alliance: "Z-S",
					size: "L",
					states: [11, 14],
					distance: 14000,
					velocity: 5,
				},
				{
					pilotName: "Shadoo",
					type: "Stabber",
					typeId: 622,
					groupId: 26,
					corp: "SNIGG",
					alliance: "PL",
					size: "M",
					states: [50],
					distance: 52000,
					velocity: 950,
				},
			],
		},
		{
			name: "Structure bash",
			entities: [
				{
					pilotName: "—",
					type: "Astrahus",
					typeId: 35832,
					groupId: 1657,
					size: "XL",
					distance: 38000,
				},
				{
					pilotName: "—",
					type: "Fortizar",
					typeId: 35833,
					groupId: 1657,
					size: "XL",
					distance: 152000,
				},
				{
					pilotName: "—",
					type: "Customs Office",
					typeId: 2233,
					groupId: 1025,
					size: "L",
					distance: 68000,
				},
				{
					pilotName: "—",
					type: "Sovereignty Hub",
					typeId: 32458,
					groupId: 1012,
					size: "L",
					distance: 240000,
				},
				{
					pilotName: "—",
					type: "Orbital Skyhook",
					typeId: 81080,
					groupId: 4736,
					size: "XL",
					distance: 310000,
				},
				{
					pilotName: "Chessur",
					type: "Rupture",
					typeId: 629,
					groupId: 26,
					corp: "BURN",
					alliance: "WAR.",
					size: "M",
					states: [13],
					distance: 21000,
					velocity: 380,
				},
			],
		},
		{
			name: "NPC site",
			entities: [
				{
					pilotName: "Guristas Scout",
					type: "Pithi Arrogator",
					typeId: 16981,
					groupId: 615,
					corp: "Guristas",
					faction: "Guristas",
					size: "S",
					states: [9],
					distance: 24500,
					velocity: 620,
				},
				{
					pilotName: "Guristas Enforcer",
					type: "Pithum Abolisher",
					typeId: 24088,
					groupId: 613,
					corp: "Guristas",
					faction: "Guristas",
					size: "M",
					states: [9],
					distance: 31800,
					velocity: 340,
				},
				{
					pilotName: "—",
					type: "Frigate Wreck",
					typeId: 26557,
					groupId: 186,
					size: "S",
					distance: 8600,
				},
				{
					pilotName: "—",
					type: "Mobile Tractor Unit",
					typeId: 33475,
					groupId: 1250,
					size: "S",
					distance: 2500,
				},
				{
					pilotName: "Zirio",
					type: "Hobgoblin II",
					typeId: 2456,
					groupId: 100,
					corp: "PROMP",
					alliance: "Z-S",
					size: "S",
					states: [11, 12],
					distance: 5100,
					velocity: 400,
				},
				{
					pilotName: "Katia Sae",
					shipName: "Into the Unknown",
					type: "Astero",
					typeId: 33468,
					groupId: 25,
					corp: "Signal Cartel",
					size: "S",
					distance: 87400,
					velocity: 240,
				},
			],
		},
	];
}

class CustomiserStore {
	// --- profile model (mirrors the YAML root keys 1:1) ---
	/** [{ name, alwaysShownStates:[int], filteredStates:[int], groups:[int] }] */
	presets = $state([]);
	/** [{ index:0–19, name (EVE markup), color:[r,g,b]|null, overview, bracket|null }] */
	tabs = $state([]);
	activeTabId = $state(0);
	/** Master left-to-right column order (superset of the active set). */
	columnOrder = $state([]);
	/** Columns actually displayed (subset of columnOrder). */
	overviewColumns = $state([]);
	/** Top-to-bottom priority: first matching id wins. */
	flagOrder = $state([]);
	backgroundOrder = $state([]);
	flagStates = $state([]); // authorized colortag state ids (whitelist)
	backgroundStates = $state([]); // authorized background state ids (whitelist)
	stateBlinks = $state({}); // { 'flag_13': true, ... } — flashing toggles
	stateColors = $state({}); // { 'background_13': 'orange' | '0xAARRGGBB', ... }
	/** Segment order; entries are field names, 'linebreak', or null (spacer). */
	shipLabelOrder = $state([]);
	/** { segmentKey: { type, pre, post, state, bold, italic, underline, fontsize, color } } */
	shipLabels = $state({});
	userSettings = $state([]);

	// --- SDE + preview ---
	sdeMatrix = $state(null);
	/** Unix seconds the bundled SDE matrix was compiled (shown in the header). */
	sdeCompiledAt = $state(null);
	/** True when the matrix fetch failed and the minimal fallback is in use. */
	sdeError = $state(false);
	loading = $state(true);
	roster = $state(seedRoster());
	/** [{ name, entities:[partial entity] }] — samples + user-saved groupings. */
	rosterSets = $state(sampleSets());
	activePresetName = $state(null);

	// --- UI ---
	theme = $state("dark");
	uiScale = $state(1); // zoom factor applied to the whole app
	fontFamily = $state("'Inter', sans-serif");
	baseProfile = $state("zs_core");
	showWelcome = $state(false);

	constructor() {
		const ls = typeof localStorage !== "undefined" ? localStorage : null;
		if (ls) this.theme = ls.getItem(THEME_KEY) || "dark";
		if (ls) this.uiScale = Number(ls.getItem(SCALE_KEY)) || 1;
		this.applyTheme();
		this.fetchSdeMatrix();

		// Roster sets: the stored list (samples included, once touched) wins.
		const sets = ls?.getItem(SETS_KEY);
		if (sets) {
			try {
				this.rosterSets = JSON.parse(sets);
			} catch (e) {
				console.warn("[!] Could not restore roster sets.", e);
			}
		} else if (ls?.getItem(SETS_KEY_V1)) {
			// One-time v1 → v2 migration: fresh built-in samples replace the old
			// ones (same names); everything the user saved themselves carries over.
			try {
				const builtin = new Set(this.rosterSets.map((s) => s.name));
				const own = JSON.parse(ls.getItem(SETS_KEY_V1)).filter(
					(s) => !builtin.has(s.name),
				);
				this.rosterSets = [...this.rosterSets, ...own];
				this.persistRosterSets();
			} catch (e) {
				console.warn("[!] Could not migrate v1 roster sets.", e);
			}
			ls.removeItem(SETS_KEY_V1);
		}

		// Restore the last working session if present; otherwise greet the user.
		const session = ls?.getItem(SESSION_KEY);
		if (session) {
			try {
				this.applyModel(parseOverviewYaml(session));
				this.baseProfile = ls.getItem(BASE_KEY) || "custom";
			} catch (e) {
				console.warn("[!] Could not restore session.", e);
				this.loadPreset("zs_core");
			}
		} else {
			this.loadPreset("zs_core");
			this.showWelcome = true;
		}
	}

	/* -------------------------- theme -------------------------- */
	applyTheme() {
		if (typeof document !== "undefined") {
			document.documentElement.dataset.theme = this.theme;
		}
	}

	toggleTheme() {
		this.theme = this.theme === "dark" ? "light" : "dark";
		if (typeof localStorage !== "undefined")
			localStorage.setItem(THEME_KEY, this.theme);
		this.applyTheme();
	}

	setScale(value) {
		this.uiScale = value;
		if (typeof localStorage !== "undefined")
			localStorage.setItem(SCALE_KEY, String(value));
	}

	/** Persist the current working profile so a reload resumes where it left off. */
	saveSession() {
		if (typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(SESSION_KEY, this.exportYaml());
			localStorage.setItem(BASE_KEY, this.baseProfile);
		} catch (e) {
			console.warn("[!] Session save failed.", e);
		}
	}

	dismissWelcome() {
		this.showWelcome = false;
	}

	/** Reset to a minimal blank profile (one empty preset + one tab). */
	clearAll() {
		this.applyModel({
			presets: [
				{
					name: "New Preset",
					alwaysShownStates: [],
					filteredStates: [],
					groups: [],
				},
			],
			tabs: [
				{
					index: 0,
					name: "Tab 1",
					color: null,
					overview: "New Preset",
					bracket: null,
				},
			],
			columnOrder: ["ICON", "DISTANCE", "NAME", "TYPE"],
			overviewColumns: ["ICON", "DISTANCE", "NAME", "TYPE"],
			flagOrder: [],
			backgroundOrder: [],
			flagStates: [],
			backgroundStates: [],
			stateBlinks: {},
			stateColors: {},
			shipLabelOrder: ["ship type", "pilot name"],
			shipLabels: {
				"ship type": this.defaultLabelConfig("ship type"),
				"pilot name": { ...this.defaultLabelConfig("pilot name"), pre: " - " },
			},
			userSettings: [],
		});
		this.baseProfile = "blank";
	}

	/* -------------------------- loading -------------------------- */
	async fetchSdeMatrix() {
		try {
			const res = await fetch(
				`${import.meta.env.BASE_URL}data/matrix_latest.json`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			this.sdeMatrix = await res.json();
			this.sdeCompiledAt = this.sdeMatrix?.metadata?.compiledAt ?? null;
		} catch (e) {
			console.warn("[!] SDE matrix fetch failed; using minimal fallback.", e);
			this.sdeError = true;
			this.sdeMatrix = {
				categories: {
					6: { name: "Ship", groups: [25, 26, 27] },
					2: { name: "Celestial", groups: [6, 10] },
				},
				groups: {
					6: { name: "Sun", categoryId: 2, types: [6] },
					10: { name: "Stargate", categoryId: 2, types: [29] },
					25: { name: "Frigate", categoryId: 6, types: [587, 588] },
					26: { name: "Cruiser", categoryId: 6, types: [620, 621] },
					27: { name: "Battleship", categoryId: 6, types: [638] },
				},
				types: {
					587: { name: "Rifter", groupId: 25 },
					588: { name: "Slasher", groupId: 25 },
					620: { name: "Rupture", groupId: 26 },
					621: { name: "Stabber", groupId: 26 },
				},
			};
		} finally {
			this.loading = false;
		}
	}

	/**
	 * Load a bundled base profile from public/defaults/ (e.g. "zs_core",
	 * "fenris_default"). Fetch path is BASE_URL-aware for the GitHub Pages
	 * subpath deployment.
	 */
	async loadPreset(presetKey) {
		try {
			const res = await fetch(
				`${import.meta.env.BASE_URL}defaults/${presetKey}.yaml`,
			);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const text = await res.text();
			this.applyModel(parseOverviewYaml(text));
			this.baseProfile = presetKey;
		} catch (err) {
			console.error(`[!] Failed to load profile '${presetKey}'.`, err);
			throw err;
		}
	}

	/**
	 * Replace the whole profile model with a parsed/merged one and reset the
	 * UI cursors (active tab / active preset) to the first entries.
	 */
	applyModel(model) {
		this.presets = model.presets;
		this.tabs = model.tabs;
		this.columnOrder = model.columnOrder;
		this.overviewColumns = model.overviewColumns;
		this.flagOrder = model.flagOrder;
		this.backgroundOrder = model.backgroundOrder;
		this.flagStates = model.flagStates;
		this.backgroundStates = model.backgroundStates;
		this.stateBlinks = model.stateBlinks;
		this.stateColors = model.stateColors;
		this.shipLabelOrder = model.shipLabelOrder;
		this.shipLabels = model.shipLabels;
		this.userSettings = model.userSettings;
		this.activeTabId = this.tabs[0]?.index ?? 0;
		this.activePresetName = this.presets[0]?.name ?? null;
	}

	/** Snapshot of the current profile as a plain model object. */
	get model() {
		return {
			presets: this.presets,
			tabs: this.tabs,
			columnOrder: this.columnOrder,
			overviewColumns: this.overviewColumns,
			flagOrder: this.flagOrder,
			backgroundOrder: this.backgroundOrder,
			flagStates: this.flagStates,
			backgroundStates: this.backgroundStates,
			stateBlinks: this.stateBlinks,
			stateColors: this.stateColors,
			shipLabelOrder: this.shipLabelOrder,
			shipLabels: this.shipLabels,
			userSettings: this.userSettings,
		};
	}

	/** Serialize the current model to a genuine, in-game-importable .yaml string. */
	exportYaml() {
		return serializeOverviewYaml(this.model);
	}

	/**
	 * Import a raw YAML profile. `mode` is "overwrite" (replace everything) or
	 * "merge" (apply on top of the current config, EVE pack-piece style).
	 */
	importYaml(text, mode = "overwrite", label = "custom") {
		const incoming = parseOverviewYaml(text);
		if (mode === "merge") {
			this.applyModel(mergeModel(this.model, incoming));
		} else {
			this.applyModel(incoming);
		}
		this.baseProfile = label;
	}

	/* -------------------------- selectors -------------------------- */
	get activeTab() {
		return this.tabs.find((t) => t.index === this.activeTabId) ?? this.tabs[0];
	}

	get activePreset() {
		return (
			this.presets.find((p) => p.name === this.activePresetName) ??
			this.presets[0]
		);
	}

	presetByName(name) {
		return this.presets.find((p) => p.name === name) ?? null;
	}

	get presetNames() {
		return this.presets.map((p) => p.name);
	}

	/* -------------------------- appearance helpers -------------------------- */
	/**
	 * CSS colour for a state's flag or background. `kind` is 'flag' or
	 * 'background'. Falls back to the state's canonical default colour when the
	 * profile doesn't override it in stateColorsNameList.
	 */
	stateColor(kind, id) {
		const key = `${kind}_${id}`;
		const value = this.stateColors[key] ?? STATES[id]?.color ?? "grey";
		return resolveStateColor(value);
	}

	/** Whether the profile flags this state's flag/background to blink. */
	stateBlink(kind, id) {
		return this.stateBlinks[`${kind}_${id}`] === true;
	}

	setStateColor(kind, id, cssColor) {
		// stateColorsNameList stores hex as 0xAARRGGBB; keep a CSS hex round-trip.
		const hex = cssColor.replace("#", "");
		this.stateColors[`${kind}_${id}`] = `0xff${hex}`;
	}

	toggleBlink(kind, id) {
		const key = `${kind}_${id}`;
		this.stateBlinks[key] = !this.stateBlinks[key];
	}

	/* -------------------------- mutation helpers -------------------------- */
	/** Swap arr[index] with its neighbour (dir = ±1); no-op at the edges. */
	reorder(arr, index, dir) {
		const j = index + dir;
		if (j < 0 || j >= arr.length) return;
		[arr[index], arr[j]] = [arr[j], arr[index]];
	}

	/** Add `value` to the array if absent, remove it if present (checkbox semantics). */
	toggleMember(arr, value) {
		const i = arr.indexOf(value);
		if (i > -1) arr.splice(i, 1);
		else arr.push(value);
	}

	toggleGroupInPreset(groupId, presetName = this.activePresetName) {
		const preset = this.presetByName(presetName);
		if (preset) this.toggleMember(preset.groups, groupId);
	}

	/* -------------------------- preset CRUD -------------------------- */
	// Tabs reference presets BY NAME (that is how the game's tabSetup works),
	// so every operation here keeps tab.overview / tab.bracket consistent:
	// rename cascades, delete remaps.

	/** Derive a name that doesn't collide with any existing preset. */
	uniquePresetName(base) {
		if (!this.presets.some((p) => p.name === base)) return base;
		let i = 2;
		while (this.presets.some((p) => p.name === `${base} ${i}`)) i++;
		return `${base} ${i}`;
	}

	/** Create an empty preset and make it the one being edited. */
	addPreset(name = "New Preset") {
		const unique = this.uniquePresetName(name);
		this.presets.push({
			name: unique,
			alwaysShownStates: [],
			filteredStates: [],
			groups: [],
		});
		this.activePresetName = unique;
		return unique;
	}

	/** Deep-copy a preset (filters and groups included) under a "(copy)" name. */
	duplicatePreset(name = this.activePresetName) {
		const src = this.presetByName(name);
		if (!src) return null;
		const unique = this.uniquePresetName(`${src.name} (copy)`);
		this.presets.push({
			name: unique,
			alwaysShownStates: [...src.alwaysShownStates],
			filteredStates: [...src.filteredStates],
			groups: [...src.groups],
		});
		this.activePresetName = unique;
		return unique;
	}

	/**
	 * Rename a preset and cascade the new name into every tab that points at
	 * it. Returns false (no change) when the name is empty or already taken.
	 */
	renamePreset(oldName, newName) {
		const trimmed = newName?.trim();
		if (!trimmed || trimmed === oldName) return false;
		if (this.presets.some((p) => p.name === trimmed)) return false;
		const preset = this.presetByName(oldName);
		if (!preset) return false;

		preset.name = trimmed;
		for (const tab of this.tabs) {
			if (tab.overview === oldName) tab.overview = trimmed;
			if (tab.bracket === oldName) tab.bracket = trimmed;
		}
		if (this.activePresetName === oldName) this.activePresetName = trimmed;
		return true;
	}

	/**
	 * Delete a preset. Refusing to delete the last one (a profile must keep at
	 * least one preset for its tabs). Tabs that used it fall back: list views
	 * to the first remaining preset, brackets to none (null), matching how a
	 * missing preset would degrade in the client.
	 */
	removePreset(name = this.activePresetName) {
		if (this.presets.length <= 1) return false;
		const i = this.presets.findIndex((p) => p.name === name);
		if (i < 0) return false;

		this.presets.splice(i, 1);
		const fallback = this.presets[0].name;
		for (const tab of this.tabs) {
			if (tab.overview === name) tab.overview = fallback;
			if (tab.bracket === name) tab.bracket = null;
		}
		if (this.activePresetName === name) this.activePresetName = fallback;
		return true;
	}

	/* -------------------------- tabs -------------------------- */
	addTab() {
		if (this.tabs.length >= MAX_TABS) return;
		const index = this.tabs.length
			? Math.max(...this.tabs.map((t) => t.index)) + 1
			: 0;
		this.tabs.push({
			index,
			name: `<b> ${index + 1} </b>`,
			color: null,
			overview: this.presets[0]?.name ?? null,
			bracket: null,
		});
		this.activeTabId = index;
	}

	removeTab(index) {
		if (this.tabs.length <= 1) return;
		const i = this.tabs.findIndex((t) => t.index === index);
		if (i > -1) {
			this.tabs.splice(i, 1);
			if (this.activeTabId === index) this.activeTabId = this.tabs[0].index;
		}
	}

	/** Commit a reordered tab list, renumbering indexes and keeping the active tab. */
	reorderTabs(newOrder) {
		const activePos = newOrder.findIndex((t) => t.index === this.activeTabId);
		this.tabs = newOrder.map((t, i) => ({ ...t, index: i }));
		this.activeTabId = activePos >= 0 ? activePos : (this.tabs[0]?.index ?? 0);
	}

	/* -------------------------- ship labels -------------------------- */
	defaultLabelConfig(type) {
		return {
			type: type === "spacer" ? null : type,
			pre: "",
			post: "",
			state: 1,
			bold: false,
			italic: false,
			underline: false,
			fontsize: null,
			color: null,
		};
	}

	/** Add a label segment (a field type, a 'linebreak', or a 'spacer'). */
	addShipLabel(type) {
		if (type === "spacer") {
			this.shipLabelOrder.push(null);
			if (!this.shipLabels.__null__)
				this.shipLabels.__null__ = this.defaultLabelConfig("spacer");
			return;
		}
		if (type === "linebreak") {
			this.shipLabelOrder.push("linebreak");
			if (!this.shipLabels.linebreak)
				this.shipLabels.linebreak = {
					...this.defaultLabelConfig("linebreak"),
					state: null,
				};
			return;
		}
		// A field label — only one of each type may exist in the order.
		if (!this.shipLabels[type])
			this.shipLabels[type] = this.defaultLabelConfig(type);
		this.shipLabelOrder.push(type);
	}

	removeShipLabelAt(index) {
		this.shipLabelOrder.splice(index, 1);
	}

	/* -------------------------- roster -------------------------- */
	addEntity(entity) {
		const id = this.roster.length
			? Math.max(...this.roster.map((e) => e.id)) + 1
			: 1;
		this.roster.push({
			id,
			pilotName: "New Pilot",
			shipName: "",
			type: "Rifter",
			typeId: 587,
			groupId: 25,
			corp: "—",
			alliance: "—",
			faction: "—",
			militia: "—",
			size: "S",
			states: [],
			distance: 10000,
			velocity: 0,
			radial: 0,
			transversal: 0,
			angular: 0,
			...entity,
		});
	}

	removeEntity(id) {
		const i = this.roster.findIndex((e) => e.id === id);
		if (i > -1) this.roster.splice(i, 1);
	}

	/* -------------------------- roster sets -------------------------- */
	// Rapid-populate groupings. Samples and user-saved sets live in one
	// persisted list, so all of them are loadable, renamable, overwritable
	// and deletable alike.

	persistRosterSets() {
		if (typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(SETS_KEY, JSON.stringify(this.rosterSets));
		} catch (e) {
			console.warn("[!] Roster sets save failed.", e);
		}
	}

	/** Replace the whole roster with a set's entities (rapid populate). */
	loadRosterSet(name) {
		const set = this.rosterSets.find((s) => s.name === name);
		if (!set) return;
		this.roster = [];
		// copy states too, or edits to a loaded entity would mutate the stored set
		for (const e of set.entities)
			this.addEntity({ ...e, states: [...(e.states ?? [])] });
	}

	/** Save the current roster under `name` — new set, or overwrite if taken. */
	saveRosterSet(name) {
		const trimmed = name?.trim();
		if (!trimmed) return false;
		const entities = this.roster.map(({ id, ...rest }) => ({
			...rest,
			states: [...rest.states],
		}));
		const existing = this.rosterSets.find((s) => s.name === trimmed);
		if (existing) existing.entities = entities;
		else this.rosterSets.push({ name: trimmed, entities });
		this.persistRosterSets();
		return true;
	}

	renameRosterSet(oldName, newName) {
		const trimmed = newName?.trim();
		if (!trimmed || trimmed === oldName) return false;
		if (this.rosterSets.some((s) => s.name === trimmed)) return false;
		const set = this.rosterSets.find((s) => s.name === oldName);
		if (!set) return false;
		set.name = trimmed;
		this.persistRosterSets();
		return true;
	}

	deleteRosterSet(name) {
		const i = this.rosterSets.findIndex((s) => s.name === name);
		if (i > -1) {
			this.rosterSets.splice(i, 1);
			this.persistRosterSets();
		}
	}

	/**
	 * Resolve how an entity renders under a given preset — the heart of the
	 * preview, mirroring the EVE client's evaluation rules exactly:
	 *
	 * Visibility precedence:
	 *   1. any entity state ∈ preset.alwaysShownStates → ALWAYS visible
	 *      (supreme override, bypasses everything);
	 *   2. else any state ∈ preset.filteredStates → hidden (absolute veto,
	 *      even when the group is authorised);
	 *   3. else visible iff the entity's groupId ∈ preset.groups.
	 *
	 * Appearance: the winning colortag/background is the FIRST id in
	 * flagOrder/backgroundOrder that the entity carries AND that the
	 * corresponding whitelist (flagStates/backgroundStates) authorises —
	 * evaluation stops at the first match, so list order is everything.
	 *
	 * @returns {{visible:boolean, flagId:?number, bgId:?number,
	 *            flagColor:?string, bgColor:?string,
	 *            flagBlink:boolean, bgBlink:boolean}}
	 */
	resolveEntity(entity, preset) {
		const states = entity.states ?? [];
		let visible;
		const forced = states.some((s) => preset?.alwaysShownStates?.includes(s));
		if (forced) {
			visible = true;
		} else if (states.some((s) => preset?.filteredStates?.includes(s))) {
			visible = false;
		} else {
			visible = preset?.groups?.includes(entity.groupId) ?? false;
		}

		const flagId = this.flagOrder.find(
			(id) => states.includes(id) && this.flagStates.includes(id),
		);
		const bgId = this.backgroundOrder.find(
			(id) => states.includes(id) && this.backgroundStates.includes(id),
		);

		return {
			visible,
			flagId: flagId ?? null,
			bgId: bgId ?? null,
			flagColor: flagId != null ? this.stateColor("flag", flagId) : null,
			bgColor: bgId != null ? this.stateColor("background", bgId) : null,
			flagBlink: flagId != null && this.stateBlink("flag", flagId),
			bgBlink: bgId != null && this.stateBlink("background", bgId),
		};
	}
}

export const customiser = new CustomiserStore();
