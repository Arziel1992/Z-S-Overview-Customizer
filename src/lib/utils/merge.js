/**
 * Merge an incoming overview model "on top of" the current one — the behaviour
 * EVE uses when importing a partial pack over a core profile (the Z-S workflow:
 * load Core, then apply a preset pack and/or a layout pack).
 *
 *  - Presets are *additive* (update the matching one, append the rest) so
 *    preset packs add tactical views to the core. Matching is by preset
 *    identity, not raw string — see `presets.js` for why that distinction is
 *    the difference between updating 52 presets and duplicating them.
 *  - Layout/appearance sections — tabs, columns, flag/background priorities &
 *    states, blink/colour maps and the ship-label layout — are *overwritten*
 *    wholesale whenever the incoming profile provides them (a layout pack like
 *    "Standard 2BL" replaces the bracket labels and column/tab layout rather
 *    than appending to them).
 *
 * A model carrying nothing but `presets` therefore merges presets and touches
 * nothing else — every other section is guarded on the incoming value being
 * non-empty. That is exactly what the importer's "presets only" mode passes,
 * and it is why that mode needs no special case here.
 */

import { NO_MATCH, presetMatcher } from "./presets.js";

function deep(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

export function mergeModel(current, incoming) {
	const out = deep(current);

	// Presets: update the one this incoming preset *is*, append when it is new.
	// The matcher reads the list as it was BEFORE this merge, and each slot may
	// be claimed once — otherwise two incoming presets that pair to the same
	// slot would overwrite each other and one would be lost outright. An
	// incoming preset that appends is still tracked by raw name, so a pack
	// repeating a name updates its own entry rather than stacking copies.
	const matchExisting = presetMatcher(out.presets);
	const claimed = new Set();
	const appended = new Map();
	for (const p of incoming.presets ?? []) {
		if (appended.has(p.name)) {
			out.presets[appended.get(p.name)] = deep(p);
			continue;
		}
		const i = matchExisting(p.name);
		if (i !== NO_MATCH && !claimed.has(i)) {
			out.presets[i] = deep(p);
			claimed.add(i);
			continue;
		}
		appended.set(p.name, out.presets.length);
		out.presets.push(deep(p));
	}

	// Tabs (layout): overwrite when the incoming profile defines any.
	if (incoming.tabs?.length) {
		out.tabs = incoming.tabs.map((t, i) => ({ ...deep(t), index: i }));
	}

	// Columns: overwrite when provided.
	if (incoming.overviewColumns?.length) {
		out.overviewColumns = deep(incoming.overviewColumns);
		if (incoming.columnOrder?.length)
			out.columnOrder = deep(incoming.columnOrder);
	}

	// Priority orders / authorized states: overwrite when provided.
	for (const key of [
		"flagOrder",
		"backgroundOrder",
		"flagStates",
		"backgroundStates",
	]) {
		if (incoming[key]?.length) out[key] = deep(incoming[key]);
	}

	// Blink/colour maps: overwrite when provided, else keep current.
	if (incoming.stateBlinks && Object.keys(incoming.stateBlinks).length)
		out.stateBlinks = deep(incoming.stateBlinks);
	if (incoming.stateColors && Object.keys(incoming.stateColors).length)
		out.stateColors = deep(incoming.stateColors);

	// Ship-label layout: overwrite wholesale when the incoming defines an order.
	if (incoming.shipLabelOrder?.length) {
		out.shipLabelOrder = deep(incoming.shipLabelOrder);
		out.shipLabels = deep(incoming.shipLabels);
	}

	if (incoming.userSettings?.length)
		out.userSettings = deep(incoming.userSettings);

	return out;
}
