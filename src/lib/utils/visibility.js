/**
 * Preset visibility rule — does this entity render under this preset?
 *
 * Kept plain (no runes) so `node --test` can exercise the whole truth table;
 * the store's resolveEntity() calls it and adds colours on top.
 *
 * The client evaluates two independent gates:
 *
 *   1. **Types** — the preset's `groups` whitelist. A hull whose groupID is not
 *      listed never renders, full stop.
 *   2. **States** — within an authorised hull, `filteredStates` vetoes and
 *      `alwaysShownStates` overrides that veto.
 *
 * So `alwaysShownStates` is scoped to *states*, matching EVE University's
 * wording: "Entities with this state will always be shown regardless of the
 * display setting of additional states they may have." It rescues a war target
 * from a friendly-veto on a combat tab; it does NOT drag a hull onto a tab that
 * filters that hull out — a logi tab stays a logi tab.
 */

/**
 * @param {{states?: number[], groupId?: number}} entity
 * @param {{groups?: number[], filteredStates?: number[],
 *          alwaysShownStates?: number[]}} preset
 * @returns {{visible: boolean, inGroups: boolean, forced: boolean,
 *            vetoed: boolean, forcedOverVeto: boolean}}
 *   `forcedOverVeto` marks the rows worth explaining in the UI: on screen only
 *   because an always-shown state outranked a state that would have hidden them.
 */
export function resolveVisibility(entity, preset) {
	const states = entity?.states ?? [];
	const inGroups = preset?.groups?.includes(entity?.groupId) ?? false;
	const forced = states.some((s) => preset?.alwaysShownStates?.includes(s));
	const vetoed = states.some((s) => preset?.filteredStates?.includes(s));
	return {
		visible: inGroups && (forced || !vetoed),
		inGroups,
		forced,
		vetoed,
		forcedOverVeto: inGroups && forced && vetoed,
	};
}
