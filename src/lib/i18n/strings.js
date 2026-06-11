/**
 * Lightweight i18n layer. UI copy lives here (not hardcoded in components) so
 * it can be localised later. `t('a.b.c')` resolves a dotted key against the
 * active locale, falling back to the key itself if missing.
 */

const en = {
	common: {
		moveUp: "Move up",
		moveDown: "Move down",
		dragHandle: "Drag to reorder",
	},
	app: {
		title: "Z-S Overview Customiser",
		subtitle: "EVE Online Overview Profile Editor",
		themeDark: "Dark",
		themeLight: "Light",
		toggleTheme: "Toggle colour theme",
		uiScale: "Scale",
		font: "Font",
		base: "Base",
		loadFenris: "Fenris Default",
		loadZs: "Z-S Core",
		custom: "Custom / Import",
		github: "View on GitHub",
		save: "Save version",
		clearAll: "Clear all",
	},
	welcome: {
		title: "Welcome to the Z-S Overview Customiser",
		intro: "What would you like to start from? You can change this any time — your work is saved in your browser and you'll resume right here next visit.",
		zs: "Z-S Core",
		zsDesc: "Load the Z-S Core base profile.",
		fenris: "Fenris Default",
		fenrisDesc: "Start from Fenris' stock overview.",
		import: "Import a .yaml",
		importDesc: "Bring in an existing profile (file or paste).",
		blank: "Start blank",
		blankDesc: "An empty profile to build from scratch.",
	},
	importer: {
		title: "Import Overview Profile",
		file: "Choose .yaml file",
		paste: "…or paste YAML here",
		mode: "How should it be applied?",
		overwrite: "Overwrite",
		overwriteHelp: "Replace the entire current configuration.",
		merge: "Apply on top",
		mergeHelp: "Merge presets, tabs and any provided sections onto the current config — for pack pieces (Z-S add-ons).",
		apply: "Import",
		cancel: "Cancel",
		invalid: "Could not parse that YAML.",
	},
	history: {
		title: "Saved Versions",
		empty: "No saved versions yet. Use “Save version” to keep a named snapshot.",
		load: "Load",
		loadMode: "Load mode",
		rename: "Rename",
		remove: "Delete",
		export: "Export",
		share: "Share",
		shared: "Link copied to clipboard",
		shareFail: "Sharing failed — YAML copied to clipboard instead",
		saveName: "Version name",
		saved: "Saved",
	},
	tabsNav: {
		tabs: "Tabs",
		presets: "Presets",
		columns: "Columns",
		appearance: "Appearance",
		ships: "Ship Labels",
		misc: "Misc",
		yaml: "YAML",
	},
	settings: {
		windowTitle: "Overview Settings",
		engine: "Z-S Client Engine",
	},
	tabs: {
		heading: "Tab Setup",
		help: "Map up to 8 client tabs to a list preset and a 3D bracket preset. Tab names support EVE colour markup, e.g. <color=0xffff3333>★ PVP</color>.",
		count: "{n}/8 tabs",
		name: "Tab name",
		listPreset: "List (overview)",
		bracketPreset: "Brackets",
		bracketNone: "None (no brackets)",
		add: "Add tab",
		max: "Maximum of 8 tabs reached.",
		remove: "Remove tab",
		tabColor: "Tab text colour",
	},
	presets: {
		heading: "Preset Filter Logic",
		help: "A preset defines which entities a tab may render. Groups authorise hull classes; filtered states veto; always-shown states force visibility.",
		select: "Editing preset",
		groups: "Authorised Groups",
		filtered: "Filtered States (veto)",
		alwaysShown: "Always-Shown States (override)",
		groupCount: "{n} groups authorised",
	},
	columns: {
		heading: "Columns",
		help: "Choose and order the telemetry columns shown left-to-right in the overview list.",
	},
	appearance: {
		heading: "Appearance",
		help: "EVE evaluates these from top to bottom; the first matching state wins. Colortags mark the icon; backgrounds highlight the whole row.",
		colortags: "Colortag Priority",
		backgrounds: "Background Priority",
		blink: "Blink",
		color: "Colour",
		authorised: "Shown",
	},
	ships: {
		heading: "Ship / Bracket Labels",
		help: "Compose the floating bracket label in space. Drag to reorder segments; add fields, line breaks or spacers and remove any you don't want.",
		bold: "Bold",
		italic: "Italic",
		underline: "Underline",
		size: "Size",
		color: "Colour",
		prefix: "Prefix",
		suffix: "Suffix",
		add: "Add segment",
		addField: "Field",
		addBreak: "Line break",
		addSpacer: "Spacer",
		remove: "Remove segment",
	},
	misc: {
		heading: "Miscellaneous",
		help: "Additional client behaviours stored with the profile.",
	},
	yaml: {
		heading: "Export Profile",
		help: "This is the exact, in-game-importable YAML for your current configuration.",
		download: "Download .yaml",
		copy: "Copy to clipboard",
		copied: "Copied!",
	},
	preview: {
		heading: "Live Preview",
		spaceView: "Tactical Brackets",
		listView: "Overview",
		roster: "Preview Entities",
		rosterHelp: "Entities you add here render live in the overview and bracket views under the active tab's presets.",
		addEntity: "Add entity",
		remove: "Remove",
		distance: "Distance (m)",
		states: "Relationship states",
		hiddenNote: "Hidden by active preset",
	},
};

const locales = { en };
let current = "en";

export function setLocale(loc) {
	if (locales[loc]) current = loc;
}

export function t(key, vars) {
	const parts = key.split(".");
	let node = locales[current];
	for (const p of parts) {
		node = node?.[p];
		if (node == null) return key;
	}
	if (typeof node === "string" && vars) {
		return node.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
	}
	return node;
}
