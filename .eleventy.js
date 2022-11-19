// Constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const metadata = require(`./${rootDir}/_data/metadata.js`);
const assets = require(`./${rootDir}/_data/assets.js`);
const locales = Object.keys(metadata.locales);
const defaultLang = 'en';

// Tools
const util = require('util');
const deepmerge = require('deepmerge');
const { PurgeCSS } = require('purgecss');
const { DateTime } = require('luxon');
const htmlmin = require('html-minifier');
const templite = require('templite');
const CleanCSS = require('clean-css');
const { minify } = require('terser');

// Plugins
const { EleventyI18nPlugin } = require('@11ty/eleventy');
const { EleventyRenderPlugin } = require('@11ty/eleventy');
const pluginBlogTools = require('eleventy-plugin-blog-tools');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItFootnote = require('markdown-it-footnote');
const md = new markdownIt().disable('code');
const pageAssets = require('./internal_modules/eleventy-plugin-page-assets-mxbck-fix');

// Helpers
function trueType(val) {
	return Object.prototype.toString.call(val).slice(8, -1).toLowerCase();
}
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
function buildDictionary() {
	const translations = {};
	for (const locale of locales) {
		const { i18n } = require(`./${rootDir}/${locale}/${locale}.json`);

		createLangDictionary(locale, i18n, translations);
	}
	return translations;
}
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

// Config
const translations = buildDictionary();
const purgeCssSafeList = {
	_global: [':is', ':where', 'translated-rtl', ':target'],
	home: ['home'],
	blog: [], // Article list links and external article button
	about: [],
};

