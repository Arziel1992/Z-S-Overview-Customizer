/**
 * Reactive i18n layer.
 *
 * All UI copy lives here (never hardcoded in components). The active locale is
 * Svelte 5 `$state`, so every `t('a.b.c')` call inside a template re-evaluates
 * the moment the locale changes — no reload needed. The chosen locale persists
 * to localStorage.
 *
 * Adding a language: copy the `en` object, translate the values (keep the keys
 * and `{placeholders}` intact), register it in `locales`, and add its name to
 * `LOCALE_NAMES`. See the "Contributing translations" section of the README.
 */

const en = {
	common: {
		moveUp: "Move up",
		moveDown: "Move down",
		dragHandle: "Drag to reorder",
		language: "Language",
		clear: "clear",
		close: "Close",
		done: "Done",
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
		customShort: "Import",
		github: "View on GitHub",
		save: "Save version",
		clearAll: "Clear all",
		clearAllTitle: "Reset to a blank profile",
		historyTitle: "Saved versions & import",
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
		shared: "YAML copied to clipboard — paste it anywhere",
		shareFail: "Could not access the clipboard",
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
		statPresets: "Presets",
		statTabs: "Tabs",
		statFlags: "Colortag states",
		statBackgrounds: "Background states",
		statColumns: "Columns active",
		statLabels: "Label segments",
		rawHeading: "userSettings (raw)",
		rawEmpty: "Empty — this profile carries no extra client-side settings.",
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
		bracketsDisabled: "Brackets disabled for this tab.",
		noEntities: "No entities match this tab's preset.",
		pilot: "Pilot",
		type: "Type",
		group: "Group",
		corporation: "Corporation",
		alliance: "Alliance",
		edit: "Edit entity",
	},
};

