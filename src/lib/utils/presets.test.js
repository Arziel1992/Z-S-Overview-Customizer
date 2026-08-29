/**
 * Preset identity, merging and diffing: `pnpm test`.
 *
 * Every check runs in both directions, because both failures are silent and
 * only one of them looks like a failure. Pairing too little duplicates a
 * preset — visible, annoying, recoverable. Pairing too much *overwrites* a
 * preset you meant to keep, which looks like nothing at all until you undock.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import { test } from "node:test";
import { parseOverviewYaml } from "./eveFormat.js";
import { mergeModel } from "./merge.js";
import { diffPresets, NO_MATCH, presetKey, presetMatcher } from "./presets.js";

const P = (name, groups = [], filteredStates = [], alwaysShownStates = []) => ({
	name,
	groups,
	filteredStates,
	alwaysShownStates,
});

const EMPTY = {
	presets: [],
	tabs: [],
	columnOrder: [],
	overviewColumns: [],
	flagOrder: [],
	backgroundOrder: [],
	flagStates: [],
	backgroundStates: [],
	stateBlinks: {},
	stateColors: {},
	shipLabelOrder: [],
	shipLabels: {},
	userSettings: [],
};

test("presetKey ignores what is cosmetic and only what is cosmetic", () => {
	// Colour markup is the thing packs restyle between releases.
	assert.equal(
		presetKey("<color=0xFF66FF66>➲ Extra: Align Points</color>"),
		presetKey("➲ Extra: Align Points"),
	);
	assert.equal(presetKey("  Travel:  All "), presetKey("travel: all"));
	// …and it must still tell genuinely different presets apart: Z-S ships
	// both of these, and folding them together would lose one.
	assert.notEqual(presetKey("✈ --- Travel: All"), presetKey("✈ Travel: All"));
	assert.notEqual(presetKey("Target: Recons"), presetKey("Target: Logi"));
});

test("an exact raw name beats a visible-name guess", () => {
	const match = presetMatcher([
		P("<color=0xFF00FF00>Travel</color>"),
		P("<color=0xFF0000FF>Travel</color>"),
	]);
	// Both visible names are "travel", so only the exact string can decide.
	assert.equal(match("<color=0xFF0000FF>Travel</color>"), 1);
	// …and with no exact hit, an ambiguous visible name is refused, not guessed.
	assert.equal(match("<color=0xFFFF0000>Travel</color>"), NO_MATCH);
});

test("a unique visible name pairs, an unknown one does not", () => {
	const match = presetMatcher([
		P("<color=0xFF00FF00>Travel</color>"),
		P("Mining"),
	]);
	assert.equal(match("<color=0xFFFF0000>Travel</color>"), 0);
	assert.equal(match("Mining"), 1);
	assert.equal(match("Wormhole"), NO_MATCH);
});

test("merging updates a recoloured preset instead of duplicating it", () => {
	const mine = { ...EMPTY, presets: [P("➲ Extra: Align Points", [1])] };
	const out = mergeModel(mine, {
		presets: [P("<color=0xFF66FF66>➲ Extra: Align Points</color>", [1, 2])],
	});
	assert.equal(out.presets.length, 1);
	assert.deepEqual(out.presets[0].groups, [1, 2]);
});

test("merging never collapses two presets a player deliberately kept apart", () => {
	const mine = {
		...EMPTY,
		presets: [
			P("<color=0xFF00FF00>Travel</color>", [1]),
			P("<color=0xFF0000FF>Travel</color>", [9]),
		],
	};
	const out = mergeModel(mine, {
		presets: [P("<color=0xFFFF0000>Travel</color>", [7])],
	});
	assert.equal(
		out.presets.length,
		3,
		"ambiguous pairing must append, not guess",
	);
	assert.deepEqual(
		out.presets.map((p) => p.groups),
		[[1], [9], [7]],
		"neither original may be overwritten",
	);
});

test("two incoming presets pairing to one slot both survive", () => {
	// Without a claimed-slot guard the second write lands on the first, and a
	// preset vanishes with nothing to show for it.
	const mine = { ...EMPTY, presets: [P("Travel", [1])] };
	const out = mergeModel(mine, {
		presets: [
			P("<color=0xFF00FF00>Travel</color>", [2]),
			P("<color=0xFF0000FF>Travel</color>", [3]),
		],
	});
	assert.equal(out.presets.length, 2);
	assert.deepEqual(out.presets.flatMap((p) => p.groups).sort(), [2, 3]);
});

test("a presets-only model leaves every layout section alone", () => {
	const mine = {
		...EMPTY,
		presets: [P("Travel", [1])],
		tabs: [{ index: 0, name: "MY TAB", overview: "Travel", bracket: "x" }],
		overviewColumns: ["distance"],
		shipLabelOrder: ["a", "b"],
	};
	const out = mergeModel(mine, { presets: [P("Travel", [1, 2])] });
	assert.deepEqual(
		out.tabs.map((t) => t.name),
		["MY TAB"],
	);
	assert.deepEqual(out.overviewColumns, ["distance"]);
	assert.deepEqual(out.shipLabelOrder, ["a", "b"]);
	assert.deepEqual(out.presets[0].groups, [1, 2], "the preset still updated");

	// The other direction: a model that DOES carry layout must still replace it,
	// or "Apply on top" would stop working for real pack pieces.
	const full = mergeModel(mine, {
		presets: [],
		tabs: [{ index: 0, name: "THEIR TAB", overview: "Travel", bracket: "x" }],
		overviewColumns: ["type"],
	});
	assert.deepEqual(
		full.tabs.map((t) => t.name),
		["THEIR TAB"],
	);
	assert.deepEqual(full.overviewColumns, ["type"]);
});

test("diffPresets classifies every preset on both sides exactly once", () => {
	const mine = [P("Travel", [1, 2]), P("Mine Only", [5]), P("Same", [7], [11])];
	const theirs = [
		P("<color=0xFF00FF00>Travel</color>", [2, 3]),
		P("Theirs Only", [8]),
		P("Same", [7], [11]),
	];
	const rows = diffPresets(mine, theirs);
	const by = (s) => rows.filter((r) => r.status === s).map((r) => r.name);

	assert.deepEqual(by("onlyA"), ["Mine Only"]);
	assert.deepEqual(by("onlyB"), ["Theirs Only"]);
	assert.deepEqual(by("same"), ["Same"]);

	const travel = rows.find((r) => r.status === "differs");
	assert.deepEqual(travel.added, [3], "gained going mine -> theirs");
	assert.deepEqual(travel.removed, [1], "lost going mine -> theirs");
	assert.equal(rows.length, 4, "no preset counted twice, none dropped");
});

test("diffPresets notices a state change even when the groups match", () => {
	const rows = diffPresets([P("A", [1], [11])], [P("A", [1], [11, 12])]);
	assert.equal(rows[0].status, "differs");
	assert.equal(rows[0].statesMoved, true);
	assert.deepEqual(rows[0].added, [], "groups really are identical");
});

test("upgrading a real Z-S profile updates its presets instead of doubling them", () => {
	// The regression this whole module exists for. Between v9 and v10 only 6 of
	// 68 preset names match byte-for-byte; raw-name merging therefore produced
	// 120 presets with 52 visible names appearing twice.
	const read = (f) =>
		parseOverviewYaml(
			fs.readFileSync(
				new URL(`../../../public/defaults/${f}`, import.meta.url),
				"utf8",
			),
		);
	const v9 = read("zs_full_v9.00.0347.yaml");
	const v10 = read("zs_full_v10.06.09.yaml");

	const out = mergeModel(v9, { presets: v10.presets });
	const seen = new Map();
	for (const p of out.presets)
		seen.set(presetKey(p.name), (seen.get(presetKey(p.name)) ?? 0) + 1);

	assert.equal(
		[...seen.values()].filter((n) => n > 1).length,
		0,
		"no preset duplicated",
	);
	assert.equal(
		out.presets.length,
		v9.presets.length,
		"every v10 preset landed on its v9 counterpart",
	);
	assert.deepEqual(
		out.tabs,
		v9.tabs,
		"a presets-only upgrade must not touch the tabs",
	);
});
