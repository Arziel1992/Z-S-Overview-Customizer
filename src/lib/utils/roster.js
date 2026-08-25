/**
 * Preview-roster helpers, kept plain (no runes) so `node --test` can exercise
 * them: the entity shape every roster entry is filled out to, and the
 * fingerprint that decides whether the working roster has unsaved changes.
 */

/**
 * Every field a preview entity carries. Saved groupings and the built-in
 * samples store *partial* entities, so both the store's addEntity() and the
 * fingerprint below fill the gaps from here — one shape, one place.
 */
export const ENTITY_DEFAULTS = {
	pilotName: "New Pilot",
	shipName: "",
	type: "Rifter",
	typeId: 587,
	groupId: 25,
	corp: "—",
	alliance: "—",
	faction: "—",
	militia: "—",
	size: "S",
	states: [],
	distance: 10000,
	velocity: 0,
	radial: 0,
	transversal: 0,
	angular: 0,
};

/**
 * Content fingerprint of an entity list, ignoring row ids and key order.
 *
 * Two lists that would render identically must produce the same string, or
 * the UI shows a permanent "unsaved" dot on a grouping the user just loaded;
 * two lists that differ in any field must produce different strings, or an
 * edit is silently discarded when the next grouping loads. Both directions
 * are covered in roster.test.js.
 */
export function entitySig(entities) {
	return JSON.stringify(
		(entities ?? []).map(({ id, ...rest }) => {
			const full = { ...ENTITY_DEFAULTS, ...rest };
			return Object.keys(full)
				.sort()
				.map((k) => [k, full[k]]);
		}),
	);
}

/** Strip row ids and detach the state arrays — the shape groupings store. */
export function toStoredEntities(roster) {
	return (roster ?? []).map(({ id, ...rest }) => ({
		...rest,
		states: [...(rest.states ?? [])],
	}));
}
