import { defaultPresets } from "$lib/data/defaultPresets";
import { parseCompliantYaml } from "$lib/utils/yamlSerializer";

// Complete map of EVE Relationship rule integers
const STATE_ID_MAP = {
	9: { key: "suspect", name: "Suspect" },
	10: { key: "criminal", name: "Criminal" },
	11: { key: "fleetMember", name: "Fleet Member" },
	12: { key: "corpMember", name: "Corp Member" },
	13: { key: "allianceMember", name: "Alliance Member" },
	14: { key: "sameMilitia", name: "Same Militia" },
	15: { key: "militiaAtWar", name: "Militia At War" },
	16: { key: "highStanding", name: "High Standing" },
	17: { key: "goodStanding", name: "Good Standing" },
	18: { key: "neutral", name: "Neutral Standing" },
	19: { key: "badStanding", name: "Bad Standing" },
	20: { key: "terribleStanding", name: "Terrible Standing" },
	21: { key: "noStanding", name: "No standing" },
	44: { key: "warTarget", name: "War Target" },
	45: { key: "rightToAttack", name: "Right To Attack" },
	48: { key: "npc", name: "Agent / NPC" },
	49: { key: "hasBounty", name: "Has Bounty" },
	50: { key: "securityOutlaw", name: "Outlaw (Sec <= -5)" },
	51: { key: "securitySuspect", name: "Suspect Sec Status" },
	52: { key: "securityNeutral", name: "Neutral Sec Status" },
	53: { key: "securityPositive", name: "Positive Sec Status" },
	66: { key: "sameAlliance", name: "Same Alliance" },
	68: { key: "factionStanding", name: "Faction Standings" },
};

class CustomiserStore {
	// Global configurations mirroring 1:1 EVE client properties
	globalSettings = $state({
		alwaysShowBroadcasts: true,
		applyToAllTabs: false,
		showBracketsInSpace: true,

		backgroundOrder: [
			"warTarget",
			"outlaw",
			"criminal",
			"suspect",
			"fleetMember",
			"corpMember",
			"allianceMember",
			"neutral",
		],
		backgroundStates: {
			warTarget: {
				active: true,
				color: "#ff3333",
				blink: true,
				name: "War Target",
			},
			outlaw: { active: true, color: "#ff7b00", blink: false, name: "Outlaw" },
			criminal: {
				active: true,
				color: "#ff0000",
				blink: true,
				name: "Criminal",
			},
			suspect: {
				active: true,
				color: "#eab308",
				blink: false,
				name: "Suspect",
			},
			fleetMember: {
				active: true,
				color: "#bf00ff",
				blink: false,
				name: "Fleet Member",
			},
			corpMember: {
				active: true,
				color: "#22c55e",
				blink: false,
				name: "Corp Member",
			},
			allianceMember: {
				active: true,
				color: "#3b82f6",
				blink: false,
				name: "Alliance Member",
			},
			neutral: {
				active: false,
				color: "#94a3b8",
				blink: false,
				name: "Neutral",
			},
		},

		flagOrder: [
			"warTarget",
			"outlaw",
			"criminal",
			"suspect",
			"fleetMember",
			"corpMember",
			"allianceMember",
			"neutral",
		],
		flagStates: {
			warTarget: { active: true, color: "#ff3333", name: "War Target" },
			outlaw: { active: true, color: "#ff7b00", name: "Outlaw" },
			criminal: { active: true, color: "#ff0000", name: "Criminal" },
			suspect: { active: true, color: "#eab308", name: "Suspect" },
			fleetMember: { active: true, color: "#bf00ff", name: "Fleet Member" },
			corpMember: { active: true, color: "#22c55e", name: "Corp Member" },
			allianceMember: {
				active: true,
				color: "#3b82f6",
				name: "Alliance Member",
			},
			neutral: { active: true, color: "#94a3b8", name: "Neutral" },
		},

		columnOrder: [
			"icon",
			"distance",
			"name",
			"type",
			"velocity",
			"radialVelocity",
			"transversalVelocity",
		],
		overviewColumns: [
			"icon",
			"distance",
			"name",
			"type",
			"velocity",
			"transversalVelocity",
		],

		// Ships typography parameters
		hideCorpIfInAlliance: true,
		labelConfigs: {
			type: {
				active: true,
				prefix: "[",
				suffix: "]",
				bold: false,
				italic: false,
				underline: false,
				size: "12",
				color: "#FFBB64",
			},
			alliance: {
				active: true,
				prefix: " [",
				suffix: "]",
				bold: true,
				italic: false,
				underline: false,
				size: "12",
				color: "#FEFF6F",
			},
			corp: {
				active: true,
				prefix: " [",
				suffix: "]",
				bold: true,
				italic: false,
				underline: false,
				size: "10",
				color: "#ffffff",
			},
			pilot: {
				active: true,
				prefix: " - ",
				suffix: "",
				bold: false,
				italic: false,
				underline: false,
				size: "10",
				color: "#FFFFFF",
			},
		},
		labelOrder: ["type", "alliance", "corp", "pilot"],

		// Tri-state Exception flags (show: 1, hide: -1, default: 0)
		exceptions: {
			limitedEngagement: 1,
			excellentStanding: 0,
			goodStanding: 0,
			neutralStanding: 0,
			noStanding: 0,
			criminal: 1,
			suspect: 1,
			inFleet: 1,
		},

		// Misc parameters
		moveBroadcastsToTop: true,
		showCrosshairs: true,
		displayDamage: true,
		displayModuleLinks: true,
		displayInSpaceBrackets: true,

		// Accessibility scale & font family properties
		uiScale: "11px",
		fontFamily: "'Inter', sans-serif",
	});

