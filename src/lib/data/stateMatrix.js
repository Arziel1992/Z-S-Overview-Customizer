/**
 * EVE Online Overview State Matrix — single source of truth.
 *
 * Maps the client's integer "state" identifiers to human-readable metadata.
 * Sourced from notes/config_keys.md §5 and the deep-dive §6.3. These integers
 * are what the client actually evaluates; UI string keys are derived from here,
 * never the reverse (the previous STATE_ID_MAP was mis-shifted and is removed).
 *
 * `kind` groups states for display:
 *   legal | standing | affiliation | militia | misc
 */

import { argbHexToCss } from "$lib/utils/eveFormat";

export const STATES = {
	9: { name: "Neutral Standing", kind: "standing", color: "grey" },
	10: { name: "Bad Standing", kind: "standing", color: "orange" },
	11: { name: "Fleet Member", kind: "affiliation", color: "purple" },
	12: { name: "Terrible Standing", kind: "standing", color: "red" },
	13: { name: "Criminal / Suspect", kind: "legal", color: "red" },
	14: { name: "Same Militia", kind: "militia", color: "blue" },
	15: { name: "Excellent Standing (+10)", kind: "standing", color: "darkBlue" },
	16: { name: "Good Standing (+5)", kind: "standing", color: "darkBlue" },
	17: { name: "Corp Threat", kind: "affiliation", color: "orange" },
	18: { name: "Corp Member", kind: "affiliation", color: "green" },
	19: { name: "Alliance Member", kind: "affiliation", color: "blue" },
	20: { name: "Security Threat", kind: "legal", color: "orange" },
	21: { name: "Has Bounty", kind: "misc", color: "white" },
	36: { name: "Legacy Veto (36)", kind: "misc", color: "grey" },
	37: { name: "Legacy Veto (37)", kind: "misc", color: "grey" },
	44: { name: "Outlaw / Kill Right", kind: "legal", color: "red" },
	45: { name: "Low Security Status", kind: "legal", color: "blue" },
	48: { name: "Agent / VIP", kind: "misc", color: "black" },
	49: { name: "VIP / Agent (alt)", kind: "misc", color: "blue" },
	50: { name: "Limited Engagement", kind: "legal", color: "orange" },
	51: { name: "Militia War", kind: "militia", color: "orange" },
	52: { name: "War Target", kind: "legal", color: "orange" },
	53: { name: "Militia / War (sec.)", kind: "militia", color: "orange" },
	66: { name: "Faction (Same)", kind: "militia", color: "blue" },
	68: { name: "Faction Militia", kind: "militia", color: "orange" },
};

/** All state ids the UI knows about, in ascending numeric order. */
export const ALL_STATE_IDS = Object.keys(STATES)
	.map(Number)
	.sort((a, b) => a - b);

export function stateName(id) {
	return STATES[id]?.name ?? `State ${id}`;
}

export function stateKind(id) {
	return STATES[id]?.kind ?? "misc";
}

/**
 * EVE named-colour palette. The client's stateColorsNameList accepts either one
 * of these names or a raw 0xAARRGGBB hex string.
 */
export const NAMED_COLORS = {
	black: "#000000",
	white: "#ffffff",
	red: "#ff0000",
	orange: "#ff7700",
	yellow: "#ffff00",
	green: "#00ff00",
	blue: "#3399ff",
	darkBlue: "#1b3a8f",
	purple: "#bf00ff",
	indigo: "#4b0082",
	grey: "#808080",
	gray: "#808080",
};

/** Resolve a stateColorsNameList value (named colour OR hex) to a CSS colour. */
export function resolveStateColor(value, fallback = "#808080") {
	if (value == null) return fallback;
	const v = String(value).trim();
	if (v.startsWith("0x") || v.startsWith("#")) return argbHexToCss(v);
	return NAMED_COLORS[v] ?? fallback;
}

/** Telemetry columns the client supports (notes/config_keys.md §2). */
export const COLUMN_DEFS = {
	ICON: { label: "Icon", desc: "Entity profile glyph / colortag." },
	NAME: { label: "Name", desc: "Pilot or unique entity name." },
	TYPE: { label: "Type", desc: "Ship/structure hull class." },
	TAG: { label: "Tag", desc: "Fleet broadcast / manual tag." },
	DISTANCE: { label: "Distance", desc: "Range from your hull." },
	CORPORATION: { label: "Corporation", desc: "Owning corporation ticker." },
	ALLIANCE: { label: "Alliance", desc: "Owning alliance ticker." },
	FACTION: { label: "Faction", desc: "Faction affiliation." },
	MILITIA: { label: "Militia", desc: "Faction-warfare militia." },
	SIZE: { label: "Size", desc: "Signature / hull size." },
	VELOCITY: { label: "Velocity", desc: "Absolute speed (m/s)." },
	RADIALVELOCITY: { label: "Radial Velocity", desc: "Closing/opening speed." },
	TRANSVERSALVELOCITY: {
		label: "Transversal",
		desc: "Perpendicular speed (tracking).",
	},
	ANGULARVELOCITY: {
		label: "Angular",
		desc: "Angular velocity (rad/s) for turret tracking.",
	},
};

export const ALL_COLUMNS = Object.keys(COLUMN_DEFS);
