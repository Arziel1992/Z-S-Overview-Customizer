/**
 * Guide completeness: `pnpm test`.
 *
 * Checked in both directions, because each failure is silent in the UI: a key
 * with no string renders the raw key path, and a string with no key is simply
 * never shown to anybody.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import { GLOSSARY_SECTIONS, glossaryMatches } from "../data/glossary.js";
import en from "../i18n/locales/en.js";

test("every glossary key the UI asks for has English text", () => {
	for (const section of GLOSSARY_SECTIONS) {
		const node = en.glossary?.[section.id];
		assert.ok(node, `missing section: ${section.id}`);
		for (const meta of ["title", "intro"])
			assert.equal(typeof node[meta], "string", `${section.id}.${meta}`);
		for (const key of section.keys) {
			assert.equal(typeof node[`${key}T`], "string", `${section.id}.${key}T`);
			assert.equal(typeof node[`${key}D`], "string", `${section.id}.${key}D`);
		}
	}
});

test("no English glossary text is orphaned", () => {
	for (const section of GLOSSARY_SECTIONS) {
		const expected = new Set(["title", "intro"]);
		for (const key of section.keys) {
			expected.add(`${key}T`);
			expected.add(`${key}D`);
		}
		for (const actual of Object.keys(en.glossary[section.id])) {
			assert.ok(
				expected.has(actual),
				`${section.id}.${actual} is never rendered — add it to GLOSSARY_SECTIONS or delete it`,
			);
		}
	}
});

test("the top-level chrome strings exist", () => {
	for (const key of ["title", "intro", "search", "hits", "noHits"])
		assert.equal(typeof en.glossary[key], "string", `glossary.${key}`);
});

test("the guide's search survives how people actually type", () => {
	const entry = {
		term: "Always-shown states (override)",
		body: "States that override the veto.",
	};
	// The hyphen is the tool's spelling, not the reader's.
	assert.ok(glossaryMatches(entry, "always shown"));
	assert.ok(glossaryMatches(entry, "always-shown"));
	assert.ok(glossaryMatches(entry, "OVERRIDE"), "body text counts too");
	assert.ok(glossaryMatches(entry, ""), "an empty box hides nothing");
	// …and it must still exclude: a matcher that matches everything is a
	// search box that does nothing.
	assert.equal(glossaryMatches(entry, "wormhole"), false);
	assert.equal(glossaryMatches({ term: "", body: "" }, "always"), false);
});