module.exports = function (eleventyConfig) {
	/* Variables */
	let jsminCache = {};
	let svgCache = {};
	eleventyConfig.on('eleventy.before', () => {
		jsminCache = {};
		svgCache = {};
	});

	/* Plugins */
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginBlogTools);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		templateFormats: ['md', 'html', 'njk'],
		preAttributes: {
			tabindex: 0,
			class: (context) => `language-${context.language} codeblock content-wide`,
			'data-lang': (context) => context.language.toUpperCase(),
		},
	});
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(EleventyI18nPlugin, {
		defaultLanguage: defaultLang, // Required, this site uses "en"
		errorMode: 'allow-fallback',
	});
	eleventyConfig.addPlugin(pageAssets, {
		mode: 'directory',
		postsMatching: `${rootDir}/fonts/*/*.njk`,
		assetsMatching: '*.jpg|*.png|*.gif|*.otf|*.woff|*.woff2',
		silent: true,
	});

	/* Filters */
	eleventyConfig.addFilter('assetPath', (filename, subdir) => `./${rootDir}/_includes/assets/${subdir}/${filename}`);
	eleventyConfig.addFilter('console', (value) => `<pre style="white-space: pre-wrap;">${unescape(util.inspect(value))}</pre>`);
	eleventyConfig.addFilter('fromJSON', (str) => JSON.parse(str));
	eleventyConfig.addFilter('keys', (obj) => Object.keys(obj));
	eleventyConfig.addFilter('values', (obj) => Object.values(obj));
	eleventyConfig.addFilter('collectionInLocale', function (collection, locale = null) {
		// Determine the target language, or use the default
		const context = this?.ctx || this.context?.environments;
		locale = locale || context.lang || defaultLang;
		return collection.filter((item) => item?.data?.lang === locale);
	});
	eleventyConfig.addFilter('stripHyphenChars', (str) => str.replace(/(&shy;|<wbr>)/gm, ''));
	eleventyConfig.addFilter('toLowercase', (str) => str.toLowerCase());
	eleventyConfig.addFilter('toUppercase', (str) => str.toUpperCase());
	eleventyConfig.addFilter('includes', (list, value) => list.includes(value));
	eleventyConfig.addFilter('filterOut', (list, values) => list.filter((value) => !values.includes(value)));
	eleventyConfig.addFilter('find', (array, prop, value) => array.find((item) => item[prop] === value));
	eleventyConfig.addFilter('unique', (arr) => [...new Set(arr)]);
	eleventyConfig.addFilter('flatten', function (array) {
		const flatten = (arr) => arr.reduce((acc, cur) => acc.concat(Array.isArray(cur) ? flatten(cur) : cur), []);
		return flatten(array);
	});
	eleventyConfig.addFilter('removePrivateProps', (arr) => arr.filter((item) => String(item).startsWith('_')));
	eleventyConfig.addFilter('pluck', function (list, key) {
		const arr = Array.isArray(list) ? list : Object.values(list);
		return arr.map((o) => o[key]);
	});
	eleventyConfig.addFilter('filterBoolProp', (array, property, flip = false) =>
		array.filter((obj) => {
			const bool = obj[property];
			return flip ? bool === false : bool !== false;
		})
	);
	eleventyConfig.addFilter('dateFormat', (date, opts = {}) => {
		const format = opts.format || 'machine';
		const locale = opts.locale || defaultLang;
		const dateObj = new Date(date);
		const utcDate = DateTime.fromJSDate(dateObj).toUTC();

		switch (format) {
			case 'obj': {
				return new Date(utcDate.toISO());
			}
			case 'rfc2822': {
				return utcDate.toRFC2822();
			}
			case 'iso': {
				return utcDate.toISO();
			}
			case 'year': {
				return utcDate.toFormat('yyyy');
			}
			case 'machine': {
				return utcDate.toFormat('yyyy-MM-dd');
			}
			case 'nice': {
				// In French, you usually say "1st" instead of "1" for the first of the month, but the rest of the days can be said as "13 October 1984", no ordinal needed
				if (locale === 'fr' && parseInt(utcDate.toFormat('d'), 10) === 1) {
					return `1er ${utcDate.toFormat('LLLL yyyy')}`;
				}
				return utcDate.setLocale(locale).toFormat('d LLLL yyyy');
			}
		}
	});

	eleventyConfig.addFilter('htmlmin', function (code) {
		return htmlmin.minify(code, {
			useShortDoctype: true,
			removeComments: true,
			collapseWhitespace: true,
		});
	});

	eleventyConfig.addFilter('cssmin', function (code) {
		return new CleanCSS({}).minify(code).styles;
	});

	eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, ...rest) {
		const callback = rest.pop();
		const cacheKey = rest.length > 0 ? rest[0] : null;

		try {
			if (cacheKey && jsminCache.hasOwnProperty(cacheKey)) {
				const cacheValue = await Promise.resolve(jsminCache[cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
				callback(null, cacheValue.code); // Access the code property of the cached value
			} else {
				const minified = minify(code);
				if (cacheKey) {
					jsminCache[cacheKey] = minified; // Store the promise which has the minified output (an object with a code property)
				}
				callback(null, (await minified).code); // Await and use the return value in the callback
			}
		} catch (err) {
			console.error('Terser error: ', err);
			callback(null, code); // Fail gracefully.
		}
	});

	eleventyConfig.addFilter('i18n', function (key, data = {}) {
		// Find the page context
		const context = this?.ctx || this.context?.environments;

		// Determine the target language, or use the default
		const lang = context.lang || defaultLang;

		// Extend the dictionary if a i18n object exists
		const addIns = context?.i18n;

		// Build the full dictionary for the page
		const fullDictionary = createLangDictionary(lang, addIns, structuredClone(translations));

		// Find the nested value of the translation, or the default language one, or just display the key
		let translation = getDeep(fullDictionary, `${key}.${lang}`);
		if (translation === false) {
			translation = getDeep(fullDictionary, `${key}.${defaultLang}`);
		}
		if (translation === false) {
			translation = key;
		}
		translation = templite(translation, data);
		return translation;
	});

	eleventyConfig.addFilter('extractColorFromTokenVar', (varValue, themeColors) => {
		// If it's not a variable, render the value as is
		if (!varValue.trim().startsWith('var(--')) {
			return varValue;
		}

		// Find the colour group and weight, then pick the value out from the theme colours
		const colorInfo = varValue.match(/var\(\s*--t-color-([a-z]+)-(min|med|max)\s*\)/);
		const colorGroup = colorInfo[1];
		const colorWeight = colorInfo[2];
		return themeColors[colorGroup][colorWeight];
	});

	/* Shortcodes */
	eleventyConfig.addPairedShortcode('callout', function (content, pseudo = '', emoji = '') {
		const uniqueId = `co-${new Date().getTime().toString(36)}`;
		const context = this?.ctx || this.context?.environments;
		const lang = context.lang || defaultLang;
		pseudo ||= translations.callout[lang];

		return `<div class="callout" aria-labelledby="${uniqueId}">
			<p id="${uniqueId}" class="h3 | callout-label"${emoji ? ' style="--callout-emoji: \'' + emoji + '\'"' : ''}>${pseudo}</p>
			<p>${md.renderInline(content.trim())}</p>
		</div>`;
	});

	eleventyConfig.addPairedShortcode('markdown', (content, inline = null) => {
		return inline ? md.renderInline(content) : md.render(content);
	});

	eleventyConfig.addAsyncShortcode('svg', async function (filename, svgOptions = {}) {
		const cacheKey = filename + '_' + JSON.stringify(svgOptions);
		if (svgCache && svgCache.hasOwnProperty(cacheKey)) {
			return await Promise.resolve(svgCache[cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
		}

		const isNjk = svgOptions.hasOwnProperty('isNjk') ? svgOptions.isNjk : true;
		const filePath = `./${rootDir}/_includes/assets/svg/${filename}.svg${isNjk ? '.njk' : ''}`;
		const engine = svgOptions.hasOwnProperty('engine') ? svgOptions.engine : isNjk ? 'njk' : 'html'; // HTML for vanilla SVG
		const content = eleventyConfig.nunjucksAsyncShortcodes.renderFile(filePath, svgOptions, engine);
		svgCache[cacheKey] = content;
		return await content;
	});

	/* Transforms */
	// Inline only the necessary CSS
	eleventyConfig.addTransform('purge-and-inline-css', async (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		let safeSelectors = purgeCssSafeList._global;
		if (/\/(index\.html|fr\/index\.html)/.exec(outputPath)) {
			safeSelectors = safeSelectors.concat(purgeCssSafeList.home);
		} else if (/\/(about|fr\/a-propos)/.exec(outputPath)) {
			safeSelectors = safeSelectors.concat(purgeCssSafeList.about);
		} else if (/\/(blog|tags)\//.exec(outputPath)) {
			safeSelectors = safeSelectors.concat(purgeCssSafeList.blog);
		}
		const purgeCSSResults = await new PurgeCSS().purge({
			content: [{ raw: content }],
			css: [`${rootDir}/_includes/${assets.style}`],
			keyframes: true, // Removes unused keyframes
			safelist: safeSelectors,
			dynamicAttributes: ['data-theme', 'aria-pressed'],
		});

		return content.replace('/*INLINE_CSS*/', purgeCSSResults[0].css || '');
	});

	// Remove anchor-link if unused
	eleventyConfig.addTransform('unused-anchor-link', (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		if (content.includes('href="#anchor-link"')) {
			return content;
		}

		return content.replace(/<svg ([^>]+) data-anchor-link>(.+)<\/svg>/s, '');
	});

	// Minify HTML output
	eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		let minified = htmlmin.minify(content, {
			useShortDoctype: true,
			removeComments: true,
			collapseWhitespace: true,
		});
		return minified;
	});

	/* Collections */
	eleventyConfig.addCollection('page_all', function (collection) {
		return [].concat(locales.map((locale) => collection.getFilteredByGlob(`./${rootDir}/${locale}/pages/*.{md,njk}`)));
	});

	eleventyConfig.addCollection('post_all', function (collection) {
		return [].concat(locales.map((locale) => collection.getFilteredByGlob(`./${rootDir}/${locale}/posts/*.{md,njk}`)));
	});

	// Loop over locales and get each page and post into its own collection
	locales.forEach((locale) => {
		eleventyConfig.addCollection(`page_${locale}`, function (collection) {
			return collection.getFilteredByGlob(`./${rootDir}/${locale}/pages/*.{md,njk}`);
		});

		eleventyConfig.addCollection(`post_${locale}`, function (collection) {
			return collection.getFilteredByGlob(`./${rootDir}/${locale}/posts/*.{md,njk}`);
		});
	});

	// Only _published_ content in the `/fonts/` directory
	eleventyConfig.addCollection('fonts', function (collection) {
		return collection
			.getFilteredByGlob(`./${rootDir}/fonts/**/index.njk`)
			.filter(function (item) {
				return !item.data.draft;
			})
			.sort(function (a, b) {
				return a.inputPath.localeCompare(b.inputPath); // sort by path - ascending
			});
	});

	/* Passthroughs */
	eleventyConfig.addPassthroughCopy({
		[`${rootDir}/_includes/assets/css`]: '/assets/css',
		// [`${rootDir}/_includes/assets/js`]: '/assets/js',
		[`${rootDir}/assets/img`]: '/assets/img',
		[`${rootDir}/assets/audio`]: '/assets/audio',
		[`${rootDir}/assets/fonts`]: '/assets/fonts',
	});

	/* Watch targets */
	eleventyConfig.addWatchTarget(`./${rootDir}/follow.11ty.js`);

	/* Markdown */
	let markdownItOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	let markdownItAnchorOptions = {
		permalink: true,
		permalinkSpace: false,
		permalinkSymbol: '#',
		permalinkClass: 'heading-anchor',
		renderPermalink: (slug, opts, state, idx) => {
			// Based on https://nicolas-hoizey.com/articles/2021/02/25/accessible-anchor-links-with-markdown-it-and-eleventy/
			// Itself based on fifth version from https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/

			// Create the opening/closing <a> and the <svg><use /></svg> tokens
			const headingAnchorTokenOpen = Object.assign(new state.Token('link_open', 'a', 1), {
				attrs: [
					...(opts.permalinkClass ? [['class', opts.permalinkClass]] : []),
					['href', opts.permalinkHref(slug, state)],
					...Object.entries(opts.permalinkAttrs(slug, state)),
				],
			});
			const svgSymbolTokenOpen = Object.assign(new state.Token('svg_open', 'svg', 1), {
				attrs: [
					['width', 16],
					['height', 16],
					['class', 'heading-anchor-symbol'],
					['aria-hidden', 'true'],
				],
			});
			const svgUseTokenOpen = Object.assign(new state.Token('use_open', 'use', 1), {
				attrs: [['xlink:href', '#anchor-link']],
			});
			const svgUseTokenClose = Object.assign(new state.Token('use_close', 'svg', -1));
			const svgSymbolTokenClose = Object.assign(new state.Token('svg_close', 'svg', -1));
			const headingAnchorTokenClose = Object.assign(new state.Token('link_close', 'a', -1));

			// idx is the index of the heading's first token
			const tokensBeforeContent = [headingAnchorTokenOpen, svgSymbolTokenOpen, svgUseTokenOpen, svgUseTokenClose, svgSymbolTokenClose];
			const tokensAfterContent = [headingAnchorTokenClose];
			// insert the anchor opening inside the heading, before the content token
			state.tokens.splice(idx + 1, 0, ...tokensBeforeContent);
			// insert the anchor closing after the heading opening and the content token + the tokens before the content
			state.tokens.splice(idx + 2 + tokensBeforeContent.length, 0, ...tokensAfterContent);
		},
		slugify: (s) =>
			encodeURIComponent(
				String(s)
					.trim()
					.normalize('NFD')
					.replace(/([\u0300-\u036f]|[,;:.…'"?!&])/g, '')
					.toLowerCase()
					.replace(/\s+/g, '-')
			), // Remove accents/punctuation in addition to regular slugification
	};
	eleventyConfig.setLibrary('md', markdownIt(markdownItOptions).disable('code').use(markdownItAnchor, markdownItAnchorOptions).use(markdownItFootnote));

	// If gulp is running, wait a tick!
	// eleventyConfig.setWatchThrottleWaitTime(1000); // in milliseconds

	return {
		pathPrefix: '/',
		markdownTemplateEngine: 'njk',
		htmlTemplateEngine: 'njk',
		passthroughFileCopy: true,
		dir: {
			input: rootDir,
			output: outputDir,
		},
	};
};
