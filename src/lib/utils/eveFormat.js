/**
 * EVE Online Overview YAML codec.
 *
 * The live client serialises its overview profile as YAML using Python-style
 * ordered maps encoded as lists of [key, value] pairs (e.g. `presets`,
 * `tabSetup`, `shipLabels`, `stateBlinks`, `stateColorsNameList`). This module
 * uses js-yaml for the raw parse/dump and owns the EVE-specific shape
 * conversions plus colour/markup helpers, so the rest of the app works with
 * plain normalized objects.
 */

import yaml from "js-yaml";

/* ------------------------------------------------------------------ */
/* Ordered-map (list-of-pairs) helpers                                 */
/* ------------------------------------------------------------------ */

/** `[['a', 1], ['b', 2]]` -> `{ a: 1, b: 2 }` (shallow). */
export function pairsToObject(pairs) {
	const out = {};
	if (!Array.isArray(pairs)) return out;
	for (const pair of pairs) {
		if (Array.isArray(pair) && pair.length >= 1) out[pair[0]] = pair[1];
	}
	return out;
}

/** `{ a: 1, b: 2 }` -> `[['a', 1], ['b', 2]]`, honouring `keyOrder` if given. */
export function objectToPairs(obj, keyOrder) {
	const keys = keyOrder ?? Object.keys(obj);
	return keys.map((k) => [k, obj[k]]);
}

/* ------------------------------------------------------------------ */
/* Colour helpers                                                      */
/* ------------------------------------------------------------------ */

function clampByte(n) {
	return Math.max(0, Math.min(255, Math.round(n)));
}

