/**
 * Merge an incoming overview model "on top of" the current one — the behaviour
 * EVE uses when importing a partial pack (e.g. the Z-S add-on pieces) over a
 * core profile. A section is only overridden when the incoming profile actually
 * carries it (non-empty); presets/tabs are additive.
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

	// Tabs: append incoming tabs, re-indexing sequentially, capped at 8.
	if (incoming.tabs?.length) {
		const merged = [...out.tabs.map(deep)];
		for (const t of incoming.tabs) merged.push(deep(t));
		out.tabs = merged.slice(0, 8).map((t, i) => ({ ...t, index: i }));
	}

	// Whole-section overrides only when the incoming profile provides them.
	if (incoming.overviewColumns?.length) {
		out.overviewColumns = deep(incoming.overviewColumns);
		if (incoming.columnOrder?.length) out.columnOrder = deep(incoming.columnOrder);
	}
	for (const key of [
		"flagOrder",
		"backgroundOrder",
		"flagStates",
		"backgroundStates",
	]) {
		if (incoming[key]?.length) out[key] = deep(incoming[key]);
	}

	// State blink/colour maps merge key-by-key (incoming wins).
	out.stateBlinks = { ...out.stateBlinks, ...(incoming.stateBlinks ?? {}) };
	out.stateColors = { ...out.stateColors, ...(incoming.stateColors ?? {}) };

	// Ship labels: replace wholesale if the incoming profile defines an order.
	if (incoming.shipLabelOrder?.length) {
		out.shipLabelOrder = deep(incoming.shipLabelOrder);
		out.shipLabels = deep(incoming.shipLabels);
	}

	if (incoming.userSettings?.length) out.userSettings = deep(incoming.userSettings);

	return out;
}
