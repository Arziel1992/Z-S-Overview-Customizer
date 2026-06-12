/**
 * Reactive i18n runtime.
 *
 * Translations live in one file per language under ./locales/ (en.js is the
 * reference; other locales fall back to it key-by-key). The active locale is
 * Svelte 5 `$state`, so every `t('a.b.c')` call inside a template re-evaluates
 * the moment the locale changes — no reload needed. The chosen locale persists
 * to localStorage.
 *
 * Adding a language: create ./locales/<code>.js by copying en.js and
 * translating the values, then import + register it in `locales` and
 * `LOCALE_NAMES` below. See the README's "Contributing translations" section.
 */

import en from "./locales/en.js";
import es from "./locales/es.js";

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
