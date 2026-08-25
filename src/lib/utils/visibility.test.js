/**
 * Visibility truth table: `pnpm test`.
 *
 * Every combination of the two gates, so a future change to the rule cannot
 * quietly flip one cell. The row that matters most is the last one: an
 * always-shown state must NOT pull a hull onto a tab that filters that hull
 * out (player report, 2026-08-25) — while still rescuing an authorised hull
 * from a state veto.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { resolveVisibility } from "./visibility.js";

const LOGI = { groups: [832], filteredStates: [11], alwaysShownStates: [13] };
const scimitar = (states) => ({ groupId: 832, states });
const hauler = (states) => ({ groupId: 28, states });

test("an authorised hull with no interesting state renders", () => {
	assert.equal(resolveVisibility(scimitar([]), LOGI).visible, true);
});

test("a filtered state hides an authorised hull", () => {
	assert.equal(resolveVisibility(scimitar([11]), LOGI).visible, false);
});

test("an always-shown state outranks the veto on an authorised hull", () => {
	const r = resolveVisibility(scimitar([11, 13]), LOGI);
	assert.equal(r.visible, true);
	assert.equal(r.forcedOverVeto, true, "the row should be marked as rescued");
});

test("an always-shown state does NOT authorise an unlisted hull", () => {
	// The whole point of the report: a war target in a hauler must stay off a
	// logi tab, even though 13 is always-shown.
	const r = resolveVisibility(hauler([13]), LOGI);
	assert.equal(r.visible, false);
	assert.equal(r.forced, true, "the state still matches…");
	assert.equal(r.inGroups, false, "…but the hull is not authorised");
	assert.equal(r.forcedOverVeto, false);
});

test("an unlisted hull is hidden whatever its states", () => {
	for (const states of [[], [11], [13], [11, 13]]) {
		assert.equal(
			resolveVisibility(hauler(states), LOGI).visible,
			false,
			`hauler with ${JSON.stringify(states)} should be hidden`,
		);
	}
});

test("an empty or missing preset shows nothing", () => {
	assert.equal(resolveVisibility(scimitar([13]), {}).visible, false);
	assert.equal(resolveVisibility(scimitar([13]), null).visible, false);
	assert.equal(resolveVisibility(null, LOGI).visible, false);
});
