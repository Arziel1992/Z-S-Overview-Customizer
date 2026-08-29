/**
 * Preset identity and diffing.
 *
 * Shared by the merge — which has to decide whether an incoming preset
 * *updates* one you already hold or is a genuinely new one — and by Compare,
 * which cannot say what changed until it has lined two profiles' presets up.
 *
 * Identity is the whole problem. A preset name carries EVE colour markup, and
 * pack maintainers restyle it between releases: between Z-S v9 and v10 only 6
 * of 68 preset names match byte-for-byte, while 58 match once the markup is
 * stripped. Pairing on the raw name alone therefore reads 52 recoloured
 * presets as brand-new ones, and you end up holding two of each — one stale,
 * one current, indistinguishable in the client's dropdown.
 *
 * The rule, in order:
 *   1. an exact raw-name hit always wins;
 *   2. otherwise a *unique* visible-name hit updates in place;
 *   3. an ambiguous visible name is never guessed at — it appends.
 *
 * Rule 3 is the one that keeps this safe: someone may deliberately keep two
 * presets whose visible names are identical and whose colours are not, and
 * silently collapsing those would destroy a preset rather than duplicate one.
 */

import { stripEveMarkup } from "./eveFormat.js";

/** Sentinel: this visible name belongs to more than one preset, so it can't identify one. */
const AMBIGUOUS = -2;
export const NO_MATCH = -1;

/**
 * A preset's identity for pairing: the name as a player actually sees it.
 * Case and run-length of whitespace are cosmetic in a name, so both fold —
 * anything more aggressive starts merging presets that only look alike
 * ("--- Travel: All" is not "Travel: All").
 */
export function presetKey(name) {
	return stripEveMarkup(name).replace(/\s+/g, " ").trim().toLowerCase();
}

/**
 * Build a lookup from a preset list. Returns `name -> index in that list`,
 * or NO_MATCH when nothing pairs. See the rule order in the module comment.
 */
export function presetMatcher(presets) {
	const raw = new Map();
	const visible = new Map();
	(presets ?? []).forEach((p, i) => {
		if (!raw.has(p.name)) raw.set(p.name, i);
		const k = presetKey(p.name);
		visible.set(k, visible.has(k) ? AMBIGUOUS : i);
	});
	return (name) => {
		const exact = raw.get(name);
		if (exact != null) return exact;
		const byVisible = visible.get(presetKey(name));
		return byVisible == null || byVisible === AMBIGUOUS ? NO_MATCH : byVisible;
	};
}

const sortNum = (list) => [...new Set(list ?? [])].sort((a, b) => a - b);
const missing = (from, other) => {
	const set = new Set(other ?? []);
	return sortNum(from).filter((x) => !set.has(x));
};

/**
 * Compare two profiles' preset lists, paired by {@link presetMatcher}.
 *
 * Every preset on either side appears exactly once, classified:
 *   `onlyA`   — in the first profile only (yours, with no counterpart upstream)
 *   `onlyB`   — in the second only (new upstream: you are missing it)
 *   `same`    — paired, and every group and state list identical
 *   `differs` — paired, but something moved
 *
 * `added` / `removed` are group ids gained and lost going A -> B, so a row
 * reads directly as "what would change if I took theirs".
 */
export function diffPresets(a, b) {
	const listA = a ?? [];
	const listB = b ?? [];
	const matchInA = presetMatcher(listA);
	const takenInA = new Set();
	const rows = [];

	for (const pb of listB) {
		const i = matchInA(pb.name);
		const pa = i === NO_MATCH || takenInA.has(i) ? null : listA[i];
		if (pa) takenInA.add(i);
		rows.push(buildRow(pa, pb));
	}
	// Whatever in A never got claimed has no counterpart in B.
	listA.forEach((pa, i) => {
		if (!takenInA.has(i)) rows.push(buildRow(pa, null));
	});

	return rows.sort((x, y) =>
		stripEveMarkup(x.name).localeCompare(stripEveMarkup(y.name)),
	);
}

function buildRow(pa, pb) {
	const added = pa && pb ? missing(pb.groups, pa.groups) : [];
	const removed = pa && pb ? missing(pa.groups, pb.groups) : [];
	const statesMoved =
		pa &&
		pb &&
		(missing(pa.filteredStates, pb.filteredStates).length > 0 ||
			missing(pb.filteredStates, pa.filteredStates).length > 0 ||
			missing(pa.alwaysShownStates, pb.alwaysShownStates).length > 0 ||
			missing(pb.alwaysShownStates, pa.alwaysShownStates).length > 0);

	let status = "same";
	if (!pa) status = "onlyB";
	else if (!pb) status = "onlyA";
	else if (added.length || removed.length || statesMoved) status = "differs";

	return {
		key: presetKey((pa ?? pb).name),
		name: (pa ?? pb).name,
		a: pa,
		b: pb,
		status,
		added,
		removed,
		statesMoved: !!statesMoved,
	};
}
