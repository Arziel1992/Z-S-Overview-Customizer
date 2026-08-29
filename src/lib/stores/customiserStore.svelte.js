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
import {
	BRACKET_SHOW_ALL,
	parseOverviewYaml,
	serializeOverviewYaml,
	stripEveMarkup,
} from "$lib/utils/eveFormat";
import { mergeModel } from "$lib/utils/merge";
import {
	ENTITY_DEFAULTS,
	entitySig,
	toStoredEntities,
} from "$lib/utils/roster";
import { resolveVisibility } from "$lib/utils/visibility";

// localStorage keys. SESSION_KEY holds the full working profile as YAML —
// reusing the export format means session restore exercises the same codec
// path as a user import (one format, no second serialisation scheme).
// The EVE client now exposes up to 20 overview tabs (historically 8). This is
// the single source of truth for the cap — UI and store both read it.
export const MAX_TABS = 20;

const THEME_KEY = "zs-overview-theme";
const SCALE_KEY = "zs-overview-scale";
// Workspace layout: the settings/preview split and which panels are collapsed.
const LAYOUT_KEY = "zs-overview-layout";
// Exported so the shell can watch for another tab overwriting it — every tab
// of this site shares the one slot.
export const SESSION_KEY = "zs-overview-session";
const BASE_KEY = "zs-overview-base";
// v3: sample rosters reworked again (signature hulls, mining-fleet logi).
// Bumping the key refreshes the built-ins; user-made groupings migrate over.
const SETS_KEY = "zs-overview-rostersets-v3";
const SETS_KEYS_OLD = ["zs-overview-rostersets-v2", "zs-overview-rostersets"];
// The working roster itself: the entities on screen, plus any unsaved edits
// held per grouping. Editor-style — leaving a grouping (or the tab) never
// costs work, it just keeps reading as unsaved until it is saved.
const ROSTER_KEY = "zs-overview-roster";
/** Draft key for the roster while it belongs to no saved grouping. */
const WORKING_SET = "";

/**
 * Default preview roster so the renderer is populated on first load.
 * Covers the interesting cases out of the box: a fleet/corp friendly (11+18),
 * a war target (52), a neutral NPC (9), a criminal outlaw (13+44), and a
 * stateless celestial (stargate) that only group filters can show/hide.
 * Pilot names throughout the samples are a tip of the hat to New Eden — and
 * the friendly / war-target slots draw randomly from the cast on every load,
 * so repeat visitors eventually meet everyone. o7
 */
