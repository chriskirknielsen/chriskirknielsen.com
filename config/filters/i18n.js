//* This plugin behaves very similarly to https://github.com/adamduncan/eleventy-plugin-i18n
//* but has the option to add contextual translations to a page via frontmatter/data as single-use values
//* to keep the global translation files leaner, allowing you to edit those one-off values in the same file as the page.

// Imports
const deepmerge = require('deepmerge');
const templite = require('templite');

// Helper functions
/** Get the actual type of a value. */
function trueType(val) {
	return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}

/**
 * Creates a usable dictionary to translate against. Edits the translations object in-place.
 * @param {string} lang The language for which to create a dictionary.
 * @param {object} object The translations to add to the default dictionary of the selected language.
 * @param {object} translations The global object holding the translations dictionary for all languages, where the language is the first node of the object path, e.g.: `en.home.title`.
 * @returns {object} The finalised translation dictionary, where the language key is the last node on the object path, e.g.: `home.title.en`.
 */
function createLangDictionary(lang, object, translations = {}) {
	if (!object) {
		return translations;
	}
	for (const [key, value] of Object.entries(object)) {
		// Create the property if it does not exist
		if (typeof translations[key] === 'undefined') {
			translations[key] = {};
		}
		// If it's an object, recursively assign
		if (trueType(value) === 'object') {
			translations[key] = deepmerge(createLangDictionary(lang, value, translations[key]), translations[key]);
		} else {
			// End of the line: set the translation value
			translations[key][lang] = value;
		}
	}
	return translations;
}

/**
 * Converts the language dictionaries to be usable by the internationalisation filter.
 * @param {object} dictionaries The dictionary for each language as an object, e.g.: `[lang]: { ...key:value }`.
 * @returns Complete language dictionaries as exploitable by the internationalisation filter.
 */
function buildDictionaries(dictionaries) {
	const translations = {};
	for (const [locale, i18n] of Object.entries(dictionaries)) {
		createLangDictionary(locale, i18n, translations);
	}
	return translations;
}

/**
 * Get the value of an object's nested properties.
 * @param {object} obj Object to crawl.
 * @param {string|string[]} keys Object path to retrieve, e.g. `['home','title']` or `'home.title'`.
 * @returns {any|false} The value at the provided path in the object, or `false` if the path is invalid.
 */
function getDeep(obj, keys) {
	if (!obj || trueType(obj) !== 'object') {
		throw `The provided obj is not an object.`;
	}
	if (typeof keys === 'string') {
		keys = keys.split('.').map((key) => key.trim());
	}
	if (keys.length === 0) {
		return false;
	}

	while (keys.length > 0) {
		const key = keys.shift();
		if (!obj.hasOwnProperty(key)) {
			return false;
		}
		obj = obj[key];
		if (typeof obj === 'undefined') {
			return false;
		}
	}
	return obj;
}

// Define the filter
module.exports = function (eleventyConfig, options = {}) {
	// Like the EleventyI18nPlugin, don't assume English as the default and explicitely require a language.
	if (!options.defaultLanguage || typeof options.defaultLanguage !== 'string') {
		throw new Error('A default language as a string is required for fallback behaviour as a `defaultLanguage` property on the `options` object.');
	}

	// If the dictionaries aren't valid, none of this will work
	if (!options.dictionaries || trueType(options.dictionaries) !== 'object') {
		throw new Error('A object with one or more locales is required as a property on the `options` object, e.g.: `{ en: { home: "Homepage" }, fr: { home: "Accueil" } }`.');
	}

	const { dictionaries, defaultLanguage } = options;
	const translations = buildDictionaries(dictionaries);

	/** Retrieve the translation for a provided key (can be nested as key.subkey). */
	eleventyConfig.addFilter('i18n', function (key, data = {}) {
		// Find the page context
		const context = this?.ctx || this.context?.environments;

		// Determine the target language, or use the default
		const lang = context.lang || defaultLanguage;

		// Extend the dictionary if a i18n object exists
		const addIns = context?.i18n;

		// Build the full dictionary for the page
		const fullDictionary = createLangDictionary(lang, addIns, structuredClone(translations));

		// Find the nested value of the translation, or the default language one, or just display the key
		let translation = getDeep(fullDictionary, `${key}.${lang}`);
		if (translation === false) {
			translation = getDeep(fullDictionary, `${key}.${defaultLanguage}`);
		}
		if (translation === false) {
			translation = key;
		}
		translation = templite(translation, data);
		return translation;
	});

	/** Filter down items in a collection that only match the provided, contextual, or default locale. */
	eleventyConfig.addFilter('filterToLocale', function (collection, locale = null) {
		// Determine the target language, or use the default
		const context = this?.ctx || this.context?.environments;
		locale ||= context.lang || defaultLanguage; // If the locale is not provided, us the context, and if that isn't reliable, use the default language
		return collection.filter((item) => item?.data?.lang === locale);
	});
};
