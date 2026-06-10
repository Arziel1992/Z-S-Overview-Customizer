/**
 * Merge an incoming overview model "on top of" the current one — the behaviour
 * EVE uses when importing a partial pack over a core profile (the Z-S workflow:
 * load Core, then apply a preset pack and/or a layout pack).
 *
 *  - Presets are *additive* (replace same-named, append the rest) so preset
 *    packs add tactical views to the core.
 *  - Layout/appearance sections — tabs, columns, flag/background priorities &
 *    states, blink/colour maps and the ship-label layout — are *overwritten*
 *    wholesale whenever the incoming profile provides them (a layout pack like
 *    "Standard 2BL" replaces the bracket labels and column/tab layout rather
 *    than appending to them).
 */

function deep(value) {
	return JSON.parse(JSON.stringify(value ?? null));
}

export function mergeModel(current, incoming) {
	const out = deep(current);

	// Presets: replace same-named, append new ones.
	const byName = new Map(out.presets.map((p) => [p.name, p]));
	for (const p of incoming.presets ?? []) {
		const clone = deep(p);
		if (byName.has(p.name)) {
			const idx = out.presets.findIndex((x) => x.name === p.name);
			out.presets[idx] = clone;
		} else {
			out.presets.push(clone);
			byName.set(p.name, clone);
		}
	}

	// Tabs (layout): overwrite when the incoming profile defines any.
	if (incoming.tabs?.length) {
		out.tabs = incoming.tabs.map((t, i) => ({ ...deep(t), index: i }));
	}

	// Columns: overwrite when provided.
	if (incoming.overviewColumns?.length) {
		out.overviewColumns = deep(incoming.overviewColumns);
		if (incoming.columnOrder?.length) out.columnOrder = deep(incoming.columnOrder);
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

	if (incoming.userSettings?.length) out.userSettings = deep(incoming.userSettings);

	return out;
}
