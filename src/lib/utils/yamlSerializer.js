/**
 * Advanced 1:1 EVE Online YAML Parser & Serializer
 * Built to recursively resolve nested lists of tuples, string formatting,
 * and standard key-value maps without standard library dependency bloat.
 */

// Helper to strip surrounding quotes
function stripQuotes(str) {
	if (!str) return "";
	return str.trim().replace(/^['"]|['"]$/g, "");
}

/**
 * Parses raw EVE Client YAML configurations.
 * Correctly detects and flattens nested arrays of lists (tuple maps).
 */
export function parseCompliantYaml(yamlText) {
	const lines = yamlText.split("\n");
	const root = {};
	const indentStack = [];
	const _currentContainer = root;
	let lastKey = null;

	// Simple token line-by-line parser
	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const trimmed = line.trim();
		if (!trimmed || line.startsWith("#") || line.startsWith("---")) continue;

		// Calculate current line indentation level
		const indent = line.search(/\S/);

		// Resolve structure nesting depth based on indent
		while (
			indentStack.length > 0 &&
			indentStack[indentStack.length - 1].indent >= indent
		) {
			indentStack.pop();
		}
		const parent =
			indentStack.length > 0
				? indentStack[indentStack.length - 1].container
				: root;

		// Check if line represents a list item
		if (trimmed.startsWith("-")) {
			const listContent = trimmed.substring(1).trim();

			if (!Array.isArray(parent[lastKey])) {
				parent[lastKey] = [];
			}

			if (listContent.includes(":")) {
				// List item is a key-value property
				const parts = listContent.split(":");
				const k = stripQuotes(parts[0]);
				const v = stripQuotes(parts.slice(1).join(":"));
				const obj = { [k]: parseValue(v) };
				parent[lastKey].push(obj);
				indentStack.push({ indent, container: obj });
			} else if (listContent !== "") {
				// List item is a flat value
				parent[lastKey].push(parseValue(listContent));
			} else {
				// List item is a nested block array
				const newArr = [];
				parent[lastKey].push(newArr);
				indentStack.push({ indent, container: newArr });
			}
		} else if (trimmed.includes(":")) {
			// Standard key-value assignment
			const parts = trimmed.split(":");
			const k = stripQuotes(parts[0]);
			const v = stripQuotes(parts.slice(1).join(":"));

			if (v !== "") {
				parent[k] = parseValue(v);
			} else {
				parent[k] = {};
				indentStack.push({ indent, container: parent[k] });
				lastKey = k;
			}
		}
	}

	return normalizeEveTupleLayout(root);
}

// Evaluates primitive types safely
function parseValue(val) {
	const clean = val.trim();
	if (clean.toLowerCase() === "true") return true;
	if (clean.toLowerCase() === "false") return false;
	if (clean.toLowerCase() === "null") return null;
	if (!Number.isNaN(clean) && clean !== "") return Number(clean);
	return stripQuotes(clean);
}

/**
 * Recursively flattens Python-serialized lists of tuples into standard JSON objects.
 * Turns nested lists like [['type', [['bold', 1]]]] into standard keys: { type: { bold: true } }
 */
function normalizeEveTupleLayout(obj) {
	if (Array.isArray(obj)) {
		// If array represents a list of tuples, convert to object
		const isTupleList = obj.every(
			(item) =>
				Array.isArray(item) && item.length === 2 && typeof item[0] === "string",
		);
		if (isTupleList) {
			const normalizedObj = {};
			obj.forEach((tuple) => {
				normalizedObj[tuple[0]] = normalizeEveTupleLayout(tuple[1]);
			});
			return normalizedObj;
		}
		return obj.map((item) => normalizeEveTupleLayout(item));
	} else if (obj !== null && typeof obj === "object") {
		const normalizedObj = {};
		Object.entries(obj).forEach(([key, val]) => {
			normalizedObj[key] = normalizeEveTupleLayout(val);
		});
		return normalizedObj;
	}
	return obj;
}

/**
 * Compiles active configuration parameters into EVE-compliant YAML structure.
 * Respects list order, case mappings, and formats unquoted hex standings values.
 */
export function buildCompliantYaml(globalSettings, tabs) {
	const yaml = [];
	yaml.push("###########################################################");
	yaml.push("# EVE Online Client Profile Configuration File             #");
	yaml.push("# Compiled via Z-S Overview Customiser Photon Engine      #");
	yaml.push(`# Generated: ${new Date().toISOString()}                  #`);
	yaml.push("###########################################################");
	yaml.push("---");

	yaml.push(
		`alwaysShowBroadcasts: ${globalSettings.alwaysShowBroadcasts ? "true" : "false"}`,
	);
	yaml.push(
		`applyToAllTabs: ${globalSettings.applyToAllTabs ? "true" : "false"}`,
	);
	yaml.push("");

	// Columns Layout (forces uppercase keys as expected by EVE Online clients)
	yaml.push("columnOrder:");
	globalSettings.columnOrder.forEach((col) => {
		yaml.push(`  - ${col.toUpperCase()}`);
	});
	yaml.push("");

	yaml.push("overviewColumns:");
	globalSettings.overviewColumns.forEach((col) => {
		yaml.push(`  - ${col.toUpperCase()}`);
	});
	yaml.push("");

	// Standings & priorities mapping
	yaml.push("backgroundOrder:");
	globalSettings.backgroundOrder.forEach((bg) => {
		const id = reverseStateMapping(bg);
		if (id) yaml.push(`  - ${id}`);
	});
	yaml.push("");

	yaml.push("backgroundStates:");
	Object.entries(globalSettings.backgroundStates).forEach(([key, value]) => {
		const id = reverseStateMapping(key);
		if (!id || !value.active) return;
		yaml.push(`  - ${id}`);
	});
	yaml.push("");

	// Serialise State colors
	yaml.push("stateColorsNameList:");
	Object.entries(globalSettings.backgroundStates).forEach(([key, value]) => {
		const rawColor = value.color.replace("#", "");
		const formattedColor =
			rawColor.length === 6 ? `0xff${rawColor}` : `0x${rawColor}`;
		yaml.push(`  - - background_${reverseStateMapping(key)}`);
		yaml.push(`    - ${formattedColor}`);
	});
	yaml.push("");

	yaml.push("flagOrder:");
	globalSettings.flagOrder.forEach((flag) => {
		const id = reverseStateMapping(flag);
		if (id) yaml.push(`  - ${id}`);
	});
	yaml.push("");

	yaml.push("flagStates:");
	Object.entries(globalSettings.flagStates).forEach(([key, value]) => {
		const id = reverseStateMapping(key);
		if (!id || !value.active) return;
		yaml.push(`  - ${id}`);
	});
	yaml.push("");

	// Serialise multi tabs configs
	yaml.push("tabSetup:");
	tabs.forEach((tab, index) => {
		yaml.push(`  - - ${index}`);
		yaml.push("    - - - bracket");
		yaml.push(`        - "${tab.name.replace(/"/g, '\\"')}"`);
		yaml.push("      - - name");
		yaml.push(`        - "${tab.name.replace(/"/g, '\\"')}"`);
		yaml.push("      - - overview");
		yaml.push(`        - "${tab.name.replace(/"/g, '\\"')}"`);
	});
	yaml.push("");

	// Ship Labels parameters
	yaml.push("shipLabelOrder:");
	globalSettings.shipLabelOrder.forEach((label) => {
		yaml.push(`  - ${label}`);
	});
	yaml.push("");

	yaml.push("shipLabels:");
	Object.entries(globalSettings.shipLabels).forEach(([key, value]) => {
		yaml.push(`  - - ${key}`);
		yaml.push("    - - - state");
		yaml.push(`        - ${value.active ? 1 : 0}`);
		yaml.push("      - - prefix");
		yaml.push(`        - "${value.prefix || ""}"`);
		yaml.push("      - - suffix");
		yaml.push(`        - "${value.suffix || ""}"`);
		yaml.push("      - - bold");
		yaml.push(`        - ${value.bold ? 1 : 0}`);
		yaml.push("      - - italic");
		yaml.push(`        - ${value.italic ? 1 : 0}`);
	});

	return yaml.join("\n");
}

// Direct state to ID mappings
const REVERSE_STATE_MAP = {
	suspect: 9,
	criminal: 10,
	fleetMember: 11,
	corpMember: 12,
	allianceMember: 13,
	sameMilitia: 14,
	militiaAtWar: 15,
	highStanding: 16,
	goodStanding: 17,
	neutral: 18,
	badStanding: 19,
	terribleStanding: 20,
	noStanding: 21,
	warTarget: 44,
	rightToAttack: 45,
	npc: 48,
	hasBounty: 49,
	securityOutlaw: 50,
	securitySuspect: 51,
	securityNeutral: 52,
	securityPositive: 53,
	sameAlliance: 66,
	factionStanding: 68,
};

function reverseStateMapping(name) {
	return REVERSE_STATE_MAP[name] || null;
}
