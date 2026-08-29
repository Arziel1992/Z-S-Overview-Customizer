/**
 * English locale — the reference language.
 *
 * Every other locale file mirrors this object's shape; keys missing from a
 * translation fall back to these values at runtime. Keep `{placeholder}`
 * tokens intact when editing. See the README's "Contributing translations"
 * section for how to add a new language.
 */

export default {
	common: {
		moveUp: "Move up",
		moveDown: "Move down",
		dragHandle: "Drag to reorder",
		language: "Language",
		clear: "clear",
		close: "Close",
		done: "Done",
	},
	markup: {
		hint: "Formatting help",
		intro:
			"This field accepts EVE inline markup (type it directly or use the toolbar):",
		colorTag: "coloured text (AARRGGBB hex)",
		boldTag: "bold",
		italicTag: "italic",
		underlineTag: "underline",
		fontsizeTag: "font size in px",
		toolbarColor: "Text colour",
		toolbarColorClear: "Remove colour",
		toolbarBold: "Bold",
		toolbarItalic: "Italic",
		toolbarUnderline: "Underline",
		preview: "Preview",
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
		loadFenris: "Fenris Default v24.01",
		loadZsFull: "Z-S Full v10.06.09",
		loadZsFullLegacy: "Z-S Full v9.00.0347",
		custom: "Custom / Import",
		customShort: "Import",
		github: "View on GitHub",
		save: "Save version",
		clearAll: "Clear all",
		clearAllTitle: "Reset to a blank profile",
		historyTitle: "Saved versions & import",
		menu: "Menu",
		versionsShort: "Versions",
		changelog: "View changelog",
		multiTab:
			"Another browser tab of this tool just saved over the shared autosave. Both tabs edit their own copy, and the last one to save wins.",
		multiTabReload: "Load that version",
		multiTabDismiss: "Keep editing here",
		hidePanel: "Hide this panel",
		showPanel: "Show {panel}",
		resizePanels: "Drag to resize the panels — double-click to reset",
		sdeUpdated: "SDE {date}",
		sdeUpdatedHelp:
			"Ship database last pulled from Fenris' Static Data Export on {date} — the tool keeps itself up to date automatically.",
		sdeError: "SDE offline",
		sdeErrorHelp:
			"Could not load the ship database — running on a minimal built-in fallback, so the group browser will be limited. Reload to retry.",
	},
	welcome: {
		title: "Welcome to the Z-S Overview Customiser",
		intro:
			"What would you like to start from? You can change this any time — your work is saved in your browser and you'll resume right here next visit.",
		zsFull: "Z-S Full v10.06.09",
		zsFullDesc: "The complete Z-S profile — the recommended start.",
		fenris: "Fenris Default v24.01",
		fenrisDesc: "Start from Fenris' stock overview.",
		import: "Import a .yaml",
		importDesc: "Bring in an existing profile (file or paste).",
		blank: "Start blank",
		blankDesc: "An empty profile to build from scratch.",
		glossary: "New to overview profiles? Open the glossary & guide",
	},
	importer: {
		title: "Import Overview Profile",
		file: "Choose .yaml file(s)",
		dropHint:
			"…or drag & drop .yaml files here — multiple files apply in order",
		removeFile: "Remove file",
		paste: "…or paste YAML here",
		mode: "How should it be applied?",
		overwrite: "Overwrite",
		overwriteHelp: "Replace the entire current configuration.",
		merge: "Apply on top",
		mergeHelp:
			"Merge presets, tabs and any provided sections onto the current config — for pack pieces (Z-S add-ons).",
		apply: "Import",
		cancel: "Cancel",
		invalid: "Could not parse that YAML.",
	},
	history: {
		title: "Saved Versions",
		empty:
			"No saved versions yet. Use “Save version” to keep a named snapshot.",
		load: "Load",
		loadMode: "Load mode",
		rename: "Rename",
		remove: "Delete",
		export: "Export",
		share: "Share",
		shared: "YAML copied to clipboard — paste it anywhere",
		shareFail: "Could not access the clipboard",
		saveName: "Version name — blank uses base + date",
		saveNameHelp:
			"Type a name and it is used exactly as typed. Leave it empty and the version is named after the base profile plus the current date and time. Either way the save time is recorded below the name.",
		saved: "Saved",
	},
	tabsNav: {
		tabs: "Tabs",
		presets: "Presets",
		columns: "Columns",
		appearance: "Appearance",
		ships: "Ship Labels",
		misc: "Misc",
		compare: "Compare",
		yaml: "YAML",
	},
	settings: {
		windowTitle: "Overview Settings",
	},
	tabs: {
		heading: "Tab Setup",
		help: "Map up to 20 client tabs to a list preset and a 3D bracket preset. Tab names support EVE colour markup, e.g. <color=0xffff3333>★ PVP</color>.",
		count: "{n}/20 tabs",
		name: "Tab name",
		listPreset: "List (overview)",
		bracketPreset: "Brackets",
		bracketShowAll: "Show all brackets",
		copyToBracket: "Use the list preset for brackets too",
		presetSearch: "Search presets…",
		add: "Add tab",
		max: "Maximum of 20 tabs reached.",
		remove: "Remove tab",
		tabColor: "Tab text colour",
		columns: "Columns",
		columnsEdit: "Set this tab's columns",
		columnsInherit: "Profile columns",
		columnsCustom: "{n} own columns",
		columnsFor: "Columns — {name}",
		columnsOwn: "Give this tab its own columns",
		columnsOwnHelp:
			"Off, the tab shows the profile-wide columns. On, it stores its own set and order — the same thing as the in-game tab right-click → Columns menu.",
		columnsCopy: "Copy from",
		columnsCopyPick: "Another tab…",
	},
	presets: {
		heading: "Preset Filter Logic",
		help: "A preset defines which entities a tab may render. Groups authorise hull classes; filtered states veto; always-shown states force visibility.",
		select: "Editing preset",
		groups: "Authorised Groups",
		allCategories: "All",
		groupSearch: "Search group or hull (e.g. Frigate, Rifter)…",
		groupSearchLabel: "Search groups",
		groupId: "Group {id}",
		noGroups: "No matching groups.",
		loadingSde: "Loading ship database…",
		countHelp:
			"{on} of {total} groups in this category are authorised ({types} types behind them). Equal numbers mean the preset covers the whole category.",
		filtered: "Filtered States (veto)",
		alwaysShown: "Always-Shown States (override)",
		groupCount: "{n} groups authorised",
		name: "Preset name",
		nameHelp:
			"Supports EVE colour markup. Renaming updates every tab that uses this preset.",
		add: "New preset",
		duplicate: "Duplicate",
		remove: "Delete preset",
		removeNote:
			"Tabs using a deleted preset fall back to the first remaining preset (brackets to none).",
		lastPreset: "A profile needs at least one preset.",
		nameTaken: "That name is already in use.",
	},
	columns: {
		heading: "Columns",
		help: "Choose and order the telemetry columns shown left-to-right in the overview list. Individual tabs can override these from Tab Setup.",
		tabOverrides: "{n} tab(s) show their own columns instead of these.",
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
		statPresets: "Presets",
		statTabs: "Tabs",
		statFlags: "Colortag states",
		statBackgrounds: "Background states",
		statColumns: "Columns active",
		statLabels: "Label segments",
		rawHeading: "userSettings (raw)",
		rawEmpty: "Empty — this profile carries no extra client-side settings.",
	},
	compare: {
		heading: "Compare Profiles",
		help: "Load one or more overview .yaml files and compare their settings — and presets — side by side against the current profile.",
		load: "Load .yaml",
		bundled: "Add bundled base…",
		dropHint: "Drag & drop overview .yaml files here",
		current: "Current profile",
		removeFile: "Remove file",
		invalid: "Could not parse {name}.",
		differs: "Values differ",
		showMore: "Show more",
		showLess: "Show less",
		settings: "Overview settings",
		setting: "Setting",
		presets: "Presets",
		tabs: "Tabs",
		columnsActive: "Active columns",
		columnOrder: "Column order",
		flagOrder: "Colortag priority",
		backgroundOrder: "Background priority",
		flagStates: "Colortag states",
		backgroundStates: "Background states",
		labelSegments: "Label segments",
		colorOverrides: "State colour overrides",
		blinks: "Blinking states",
		presetCompare: "Preset vs preset",
		presetCompareHelp:
			"Presets rarely map 1:1 across profiles, so pick one preset per profile — the table below shows every group selected by any of them.",
		preset: "Preset",
		filtered: "Filtered states (veto)",
		alwaysShown: "Always-shown states (override)",
		groupCount: "Groups selected",
		group: "Group",
		none: "—",
	},
	yaml: {
		heading: "Export Profile",
		help: "This is the exact, in-game-importable YAML for your current configuration.",
		download: "Download .yaml",
		copy: "Copy to clipboard",
		copied: "Copied!",
		rosterDirty:
			"Your preview entities have unsaved changes. They are workbench data and are never part of this export — save the grouping in Preview Entities if you want to keep them.",
	},
	preview: {
		heading: "Live Preview",
		spaceView: "Tactical Brackets",
		listView: "Overview",
		roster: "Preview Entities",
		rosterHelp:
			"Entities you add here render live in the overview and bracket views under the active tab's presets.",
		addEntity: "Add entity",
		remove: "Remove",
		distance: "Distance (m)",
		states: "Relationship states",
		workingSet: "Working set",
		unsaved: "Unsaved",
		unsavedHelp:
			"These entities differ from the grouping they came from. Click to save them back — nothing is lost meanwhile: switching groupings parks them, and they survive a reload.",
		parkedHelp:
			"Has unsaved entities parked — load it to carry on where you left off",
		setsHelp:
			"Loading a grouping parks whatever is on screen first, so you can look at another one and come back to your edits.",
		forcedOverVeto:
			"Kept on screen by an always-shown state — a filtered state would otherwise have hidden this entity.",
		unlockTabs: "Unlock tab reordering — drag the tabs to rearrange them",
		lockTabs: "Lock tab reordering",
		tipTabsTitle: "Reorder tabs",
		tipTabs:
			"Unlocked, drag the tabs above into any order. Locked, they only respond to clicks.",
		tipSync:
			"Every drop writes to the profile itself, so the settings sections show the change instantly — and their edits show up here.",
		colMode: {
			locked: "Column reordering locked — click to drag for this tab",
			tab: "Dragging columns rearranges this tab — click to rearrange the whole profile",
			profile: "Dragging columns rearranges the whole profile — click to lock",
		},
		tipColsTitle: "Reorder columns",
		tipColLocked: "🔒 Locked — the header only responds to clicks.",
		tipColTab:
			"🔓 This tab — a drop gives this tab its own column set, leaving every other tab alone.",
		tipColProfile:
			"🌐 Whole profile — a drop rearranges the shared column order that every tab without its own set follows.",
		tipHidden:
			"Columns you switched off keep their place in the order — they reappear where you left them.",
		hiddenNote: "Hidden by active preset",
		noEntities: "No entities match this tab's preset.",
		pilot: "Pilot",
		type: "Type",
		typeSearch: "Search any type (e.g. Astrahus, Veldspar)…",
		group: "Group",
		corporation: "Corporation",
		alliance: "Alliance",
		edit: "Edit entity",
		rapidPopulate: "Rapid populate & saved groupings",
		loadSet: "Load this grouping (replaces the current entities)",
		renameSet: "Rename grouping",
		overwriteSet: "Overwrite with the current entities",
		deleteSet: "Delete grouping",
		setName: "Grouping name",
		saveSet: "Save current",
	},
	glossary: {
		title: "Glossary & guide",
		short: "Guide",
		intro:
			"What every word and button here means, how it maps onto the game, and the questions players ask most. Search it, or read it top to bottom once.",
		search: "Search the guide…",
		hits: "{n} matching entries",
		noHits: "Nothing matches that. Try a shorter word.",
		start: {
			title: "Quick start",
			intro:
				"Six steps from an empty browser tab to an overview loaded in the client.",
			baseT: "Pick a base profile",
			baseD:
				"The Base selector in the header loads a complete, working profile — Z-S Full, the Fenris default, or your own file through Import. Everything you do afterwards edits your copy in this browser; the original is never touched.",
			tabsT: "Lay out your tabs",
			tabsD:
				"Tab Setup maps up to 20 client tabs. Each tab points at two presets: one for the flat overview list, one for the brackets in space. They are independent — a logistics tab can list only friendlies while still showing every hostile bracket around you.",
			presetsT: "Build the presets",
			presetsD:
				"A preset is the filter itself. Tick the groups it may show under Authorised groups, then use the two state lists: filtered states hide an entity, always-shown states rescue it. The count on each category tab tells you how much of that category the preset covers.",
			lookT: "Choose the look",
			lookD:
				"Columns picks the telemetry and its left-to-right order. Appearance sets colortag and background priority — the first matching state wins, so the order is the whole game — plus blink and colours. Ship Labels composes the text floating beside each bracket in space.",
			previewT: "Check it in the preview",
			previewD:
				"The right-hand panels render your profile against made-up entities. Give an entity the states and the hull you care about, then click through the tabs: if something appears that should not, the active preset is why.",
			exportT: "Export and load it in EVE",
			exportD:
				"The YAML section shows exactly what the client will read, and Download .yaml saves it. Put the file in Documents » EVE » Overview, then in game: Overview Settings (the ≡ at the top left of the Overview window) » Misc » Import Overview Settings » pick the file » Check All » Import. Dock and undock once if something looks stale.",
		},
		terms: {
			title: "The vocabulary",
			intro:
				"The client's words and this tool's words for the same things. Ids are the integers the game actually stores in the file.",
			profileT: "Profile",
			profileD:
				"One overview .yaml: every preset, tab, column, colour and label in a single file. It is what you import in game, and what this tool edits.",
			presetT: "Preset",
			presetD:
				"A named filter deciding what may render. It carries authorised groups, filtered states and always-shown states. Tabs point at presets by name, so renaming one updates every tab that uses it.",
			tabT: "Tab",
			tabD: "One tab of the in-game Overview window. It names two presets — the list preset and the bracket preset — and may carry its own column set. The client allows 20.",
			categoryT: "Category",
			categoryD:
				"The top level of the game's item tree: Ship, Entity, Celestial, Charge, Drone, Structure and so on. Categories are only a way to browse — the file itself never stores them.",
			groupT: "Group",
			groupD:
				"The level below a category, and the only thing a preset actually whitelists: Frigate (25), Cruiser (26), Stargate (10), Station (15). Tick a group and every hull inside it can render.",
			typeT: "Type",
			typeD:
				"An individual item — a Rifter, a Veldspar rock, an Astrahus. Types are what you see in space; they inherit visibility from their group, and the game gives no way to filter a single type.",
			stateT: "State",
			stateD:
				"A relationship or legal condition between you and an entity, stored as an integer: 11 in your fleet, 13 at war with you, 52 limited engagement, 15 to 19 standings. The same ids drive filters, colortags and backgrounds alike.",
			filteredT: "Filtered states (veto)",
			filteredD:
				"States that hide an entity even though its group is authorised — the usual way to strip friendlies off a combat tab so you cannot misclick them.",
			alwaysT: "Always-shown states (override)",
			alwaysD:
				"States that override the veto: an entity matching one renders even though another of its states is filtered. It is scoped to states — it does not pull a hull onto a tab whose group list excludes it, so a logistics tab stays a logistics tab.",
			colortagT: "Colortag",
			colortagD:
				"The small coloured marker on a row and its bracket. The winner is the first state in the colortag priority order that the entity carries and the profile authorises — so the order of that list decides everything.",
			backgroundT: "Background",
			backgroundD:
				"A colour wash across the whole row, resolved by its own priority list. Used for the states you must never miss, since a filled row is far louder than a marker.",
			blinkT: "Blink",
			blinkD:
				"Makes a colortag or background flash. Reserve it for the genuinely urgent: everything blinking is the same as nothing blinking.",
			bracketT: "Bracket",
			bracketD:
				"The floating icon and label drawn around an object in space, filtered by the tab's bracket preset rather than its list preset. Show all brackets is the client's default and means unfiltered.",
			shipLabelsT: "Ship labels",
			shipLabelsD:
				"The text beside a bracket, built from segments — pilot name, ship type, corp ticker — each with its own colour, styling and separators.",
			columnsT: "Columns",
			columnsD:
				"The telemetry shown in the list and its order: distance, name, type, transversal, angular and so on. The profile carries one shared set.",
			tabColumnsT: "Per-tab columns",
			tabColumnsD:
				"A tab may override the shared set with its own, exactly like the in-game right-click » Columns menu on a tab. Tabs without an override follow the profile-wide set.",
			sdeT: "SDE",
			sdeD: "Fenris' Static Data Export: the official dump of every item, group and category in the game. This tool rebuilds its copy automatically, and the header badge shows the date it was last pulled.",
			yamlT: "YAML",
			yamlD:
				"The plain-text format the client reads and writes for overview profiles. What the YAML section shows is byte-for-byte what the game will parse — no separate save format sits in between.",
		},
		doing: {
			title: "What each control does",
			intro:
				"Every button that changes something, and exactly what it changes.",
			baseSelectT: "Base",
			baseSelectD:
				"Loads a bundled profile as your starting point, replacing the workspace. Your saved versions are untouched.",
			importT: "Import » Overwrite",
			importD:
				"Reads a .yaml (file or pasted text) and replaces the entire workspace with it.",
			mergeT: "Import » Apply on top",
			mergeD:
				"Merges a file onto what you already have, the way stacking pack pieces works in game. Presets are additive: a same-named preset is replaced, new ones are appended, and none are ever removed. Layout sections — tabs, columns, appearance and ship labels — are replaced wholesale whenever the incoming file provides them. It is not a save-as.",
			versionsT: "Saved versions",
			versionsD:
				"Named snapshots of the whole profile, kept in this browser. Save one before any experiment: it is the undo this tool otherwise lacks.",
			loadT: "Load",
			loadD:
				"Reads a saved version and replaces the current workspace with it, discarding unsaved changes.",
			applyOnTopT: "Apply on top (on a saved version)",
			applyOnTopD:
				"Same merge as the import mode: the snapshot's presets are added to what you have, and its layout sections replace yours when it carries them. It does not save over the snapshot.",
			exportBtnT: "Export",
			exportBtnD:
				"Writes that saved version to your disk as a real .yaml file — the one you place in the EVE Overview folder and import in game.",
			shareT: "Share",
			shareD:
				"Copies the version's YAML to your clipboard so you can paste it to a corpmate. Nothing is uploaded — there is no server involved.",
			namingT: "Why some saved versions carry a date",
			namingD:
				"The name box decides it. Type a name and it is used exactly as typed. Leave it empty and the tool names the version after the base profile plus the current date and time, so it is still identifiable. Either way the save time is recorded and shown under the name.",
			countsT: "The X / Y on category tabs",
			countsD:
				"Groups authorised by this preset, out of the groups that category holds — the same sanity check the client's own type tree gives. Equal numbers turn green: the preset covers the whole category. After an expansion adds a group, 50/50 becomes 50/51 and the gap is visible at a glance. Hover for the type total behind those groups.",
			entitiesT: "Preview entities",
			entitiesD:
				"Made-up pilots and objects the preview renders your profile against. Their type field searches the whole SDE, so any real object can join, and their states let you reproduce any relationship a preset filters on.",
			groupingsT: "Rapid populate & groupings",
			groupingsD:
				"Named sets of preview entities. Loading one swaps the roster; whatever you were editing is parked first and comes back when you return to it.",
			unsavedT: "The Unsaved dot",
			unsavedD:
				"Your preview entities differ from the grouping they came from. Nothing is lost meanwhile — they survive switching groupings and reloading — but saving the grouping is what makes them permanent.",
			locksT: "The locks in the preview",
			locksD:
				"The tab strip lock opens dragging of the tabs themselves. The column control cycles locked » this tab » whole profile, deciding where a column drop lands. Every drop writes to the profile, so the settings sections show the change instantly.",
			layoutT: "Panels and the divider",
			layoutD:
				"Drag the divider to rebalance settings against the preview (double-click resets it), and the eye on each panel collapses it to a bar. Both are remembered in this browser.",
			clearT: "Clear all",
			clearD:
				"Resets the workspace to a blank profile with one empty preset and one tab. Saved versions and preview groupings survive it.",
		},
		faq: {
			title: "Questions people ask",
			intro: "Mostly about where your work lives and what shares it.",
			tabsOpenT: "What happens if I open the tool in two browser tabs?",
			tabsOpenD:
				"Each tab runs its own copy in memory, so edits in one do not appear in the other — they are two workspaces, not two views of one. Storage is a different matter: tabs of the same site deliberately share localStorage and IndexedDB, so both tabs autosave the working profile to the same slot about half a second after any change, and the last writer wins. Reloading either tab then shows whichever version was saved last. Edit a profile in one tab at a time; if another tab does overwrite the shared autosave, a notice now appears offering to load its version instead.",
			versionsSharedT: "Why do saved versions show up in every tab?",
			versionsSharedD:
				"Because that is where they live: one database for the whole site, shared by every tab, which is what makes a version saved in one tab available in another. Intended. The list is read when the dialog opens, so a dialog already open when another tab saves needs reopening to see it.",
			onDiskT: "Are saved versions files on my drive?",
			onDiskD:
				"No. They are rows in the browser's own database for this site — nothing you can browse to in a file manager, and clearing this site's data deletes them. Use Export to write a real .yaml to disk, and treat that as the backup.",
			installT: "How do I get a profile into the game?",
			installD:
				"Download the .yaml, put it in Documents » EVE » Overview (create the folder, or better, export your current overview from the game first so it exists and you have a backup), then in game: Overview Settings » Misc » Import Overview Settings, select the file, Check All, Import. Dock and undock once if part of the UI looks stale.",
			expansionT: "How do I keep presets current after an expansion?",
			expansionD:
				"The ship database refreshes itself — the header badge shows when it was last pulled. Then read the counts on the category tabs: a preset that covered everything reads X/X, so a category that gained a group drops to X/Y and tells you exactly where to look.",
			storageT: "What is stored, and does anything leave my machine?",
			storageD:
				"Nothing leaves your machine: no accounts, no cookies, no analytics, no uploads. Your working profile, theme, scale, layout, preview entities and groupings sit in this browser's local storage; saved versions sit in its database. The privacy panel lists every item by name and can erase all of it.",
			dataLossT: "Is my work safe if I close the tab?",
			dataLossD:
				"Yes, in the same browser: the profile autosaves, the preview roster persists, and saved versions stay in the database. It is all tied to this browser on this device, though — a different browser, a private window, or clearing site data starts from nothing. Export anything you would be sad to lose.",
		},
	},
	privacy: {
		banner:
			"This tool stores your work and preferences in this browser only — no cookies, no analytics, no tracking. No data ever leaves your device.",
		details: "Details",
		gotIt: "Got it",
		title: "Privacy, data & licences",
		openPanel: "Privacy, data & licences",
		short: "Privacy",
		intro:
			"This is a fully client-side tool: no accounts, no forms, no cookies, no analytics, no ads and no tracking of any kind. Everything you build here is saved in your own browser and is never transmitted anywhere.",
		noConsent:
			"There is no accept/reject choice to make because there is nothing optional to consent to: every stored item below is strictly necessary to provide something you explicitly asked for (saving your work, remembering a preference you set). Such storage is exempt from consent under the ePrivacy rules (Directive 2002/58/EC Art. 5(3)) and equivalent laws.",
		storageHeading: "What is stored in your browser",
		storageNote:
			"All items are first-party, never leave this device, and persist until you delete them (button below, or your browser's site-data settings).",
		colKey: "Item",
		colType: "Type",
		colPurpose: "Purpose",
		stTheme: "Your light/dark theme choice",
		stLocale: "Your language choice",
		stScale: "Your interface scale choice",
		stLayout:
			"Your workspace layout: where you dragged the panel divider and which panels you hid",
		stSession:
			"Autosave of the overview profile you are editing (as YAML), so a reload resumes where you left off",
		stBase: "Which base profile your session started from",
		stSets: "Your saved preview-roster groupings",
		stRoster:
			"The preview entities you are working on, including unsaved edits parked per grouping, so nothing is lost on a reload",
		stAck: "Remembers that you dismissed the privacy notice, and when",
		stHistory: 'Profile snapshots you save under "Saved versions"',
		networkHeading: "Network requests",
		network1:
			"Every request this app makes goes to this site's own origin: the app itself, its fonts (self-hosted — no Google Fonts CDN, so your IP is not sent to Google) and the EVE ship database (SDE), which is refreshed at build time, not from your browser.",
		network2:
			"The site is hosted on GitHub Pages. Like any web host, GitHub may process technical request logs (such as your IP address) to operate and secure the service — see the GitHub Privacy Statement.",
		githubPrivacy: "GitHub Privacy Statement",
		rightsHeading: "Your data, your control",
		rights1:
			"Nothing is stored server-side, so access, portability and erasure are entirely in your hands: your profile exports as YAML at any time, and the button below removes everything this tool has stored on this device.",
		clearData: "Delete all locally stored data",
		clearDataConfirm:
			"Delete everything this tool has stored in this browser (working profile, saved versions, preferences) and reload?",
		ackOn: "Notice dismissed on {date}.",
		licencesHeading: "Licences & attribution",
		licApp:
			"This tool is free software under the GNU AGPL-3.0 licence — full source code on GitHub.",
		licDeps:
			"Bundled open-source libraries: Svelte, js-yaml and svelte-dnd-action; built with Vite and Tailwind CSS. All are MIT-licensed, which is AGPL-3.0-compatible.",
		licFonts:
			"Fonts: Inter and JetBrains Mono, bundled under the SIL Open Font License 1.1.",
		licCcp:
			"EVE Online and the ship/type data used here (the Static Data Export) are the intellectual property of Fenris hf. EVE Online® is a registered trademark of Fenris hf. This is a fan-made tool, not affiliated with or endorsed by Fenris hf.",
	},
};
