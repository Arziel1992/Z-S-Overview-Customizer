/**
 * Builds the floating "bracket" label HTML for a preview entity from the
 * profile's shipLabelOrder + shipLabels.
 *
 * Each ordered segment contributes `pre + fieldValue + post`, where pre/post
 * may themselves contain EVE inline markup (renderEveMarkup handles the
 * stateful open/close balancing), plus segment-level styling: bold / italic /
 * underline flags, a pixel font size, and an [r,g,b] float-triplet colour.
 * `linebreak` segments emit <br/>; `null` entries are spacers and contribute
 * nothing visible; segments whose field resolves to an empty value are skipped
 * entirely (so their pre/post brackets don't render around nothing).
 */

import { floatTripletToCss, renderEveMarkup } from "$lib/utils/eveFormat";

/** Maps a shipLabels segment key/type to the roster-entity field it displays. */
const FIELD = {
	"ship type": (e) => e.type,
	"ship name": (e) => e.shipName,
	"pilot name": (e) => e.pilotName,
	alliance: (e) => e.alliance,
	corporation: (e) => e.corp,
	faction: (e) => e.faction,
	militia: (e) => e.militia,
};

/** Inline CSS for a segment's own styling flags (markup styling is separate). */
function segmentStyle(cfg) {
	const s = [];
	if (cfg.bold) s.push("font-weight:700");
	if (cfg.italic) s.push("font-style:italic");
	if (cfg.underline) s.push("text-decoration:underline");
	if (cfg.fontsize) s.push(`font-size:${cfg.fontsize}px`);
	if (Array.isArray(cfg.color)) s.push(`color:${floatTripletToCss(cfg.color)}`);
	return s.join(";");
}

const EMPTY_FIELD = new Set(["", "—", null, undefined]);

export function buildShipLabelHtml(entity, order, labels) {
	if (!entity || !Array.isArray(order)) return "";
	const parts = [];

	for (const key of order) {
		if (key == null) continue; // explicit spacer
		if (key === "linebreak") {
			parts.push("<br/>");
			continue;
		}
		const cfg = labels?.[key];
		if (!cfg) continue;

		const getter = FIELD[key] ?? FIELD[cfg.type];
		const value = getter ? getter(entity) : "";
		if (EMPTY_FIELD.has(value)) continue;

		const inner = renderEveMarkup(`${cfg.pre ?? ""}${value}${cfg.post ?? ""}`);
		const style = segmentStyle(cfg);
		parts.push(style ? `<span style="${style}">${inner}</span>` : inner);
	}

	return parts.join("");
}