	tabs = $state([]);
	activeTabId = $state(0);
	sdeMatrix = $state(null);
	loading = $state(true);

	constructor() {
		this.loadPreset("zs_core");
		this.fetchSdeMatrix();
	}

	async fetchSdeMatrix() {
		try {
			const res = await fetch("/data/matrix_latest.json");
			if (res.ok) {
				this.sdeMatrix = await res.json();
			} else {
				throw new Error("HTTP error retrieving local JSON SDE compilation");
			}
		} catch (e) {
			console.warn(
				"[!] SDE fetch matrix failed; loading defensive local mock instead.",
				e,
			);
			// Fallback matrix seed
			this.sdeMatrix = {
				categories: {
					3: { name: "Celestials", groups: [6, 10, 988] },
					6: { name: "Ships", groups: [25, 26, 27, 419, 420] },
				},
				groups: {
					6: { name: "Sun", categoryId: 3, types: [1001] },
					10: { name: "Stargate", categoryId: 3, types: [1002] },
					25: { name: "Frigate", categoryId: 6, types: [587, 588] },
					26: { name: "Cruiser", categoryId: 6, types: [620, 621] },
					27: { name: "Battleship", categoryId: 6, types: [2701] },
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
			const url = `/defaults/${presetKey}.yaml`;
			const response = await fetch(url);
			if (!response.ok)
				throw new Error(`HTTP Error Status: ${response.status}`);

			const yamlText = await response.text();
			this.importRawYaml(yamlText);
		} catch (err) {
			console.warn(
				`[!] Unable to load default Svelte YAML presets. Restoring local fallback presets.`,
				err.message,
			);
			const template = JSON.parse(
				JSON.stringify(defaultPresets[presetKey] || defaultPresets.zs_core),
			);
			this.tabs = template.tabs;
			this.activeTabId = template.tabs[0]?.id || 0;
			this.globalSettings = {
				...this.globalSettings,
				...template.globalSettings,
			};
		}
	}

	/**
	 * Safe parser for 1:1 legacy and modern YAML tuples
	 */
	importRawYaml(yamlText) {
		const rawParsed = parseCompliantYaml(yamlText);

		// FIXED: Defensive checking maps clean lower case column representations safely, filtering out non-strings
		if (rawParsed.columnOrder && Array.isArray(rawParsed.columnOrder)) {
			this.globalSettings.columnOrder = rawParsed.columnOrder
				.filter((col) => col && typeof col === "string")
				.map((col) => col.toLowerCase());
		}
		if (rawParsed.overviewColumns && Array.isArray(rawParsed.overviewColumns)) {
			this.globalSettings.overviewColumns = rawParsed.overviewColumns
				.filter((col) => col && typeof col === "string")
				.map((col) => col.toLowerCase());
		}

		// Map Priorities & Standings Lists
		if (rawParsed.backgroundOrder && Array.isArray(rawParsed.backgroundOrder)) {
			this.globalSettings.backgroundOrder = rawParsed.backgroundOrder
				.filter((id) => id !== null && typeof id !== "object")
				.map((id) => STATE_ID_MAP[id]?.key)
				.filter(Boolean);
		}
		if (
			rawParsed.backgroundStates &&
			Array.isArray(rawParsed.backgroundStates)
		) {
			Object.keys(this.globalSettings.backgroundStates).forEach((k) => {
				this.globalSettings.backgroundStates[k].active = false;
			});
			rawParsed.backgroundStates
				.filter((id) => id !== null && typeof id !== "object")
				.forEach((id) => {
					const key = STATE_ID_MAP[id]?.key;
					if (key) this.globalSettings.backgroundStates[key].active = true;
				});
		}

		// Extract multi-tab setups
		if (rawParsed.tabSetup && Array.isArray(rawParsed.tabSetup)) {
			const parsedTabs = [];
			Object.entries(rawParsed.tabSetup).forEach(([tabId, tabData]) => {
				const overviewPresetName = tabData.overview || `Preset_T${tabId}`;
				let activeOverviewGroups = [];
				let activeBracketGroups = [];

				if (rawParsed.presets) {
					const overviewPreset = rawParsed.presets[overviewPresetName];
					if (overviewPreset?.groups) {
						activeOverviewGroups = overviewPreset.groups.map(Number);
					}
				}

				parsedTabs.push({
					id: Number(tabId),
					name: tabData.name || `Tab ${tabId}`,
					overviewGroups: activeOverviewGroups,
					bracketGroups: activeBracketGroups,
				});
			});

			this.tabs = parsedTabs;
			this.activeTabId = parsedTabs[0]?.id || 0;
		}

		// Map customized label formats
		if (rawParsed.shipLabels) {
			Object.entries(rawParsed.shipLabels).forEach(([key, value]) => {
				if (this.globalSettings.labelConfigs[key]) {
					const target = this.globalSettings.labelConfigs[key];
					target.active = value.state === 1;
					target.prefix = value.prefix || "";
					target.suffix = value.suffix || "";
					target.bold = value.bold === 1;
					target.italic = value.italic === 1;
				}
			});
		}

		console.log("[+] Integrated raw EVE config successfully parsed.");
	}

	get activeTab() {
		return this.tabs.find((t) => t.id === this.activeTabId);
	}

	toggleGroupInActiveTab(groupId, viewType = "overview") {
		if (!this.activeTab) return;
		const targetSet =
			viewType === "overview"
				? this.activeTab.overviewGroups
				: this.activeTab.bracketGroups;

		const index = targetSet.indexOf(groupId);
		if (index > -1) {
			targetSet.splice(index, 1);
		} else {
			targetSet.push(groupId);
		}
	}

	reorderPriority(type, index, direction) {
		const list =
			type === "background"
				? this.globalSettings.backgroundOrder
				: this.globalSettings.flagOrder;
		const targetIndex = index + direction;
		if (targetIndex < 0 || targetIndex >= list.length) return;

		const temp = list[index];
		list[index] = list[targetIndex];
		list[targetIndex] = temp;
	}
}

export const customiser = new CustomiserStore();