/** `0xffff6666` | `ffff6666` | `#ff6666` -> `#ff6666` (alpha stripped). */
export function argbHexToCss(hex) {
	if (hex == null) return "#000000";
	let h = String(hex).trim().replace(/^0x/i, "").replace(/^#/, "");
	if (h.length === 8) h = h.slice(2); // drop AA
	if (h.length === 3)
		h = h
			.split("")
			.map((c) => c + c)
			.join("");
	if (h.length !== 6) return "#000000";
	return `#${h.toLowerCase()}`;
}

/** `#ff6666` -> `0xffff6666` (fully opaque). */
export function cssToArgbHex(css) {
	const h = String(css).trim().replace(/^#/, "");
	return `0xff${h.toLowerCase()}`;
}

/** `[1, 0.7, 0]` (0..1 floats) -> `#ffb300`. */
export function floatTripletToCss(triplet) {
	if (!Array.isArray(triplet) || triplet.length < 3) return "#ffffff";
	const [r, g, b] = triplet;
	const hex = (n) => clampByte(n * 255).toString(16).padStart(2, "0");
	return `#${hex(r)}${hex(g)}${hex(b)}`;
}

/** `#ffb300` -> `[1, 0.7, 0]` (0..1 floats, 3-dp). */
export function cssToFloatTriplet(css) {
	const h = String(css).trim().replace(/^#/, "");
	if (h.length !== 6) return [1, 1, 1];
	const part = (i) => Number((parseInt(h.slice(i, i + 2), 16) / 255).toFixed(3));
	return [part(0), part(2), part(4)];
}

/**
 * Convert EVE inline markup to safe HTML for previews.
 * Supports `<color=0xAARRGGBB>`, `<fontsize=NN>`, `<b>`, `<i>`, `<u>` and closes.
 *
 * EVE markup is stateful: tags often stay *open* within a single label segment
 * (e.g. a ship-type prefix `<fontsize=12><color=0x..><b> <u>` closed in a later
 * segment) and stray closing tags appear on their own. We therefore balance the
 * output ourselves — converting every tag, tracking open spans, and auto-closing
 * any left open — instead of requiring matched pairs (which left unhandled tags
 * such as `<fontsize=..>` showing as literal text).
 */
export function renderEveMarkup(raw) {
	if (raw == null) return "";
	const escaped = escapeHtml(String(raw));
	let open = 0; // count of open inline elements to auto-close at the end
	const out = escaped.replace(
		/&lt;(\/?)(color(?:=0x[0-9a-fA-F]+)?|fontsize(?:=\d+)?|b|i|u)&gt;/g,
		(_, slash, tag) => {
			if (slash) {
				if (open > 0) {
					open--;
					return "</span>";
				}
				return ""; // stray close tag — drop it
			}
			open++;
			if (tag.startsWith("color=")) {
				return `<span style="color:${argbHexToCss(tag.slice(6))}">`;
			}
			if (tag.startsWith("fontsize=")) {
				return `<span style="font-size:${tag.slice(9)}px">`;
			}
			const style =
				tag === "b"
					? "font-weight:700"
					: tag === "i"
						? "font-style:italic"
						: "text-decoration:underline";
			return `<span style="${style}">`;
		},
	);
	return out + "</span>".repeat(open);
}

/** Strip all markup to plain text (for aria-labels, dropdowns). */
export function stripEveMarkup(raw) {
	if (raw == null) return "";
	return String(raw)
		.replace(/<\/?(?:color(?:=0x[0-9a-fA-F]+)?|fontsize(?:=\d+)?)>/g, "")
		.replace(/<\/?[biu]>/g, "")
		.trim();
}

function escapeHtml(s) {
	return s
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;");
}

/* ------------------------------------------------------------------ */
/* Parse                                                               */
/* ------------------------------------------------------------------ */

// Real exports key one shipLabels entry by a literal YAML `null` (a spacer
// segment). JS objects can't have a null key, so it is stored under this
// sentinel and translated back to null on serialize.
const NULL_LABEL_KEY = "__null__";

/** Coerce a YAML array to clean integers, dropping nulls (empty `- ` lines). */
function intList(arr) {
	return Array.isArray(arr) ? arr.filter((x) => x != null).map(Number) : [];
}

/**
 * Parse a raw EVE overview .yaml string into the app's normalized model.
 *
 * The game serialises several sections as ordered maps encoded as lists of
 * [key, value] pairs (presets, tabSetup, shipLabels, stateBlinks,
 * stateColorsNameList); each is unwrapped via pairsToObject so the rest of the
 * app deals with plain objects. Missing sections come back as empty arrays /
 * objects, which lets partial pack pieces parse cleanly.
 *
 * @param {string} text raw YAML
 * @returns the normalized model consumed by customiserStore.applyModel()
 * @throws {YAMLException} when the input isn't valid YAML
 */
export function parseOverviewYaml(text) {
	const raw = yaml.load(text) ?? {};

	const presets = (raw.presets ?? []).map(([name, body]) => {
		const b = pairsToObject(body);
		return {
			name,
			alwaysShownStates: intList(b.alwaysShownStates),
			filteredStates: intList(b.filteredStates),
			groups: intList(b.groups),
		};
	});

	const tabs = (raw.tabSetup ?? []).map(([index, body]) => {
		const b = pairsToObject(body);
		return {
			index: Number(index),
			name: b.name ?? "",
			color: Array.isArray(b.color) ? b.color : null,
			overview: b.overview ?? null,
			bracket: b.bracket ?? null,
		};
	});

	const shipLabels = {};
	(raw.shipLabels ?? []).forEach(([key, body]) => {
		const b = pairsToObject(body);
		const k = key == null ? NULL_LABEL_KEY : key;
		shipLabels[k] = {
			type: b.type ?? (key == null ? null : key),
			pre: b.pre ?? "",
			post: b.post ?? "",
			state: b.state ?? null,
			bold: !!b.bold,
			italic: !!b.italic,
			underline: !!b.underline,
			fontsize: b.fontsize ?? null,
			color: Array.isArray(b.color) ? b.color : null,
		};
	});

	return {
		presets,
		tabs,
		columnOrder: (raw.columnOrder ?? []).map(String),
		overviewColumns: (raw.overviewColumns ?? []).map(String),
		flagOrder: intList(raw.flagOrder),
		backgroundOrder: intList(raw.backgroundOrder),
		flagStates: intList(raw.flagStates),
		backgroundStates: intList(raw.backgroundStates),
		stateBlinks: pairsToObject(raw.stateBlinks ?? []),
		stateColors: pairsToObject(raw.stateColorsNameList ?? []),
		shipLabelOrder: raw.shipLabelOrder ?? [],
		shipLabels,
		userSettings: raw.userSettings ?? [],
	};
}

/* ------------------------------------------------------------------ */
/* Serialize                                                           */
/* ------------------------------------------------------------------ */

// Attribute order inside each serialized shipLabels entry. Fixed so exports
// are deterministic and diff cleanly between versions.
const LABEL_PAIR_ORDER = [
	"type",
	"pre",
	"post",
	"state",
	"bold",
	"italic",
	"underline",
	"fontsize",
	"color",
];

/**
 * Serialize the normalized model back into a genuine, in-game-importable
 * EVE overview .yaml string.
 *
 * Faithfulness rules (verified by round-tripping real Z-S exports):
 *  - top-level keys are emitted in the same order the client exports them;
 *  - ordered-map sections are rebuilt as lists of [key, value] pairs;
 *  - bold/italic/underline are written as 1/0 (the client's convention),
 *    everything missing as explicit `null`.
 */
export function serializeOverviewYaml(model) {
	const out = {};

	out.backgroundOrder = [...model.backgroundOrder];
	out.backgroundStates = [...model.backgroundStates];
	out.columnOrder = [...model.columnOrder];
	out.flagOrder = [...model.flagOrder];
	out.flagStates = [...model.flagStates];
	out.overviewColumns = [...model.overviewColumns];

	out.presets = model.presets.map((p) => [
		p.name,
		[
			["alwaysShownStates", [...p.alwaysShownStates]],
			["filteredStates", [...p.filteredStates]],
			["groups", [...p.groups]],
		],
	]);

	out.shipLabelOrder = [...model.shipLabelOrder];

	out.shipLabels = Object.entries(model.shipLabels).map(([key, cfg]) => {
		const realKey = key === NULL_LABEL_KEY ? null : key;
		const pairs = LABEL_PAIR_ORDER.map((attr) => {
			let v = cfg[attr];
			if (attr === "bold" || attr === "italic" || attr === "underline")
				v = v ? 1 : 0;
			return [attr, v ?? null];
		});
		return [realKey, pairs];
	});

	out.stateBlinks = objectToPairs(model.stateBlinks);
	out.stateColorsNameList = objectToPairs(model.stateColors);

	out.tabSetup = model.tabs.map((t) => [
		t.index,
		[
			["bracket", t.bracket ?? null],
			["color", t.color ?? null],
			["name", t.name ?? ""],
			["overview", t.overview ?? null],
		],
	]);

	out.userSettings = model.userSettings ?? [];

	return yaml.dump(out, {
		lineWidth: -1,
		noRefs: true,
		sortKeys: false,
		quotingType: '"',
		forceQuotes: false,
	});
}

export { NULL_LABEL_KEY };
