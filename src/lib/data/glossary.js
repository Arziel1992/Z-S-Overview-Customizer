/**
 * Glossary structure: which sections exist, in which order, and which entries
 * they hold. Text lives in the locale files under `glossary.<section>.<key>T`
 * (term / question) and `<key>D` (definition / answer).
 *
 * Kept apart from the component so `node --test` can check the two halves
 * against each other — a key listed here with no string, or a string with no
 * key, is a hole in the guide that nothing else would catch.
 */

export const GLOSSARY_SECTIONS = [
	{
		id: "start",
		ordered: true, // a walkthrough reads as steps, not as a dictionary
		keys: ["base", "tabs", "presets", "look", "preview", "export"],
	},
	{
		id: "terms",
		keys: [
			"profile",
			"preset",
			"tab",
			"category",
			"group",
			"type",
			"state",
			"filtered",
			"always",
			"colortag",
			"background",
			"blink",
			"bracket",
			"shipLabels",
			"columns",
			"tabColumns",
			"sde",
			"yaml",
		],
	},
	{
		id: "doing",
		keys: [
			"baseSelect",
			"import",
			"merge",
			"versions",
			"load",
			"applyOnTop",
			"exportBtn",
			"share",
			"naming",
			"counts",
			"entities",
			"groupings",
			"unsaved",
			"locks",
			"layout",
			"clear",
		],
	},
	{
		id: "faq",
		keys: [
			"tabsOpen",
			"versionsShared",
			"onDisk",
			"install",
			"expansion",
			"storage",
			"dataLoss",
		],
	},
];

/**
 * Does an entry match what someone typed? Hyphens are folded to spaces on both
 * sides, because the guide writes "always-shown states" while people search
 * for "always shown" — and a search that answers "nothing matches" to a term
 * the guide actually defines is worse than no search at all.
 */
export function glossaryMatches(entry, query) {
	const fold = (s) => (s ?? "").toLowerCase().replace(/[-–—]/g, " ");
	const q = fold(query).trim();
	if (!q) return true;
	return fold(entry.term).includes(q) || fold(entry.body).includes(q);
}
