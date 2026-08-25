/**
 * Unsaved-changes self-check: `pnpm test`.
 *
 * The fingerprint drives whether the roster panel shows an "unsaved" dot and
 * whether switching groupings stashes the current entities, so it is checked
 * in BOTH directions — a false positive nags on every freshly loaded
 * grouping, a false negative throws the user's edits away.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { ENTITY_DEFAULTS, entitySig, toStoredEntities } from "./roster.js";

// A stored grouping entry: partial, exactly as the samples ship them.
const STORED = [
	{ pilotName: "Chribba", type: "Veldnaught", typeId: 1230, groupId: 462 },
];
// The same entry once the store has loaded it into the live roster.
const LOADED = [{ id: 1, ...ENTITY_DEFAULTS, ...STORED[0] }];

test("a freshly loaded grouping does not read as unsaved", () => {
	assert.equal(entitySig(STORED), entitySig(LOADED));
});

test("an id or key-order difference alone is not a change", () => {
	const reordered = [
		{ groupId: 462, typeId: 1230, type: "Veldnaught", pilotName: "Chribba" },
	];
	assert.equal(entitySig(STORED), entitySig(reordered));
	assert.equal(entitySig(LOADED), entitySig([{ ...LOADED[0], id: 99 }]));
});

test("every edit the modal can make is detected", () => {
	// One case per field kind: text, number, and the states array — the last
	// matters most, since states are mutated in place by the state buttons.
	const edits = [
		{ pilotName: "Chribba II" },
		{ distance: 12800 },
		{ states: [11, 18] },
	];
	for (const edit of edits) {
		assert.notEqual(
			entitySig(LOADED),
			entitySig([{ ...LOADED[0], ...edit }]),
			`edit not detected: ${JSON.stringify(edit)}`,
		);
	}
	// Adding and removing rows counts too.
	assert.notEqual(entitySig(LOADED), entitySig([...LOADED, ...LOADED]));
	assert.notEqual(entitySig(LOADED), entitySig([]));
});

test("saving a grouping round-trips back to the same fingerprint", () => {
	const saved = toStoredEntities(LOADED);
	assert.equal(saved[0].id, undefined);
	assert.equal(entitySig(saved), entitySig(LOADED));
	// States must be detached, or editing the roster would mutate the grouping.
	saved[0].states.push(11);
	assert.deepEqual(LOADED[0].states, []);
});