const es = {
	common: {
		moveUp: "Subir",
		moveDown: "Bajar",
		dragHandle: "Arrastrar para reordenar",
		language: "Idioma",
		clear: "quitar",
		close: "Cerrar",
		done: "Hecho",
	},
	app: {
		title: "Z-S Overview Customiser",
		subtitle: "Editor de perfiles de Overview para EVE Online",
		themeDark: "Oscuro",
		themeLight: "Claro",
		toggleTheme: "Cambiar tema de color",
		uiScale: "Escala",
		font: "Fuente",
		base: "Base",
		loadFenris: "Fenris por defecto",
		loadZs: "Z-S Core",
		custom: "Personalizado / Importar",
		customShort: "Importar",
		github: "Ver en GitHub",
		save: "Guardar versión",
		clearAll: "Vaciar todo",
		clearAllTitle: "Restablecer a un perfil en blanco",
		historyTitle: "Versiones guardadas e importación",
	},
	welcome: {
		title: "Bienvenido al Z-S Overview Customiser",
		intro: "¿Desde dónde quieres empezar? Puedes cambiarlo en cualquier momento: tu trabajo se guarda en el navegador y la próxima visita continuarás justo aquí.",
		zs: "Z-S Core",
		zsDesc: "Cargar el perfil base Z-S Core.",
		fenris: "Fenris por defecto",
		fenrisDesc: "Empezar desde el overview estándar de Fenris.",
		import: "Importar un .yaml",
		importDesc: "Trae un perfil existente (archivo o pegado).",
		blank: "Empezar en blanco",
		blankDesc: "Un perfil vacío para construir desde cero.",
	},
	importer: {
		title: "Importar perfil de Overview",
		file: "Elegir archivo .yaml",
		paste: "…o pega el YAML aquí",
		mode: "¿Cómo se debe aplicar?",
		overwrite: "Sobrescribir",
		overwriteHelp: "Reemplaza toda la configuración actual.",
		merge: "Aplicar encima",
		mergeHelp: "Fusiona presets, pestañas y las secciones incluidas sobre la configuración actual — para piezas de packs (complementos Z-S).",
		apply: "Importar",
		cancel: "Cancelar",
		invalid: "No se pudo interpretar ese YAML.",
	},
	history: {
		title: "Versiones guardadas",
		empty: "Aún no hay versiones guardadas. Usa «Guardar versión» para conservar una instantánea con nombre.",
		load: "Cargar",
		loadMode: "Modo de carga",
		rename: "Renombrar",
		remove: "Eliminar",
		export: "Exportar",
		share: "Compartir",
		shared: "YAML copiado al portapapeles — pégalo donde quieras",
		shareFail: "No se pudo acceder al portapapeles",
		saveName: "Nombre de la versión",
		saved: "Guardado",
	},
	tabsNav: {
		tabs: "Pestañas",
		presets: "Presets",
		columns: "Columnas",
		appearance: "Apariencia",
		ships: "Etiquetas de nave",
		misc: "Misc",
		yaml: "YAML",
	},
	settings: {
		windowTitle: "Ajustes del Overview",
		engine: "Motor cliente Z-S",
	},
	tabs: {
		heading: "Configuración de pestañas",
		help: "Asigna hasta 8 pestañas del cliente a un preset de lista y otro de brackets 3D. Los nombres admiten marcado de color de EVE, p. ej. <color=0xffff3333>★ PVP</color>.",
		count: "{n}/8 pestañas",
		name: "Nombre de la pestaña",
		listPreset: "Lista (overview)",
		bracketPreset: "Brackets",
		bracketNone: "Ninguno (sin brackets)",
		add: "Añadir pestaña",
		max: "Se alcanzó el máximo de 8 pestañas.",
		remove: "Eliminar pestaña",
		tabColor: "Color del texto de la pestaña",
	},
	presets: {
		heading: "Lógica de filtros del preset",
		help: "Un preset define qué entidades puede mostrar una pestaña. Los grupos autorizan clases de casco; los estados filtrados vetan; los estados siempre visibles fuerzan la visibilidad.",
		select: "Editando preset",
		groups: "Grupos autorizados",
		filtered: "Estados filtrados (veto)",
		alwaysShown: "Estados siempre visibles (anulación)",
		groupCount: "{n} grupos autorizados",
	},
	columns: {
		heading: "Columnas",
		help: "Elige y ordena las columnas de telemetría mostradas de izquierda a derecha en la lista del overview.",
	},
	appearance: {
		heading: "Apariencia",
		help: "EVE evalúa esto de arriba a abajo; gana el primer estado que coincida. Los colortags marcan el icono; los fondos resaltan toda la fila.",
		colortags: "Prioridad de colortags",
		backgrounds: "Prioridad de fondos",
		blink: "Parpadeo",
		color: "Color",
		authorised: "Visible",
	},
	ships: {
		heading: "Etiquetas de nave / bracket",
		help: "Compón la etiqueta flotante del bracket en el espacio. Arrastra para reordenar segmentos; añade campos, saltos de línea o espaciadores y elimina los que no quieras.",
		bold: "Negrita",
		italic: "Cursiva",
		underline: "Subrayado",
		size: "Tamaño",
		color: "Color",
		prefix: "Prefijo",
		suffix: "Sufijo",
		add: "Añadir segmento",
		addField: "Campo",
		addBreak: "Salto de línea",
		addSpacer: "Espaciador",
		remove: "Eliminar segmento",
	},
	misc: {
		heading: "Misceláneo",
		help: "Comportamientos adicionales del cliente guardados con el perfil.",
		statPresets: "Presets",
		statTabs: "Pestañas",
		statFlags: "Estados de colortag",
		statBackgrounds: "Estados de fondo",
		statColumns: "Columnas activas",
		statLabels: "Segmentos de etiqueta",
		rawHeading: "userSettings (sin procesar)",
		rawEmpty: "Vacío — este perfil no incluye ajustes extra del cliente.",
	},
	yaml: {
		heading: "Exportar perfil",
		help: "Este es el YAML exacto, importable en el juego, de tu configuración actual.",
		download: "Descargar .yaml",
		copy: "Copiar al portapapeles",
		copied: "¡Copiado!",
	},
	preview: {
		heading: "Vista previa en vivo",
		spaceView: "Brackets tácticos",
		listView: "Overview",
		roster: "Entidades de prueba",
		rosterHelp: "Las entidades que añadas aquí se muestran en vivo en las vistas de overview y brackets según los presets de la pestaña activa.",
		addEntity: "Añadir entidad",
		remove: "Eliminar",
		distance: "Distancia (m)",
		states: "Estados de relación",
		hiddenNote: "Oculto por el preset activo",
		bracketsDisabled: "Brackets desactivados para esta pestaña.",
		noEntities: "Ninguna entidad coincide con el preset de esta pestaña.",
		pilot: "Piloto",
		type: "Tipo",
		group: "Grupo",
		corporation: "Corporación",
		alliance: "Alianza",
		edit: "Editar entidad",
	},
};

const locales = { en, es };

/** Native-language names shown in the language selector. */
export const LOCALE_NAMES = { en: "English", es: "Español" };

const LOCALE_KEY = "zs-overview-locale";

function initialLocale() {
	if (typeof localStorage !== "undefined") {
		const saved = localStorage.getItem(LOCALE_KEY);
		if (saved && locales[saved]) return saved;
	}
	return "en";
}

// Reactive current locale — templates calling t()/getLocale() re-render on change.
const state = $state({ locale: initialLocale() });

export function getLocale() {
	return state.locale;
}

export function setLocale(loc) {
	if (!locales[loc]) return;
	state.locale = loc;
	if (typeof localStorage !== "undefined") localStorage.setItem(LOCALE_KEY, loc);
}

/**
 * Resolve a dotted key against the active locale, with English as fallback for
 * keys a translation hasn't covered yet, then the key itself as a last resort.
 * `{name}` placeholders are substituted from `vars`.
 */
export function t(key, vars) {
	const parts = key.split(".");
	let node = locales[state.locale];
	let fallback = locales.en;
	for (const p of parts) {
		node = node?.[p];
		fallback = fallback?.[p];
	}
	const text = node ?? fallback ?? key;
	if (typeof text === "string" && vars) {
		return text.replace(/\{(\w+)\}/g, (_, k) => vars[k] ?? `{${k}}`);
	}
	return text;
}
