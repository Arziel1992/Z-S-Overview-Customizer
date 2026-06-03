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
			outlaw: { active: true, color: "#ff6600", blink: false, name: "Outlaw" },
			criminal: {
				active: true,
				color: "#b30000",
				blink: true,
				name: "Criminal",
			},
			suspect: {
				active: true,
				color: "#e0a300",
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
				color: "#00ff00",
				blink: false,
				name: "Corp Member",
			},
			allianceMember: {
				active: true,
				color: "#33ccff",
				blink: false,
				name: "Alliance Member",
			},
			neutral: {
				active: false,
				color: "#cccccc",
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
			outlaw: { active: true, color: "#ff6600", name: "Outlaw" },
			criminal: { active: true, color: "#b30000", name: "Criminal" },
			suspect: { active: true, color: "#e0a300", name: "Suspect" },
			fleetMember: { active: true, color: "#bf00ff", name: "Fleet Member" },
			corpMember: { active: true, color: "#00ff00", name: "Corp Member" },
			allianceMember: {
				active: true,
				color: "#33ccff",
				name: "Alliance Member",
			},
			neutral: { active: true, color: "#ffffff", name: "Neutral" },
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

		shipLabelOrder: ["type", "name", "alliance", "corp"],
		shipLabels: {
			type: {
				active: true,
				prefix: "[",
				suffix: "]",
				bold: false,
				italic: false,
			},
			name: { active: true, prefix: "", suffix: "", bold: true, italic: false },
			corp: {
				active: true,
				prefix: "<",
				suffix: ">",
				bold: false,
				italic: true,
			},
			alliance: {
				active: false,
				prefix: "{",
				suffix: "}",
				bold: false,
				italic: false,
			},
		},
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
				throw new Error("Local HTTP 404 matrix JSON asset missing");
			}
		} catch (e) {
			console.warn(
				"[!] SDE fetch matrix failed; loading defensive local mock instead.",
				e,
			);
			// Fail-safe mock database
			this.sdeMatrix = {
				categories: {
					6: { name: "Ships", groups: [25, 26, 27, 28, 419, 420] },
				},
				groups: {
					25: { name: "Frigate", categoryId: 6, types: [587, 588] },
					26: { name: "Cruiser", categoryId: 6, types: [620, 621] },
					419: {
						name: "Combat Recon Ship",
						categoryId: 6,
						types: [11963, 11957],
					},
				},
				types: {
					587: { name: "Rifter", groupId: 25 },
					588: { name: "Slasher", groupId: 25 },
					620: { name: "Rupture", groupId: 26 },
					621: { name: "Stabber", groupId: 26 },
					11963: { name: "Rapier", groupId: 419 },
					11957: { name: "Falcon", groupId: 419 },
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
				`[!] Unable to load default YAML asset paths. Loading JavaScript fallback template.`,
				err,
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
	 * Imports and normalizes both Legacy and Modern Z-S YAML structures seamlessly.
	 */
	importRawYaml(yamlText) {
		const rawParsed = parseCompliantYaml(yamlText);

		// 1. Map columns (safeguards against uppercase discrepancies)
		if (rawParsed.columnOrder) {
			this.globalSettings.columnOrder = rawParsed.columnOrder.map((col) =>
				col.toLowerCase(),
			);
		}
		if (rawParsed.overviewColumns) {
			this.globalSettings.overviewColumns = rawParsed.overviewColumns.map(
				(col) => col.toLowerCase(),
			);
		}

		// 2. Map priorities and standings from integer lists
		if (rawParsed.backgroundOrder) {
			this.globalSettings.backgroundOrder = rawParsed.backgroundOrder
				.map((id) => STATE_ID_MAP[id]?.key)
				.filter(Boolean);
		}
		if (rawParsed.backgroundStates) {
			// Initialize active background state mappings
			Object.keys(this.globalSettings.backgroundStates).forEach((k) => {
				this.globalSettings.backgroundStates[k].active = false;
			});
			rawParsed.backgroundStates.forEach((id) => {
				const key = STATE_ID_MAP[id]?.key;
				if (key) this.globalSettings.backgroundStates[key].active = true;
			});
		}

		if (rawParsed.flagOrder) {
			this.globalSettings.flagOrder = rawParsed.flagOrder
				.map((id) => STATE_ID_MAP[id]?.key)
				.filter(Boolean);
		}
		if (rawParsed.flagStates) {
			Object.keys(this.globalSettings.flagStates).forEach((k) => {
				this.globalSettings.flagStates[k].active = false;
			});
			rawParsed.flagStates.forEach((id) => {
				const key = STATE_ID_MAP[id]?.key;
				if (key) this.globalSettings.flagStates[key].active = true;
			});
		}

		// 3. Extract and compile active tabs setup
		if (rawParsed.tabSetup) {
			const parsedTabs = [];
			Object.entries(rawParsed.tabSetup).forEach(([tabId, tabData]) => {
				// Find matching preset references
				const overviewPresetName = tabData.overview || `Preset_T${tabId}`;
				const bracketPresetName = tabData.bracket || `Preset_Bracket_T${tabId}`;

				// Find associated active preset group mappings inside YAML
				let activeOverviewGroups = [];
				let activeBracketGroups = [];

				if (rawParsed.presets) {
					const overviewPreset = rawParsed.presets[overviewPresetName];
					if (overviewPreset?.groups) {
						activeOverviewGroups = overviewPreset.groups.map(Number);
					}
					const bracketPreset = rawParsed.presets[bracketPresetName];
					if (bracketPreset?.groups) {
						activeBracketGroups = bracketPreset.groups.map(Number);
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

		// 4. Map Custom ship labels
		if (rawParsed.shipLabels) {
			Object.entries(rawParsed.shipLabels).forEach(([key, value]) => {
				if (this.globalSettings.shipLabels[key]) {
					const target = this.globalSettings.shipLabels[key];
					target.active = value.state === 1;
					target.prefix = value.prefix || "";
					target.suffix = value.suffix || "";
					target.bold = value.bold === 1;
					target.italic = value.italic === 1;
				}
			});
		}

		console.log(
			"[+] Normalized EVE Client YAML profile successfully digested.",
		);
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
