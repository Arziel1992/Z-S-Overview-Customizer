/**
 * Spanish (Español) locale.
 *
 * Mirrors the shape of en.js; any key left untranslated falls back to English
 * at runtime. Keep `{placeholder}` tokens intact when editing.
 */

export default {
	common: {
		moveUp: "Subir",
		moveDown: "Bajar",
		dragHandle: "Arrastrar para reordenar",
		language: "Idioma",
		clear: "quitar",
		close: "Cerrar",
		done: "Hecho",
	},
	markup: {
		hint: "Ayuda de formato",
		intro:
			"Este campo acepta marcado de EVE (escríbelo directamente o usa la barra de herramientas):",
		colorTag: "texto con color (hex AARRGGBB)",
		boldTag: "negrita",
		italicTag: "cursiva",
		underlineTag: "subrayado",
		fontsizeTag: "tamaño de fuente en px",
		toolbarColor: "Color del texto",
		toolbarColorClear: "Quitar color",
		toolbarBold: "Negrita",
		toolbarItalic: "Cursiva",
		toolbarUnderline: "Subrayado",
		preview: "Vista previa",
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
		loadFenris: "Fenris por defecto v24.01",
		loadZsFull: "Z-S Full v10.06.09",
		loadZsFullLegacy: "Z-S Full v9.00.0347",
		custom: "Personalizado / Importar",
		customShort: "Importar",
		github: "Ver en GitHub",
		save: "Guardar versión",
		clearAll: "Vaciar todo",
		clearAllTitle: "Restablecer a un perfil en blanco",
		historyTitle: "Versiones guardadas e importación",
		menu: "Menú",
		versionsShort: "Versiones",
		changelog: "Ver el registro de cambios",
		multiTab:
			"Otra pestaña del navegador con esta herramienta acaba de sobrescribir el guardado automático compartido. Cada pestaña edita su propia copia y gana la última que guarda.",
		multiTabReload: "Cargar esa versión",
		multiTabDismiss: "Seguir aquí",
		hidePanel: "Ocultar este panel",
		showPanel: "Mostrar {panel}",
		resizePanels:
			"Arrastra para redimensionar los paneles — doble clic para restablecer",
		sdeUpdated: "SDE {date}",
		sdeUpdatedHelp:
			"Base de datos de naves descargada por última vez del Static Data Export de Fenris el {date} — la herramienta se mantiene actualizada automáticamente.",
		sdeError: "SDE sin conexión",
		sdeErrorHelp:
			"No se pudo cargar la base de datos de naves; se usa una lista mínima integrada, así que el navegador de grupos estará limitado. Recarga para reintentar.",
	},
	welcome: {
		title: "Bienvenido al Z-S Overview Customiser",
		intro:
			"¿Desde dónde quieres empezar? Puedes cambiarlo en cualquier momento: tu trabajo se guarda en el navegador y la próxima visita continuarás justo aquí.",
		zsFull: "Z-S Full v10.06.09",
		zsFullDesc: "El perfil Z-S completo — el inicio recomendado.",
		fenris: "Fenris por defecto v24.01",
		fenrisDesc: "Empezar desde el overview estándar de Fenris.",
		import: "Importar un .yaml",
		importDesc: "Trae un perfil existente (archivo o pegado).",
		blank: "Empezar en blanco",
		blankDesc: "Un perfil vacío para construir desde cero.",
		glossary: "¿Nuevo en los perfiles de overview? Abre el glosario y la guía",
	},
	importer: {
		title: "Importar perfil de Overview",
		file: "Elegir archivos .yaml",
		dropHint:
			"…o arrastra y suelta archivos .yaml aquí — varios archivos se aplican en orden",
		removeFile: "Quitar archivo",
		paste: "…o pega el YAML aquí",
		mode: "¿Cómo se debe aplicar?",
		overwrite: "Sobrescribir",
		overwriteHelp: "Reemplaza toda la configuración actual.",
		merge: "Aplicar encima",
		presetsOnly: "Solo presets",
		presetsOnlyHelp:
			"Toma únicamente los presets del archivo y nada más: tus pestañas, columnas, colores y etiquetas de nave se mantienen tal cual. Así actualizas los presets desde un pack más reciente sin perder el perfil que construiste a su alrededor.",
		mergeHelp:
			"Fusiona presets, pestañas y las secciones incluidas sobre la configuración actual — para piezas de packs (complementos Z-S). Las secciones de diseño reemplazan las tuyas siempre que el archivo las incluya.",
		apply: "Importar",
		cancel: "Cancelar",
		invalid: "No se pudo interpretar ese YAML.",
	},
	history: {
		title: "Versiones guardadas",
		empty:
			"Aún no hay versiones guardadas. Usa «Guardar versión» para conservar una instantánea con nombre.",
		load: "Cargar",
		loadMode: "Modo de carga",
		rename: "Renombrar",
		remove: "Eliminar",
		export: "Exportar",
		share: "Compartir",
		shared: "YAML copiado al portapapeles — pégalo donde quieras",
		shareFail: "No se pudo acceder al portapapeles",
		saveName: "Nombre de la versión — vacío usa base + fecha",
		saveNameHelp:
			"Si escribes un nombre se usa tal cual. Si lo dejas vacío, la versión se nombra con el perfil base más la fecha y hora actuales. En ambos casos la hora de guardado se registra bajo el nombre.",
		saved: "Guardado",
	},
	tabsNav: {
		tabs: "Pestañas",
		presets: "Presets",
		columns: "Columnas",
		appearance: "Apariencia",
		ships: "Etiquetas de nave",
		misc: "Misc",
		compare: "Comparar",
		yaml: "YAML",
	},
	settings: {
		windowTitle: "Ajustes del Overview",
	},
	tabs: {
		heading: "Configuración de pestañas",
		help: "Asigna hasta 20 pestañas del cliente a un preset de lista y otro de brackets 3D. Los nombres admiten marcado de color de EVE, p. ej. <color=0xffff3333>★ PVP</color>.",
		count: "{n}/20 pestañas",
		name: "Nombre de la pestaña",
		listPreset: "Lista (overview)",
		bracketPreset: "Brackets",
		bracketShowAll: "Mostrar todos los brackets",
		copyToBracket: "Usar el preset de lista también para los brackets",
		presetSearch: "Buscar presets…",
		add: "Añadir pestaña",
		max: "Se alcanzó el máximo de 20 pestañas.",
		remove: "Eliminar pestaña",
		tabColor: "Color del texto de la pestaña",
		columns: "Columnas",
		columnsEdit: "Definir las columnas de esta pestaña",
		columnsInherit: "Columnas del perfil",
		columnsCustom: "{n} columnas propias",
		columnsFor: "Columnas — {name}",
		columnsOwn: "Dar columnas propias a esta pestaña",
		columnsOwnHelp:
			"Desactivado, la pestaña muestra las columnas del perfil. Activado, guarda su propio conjunto y orden: lo mismo que el menú Columnas del clic derecho sobre la pestaña en el juego.",
		columnsCopy: "Copiar de",
		columnsCopyPick: "Otra pestaña…",
	},
	presets: {
		heading: "Lógica de filtros del preset",
		help: "Un preset define qué entidades puede mostrar una pestaña. Los grupos autorizan clases de casco; los estados filtrados vetan; los estados siempre visibles fuerzan la visibilidad.",
		select: "Editando preset",
		groups: "Grupos autorizados",
		allCategories: "Todos",
		groupSearch: "Buscar grupo o casco (p. ej. Frigate, Rifter)…",
		groupSearchLabel: "Buscar grupos",
		groupId: "Grupo {id}",
		noGroups: "Ningún grupo coincide.",
		loadingSde: "Cargando la base de datos de naves…",
		countHelp:
			"{on} de {total} grupos de esta categoría están autorizados ({types} tipos detrás). Números iguales significan que el preset cubre la categoría entera.",
		filtered: "Estados filtrados (veto)",
		alwaysShown: "Estados siempre visibles (anulación)",
		groupCount: "{n} grupos autorizados",
		name: "Nombre del preset",
		nameHelp:
			"Admite marcado de color de EVE. Renombrar actualiza todas las pestañas que usan este preset.",
		add: "Nuevo preset",
		duplicate: "Duplicar",
		remove: "Eliminar preset",
		removeNote:
			"Las pestañas que usen un preset eliminado pasan al primer preset restante (los brackets a ninguno).",
		lastPreset: "Un perfil necesita al menos un preset.",
		nameTaken: "Ese nombre ya está en uso.",
	},
	columns: {
		heading: "Columnas",
		help: "Elige y ordena las columnas de telemetría mostradas de izquierda a derecha en la lista del overview. Cada pestaña puede anularlas desde Configuración de pestañas.",
		tabOverrides:
			"{n} pestaña(s) muestran sus propias columnas en lugar de estas.",
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
	compare: {
		heading: "Comparar perfiles",
		help: "Carga uno o más archivos .yaml de overview y compara sus ajustes — y presets — lado a lado con el perfil actual.",
		load: "Cargar .yaml",
		bundled: "Añadir base incluida…",
		dropHint: "Arrastra y suelta archivos .yaml de overview aquí",
		current: "Perfil actual",
		removeFile: "Quitar archivo",
		invalid: "No se pudo interpretar {name}.",
		differs: "Los valores difieren",
		showMore: "Mostrar más",
		showLess: "Mostrar menos",
		settings: "Ajustes del overview",
		setting: "Ajuste",
		presets: "Presets",
		tabs: "Pestañas",
		columnsActive: "Columnas activas",
		columnOrder: "Orden de columnas",
		flagOrder: "Prioridad de colortags",
		backgroundOrder: "Prioridad de fondos",
		flagStates: "Estados de colortag",
		backgroundStates: "Estados de fondo",
		labelSegments: "Segmentos de etiqueta",
		colorOverrides: "Colores de estado personalizados",
		blinks: "Estados con parpadeo",
		guide: "Cómo usar Comparar",
		hideSection: "Ocultar esta sección",
		showSection: "Mostrar esta sección",
		inventory: "Inventario de presets",
		inventoryHelp:
			"Todos los presets de ambos lados, emparejados por nombre ignorando el formato de color: los packs recolorean sus nombres entre versiones, así que emparejar por el nombre en bruto convertiría un preset antiguo en uno nuevo. Haz clic en un preset para abrir esa pareja en la tabla de abajo.",
		inventoryAgainst: "Contra",
		inventoryMine: "Tuyos",
		inventoryTheirs: "Suyos",
		inventoryEmpty: "No hay presets en esta categoría.",
		status: "Estado",
		statusFilter: "Filtrar por estado",
		statusAll: "Todos",
		statusOnlyB: "Nuevo en el pack",
		statusDiffers: "Cambiado",
		statusOnlyA: "Solo tuyo",
		statusSame: "Idéntico",
		groupDelta: "Cambio de grupos",
		addedHelp: "{n} grupos que el suyo autoriza y el tuyo no",
		removedHelp: "{n} grupos que el tuyo autoriza y el suyo no",
		statesMovedShort: "estados",
		statesMovedHelp:
			"Las listas de estados filtrados o siempre visibles son distintas.",
		openPair: "Abrir esta pareja abajo",
		diffOnly: "Solo diferencias",
		groupsAllSame: "Todos los grupos coinciden entre estos presets.",
		presetCompare: "Preset contra preset",
		presetCompareHelp:
			"Los presets rara vez coinciden 1:1 entre perfiles, así que elige un preset por perfil — la tabla inferior muestra cada grupo seleccionado por cualquiera de ellos.",
		preset: "Preset",
		filtered: "Estados filtrados (veto)",
		alwaysShown: "Estados siempre visibles (anulación)",
		groupCount: "Grupos seleccionados",
		group: "Grupo",
		none: "—",
	},
	yaml: {
		heading: "Exportar perfil",
		help: "Este es el YAML exacto, importable en el juego, de tu configuración actual.",
		download: "Descargar .yaml",
		packMode: "Pack de presets — exportar solo los presets marcados",
		packHelp:
			"Un archivo solo con presets. Importarlo con «Solo presets» actualiza esos presets y deja intactas las pestañas, columnas, colores y etiquetas de nave del perfil que lo recibe, que un perfil completo sí reemplazaría.",
		packAll: "Todos",
		packNone: "Ninguno",
		packCount: "{n} de {m} presets",
		packEmpty: "Marca al menos un preset: un pack vacío no cambia nada.",
		copy: "Copiar al portapapeles",
		copied: "¡Copiado!",
		rosterDirty:
			"Tus entidades de prueba tienen cambios sin guardar. Son datos de trabajo y nunca forman parte de esta exportación: guarda la agrupación en Entidades de prueba si quieres conservarlas.",
	},
	preview: {
		heading: "Vista previa en vivo",
		spaceView: "Brackets tácticos",
		listView: "Overview",
		roster: "Entidades de prueba",
		rosterHelp:
			"Las entidades que añadas aquí se muestran en vivo en las vistas de overview y brackets según los presets de la pestaña activa.",
		addEntity: "Añadir entidad",
		remove: "Eliminar",
		distance: "Distancia (m)",
		states: "Estados de relación",
		workingSet: "Conjunto de trabajo",
		unsaved: "Sin guardar",
		unsavedHelp:
			"Estas entidades difieren de la agrupación de la que provienen. Pulsa para guardarlas: mientras tanto no se pierde nada, cambiar de agrupación las aparca y sobreviven a una recarga.",
		parkedHelp:
			"Tiene entidades sin guardar aparcadas: cárgala para seguir donde lo dejaste",
		setsHelp:
			"Al cargar una agrupación se aparca primero lo que haya en pantalla, así puedes consultar otra y volver a tus cambios.",
		forcedOverVeto:
			"Se mantiene visible por un estado de «mostrar siempre»: un estado filtrado lo habría ocultado.",
		unlockTabs:
			"Desbloquear el reordenamiento de pestañas — arrástralas para reorganizarlas",
		lockTabs: "Bloquear el reordenamiento de pestañas",
		tipTabsTitle: "Reordenar pestañas",
		tipTabs:
			"Desbloqueado, arrastra las pestañas de arriba en el orden que quieras. Bloqueado, solo responden al clic.",
		tipSync:
			"Cada cambio se escribe en el propio perfil, así que las secciones de ajustes lo reflejan al instante — y sus cambios aparecen aquí.",
		colMode: {
			locked:
				"Reordenamiento de columnas bloqueado — pulsa para arrastrar en esta pestaña",
			tab: "Arrastrar columnas reorganiza esta pestaña — pulsa para reorganizar todo el perfil",
			profile:
				"Arrastrar columnas reorganiza todo el perfil — pulsa para bloquear",
		},
		tipColsTitle: "Reordenar columnas",
		tipColLocked: "🔒 Bloqueado — la cabecera solo responde al clic.",
		tipColTab:
			"🔓 Esta pestaña — al soltar, la pestaña recibe su propio conjunto de columnas, sin tocar las demás.",
		tipColProfile:
			"🌐 Todo el perfil — al soltar se reorganiza el orden compartido que siguen todas las pestañas sin conjunto propio.",
		tipHidden:
			"Las columnas desactivadas conservan su posición en el orden: reaparecen donde las dejaste.",
		hiddenNote: "Oculto por el preset activo",
		noEntities: "Ninguna entidad coincide con el preset de esta pestaña.",
		pilot: "Piloto",
		type: "Tipo",
		typeSearch: "Busca cualquier tipo (p. ej. Astrahus, Veldspar)…",
		group: "Grupo",
		corporation: "Corporación",
		alliance: "Alianza",
		edit: "Editar entidad",
		rapidPopulate: "Población rápida y agrupaciones guardadas",
		loadSet: "Cargar esta agrupación (reemplaza las entidades actuales)",
		renameSet: "Renombrar agrupación",
		overwriteSet: "Sobrescribir con las entidades actuales",
		deleteSet: "Eliminar agrupación",
		setName: "Nombre de la agrupación",
		saveSet: "Guardar actual",
	},
	glossary: {
		title: "Glosario y guía",
		short: "Guía",
		intro:
			"Qué significa cada palabra y cada botón, cómo se corresponden con el juego, y las preguntas más frecuentes. Búscala o léela entera una vez.",
		search: "Buscar en la guía…",
		hits: "{n} entradas coinciden",
		noHits: "Nada coincide. Prueba con una palabra más corta.",
		showAll: "← Ver la guía completa",
		start: {
			title: "Primeros pasos",
			intro:
				"Seis pasos desde una pestaña vacía hasta un overview cargado en el cliente.",
			baseT: "Elige un perfil base",
			baseD:
				"El selector Base de la cabecera carga un perfil completo y funcional — Z-S Full, el de Fenris por defecto, o el tuyo mediante Importar. Todo lo que hagas después edita tu copia en este navegador; el original no se toca.",
			tabsT: "Organiza las pestañas",
			tabsD:
				"Configuración de pestañas asigna hasta 20 pestañas del cliente. Cada una apunta a dos presets: uno para la lista y otro para los brackets en el espacio. Son independientes: una pestaña de logística puede listar solo amigos y aun así mostrar todos los brackets hostiles.",
			presetsT: "Construye los presets",
			presetsD:
				"El preset es el filtro. Marca los grupos que puede mostrar en Grupos autorizados y usa las dos listas de estados: los filtrados ocultan, los de «mostrar siempre» rescatan. El contador de cada categoría indica cuánto cubre el preset.",
			lookT: "Elige el aspecto",
			lookD:
				"Columnas define la telemetría y su orden. Apariencia fija la prioridad de colortags y fondos — gana el primer estado que coincida, así que el orden lo es todo — además del parpadeo y los colores. Etiquetas de nave compone el texto junto a cada bracket.",
			previewT: "Compruébalo en la vista previa",
			previewD:
				"Los paneles de la derecha renderizan tu perfil con entidades inventadas. Dale a una entidad los estados y el casco que te importan y recorre las pestañas: si aparece algo que no debería, el preset activo es el motivo.",
			exportT: "Exporta y cárgalo en EVE",
			exportD:
				"La sección YAML muestra exactamente lo que leerá el cliente, y Descargar .yaml lo guarda. Pon el archivo en Documentos » EVE » Overview y, en el juego: Ajustes del Overview (el ≡ arriba a la izquierda de la ventana) » Misc » Import Overview Settings » elige el archivo » Check All » Import. Acopla y desacopla una vez si algo se ve desactualizado.",
		},
		compare: {
			title: "Usar Comparar",
			intro:
				"Seis pasos para responder «si el pack cambió, en qué me he quedado atrás?». Comparar solo lee: nada de lo que hay aquí edita tu perfil.",
			loadT: "Carga algo con lo que comparar",
			loadD:
				"Usa Cargar .yaml para un archivo tuyo, o Añadir base incluida para un pack que viene con la herramienta; también puedes arrastrar archivos a la zona de soltar. Cada uno se convierte en una columna junto a tu perfil actual, y puedes cargar varios a la vez. La X de una etiqueta lo quita.",
			inventoryT: "Lee primero el inventario de presets",
			inventoryD:
				"Empareja todos los presets de ambos lados y los clasifica: nuevo en el pack (lo tienen ellos y tú no), cambiado, solo tuyo, idéntico. El número de cada botón es el recuento, y al pulsarlo filtras por él. Tuyos y Suyos son los recuentos de grupos; Cambio de grupos es cuántos se movieron, así que +40 significa que su versión autoriza cuarenta grupos que la tuya no.",
			settingsT: "Revisa los ajustes del perfil",
			settingsD:
				"Pestañas, columnas, prioridad de colortag y de fondo, segmentos de etiqueta. Las filas en las que los perfiles no coinciden aparecen resaltadas. Aquí ves que un pack reordenó su prioridad de colortag, un cambio que altera lo que percibes en el espacio sin tocar un solo preset.",
			pairT: "Baja al detalle de una pareja de presets",
			pairD:
				"Haz clic en cualquier preset del inventario para abrirlo abajo, o elígelo en los desplegables: al elegir en una columna las demás saltan a su equivalente. Tienes los estados filtrados y siempre visibles lado a lado, y luego todos los grupos que autoriza cualquiera de los dos, con una marca por perfil.",
			diffOnlyT: "Activa Solo diferencias",
			diffOnlyD:
				"Un preset de brackets puede autorizar quinientos grupos, y leer quinientas filas para encontrar las veinte que se movieron no es leer. El interruptor oculta todos los grupos en los que los presets coinciden; el recuento que lleva al lado te dice cuántos quedan antes de pulsarlo.",
			actT: "Y entonces actúa",
			actD: "Comparar no cambia nada por sí mismo. Para quedarte con los presets nuevos, importa el mismo archivo con «Solo presets»: actualiza los presets que coinciden, añade los nuevos y deja intactas tus pestañas, columnas y colores. Guarda una versión antes si quieres una vía de vuelta.",
		},
		terms: {
			title: "El vocabulario",
			intro:
				"Las palabras del cliente y las de esta herramienta para lo mismo. Los ids son los enteros que el juego guarda en el archivo.",
			profileT: "Perfil",
			profileD:
				"Un .yaml de overview: todos los presets, pestañas, columnas, colores y etiquetas en un único archivo. Es lo que importas en el juego y lo que edita esta herramienta.",
			presetT: "Preset",
			presetD:
				"Un filtro con nombre que decide qué puede renderizarse. Lleva grupos autorizados, estados filtrados y estados de «mostrar siempre». Las pestañas apuntan a los presets por su nombre, así que renombrar uno actualiza todas las que lo usan.",
			tabT: "Pestaña",
			tabD: "Una pestaña de la ventana Overview del juego. Nombra dos presets — el de la lista y el de los brackets — y puede tener sus propias columnas. El cliente permite 20.",
			categoryT: "Categoría",
			categoryD:
				"El nivel superior del árbol de objetos del juego: Ship, Entity, Celestial, Charge, Drone, Structure… Solo sirven para navegar: el archivo nunca las guarda.",
			groupT: "Grupo",
			groupD:
				"El nivel por debajo de la categoría, y lo único que un preset autoriza realmente: Frigate (25), Cruiser (26), Stargate (10), Station (15). Marca un grupo y todos sus cascos pueden aparecer.",
			typeT: "Tipo",
			typeD:
				"Un objeto concreto: un Rifter, una roca de Veldspar, un Astrahus. Es lo que ves en el espacio; hereda la visibilidad de su grupo, y el juego no permite filtrar un tipo suelto.",
			stateT: "Estado",
			stateD:
				"Una relación o condición legal contigo, guardada como entero: 11 en tu flota, 13 en guerra contigo, 52 combate limitado, 15 a 19 reputaciones. Los mismos ids gobiernan filtros, colortags y fondos.",
			filteredT: "Estados filtrados (veto)",
			filteredD:
				"Estados que ocultan una entidad aunque su grupo esté autorizado — la forma habitual de quitar amigos de una pestaña de combate para no clicarlos por error.",
			alwaysT: "Estados siempre visibles (anulación)",
			alwaysD:
				"Estados que anulan el veto: una entidad que coincida se muestra aunque otro de sus estados esté filtrado. Está limitado a los estados: no arrastra un casco a una pestaña cuya lista de grupos lo excluye, así que una pestaña de logística sigue siendo de logística.",
			colortagT: "Colortag",
			colortagD:
				"La marca de color de la fila y su bracket. Gana el primer estado de la lista de prioridad que la entidad tenga y el perfil autorice, así que el orden de esa lista lo decide todo.",
			backgroundT: "Fondo",
			backgroundD:
				"Un color que baña la fila entera, resuelto con su propia lista de prioridad. Para los estados que no puedes pasar por alto: una fila rellena grita mucho más que una marca.",
			blinkT: "Parpadeo",
			blinkD:
				"Hace destellar un colortag o un fondo. Resérvalo para lo verdaderamente urgente: si todo parpadea, es como si no parpadeara nada.",
			bracketT: "Bracket",
			bracketD:
				"El icono y la etiqueta que flotan alrededor de un objeto en el espacio, filtrados por el preset de brackets de la pestaña y no por el de la lista. «Mostrar todos los brackets» es el valor por defecto del cliente y significa sin filtrar.",
			shipLabelsT: "Etiquetas de nave",
			shipLabelsD:
				"El texto junto a un bracket, compuesto por segmentos — nombre del piloto, tipo de nave, ticker de corporación — cada uno con su color, estilo y separadores.",
			columnsT: "Columnas",
			columnsD:
				"La telemetría de la lista y su orden: distancia, nombre, tipo, transversal, angular… El perfil lleva un conjunto compartido.",
			tabColumnsT: "Columnas por pestaña",
			tabColumnsD:
				"Una pestaña puede sustituir el conjunto compartido por el suyo, igual que el menú del juego clic derecho » Columns sobre una pestaña. Las pestañas sin anulación siguen el conjunto del perfil.",
			compareT: "Comparar",
			compareD:
				"La sección que pone tu perfil junto a otros archivos de overview (uno subido o un pack incluido) y dice qué cambia: los ajustes del perfil, un inventario de presets y una matriz grupo por grupo para cualquier pareja de presets. Solo lee: nada de lo que muestra modifica tu perfil.",
			sdeT: "SDE",
			sdeD: "El Static Data Export de Fenris: el volcado oficial de todos los objetos, grupos y categorías del juego. Esta herramienta reconstruye su copia automáticamente, y la insignia de la cabecera muestra la fecha de la última descarga.",
			yamlT: "YAML",
			yamlD:
				"El formato de texto plano que el cliente lee y escribe para los perfiles de overview. Lo que muestra la sección YAML es exactamente lo que analizará el juego: no hay ningún formato intermedio.",
		},
		doing: {
			title: "Qué hace cada control",
			intro: "Todos los botones que cambian algo, y qué cambian exactamente.",
			baseSelectT: "Base",
			baseSelectD:
				"Carga un perfil incluido como punto de partida y reemplaza el espacio de trabajo. Tus versiones guardadas no se tocan.",
			importT: "Importar » Sobrescribir",
			importD:
				"Lee un .yaml (archivo o texto pegado) y reemplaza con él todo el espacio de trabajo.",
			mergeT: "Importar » Aplicar encima",
			mergeD:
				"Fusiona un archivo sobre lo que ya tienes, como apilar piezas de un pack en el juego. Los presets son aditivos: uno con el mismo nombre se reemplaza, los nuevos se añaden y ninguno se elimina. Las secciones de diseño — pestañas, columnas, apariencia y etiquetas de nave — se sustituyen por completo cuando el archivo entrante las trae. No es un «guardar como». Si solo quieres los presets del archivo, usa «Solo presets».",
			presetsOnlyT: "Importar » Solo presets",
			presetsOnlyD:
				"Toma los presets del archivo y nada más: tus pestañas, columnas, colores y etiquetas de nave sobreviven tal cual. Es el modo para actualizar presets desde un pack más reciente, porque todo archivo de pack real (Z-S Core, 1BL, 2BL y Full por igual) es un perfil completo, así que aplicarlo encima reemplazaría el diseño que construiste alrededor. Un preset que coincide con uno tuyo se actualiza en su sitio, los nuevos se añaden y ninguno se elimina jamás.",
			inventoryT: "Inventario de presets (en Comparar)",
			inventoryD:
				"Todos los presets de ambos lados a la vez, emparejados y clasificados en nuevos del pack, cambiados, solo tuyos e idénticos, con el número de grupos de cada lado y cuántos se movieron. El número de cada botón de filtro es la respuesta corta a cuánto te has quedado atrás; haz clic en un preset para abrir esa pareja en la tabla de detalle. El emparejado ignora el formato de color, porque los packs recolorean los nombres entre versiones y emparejar por el nombre en bruto convertiría cada preset recoloreado en uno nuevo.",
			packT: "Exportar » Pack de presets",
			packD:
				"Escribe un archivo con solo los presets que marques y nada del diseño. Mándaselo a quien quiera tus filtros pero no tus pestañas, o guárdalo como copia de seguridad de tus presets antes de aplicar una actualización. El cliente nunca escribe uno así — toda exportación del juego es un perfil completo — y por eso mismo merece la pena poder crearlo aquí.",
			versionsT: "Versiones guardadas",
			versionsD:
				"Instantáneas con nombre del perfil completo, guardadas en este navegador. Guarda una antes de cualquier experimento: es el deshacer que esta herramienta no tiene.",
			loadT: "Cargar",
			loadD:
				"Lee una versión guardada y reemplaza con ella el espacio de trabajo, descartando los cambios sin guardar.",
			applyOnTopT: "Aplicar encima (sobre una versión guardada)",
			applyOnTopD:
				"La misma fusión que en la importación: los presets de la instantánea se suman a los tuyos, y sus secciones de diseño sustituyen a las tuyas si las trae. No guarda sobre la instantánea.",
			exportBtnT: "Exportar",
			exportBtnD:
				"Escribe esa versión en tu disco como un .yaml real — el que colocas en la carpeta Overview de EVE e importas en el juego.",
			shareT: "Compartir",
			shareD:
				"Copia el YAML de la versión al portapapeles para pegárselo a un compañero. No se sube nada: no hay servidor.",
			namingT: "Por qué algunas versiones llevan fecha",
			namingD:
				"Lo decide la caja del nombre. Si escribes un nombre se usa tal cual. Si la dejas vacía, la herramienta nombra la versión con el perfil base más la fecha y la hora actuales, para que siga siendo identificable. En ambos casos la hora de guardado se registra y se muestra bajo el nombre.",
			countsT: "El X / Y de las categorías",
			countsD:
				"Grupos autorizados por este preset, sobre los que contiene la categoría — la misma comprobación rápida que da el árbol de tipos del cliente. Si coinciden se ponen en verde: el preset cubre la categoría entera. Cuando una expansión añade un grupo, 50/50 pasa a 50/51 y la diferencia salta a la vista. Pasa el ratón para ver los tipos que hay detrás.",
			entitiesT: "Entidades de prueba",
			entitiesD:
				"Pilotos y objetos inventados con los que la vista previa renderiza tu perfil. Su campo de tipo busca en todo el SDE, así que puede entrar cualquier objeto real, y sus estados permiten reproducir cualquier relación que un preset filtre.",
			groupingsT: "Poblado rápido y agrupaciones",
			groupingsD:
				"Conjuntos de entidades de prueba con nombre. Cargar uno cambia la lista; lo que estabas editando se aparca primero y vuelve cuando regresas a ello.",
			unsavedT: "El punto «Sin guardar»",
			unsavedD:
				"Tus entidades de prueba difieren de la agrupación de la que salieron. Mientras tanto no se pierde nada — sobreviven al cambio de agrupación y a una recarga — pero guardar la agrupación es lo que las hace permanentes.",
			locksT: "Los candados de la vista previa",
			locksD:
				"El candado de la tira de pestañas habilita arrastrarlas. El control de columnas alterna bloqueado » esta pestaña » todo el perfil, y decide dónde acaba lo que sueltas. Cada cambio se escribe en el perfil, así que las secciones de ajustes lo reflejan al instante.",
			layoutT: "Paneles y divisor",
			layoutD:
				"Arrastra el divisor para repartir el ancho entre ajustes y vista previa (doble clic lo restablece), y el ojo de cada panel lo pliega a una barra. Ambas cosas se recuerdan en este navegador.",
			clearT: "Vaciar todo",
			clearD:
				"Deja el espacio de trabajo en un perfil en blanco con un preset vacío y una pestaña. Las versiones guardadas y las agrupaciones sobreviven.",
		},
		faq: {
			title: "Preguntas frecuentes",
			intro: "Sobre todo, dónde vive tu trabajo y qué se comparte.",
			tabsOpenT: "¿Qué pasa si abro la herramienta en dos pestañas?",
			tabsOpenD:
				"Cada pestaña ejecuta su propia copia en memoria, así que lo que edites en una no aparece en la otra: son dos espacios de trabajo, no dos vistas del mismo. El almacenamiento es otra cosa: las pestañas de un mismo sitio comparten a propósito localStorage e IndexedDB, así que ambas guardan el perfil en la misma ranura medio segundo después de cada cambio, y gana la última. Al recargar cualquiera verás la versión que se guardó al final. Edita un perfil en una sola pestaña a la vez; si otra sobrescribe el guardado compartido, ahora aparece un aviso que ofrece cargar su versión.",
			versionsSharedT:
				"¿Por qué las versiones guardadas salen en todas las pestañas?",
			versionsSharedD:
				"Porque ahí viven: una base de datos para todo el sitio, compartida por todas las pestañas, que es justo lo que hace que una versión guardada en una esté disponible en otra. Es intencionado. La lista se lee al abrir el diálogo, así que uno ya abierto necesita reabrirse para ver lo que otra pestaña acaba de guardar.",
			onDiskT: "¿Las versiones guardadas son archivos en mi disco?",
			onDiskD:
				"No. Son registros en la base de datos que el navegador reserva a este sitio: nada que puedas abrir en el explorador de archivos, y borrar los datos del sitio las elimina. Usa Exportar para escribir un .yaml real en el disco y trata ese archivo como la copia de seguridad.",
			installT: "¿Cómo llevo un perfil al juego?",
			installD:
				"Descarga el .yaml, ponlo en Documentos » EVE » Overview (crea la carpeta o, mejor, exporta antes tu overview actual desde el juego para que exista y tengas copia) y, en el juego: Ajustes del Overview » Misc » Import Overview Settings, elige el archivo, Check All, Import. Acopla y desacopla una vez si parte de la interfaz se ve desactualizada.",
			expansionT: "¿Cómo mantengo los presets al día tras una expansión?",
			expansionD:
				"La base de datos de naves se actualiza sola — la insignia de la cabecera indica cuándo se descargó. Después mira los contadores de las categorías: un preset que lo cubría todo marca X/X, así que una categoría que ganó un grupo baja a X/Y y te dice exactamente dónde mirar.",
			upgradeT:
				"¿Cómo mantengo al día mis presets personalizados con un pack como Z-S?",
			upgradeD:
				"Duplica el preset del pack que quieras tocar y edita la copia, para que el original siga siendo una referencia limpia. Cuando salga una versión nueva del pack, cárgala en Comparar: el inventario de presets te dice qué es nuevo, qué cambió y cuánto. Luego impórtala con «Solo presets», que actualiza los presets y deja intactas tus pestañas, columnas y colores. Dos cosas que conviene saber. Todo archivo de pack es un perfil completo, así que una importación completa reemplaza cada sección de diseño que traiga, y eso es lo que le cuesta a la gente su configuración de pestañas. Y los mantenedores recolorean los nombres entre versiones, por lo que aquí el emparejado ignora el formato de color a propósito: entre Z-S v9 y v10 solo 6 de 68 nombres coincidían byte a byte, mientras que 58 coincidían una vez ignorados los colores.",
			storageT: "¿Qué se guarda y sale algo de mi equipo?",
			storageD:
				"No sale nada: sin cuentas, sin cookies, sin analítica y sin subidas. Tu perfil en curso, el tema, la escala, la disposición, las entidades de prueba y las agrupaciones están en el almacenamiento local de este navegador; las versiones guardadas, en su base de datos. El panel de privacidad enumera cada elemento y puede borrarlo todo.",
			dataLossT: "¿Es seguro mi trabajo si cierro la pestaña?",
			dataLossD:
				"Sí, en el mismo navegador: el perfil se guarda solo, las entidades de prueba persisten y las versiones siguen en la base de datos. Pero todo está atado a este navegador en este dispositivo: otro navegador, una ventana privada o borrar los datos del sitio empiezan de cero. Exporta lo que te dolería perder.",
		},
	},
	privacy: {
		banner:
			"Esta herramienta guarda tu trabajo y tus preferencias solo en este navegador: sin cookies, sin analítica, sin rastreo. Ningún dato sale de tu dispositivo.",
		details: "Detalles",
		gotIt: "Entendido",
		title: "Privacidad, datos y licencias",
		openPanel: "Privacidad, datos y licencias",
		short: "Privacidad",
		intro:
			"Es una herramienta totalmente del lado del cliente: sin cuentas, sin formularios, sin cookies, sin analítica, sin publicidad y sin ningún tipo de rastreo. Todo lo que construyas aquí se guarda en tu propio navegador y nunca se transmite a ninguna parte.",
		noConsent:
			"No hay ninguna elección de aceptar/rechazar porque no hay nada opcional que consentir: cada elemento almacenado listado abajo es estrictamente necesario para prestar algo que pediste explícitamente (guardar tu trabajo, recordar una preferencia que configuraste). Ese almacenamiento está exento de consentimiento según las normas ePrivacy (Directiva 2002/58/CE, art. 5.3) y leyes equivalentes.",
		storageHeading: "Qué se guarda en tu navegador",
		storageNote:
			"Todos los elementos son de origen propio, nunca salen de este dispositivo y persisten hasta que los borres (botón de abajo o los ajustes de datos de sitios de tu navegador).",
		colKey: "Elemento",
		colType: "Tipo",
		colPurpose: "Finalidad",
		stTheme: "Tu elección de tema claro/oscuro",
		stLocale: "Tu elección de idioma",
		stScale: "Tu elección de escala de la interfaz",
		stLayout:
			"La disposición de tu espacio de trabajo: dónde arrastraste el divisor de paneles y qué paneles ocultaste",
		stSession:
			"Autoguardado del perfil de overview que estás editando (como YAML), para que al recargar continúes donde lo dejaste",
		stBase: "Desde qué perfil base comenzó tu sesión",
		stSets: "Tus agrupaciones guardadas de entidades de vista previa",
		stRoster:
			"Las entidades de prueba en las que trabajas, incluidos los cambios sin guardar aparcados por agrupación, para no perder nada al recargar",
		stAck: "Recuerda que descartaste el aviso de privacidad, y cuándo",
		stHistory: "Instantáneas de perfil que guardas en «Versiones guardadas»",
		networkHeading: "Peticiones de red",
		network1:
			"Todas las peticiones de esta app van al propio origen del sitio: la app, sus fuentes (autoalojadas — sin CDN de Google Fonts, así que tu IP no se envía a Google) y la base de datos de naves de EVE (SDE), que se actualiza al compilar, no desde tu navegador.",
		network2:
			"El sitio se aloja en GitHub Pages. Como cualquier alojamiento web, GitHub puede procesar registros técnicos de las peticiones (como tu dirección IP) para operar y proteger el servicio; consulta la Declaración de privacidad de GitHub.",
		githubPrivacy: "Declaración de privacidad de GitHub",
		rightsHeading: "Tus datos, tu control",
		rights1:
			"Nada se guarda en servidores, así que el acceso, la portabilidad y el borrado están completamente en tus manos: tu perfil se exporta como YAML en cualquier momento, y el botón de abajo elimina todo lo que esta herramienta ha guardado en este dispositivo.",
		clearData: "Borrar todos los datos guardados localmente",
		clearDataConfirm:
			"¿Borrar todo lo que esta herramienta ha guardado en este navegador (perfil de trabajo, versiones guardadas, preferencias) y recargar?",
		ackOn: "Aviso descartado el {date}.",
		licencesHeading: "Licencias y atribución",
		licApp:
			"Esta herramienta es software libre bajo la licencia GNU AGPL-3.0; código fuente completo en GitHub.",
		licDeps:
			"Bibliotecas de código abierto incluidas: Svelte, js-yaml y svelte-dnd-action; construida con Vite y Tailwind CSS. Todas con licencia MIT, compatible con la AGPL-3.0.",
		licFonts:
			"Fuentes: Inter y JetBrains Mono, incluidas bajo la SIL Open Font License 1.1.",
		licCcp:
			"EVE Online y los datos de naves/tipos usados aquí (el Static Data Export) son propiedad intelectual de Fenris hf. EVE Online® es una marca registrada de Fenris hf. Esta es una herramienta hecha por fans, no afiliada a Fenris hf. ni respaldada por ella.",
	},
};
