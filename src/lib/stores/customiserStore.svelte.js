/**
 * Central reactive store for the Z-S Overview Customiser.
 *
 * Holds the EVE overview profile as a native, normalized model (states keyed by
 * the client's integer ids), the loaded SDE matrix, the live-preview entity
 * roster, and UI/theme preferences. All YAML I/O goes through eveFormat.js.
 */

import { resolveStateColor, STATES } from "$lib/data/stateMatrix";
import { parseOverviewYaml, serializeOverviewYaml } from "$lib/utils/eveFormat";
import { mergeModel } from "$lib/utils/merge";

const THEME_KEY = "zs-overview-theme";

/** Reasonable preview roster so the renderer is populated on first load. */
function seedRoster() {
	return [
		{
			id: 1,
			pilotName: "Sela Siona",
			shipName: "Whirlwind",
			type: "Rifter",
			typeId: 587,
			groupId: 25,
			corp: "CIDLA",
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
			pilotName: "Vandis Alar",
			shipName: "Reaper",
			type: "Rupture",
			typeId: 620,
			groupId: 26,
			corp: "BURN",
			alliance: "WAR.",
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
			typeId: 0,
			groupId: 26,
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
			pilotName: "Khron Vex",
			shipName: "Anathema",
			type: "Slasher",
			typeId: 588,
			groupId: 25,
			corp: "CRIM",
			alliance: "—",
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
			pilotName: "—",
			shipName: "",
			type: "Stargate (Caldari)",
			typeId: 0,
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

class CustomiserStore {
	// --- profile model ---
	presets = $state([]);
	tabs = $state([]);
	activeTabId = $state(0);
	columnOrder = $state([]);
	overviewColumns = $state([]);
	flagOrder = $state([]);
	backgroundOrder = $state([]);
	flagStates = $state([]); // authorized colortag state ids
	backgroundStates = $state([]); // authorized background state ids
	stateBlinks = $state({}); // { 'flag_13': true, ... }
	stateColors = $state({}); // { 'background_13': 'orange', ... }
	shipLabelOrder = $state([]);
	shipLabels = $state({});
	userSettings = $state([]);

	// --- SDE + preview ---
	sdeMatrix = $state(null);
	loading = $state(true);
	roster = $state(seedRoster());
	activePresetName = $state(null);

	// --- UI ---
	theme = $state("dark");
	uiScale = $state(1); // zoom factor applied to the whole app
	fontFamily = $state("'Inter', sans-serif");
	baseProfile = $state("zs_core");

	constructor() {
		if (typeof localStorage !== "undefined") {
			this.theme = localStorage.getItem(THEME_KEY) || "dark";
		}
		this.applyTheme();
		this.loadPreset("zs_core");
		this.fetchSdeMatrix();
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

	/* -------------------------- loading -------------------------- */
	async fetchSdeMatrix() {
		try {
			const res = await fetch("/data/matrix_latest.json");
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			this.sdeMatrix = await res.json();
		} catch (e) {
			console.warn("[!] SDE matrix fetch failed; using minimal fallback.", e);
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

	async loadPreset(presetKey) {
		try {
			const res = await fetch(`/defaults/${presetKey}.yaml`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			const text = await res.text();
			this.applyModel(parseOverviewYaml(text));
			this.baseProfile = presetKey;
		} catch (err) {
			console.error(`[!] Failed to load profile '${presetKey}'.`, err);
			throw err;
		}
	}

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
	stateColor(kind, id) {
		const key = `${kind}_${id}`;
		const value = this.stateColors[key] ?? STATES[id]?.color ?? "grey";
		return resolveStateColor(value);
	}

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
	reorder(arr, index, dir) {
		const j = index + dir;
		if (j < 0 || j >= arr.length) return;
		[arr[index], arr[j]] = [arr[j], arr[index]];
	}

	toggleMember(arr, value) {
		const i = arr.indexOf(value);
		if (i > -1) arr.splice(i, 1);
		else arr.push(value);
	}

	toggleGroupInPreset(groupId, presetName = this.activePresetName) {
		const preset = this.presetByName(presetName);
		if (preset) this.toggleMember(preset.groups, groupId);
	}

	/* -------------------------- tabs -------------------------- */
	addTab() {
		if (this.tabs.length >= 8) return;
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
		if (!this.shipLabels[type]) this.shipLabels[type] = this.defaultLabelConfig(type);
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

	/**
	 * Resolve how an entity renders under a given preset:
	 * visibility (alwaysShown > filtered > group membership) and the winning
	 * flag/background ids by walking the priority orders ∩ authorized states.
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