function seedRoster() {
	const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
	// Signature hulls per pilot request: Zirio flies a Vargur, Deuce a logi.
	const friendly = pick([
		{
			pilotName: "Zirio",
			shipName: "Whirlwind",
			type: "Vargur",
			typeId: 28665,
			groupId: 900,
			size: "L",
		},
		{
			pilotName: "Kismeteer",
			shipName: "Whirlwind",
			type: "Rifter",
			typeId: 587,
			groupId: 25,
			size: "S",
		},
		{
			pilotName: "Tomas Iridium",
			shipName: "Whirlwind",
			type: "Rifter",
			typeId: 587,
			groupId: 25,
			size: "S",
		},
		pick([
			{
				pilotName: "Deuce Syundai",
				shipName: "Whirlwind",
				type: "Scimitar",
				typeId: 11978,
				groupId: 832,
				size: "M",
			},
			{
				pilotName: "Deuce Syundai",
				shipName: "Whirlwind",
				type: "Basilisk",
				typeId: 11985,
				groupId: 832,
				size: "M",
			},
		]),
	]);
	const warTarget = pick([
		{
			pilotName: "The Mittani",
			shipName: "Sins of a Solar Spymaster",
			type: "Rupture",
			typeId: 629,
			groupId: 26,
			corp: "GoonWaffe",
			alliance: "CONDI",
		},
		{
			pilotName: "Shadoo",
			shipName: "",
			type: "Stabber",
			typeId: 622,
			groupId: 26,
			corp: "SNIGG",
			alliance: "PL",
		},
	]);
	return [
		{
			id: 1,
			...friendly,
			corp: "PROMP",
			alliance: "Z-S",
			faction: "—",
			militia: "—",
			states: [11, 18],
			distance: 14250,
			velocity: 340,
			radial: -120,
			transversal: 318,
			angular: 0.042,
		},
		{
			id: 2,
			...warTarget,
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
					pilotName: "Halada",
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
					pilotName: "Deuce Syundai",
					type: "Basilisk",
					typeId: 11985,
					groupId: 832,
					corp: "PROMP",
					alliance: "Z-S",
					size: "M",
					states: [11],
					distance: 10400,
					velocity: 60,
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

/**
 * Rewrite a master column order from a new sequence of the *visible* columns.
 *
 * The visible ones are dealt back into the positions they already occupied, so
 * columns that are switched off keep their slots instead of drifting to the
 * end. If the master doesn't describe the visible set at all (a hand-edited
 * profile), it is rebuilt from the drag result with the rest kept behind it.
 */
function dealIntoSlots(master, visible) {
	const slots = [];
	master.forEach((c, i) => {
		if (visible.includes(c)) slots.push(i);
	});
	if (slots.length !== visible.length)
		return [...visible, ...master.filter((c) => !visible.includes(c))];
	const next = [...master];
	slots.forEach((slot, k) => {
		next[slot] = visible[k];
	});
	return next;
}

class CustomiserStore {
	// --- profile model (mirrors the YAML root keys 1:1) ---
	/** [{ name, alwaysShownStates:[int], filteredStates:[int], groups:[int] }] */
	presets = $state([]);
	/** [{ index:0–19, name (EVE markup), color:[r,g,b]|null, overview, bracket (preset name or BRACKET_SHOW_ALL), tabColumns:[string]|null, tabColumnOrder:[string]|null }] */
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
	/** Grouping the roster came from; null while it belongs to none. */
	activeSet = $state(null);
	/** { groupingName: entities } — unsaved edits parked per grouping. */
	rosterDrafts = $state({});
	/** Fingerprint of the roster as last loaded or saved (drives the dot). */
	rosterBaseline = $state("");
	activePresetName = $state(null);

	// --- UI ---
	theme = $state("dark");
	uiScale = $state(1); // zoom factor applied to the whole app
	/** Width of the settings panel, in % of the workspace (wide screens only). */
	splitPct = $state(58);
	/**
	 * Panels the user has collapsed; each can be brought back. The four
	 * workspace panels collapse to a bar; the `cmp*` keys are Compare's three
	 * sections, which keep their heading and hide only their body. They share
	 * this map (and so the saved layout) because they are the same gesture.
	 */
	hiddenPanels = $state({
		settings: false,
		brackets: false,
		overview: false,
		roster: false,
		cmpInventory: false,
		cmpSettings: false,
		cmpPresets: false,
	});
	fontFamily = $state("'Inter', sans-serif");
	baseProfile = $state("zs_full_v10.06.09");
	showWelcome = $state(false);

	constructor() {
		const ls = typeof localStorage !== "undefined" ? localStorage : null;
		if (ls) this.theme = ls.getItem(THEME_KEY) || "dark";
		if (ls) this.uiScale = Number(ls.getItem(SCALE_KEY)) || 1;
		const layout = ls?.getItem(LAYOUT_KEY);
		if (layout) {
			try {
				const { splitPct, hiddenPanels } = JSON.parse(layout);
				if (splitPct) this.setSplit(splitPct);
				// Spread over the defaults so a key added in a later version still
				// starts visible rather than undefined.
				if (hiddenPanels)
					this.hiddenPanels = { ...this.hiddenPanels, ...hiddenPanels };
			} catch (e) {
				console.warn("[!] Could not restore workspace layout.", e);
			}
		}
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
		} else if (ls) {
			// One-time migration from an older key: fresh built-in samples replace
			// the old ones (same names); everything the user saved carries over.
			const old = SETS_KEYS_OLD.map((k) => ls.getItem(k)).find(Boolean);
			if (old) {
				try {
					const builtin = new Set(this.rosterSets.map((s) => s.name));
					const own = JSON.parse(old).filter((s) => !builtin.has(s.name));
					this.rosterSets = [...this.rosterSets, ...own];
					this.persistRosterSets();
				} catch (e) {
					console.warn("[!] Could not migrate old roster sets.", e);
				}
				for (const k of SETS_KEYS_OLD) ls.removeItem(k);
			}
		}

		// The working roster, its grouping and any parked drafts.
		const savedRoster = ls?.getItem(ROSTER_KEY);
		if (savedRoster) {
			try {
				const saved = JSON.parse(savedRoster);
				if (Array.isArray(saved.roster) && saved.roster.length)
					this.roster = saved.roster;
				this.activeSet = saved.activeSet ?? null;
				this.rosterDrafts = saved.drafts ?? {};
				this.rosterBaseline = saved.baseline ?? entitySig(this.roster);
			} catch (e) {
				console.warn("[!] Could not restore the preview roster.", e);
			}
		} else {
			// A first-run seed is not unsaved work — nothing has been edited yet.
			this.rosterBaseline = this.rosterSig;
		}

		// Restore the last working session if present; otherwise greet the user.
		const session = ls?.getItem(SESSION_KEY);
		if (session) {
			try {
				this.applyModel(parseOverviewYaml(session));
				this.baseProfile = ls.getItem(BASE_KEY) || "custom";
			} catch (e) {
				console.warn("[!] Could not restore session.", e);
				this.loadPreset("zs_full_v10.06.09");
			}
		} else {
			this.loadPreset("zs_full_v10.06.09");
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

	/* -------------------------- workspace layout -------------------------- */

	/** Move the settings/preview divider, clamped so neither side vanishes. */
	setSplit(pct) {
		this.splitPct = Math.max(25, Math.min(75, Math.round(pct)));
		this.persistLayout();
	}

	/** Collapse a panel to a bar, or bring it back. */
	togglePanel(key) {
		this.hiddenPanels[key] = !this.hiddenPanels[key];
		this.persistLayout();
	}

	persistLayout() {
		if (typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(
				LAYOUT_KEY,
				JSON.stringify({
					splitPct: this.splitPct,
					hiddenPanels: this.hiddenPanels,
				}),
			);
		} catch (e) {
			console.warn("[!] Layout save failed.", e);
		}
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
					bracket: BRACKET_SHOW_ALL,
					tabColumns: null,
					tabColumnOrder: null,
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
	 * Load a bundled base profile from public/defaults/ (e.g.
	 * "zs_full_v10.06.09", "fenris_default_v24.01" — file names carry the
	 * in-game pack/client version). Fetch path is BASE_URL-aware for the
	 * GitHub Pages subpath deployment.
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

	/**
	 * Serialize the current model to a genuine, in-game-importable .yaml string.
	 *
	 * With no options this is the whole profile — what the autosave, the saved
	 * versions and the download all want. `presetNames` narrows it to those
	 * presets, and `presetsOnly` drops every section except `presets`, which
	 * together produce a preset pack: a file that refreshes someone's presets
	 * without touching the tabs and colours they built around them.
	 */
	exportYaml({ presetsOnly = false, presetNames = null } = {}) {
		const model = presetNames
			? {
					...this.model,
					presets: this.presets.filter((p) => presetNames.includes(p.name)),
				}
			: this.model;
		return serializeOverviewYaml(model, { presetsOnly });
	}

	/**
	 * Import a raw YAML profile.
	 *
	 * `mode`:
	 *  - "overwrite" — replace the whole configuration;
	 *  - "merge"     — apply on top, EVE pack-piece style (presets additive,
	 *                  layout sections replaced wholesale when provided);
	 *  - "presets"   — take the file's presets and nothing else.
	 *
	 * "presets" exists because every real pack — Z-S Core, 1BL, 2BL and Full
	 * alike — is a complete profile carrying tabSetup, columns, colours and
	 * ship labels. Pulling a newer pack in to refresh your presets therefore
	 * replaced the layout you had built on top of it. Passing a model that
	 * holds only `presets` sidesteps that: every other section in mergeModel is
	 * guarded on the incoming value being non-empty.
	 *
	 * It also leaves `baseProfile` alone — you took someone's presets, you did
	 * not become their profile, and that label names your exports.
	 */
	importYaml(text, mode = "overwrite", label = "custom") {
		const incoming = parseOverviewYaml(text);
		if (mode === "presets") {
			this.applyModel(mergeModel(this.model, { presets: incoming.presets }));
			return;
		}
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

	/**
	 * Preset names for dropdowns, sorted by their *visible* (markup-stripped)
	 * name — matching the client, which sorts its preset menus at display
	 * time. The model/export keeps the file's own preset order untouched
	 * (in-game exports serialise presets unsorted).
	 */
	get presetNames() {
		return this.presets
			.map((p) => p.name)
			.sort((a, b) => stripEveMarkup(a).localeCompare(stripEveMarkup(b)));
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
	 * to the first remaining preset, brackets to "show all" (the game's
	 * unfiltered default — it has no "no brackets" state).
	 */
	removePreset(name = this.activePresetName) {
		if (this.presets.length <= 1) return false;
		const i = this.presets.findIndex((p) => p.name === name);
		if (i < 0) return false;

		this.presets.splice(i, 1);
		const fallback = this.presets[0].name;
		for (const tab of this.tabs) {
			if (tab.overview === name) tab.overview = fallback;
			if (tab.bracket === name) tab.bracket = BRACKET_SHOW_ALL;
		}
		if (this.activePresetName === name) this.activePresetName = fallback;
		return true;
	}

	/* -------------------------- columns -------------------------- */
	// Two levels, exactly like the client: the profile-wide pair
	// (columnOrder = master left-to-right order, overviewColumns = the set
	// actually shown) and an optional per-tab override (tabColumnOrder /
	// tabColumns, set in-game by right-clicking a tab -> Columns). A tab whose
	// override is null inherits the profile pair — null, not a copy, is what
	// "inherit" looks like in the model, so it round-trips as an absent key.
	//
	// Ordering follows the *Order key, not the set: real client exports write
	// overviewColumns alphabetically sorted while columnOrder carries the true
	// left-to-right sequence, so the set is a set. The per-tab pair is treated
	// the same way. A tab carrying tabColumns without tabColumnOrder therefore
	// renders in the profile order — both keys still round-trip verbatim, so
	// this affects only the preview, never the exported file.

	/** Toggle a column in the profile-wide set, keeping it in the master order. */
	toggleColumn(col) {
		if (!this.columnOrder.includes(col)) this.columnOrder.push(col);
		this.toggleMember(this.overviewColumns, col);
	}

	/** The column set a tab shows — its own override, else the profile's. */
	columnsForTab(tab) {
		return tab?.tabColumns ?? this.overviewColumns;
	}

	/** The master column order a tab uses — its own override, else the profile's. */
	columnOrderForTab(tab) {
		return tab?.tabColumnOrder?.length
			? tab.tabColumnOrder
			: this.columnOrder.length
				? this.columnOrder
				: this.columnsForTab(tab);
	}

	/**
	 * Columns a tab actually renders, left to right: its active set sequenced by
	 * its master order. Falls back to the raw set if the order mentions none of
	 * it (a hand-edited profile), so a tab never renders as a blank grid.
	 */
	visibleColumnsForTab(tab) {
		const active = new Set(this.columnsForTab(tab));
		const cols = this.columnOrderForTab(tab).filter((c) => active.has(c));
		return cols.length ? cols : [...active];
	}

	/** True when this tab carries its own columns instead of inheriting. */
	tabHasOwnColumns(tab) {
		return Array.isArray(tab?.tabColumns);
	}

	/**
	 * Commit a new left-to-right sequence for the columns a tab *shows* — what
	 * dragging the preview's column header produces.
	 *
	 * `scope` is which order the drop lands in:
	 *  - "tab" — this tab only. A tab that was still inheriting is given its own
	 *    columns here, seeded from what it already showed, so no other tab moves.
	 *  - "profile" — the shared columnOrder every inheriting tab follows. A tab
	 *    that has its own order is dealt the same sequence too, otherwise the
	 *    drag would appear to do nothing in the very preview it was made in.
	 */
	reorderVisibleColumns(tab, visible, scope = "tab") {
		if (!tab) return;
		if (scope === "profile") {
			this.columnOrder = dealIntoSlots(this.columnOrder, visible);
			if (this.tabHasOwnColumns(tab))
				tab.tabColumnOrder = dealIntoSlots(
					this.columnOrderForTab(tab),
					visible,
				);
			return;
		}
		if (!this.tabHasOwnColumns(tab)) this.setTabColumnsOverride(tab, true);
		tab.tabColumnOrder = dealIntoSlots(this.columnOrderForTab(tab), visible);
	}

	/**
	 * Turn a tab's column override on or off. Switching it on seeds the tab with
	 * exactly what it shows right now, so enabling the checkbox never changes the
	 * preview; switching it off drops both keys back to "inherit".
	 */
	setTabColumnsOverride(tab, on) {
		if (!tab) return;
		if (!on) {
			tab.tabColumns = null;
			tab.tabColumnOrder = null;
			return;
		}
		tab.tabColumnOrder = [...this.columnOrderForTab(tab)];
		tab.tabColumns = [...this.columnsForTab(tab)];
	}

	/** Toggle one column in a tab's own set (no-op while the tab inherits). */
	toggleTabColumn(tab, col) {
		if (!this.tabHasOwnColumns(tab)) return;
		// A column missing from the effective order would stay invisible however
		// it is ticked, so pin an explicit per-tab order that includes it.
		if (!this.columnOrderForTab(tab).includes(col))
			tab.tabColumnOrder = [...this.columnOrderForTab(tab), col];
		this.toggleMember(tab.tabColumns, col);
	}

	/** Copy the column choice + order of another tab onto this one. */
	copyTabColumns(fromIndex, tab) {
		const src = this.tabs.find((t) => t.index === fromIndex);
		if (!tab || !src || src === tab) return;
		// Copying from a tab that inherits hands over the profile columns as this
		// tab's own set — the user asked for these columns, explicitly.
		tab.tabColumnOrder = [...this.columnOrderForTab(src)];
		tab.tabColumns = [...this.columnsForTab(src)];
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
			bracket: BRACKET_SHOW_ALL,
			tabColumns: null, // inherit the profile columns
			tabColumnOrder: null,
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
		this.roster.push({ id, ...ENTITY_DEFAULTS, ...entity });
	}

	removeEntity(id) {
		const i = this.roster.findIndex((e) => e.id === id);
		if (i > -1) this.roster.splice(i, 1);
	}

	/** Content fingerprint of the entities on screen (ids and key order aside). */
	get rosterSig() {
		return entitySig(this.roster);
	}

	/** True while the roster differs from the grouping it was loaded from. */
	get rosterDirty() {
		return this.rosterSig !== this.rosterBaseline;
	}

	/** Persist the entities on screen, their grouping, and every parked draft. */
	saveRoster() {
		if (typeof localStorage === "undefined") return;
		try {
			localStorage.setItem(
				ROSTER_KEY,
				JSON.stringify({
					activeSet: this.activeSet,
					baseline: this.rosterBaseline,
					roster: this.roster,
					drafts: this.rosterDrafts,
				}),
			);
		} catch (e) {
			console.warn("[!] Roster save failed.", e);
		}
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

	/**
	 * Park the entities on screen under their grouping, so switching away and
	 * back returns to exactly what was being edited. No-op when nothing has
	 * changed since the grouping was loaded — a clean grouping needs no draft.
	 */
	stashDraft() {
		if (!this.rosterDirty) return;
		this.rosterDrafts[this.activeSet ?? WORKING_SET] = toStoredEntities(
			this.roster,
		);
	}

	/**
	 * Show a grouping's entities. Parked edits win over the saved entities, so
	 * returning to a grouping resumes where the user left off; pass "" for the
	 * unnamed working set. Whatever is on screen is parked first — loading a
	 * grouping to cross-check something must never cost work.
	 */
	loadRosterSet(name) {
		const key = name ?? WORKING_SET;
		const set = key ? this.rosterSets.find((s) => s.name === key) : null;
		const draft = this.rosterDrafts[key];
		if (!set && !draft) return;
		this.stashDraft();
		this.roster = [];
		// copy states too, or edits to a loaded entity would mutate the stored set
		for (const e of draft ?? set.entities)
			this.addEntity({ ...e, states: [...(e.states ?? [])] });
		this.activeSet = set ? set.name : null;
		// Baseline is the *saved* grouping either way, so a restored draft keeps
		// reading as unsaved while a clean load does not.
		this.rosterBaseline = set ? entitySig(set.entities) : "";
		delete this.rosterDrafts[key]; // it is live now, not parked
		this.saveRoster();
	}

	/** Save the current roster under `name` — new set, or overwrite if taken. */
	saveRosterSet(name) {
		const trimmed = name?.trim();
		if (!trimmed) return false;
		const entities = toStoredEntities(this.roster);
		const existing = this.rosterSets.find((s) => s.name === trimmed);
		if (existing) existing.entities = entities;
		else this.rosterSets.push({ name: trimmed, entities });
		this.persistRosterSets();
		// Saved: this grouping owns the entities now, and no draft outranks them.
		this.activeSet = trimmed;
		this.rosterBaseline = this.rosterSig;
		delete this.rosterDrafts[trimmed];
		delete this.rosterDrafts[WORKING_SET];
		this.saveRoster();
		return true;
	}

	renameRosterSet(oldName, newName) {
		const trimmed = newName?.trim();
		if (!trimmed || trimmed === oldName) return false;
		if (this.rosterSets.some((s) => s.name === trimmed)) return false;
		const set = this.rosterSets.find((s) => s.name === oldName);
		if (!set) return false;
		set.name = trimmed;
		if (this.rosterDrafts[oldName]) {
			this.rosterDrafts[trimmed] = this.rosterDrafts[oldName];
			delete this.rosterDrafts[oldName];
		}
		if (this.activeSet === oldName) this.activeSet = trimmed;
		this.persistRosterSets();
		this.saveRoster();
		return true;
	}

	deleteRosterSet(name) {
		const i = this.rosterSets.findIndex((s) => s.name === name);
		if (i > -1) {
			this.rosterSets.splice(i, 1);
			this.persistRosterSets();
		}
		// The entities stay on screen; they just no longer belong to a grouping.
		delete this.rosterDrafts[name];
		if (this.activeSet === name) {
			this.activeSet = null;
			this.rosterBaseline = "";
		}
		this.saveRoster();
	}

	/**
	 * Resolve how an entity renders under a given preset — the heart of the
	 * preview, mirroring the EVE client's evaluation rules exactly:
	 *
	 * Visibility runs two independent gates (see visibility.js for the rule and
	 * its truth table):
	 *   1. the entity's groupId must be in preset.groups — the type filter is
	 *      absolute, and no state overrides it;
	 *   2. within an authorised hull, a state ∈ preset.filteredStates vetoes,
	 *      unless a state ∈ preset.alwaysShownStates overrides that veto.
	 *
	 * Appearance: the winning colortag/background is the FIRST id in
	 * flagOrder/backgroundOrder that the entity carries AND that the
	 * corresponding whitelist (flagStates/backgroundStates) authorises —
	 * evaluation stops at the first match, so list order is everything.
	 *
	 * `forcedOverVeto` marks a row an always-shown state rescued from a state
	 * that would otherwise have hidden it — worth explaining in the preview,
	 * since the same tab hides its siblings.
	 *
	 * @returns {{visible:boolean, forcedOverVeto:boolean, flagId:?number,
	 *            bgId:?number, flagColor:?string, bgColor:?string,
	 *            flagBlink:boolean, bgBlink:boolean}}
	 */
	resolveEntity(entity, preset) {
		const states = entity.states ?? [];
		const { visible, forcedOverVeto } = resolveVisibility(entity, preset);

		const flagId = this.flagOrder.find(
			(id) => states.includes(id) && this.flagStates.includes(id),
		);
		const bgId = this.backgroundOrder.find(
			(id) => states.includes(id) && this.backgroundStates.includes(id),
		);

		return {
			visible,
			forcedOverVeto,
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
