/**
 * EVE Online Overview State Matrix — single source of truth for the client's
 * integer "state" identifiers (relationship / legal / standing conditions).
 *
 * These integers are what the game's YAML actually stores in flagOrder,
 * backgroundOrder, filteredStates etc.; everything in the app derives display
 * names from here, never the reverse.
 *
 * Taxonomy corrected against Tomas Iridium's (Iridium Overview) canonical list:
 *   https://github.com/iridiumops/overview/blob/main/parts/states_all.yaml
 * Per his notes, the same ids drive filters, backgrounds and flags alike — with
 * the exception of the wreck ids (36/37), which the client honours ONLY in
 * filteredStates / alwaysShownStates (never as a colortag or background). Those
 * carry `filterOnly: true`. Id 20 has no observed in-game meaning but appears in
 * YAML exports, so it is retained as a reserved passthrough.
 *
 * `kind` loosely buckets states for display purposes:
 *   legal | standing | affiliation | militia | misc
 * `color` is the canonical default used when a profile's stateColorsNameList
 * doesn't override that state.
 */

import { argbHexToCss } from "$lib/utils/eveFormat";

// `name` is the verbatim in-game / Iridium label for each state — kept exact so
// the UI text matches what the client shows; do not paraphrase these strings.
export const STATES = {
	9: { name: "Pilot has a security status below -5", kind: "legal", color: "red" },
	10: { name: "Pilot has a security status below 0", kind: "legal", color: "orange" },
	11: { name: "Pilot is in your fleet", kind: "affiliation", color: "purple" },
	12: { name: "Pilot is in your Capsuleer corporation", kind: "affiliation", color: "green" },
	13: { name: "Pilot is at war with your corporation/alliance", kind: "legal", color: "red" },
	14: { name: "Pilot is in your alliance", kind: "affiliation", color: "blue" },
	15: { name: "Pilot has Excellent Standing", kind: "standing", color: "darkBlue" },
	16: { name: "Pilot has Good Standing", kind: "standing", color: "darkBlue" },
	17: { name: "Pilot has Neutral Standing", kind: "standing", color: "grey" },
	18: { name: "Pilot has Bad Standing", kind: "standing", color: "orange" },
	19: { name: "Pilot has Terrible Standing", kind: "standing", color: "red" },
	20: { name: "Reserved (20)", kind: "misc", color: "grey" },
	21: { name: "Pilot (agent) is interactable", kind: "misc", color: "white" },
	36: { name: "Wreck is already viewed", kind: "misc", color: "grey", filterOnly: true },
	37: { name: "Wreck is empty", kind: "misc", color: "grey", filterOnly: true },
	44: { name: "Pilot is at war with your militia", kind: "militia", color: "red" },
	45: { name: "Pilot is in your militia or allied to your militia", kind: "militia", color: "blue" },
	48: { name: "Pilot has No Standing", kind: "standing", color: "grey" },
	49: { name: "Pilot is an ally in one or more of your wars", kind: "legal", color: "blue" },
	50: { name: "Pilot is a suspect", kind: "legal", color: "yellow" },
	51: { name: "Pilot is a criminal", kind: "legal", color: "red" },
	52: { name: "Pilot has a limited engagement with you", kind: "legal", color: "orange" },
	53: { name: "Pilot has a killright on them that you can activate", kind: "legal", color: "orange" },
	66: { name: "Pilot is in your Non Capsuleer corporation", kind: "affiliation", color: "green" },
	68: { name: "Pilot has retribution timer", kind: "legal", color: "orange" },
};

/** All state ids the UI knows about, in ascending numeric order. */
export const ALL_STATE_IDS = Object.keys(STATES)
	.map(Number)
	.sort((a, b) => a - b);

/**
 * State ids valid as colortag/background appearance targets — everything except
 * the wreck ids (36/37), which the client only evaluates as filters.
 */
export const APPEARANCE_STATE_IDS = ALL_STATE_IDS.filter(
	(id) => !STATES[id]?.filterOnly,
);

export function stateName(id) {
	return STATES[id]?.name ?? `State ${id}`;
}

export function stateKind(id) {
	return STATES[id]?.kind ?? "misc";
}

/** True for ids the client honours only in filters, never as flag/background. */
export function isFilterOnlyState(id) {
	return STATES[id]?.filterOnly === true;
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
