// Constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const metadata = require(`./${rootDir}/_data/metadata.js`);
const assets = require(`./${rootDir}/_data/assets.js`);
const locales = metadata.locales;
const defaultLang = 'en';

// Tools
const util = require('util');
const deepmerge = require('deepmerge');
const { minify } = require('terser');
const { PurgeCSS } = require('purgecss');

// Plugins
const pluginBlogTools = require('eleventy-plugin-blog-tools');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const { EleventyI18nPlugin } = require('@11ty/eleventy');
const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItFootnote = require('markdown-it-footnote');

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
		if (!obj) {
			return false;
		}
	}
	return obj;
}

// Config
const translations = buildDictionary();
const purgeCssSafeList = {
	_global: [':is', ':where', 'translated-rtl', 'aria-checked', 'data-theme'], // Translation class
	home: [],
	blog: [], // Article list links and external article button
	about: [],
};

module.exports = function (eleventyConfig) {
	/* Plugins */
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginBlogTools);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		templateFormats: ['md', 'html', 'njk'],
		preAttributes: {
			tabindex: 0,
			'data-lang': (context) => context.language.toUpperCase(),
		},
	});
	eleventyConfig.addPlugin(EleventyI18nPlugin, {
		defaultLanguage: defaultLang, // Required, this site uses "en"
		errorMode: 'allow-fallback',
		dictionary: translations,
	});

	/* Filters */
	eleventyConfig.addFilter('console', (value) => `<div style="white-space: pre-wrap;">${unescape(util.inspect(value))}</div>`);
	eleventyConfig.addFilter('keys', (obj) => Object.keys(obj));
	eleventyConfig.addFilter('values', (obj) => Object.values(obj));
	eleventyConfig.addFilter('includes', (list, value) => list.includes(value));
	eleventyConfig.addFilter('removePrivateProps', (arr) => arr.filter((item) => String(item).startsWith('_')));

	eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, callback) {
		try {
			const minified = await minify(code);
			callback(null, minified.code);
		} catch (err) {
			console.error('Terser error: ', err);
			callback(null, code); // Fail gracefully.
		}
	});

	eleventyConfig.addFilter('i18n', function (key) {
		// Find the page context
		const context = this?.ctx || this.context?.environments;

		// Determine the target language, or use the default
		const lang = context.lang || defaultLang;

		// Extend the dictionary if a i18n object exists
		const addIns = context?.i18n;

		// Build the full dictionary for the page
		const fullDictionary = createLangDictionary(lang, addIns, structuredClone(translations));

		// Find the nested value of the translation, or the default language one, or just display the key
		const translation = getDeep(fullDictionary, `${key}.${lang}`) || getDeep(fullDictionary, `${key}.${defaultLang}`) || key;
		return translation;
	});

	eleventyConfig.addFilter('extractColorFromTokenVar', (varValue, themeColors) => {
		const colorInfo = varValue.match(/var\(\s*--theme-color-([a-z]+)-(min|med|max)\s*\)/);
		const colorGroup = colorInfo[1];
		const colorWeight = colorInfo[2];
		return themeColors[colorGroup][colorWeight];
	});

	/* Shortcodes */
	eleventyConfig.addPairedShortcode('callout', function (content, pseudo) {
		const md = new markdownIt().disable('code');
		return `<div class="callout"${typeof pseudo === 'string' ? ' data-callout="' + pseudo + '"' : ''}>
			<p>${md.renderInline(content)}</p>
		</div>`;
	});

	/* Transforms */
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
			keyframes: true,
			safelist: safeSelectors,
		});

		return content.replace('/*INLINE_CSS*/', purgeCSSResults[0].css || '');
	});

	/* Passthroughs */
	eleventyConfig.addPassthroughCopy({
		[`${rootDir}/_includes/assets/css`]: '/assets/css',
		[`${rootDir}/_includes/assets/js`]: '/assets/js',
	});

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
					['focusable', 'false'],
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
					.replace(/([\u0300-\u036f]|[,;:.'"?!&])/g, '')
					.toLowerCase()
					.replace(/\s+/g, '-')
			), // Remove accents/punctuation in addition to regular slugification
	};
	eleventyConfig.setLibrary('md', markdownIt(markdownItOptions).disable('code').use(markdownItAnchor, markdownItAnchorOptions).use(markdownItFootnote));

	return {
		dir: {
			input: rootDir,
			output: outputDir,
		},
	};
};
