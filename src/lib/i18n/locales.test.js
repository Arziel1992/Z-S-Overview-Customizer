/**
 * Locale parity: `pnpm test`.
 *
 * en.js is the reference; a key missing from another locale silently falls
 * back to English, and a key that exists ONLY in another locale is dead weight
 * nothing renders. Both are invisible in the UI, so both are checked here.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import en from "./locales/en.js";
import es from "./locales/es.js";

/** Dotted paths of every leaf string in a locale object. */
function paths(node, prefix = "") {
	return Object.entries(node).flatMap(([k, v]) =>
		v && typeof v === "object" ? paths(v, `${prefix}${k}.`) : [`${prefix}${k}`],
	);
}

const EN = new Set(paths(en));
const ES = new Set(paths(es));

test("every English key has a Spanish translation", () => {
	const missing = [...EN].filter((k) => !ES.has(k));
	assert.deepEqual(missing, [], `untranslated: ${missing.join(", ")}`);
});

test("Spanish carries no keys English does not", () => {
	const orphans = [...ES].filter((k) => !EN.has(k));
	assert.deepEqual(orphans, [], `orphaned: ${orphans.join(", ")}`);
});

test("no locale value is left empty", () => {
	for (const [name, loc] of [
		["en", en],
		["es", es],
	]) {
		for (const p of paths(loc)) {
			const value = p.split(".").reduce((n, k) => n[k], loc);
			assert.equal(typeof value, "string", `${name}.${p} is not a string`);
			assert.ok(value.trim(), `${name}.${p} is empty`);
		}
	}
});
