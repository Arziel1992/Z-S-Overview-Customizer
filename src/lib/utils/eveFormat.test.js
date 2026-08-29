/**
 * Codec self-check: `node --test src/` (or `pnpm test`).
 *
 * Covers the per-tab column override (tabColumns / tabColumnOrder) in BOTH
 * directions — a tab that overrides must keep its columns through a round
 * trip, and a tab that does not must never acquire the keys, since writing
 * them would pin that tab's columns in-game.
 */

import assert from "node:assert/strict";
import { test } from "node:test";
import yaml from "js-yaml";
import { parseOverviewYaml, serializeOverviewYaml } from "./eveFormat.js";

// Verbatim shape of a real export (player-reported, 2026-08-15): tab 0 carries
// tabColumns only, tab 1 carries both keys, tab 2 carries neither.
const SAMPLE = `
columnOrder: [ICON, TAG, DISTANCE, NAME, TYPE]
overviewColumns: [DISTANCE, ICON, NAME, TYPE]
presets:
- - Main
  - - - alwaysShownStates
      - []
    - - filteredStates
      - []
    - - groups
      - [25]
shipLabelOrder: []
shipLabels: []
tabSetup:
- - 0
  - - - bracket
      - _BracketFilterShowAll
    - - name
      - "<b> SYSTEM </b>"
    - - overview
      - Main
    - - tabColumns
      - [ICON, DISTANCE, NAME, TYPE]
- - 1
  - - - bracket
      - Main
    - - name
      - "<b> PVE </b>"
    - - overview
      - Main
    - - tabColumnOrder
      - [ICON, DISTANCE, NAME, TYPE, VELOCITY, CORPORATION]
    - - tabColumns
      - [ICON, DISTANCE, NAME, VELOCITY]
- - 2
  - - - bracket
      - Main
    - - name
      - "<b> PLAIN </b>"
    - - overview
      - Main
userSettings: []
`;

test("per-tab columns survive a parse -> serialize -> parse round trip", () => {
	const model = parseOverviewYaml(SAMPLE);
	const [t0, t1, t2] = model.tabs;

	assert.deepEqual(t0.tabColumns, ["ICON", "DISTANCE", "NAME", "TYPE"]);
	assert.equal(t0.tabColumnOrder, null, "no tabColumnOrder key -> inherit");
	assert.deepEqual(t1.tabColumns, ["ICON", "DISTANCE", "NAME", "VELOCITY"]);
	assert.deepEqual(t1.tabColumnOrder, [
		"ICON",
		"DISTANCE",
		"NAME",
		"TYPE",
		"VELOCITY",
		"CORPORATION",
	]);
	assert.equal(t2.tabColumns, null);
	assert.equal(t2.tabColumnOrder, null);

	const again = parseOverviewYaml(serializeOverviewYaml(model));
	assert.deepEqual(again.tabs, model.tabs);
});

test("only overriding tabs get the column keys written", () => {
	const raw = yaml.load(serializeOverviewYaml(parseOverviewYaml(SAMPLE)));
	const keysOf = (i) => raw.tabSetup[i][1].map(([k]) => k);

	// The tab that overrides keeps its keys, in the client's alphabetical order.
	assert.deepEqual(keysOf(1), [
		"bracket",
		"color",
		"name",
		"overview",
		"tabColumnOrder",
		"tabColumns",
	]);
	// The tab that inherits must come back out exactly as plain as it went in —
	// gaining a tabColumns key here would freeze its columns in-game.
	assert.deepEqual(keysOf(2), ["bracket", "color", "name", "overview"]);
});

test("an empty column list means inherit, not an empty overview", () => {
	const model = parseOverviewYaml(
		SAMPLE.replace("- [ICON, DISTANCE, NAME, TYPE]", "- []"),
	);
	assert.equal(model.tabs[0].tabColumns, null);
	assert.match(serializeOverviewYaml(model), /tabColumns/); // tab 1 still has its own
});

test("a preset pack carries presets and nothing else", () => {
	const model = parseOverviewYaml(SAMPLE);
	const pack = serializeOverviewYaml(model, { presetsOnly: true });
	const raw = yaml.load(pack);

	assert.deepEqual(
		Object.keys(raw),
		["presets"],
		"no layout section may ride along",
	);
	// It has to survive the round trip, or it is not an importable file.
	assert.deepEqual(parseOverviewYaml(pack).presets, model.presets);

	// The other direction: the default export must still be the whole profile,
	// or every download and autosave silently loses the layout.
	const full = yaml.load(serializeOverviewYaml(model));
	for (const key of ["presets", "tabSetup", "overviewColumns", "shipLabels"])
		assert.ok(key in full, `full export lost ${key}`);
});
