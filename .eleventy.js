// Constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const metadata = require(`./${rootDir}/_data/metadata.js`);
const assets = require(`./${rootDir}/_data/assets.js`);
const locales = Object.keys(metadata.locales);
const defaultLang = 'en';

// Tools
const util = require('util');
const fs = require('fs');
const path = require('node:path');
const jsonSass = require('json-sass');
const deepmerge = require('deepmerge');
const { PurgeCSS } = require('purgecss');
const { DateTime } = require('luxon');
const htmlmin = require('html-minifier');
const templite = require('templite');
const CleanCSS = require('clean-css');
const sass = require('sass'); // dart-sass
const esbuild = require('esbuild');

// Plugins
const { EleventyI18nPlugin } = require('@11ty/eleventy');
const { EleventyRenderPlugin } = require('@11ty/eleventy');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const md = new markdownIt().disable('code');
const pageAssets = require('./internal_modules/eleventy-plugin-page-assets-mxbck-fix');
const assetCompiler = require('./config/asset-compiler.js');

// Helpers
function mdsafe(content) {
	return content.replace(/(\t|\n|\r|(    ))/g, ' ');
}
function htmlMinify(code) {
	return htmlmin.minify(code, {
		useShortDoctype: true,
		removeComments: true,
		collapseWhitespace: true,
	});
}
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

	eleventyConfig.on('eleventy.before', function (config) {
		let beforeStart = performance.now(); // Track execution time

		// Reset caches
		jsminCache = {};
		svgCache = {};

		// Precompile Sass and JS files with the asset compiler
		const compileAssets = (settings) => assetCompiler(settings, config);

		// Compile the JSON tokens file to a Sass file first
		const tokens = new Promise((resolve, reject) =>
			fs
				.createReadStream(`${config.inputDir}/_data/tokens.json`)
				.pipe(jsonSass({ prefix: '$tokens: ' }))
				.pipe(fs.createWriteStream(`${config.inputDir}/assets/scss/tools/_tokens.scss`).on('finish', resolve).on('error', reject))
		);

		const styles = () =>
			compileAssets({
				inFolder: 'scss',
				inExt: 'scss',
				outFolder: 'css',
				outExt: 'css',
				filterFn: (inputPath) => !inputPath.split('/').pop().startsWith('_'),
				compileFn: async (parsed) => {
					const result = sass.compile(`${parsed.dir}/${parsed.base}`, {
						loadPaths: [parsed.dir || '.', config.dir.includes],
						style: 'compressed',
						precision: 4,
					});
					return result.css;
				},
			});

		const scripts = () =>
			compileAssets({
				inFolder: 'js',
				inExt: 'js',
				compileFn: async (parsed) => {
					const result = await esbuild.build({
						target: 'es2020',
						entryPoints: [`${parsed.dir}/${parsed.base}`],
						minify: true,
						bundle: true,
						write: false,
					});
					return result.outputFiles[0].text;
				},
			});

		return Promise.all([tokens.then(styles), scripts()]).then((pipelines) => {
			console.log(`\x1b[33m[11ty] Ran eleventy.before in ${((performance.now() - beforeStart) / 1000).toFixed(2)} seconds`);
			return pipelines;
		});
	});

	/* Plugins */
	eleventyConfig.addPlugin(pluginRss);
	eleventyConfig.addPlugin(pluginSyntaxHighlight, {
		templateFormats: ['md', 'html', 'njk'],
		preAttributes: {
			tabindex: 0,
			class: (context) => `${context.language ? 'language-' + context.language : ''} codeblock content-wide`.trim(),
			'data-lang': (context) => (context.language && context.language !== 'text' ? context.language.toUpperCase() : ''),
		},
	});
	eleventyConfig.addPlugin(EleventyRenderPlugin);
	eleventyConfig.addPlugin(EleventyI18nPlugin, {
		defaultLanguage: defaultLang, // Required, this site uses "en"
		errorMode: 'allow-fallback',
	});
	eleventyConfig.addPlugin(pageAssets, {
		mode: 'directory',
		postsMatching: [`${rootDir}/fonts/*/*.njk`, `${rootDir}/**/posts/**/index.{njk,md}`, `${rootDir}/projects/**/index.{njk,md}`],
		assetsMatching: '*.jpg|*.png|*.gif|*.otf|*.woff|*.woff2|*.zip',
		silent: true,
	});
	eleventyConfig.addPlugin(require('./config/markdown-it.js')); // Markdown Anchors

	/* Filters */
	eleventyConfig.addFilter('mdsafe', mdsafe);
	eleventyConfig.addFilter('incPath', (filename, incDir = '', subdir = '') => `./${rootDir}/_includes/${incDir ? incDir + '/' : ''}${subdir ? subdir + '/' : ''}${filename}`);
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
	eleventyConfig.addFilter('removeTrailingSlash', (str) => str.trim().replace(/\/$/g, ''));
	eleventyConfig.addFilter('stripHyphenChars', (str) => str.replace(/(&shy;|<wbr>)/gm, ''));
	eleventyConfig.addFilter('stripScripts', (str) => str.replace(/(<script( [^>]+)?>(.+)<\/script>)/gim, '')); // Not 100% reliable, however I don't usually add `</script>` inside a script tag so it should be safe!
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
	eleventyConfig.addFilter('getFirst', (listOrItem) => (Array.isArray(listOrItem) ? listOrItem[0] : listOrItem)); // Gets the first item, and if it is not an array, returns the value as-is
	eleventyConfig.addFilter('getList', (listOrItem) => (Array.isArray(listOrItem) ? listOrItem : [listOrItem])); // Gets the list of items, and if it is not an array, returns the value wrapped in an array
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
		return htmlMinify(code);
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
				const minified = esbuild.transform(code, {
					minify: true,
				});
				if (cacheKey) {
					jsminCache[cacheKey] = minified; // Store the promise which has the minified output (an object with a code property)
				}
				callback(null, (await minified).code); // Await and use the return value in the callback
			}
		} catch (err) {
			console.error('jsmin error: ', err);
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
	eleventyConfig.addPairedShortcode('mdsafe', mdsafe);
	eleventyConfig.addPairedShortcode('callout', function (content, pseudo = '', emoji = '') {
		const uniqueId = `co-${new Date().getTime().toString(36)}`;
		const context = this?.ctx || this.context?.environments;
		const lang = context.lang || defaultLang;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		pseudo ||= translations.callout[lang];

		return `<div class="callout" aria-labelledby="${uniqueId}">
			<p id="${uniqueId}" class="h3 | callout-label" ${emojiStyleAttr}>${pseudo}</p>
			<p>${md.renderInline(content.trim())}</p>
		</div>`;
	});

	eleventyConfig.addPairedShortcode('markdown', (content, inline = null) => {
		return inline ? md.renderInline(content) : md.render(content);
	});
	eleventyConfig.addShortcode('codepen', function (url, tabs = 'result', height = '480', theme = '') {
		const path = new URL(url).pathname;
		const id = path.split('/')[3];
		let markup = `<p class="codepen" data-height="${height}" data-theme-id="${theme}" data-default-tab="${tabs}" data-slug-hash="${id}">
			<a href="${url}" class="button">See the Pen</a>
		</p>`;

		// Only inject the CodePen embed once per page
		if (!this.page.hasOwnProperty('__codepen_embed_script_injected__')) {
			markup += `<script async src="https://static.codepen.io/assets/embed/ei.js"></script>`;
			this.page.__codepen_embed_script_injected__ = true;
		}

		return markup;
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
	eleventyConfig.addAsyncShortcode('component', async function (filename, componentOptions = {}) {
		const filePath = `./${rootDir}/_includes/components/${filename}.njk`;
		const content = eleventyConfig.nunjucksAsyncShortcodes.renderFile(filePath, componentOptions, 'njk');
		return await content;
	});

	function imageGalleryShortcode(pictures, addClass = null) {
		const galleryClasses = ['image-gallery', 'content-wide'];
		if (addClass) {
			galleryClasses.push(addClass);
		}
		return `<div class="${galleryClasses.join(' ')}">${pictures.trim()}</div>`;
	}
	function imageShortcode(src, alt, caption = '', options = {}) {
		if (typeof alt === 'undefined') {
			throw `The ${src} image does not have an alt attribute! (empty string is allowed)`;
		}

		if (!options.ratio && !options.width && !options.height) {
			throw `The ${src} image does not have a ratio or width/height attributes. At least two of the three must be provided.`;
		}

		const isGroupContext = options.hasOwnProperty('group') && options.group; // Whether the image is part of a group
		const sizes = ['100vw', '(min-width: 50rem) 50rem'].join(', ');
		const widths = options.widths || [480, 800, 1200];
		const srcset = widths.map((w) => `${src}?nf_resize=fit&w=${w} ${w}w`);
		if (alt.indexOf('"') > -1) {
			alt = alt.split('"').join('&quot;');
		}
		if (alt.indexOf('<') > -1) {
			alt = alt.split('<').join('&lt;');
		}

		const attrs = {
			loading: 'lazy',
			decoding: 'async',
			alt: alt,
		};

		// Assign a ratio to the image
		if (options.ratio) {
			// If the ratio is passed as a string, parse it to a number
			if (typeof options.ratio === 'string') {
				attrs['data-ratio'] = options.ratio; // Store the initial ratio provided

				if (options.ratio.includes('/')) {
					let ratioParts = options.ratio.split('/');
					options.ratio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
				} else {
					options.ratio = parseFloat(options.ratio);
				}
			}

			// If only one dimension was provided, calculate the other based on the ratio
			if (options.width && !options.height) {
				options.height = options.width / options.ratio;
			} else if (!options.width && options.height) {
				options.height = options.height * options.ratio;
			} else if (!options.width && !options.height) {
				// If no dimensions were provided, assume a 1000px height and determine the width based on the ratio
				options.width = Math.floor(options.ratio * 1000);
				options.height = 1000;
			}
		}

		// Set the width and height attributes
		if (options.width) {
			attrs.width = options.width;
		}
		if (options.height) {
			attrs.height = options.height;
		}

		let ratioString = attrs['data-ratio'] || options.ratio ? parseFloat(options.ratio.toFixed(4)).toString() : `${options.width} / ${options.height}`;
		attrs.style = `aspect-ratio:${ratioString};`;

		const attrsStr = Object.entries(attrs)
			.map((attr) => `${attr[0]}="${attr[1]}"`)
			.join(' ');

		const imageMarkup = `<a href="${src}"><img src="${src}?nf_resize=fit&w=${widths.at(-2)}" srcset="${srcset.join(',')}" sizes="${sizes}" ${attrsStr} /></a>`;

		let output;
		if (caption) {
			output = `<figure>${imageMarkup}<figcaption>${caption}</figcaption></figure>`;
		} else {
			output = imageMarkup;
		}

		// If not grouped in a gallery (wrapped in a {% gallery %} shortcode pair), make it a single-image gallery
		if (!isGroupContext) {
			return imageGalleryShortcode(output);
		}

		return output;
	}

	eleventyConfig.addShortcode('image', imageShortcode);
	eleventyConfig.addPairedShortcode('gallery', imageGalleryShortcode);

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

	// Minify HTML output
	eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		return htmlMinify(content);
	});

	/* Collections */
	// Loop over locales and get each page and post into its own collection
	locales.forEach((locale) => {
		eleventyConfig.addCollection(`page_${locale}`, function (collection) {
			return collection.getFilteredByGlob(`./${rootDir}/${locale}/pages/**/*.{md,njk}`);
		});

		eleventyConfig.addCollection(`post_${locale}`, function (collection) {
			return collection.getFilteredByGlob(`./${rootDir}/${locale}/posts/**/*.{md,njk}`);
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
		[`${rootDir}/_includes/assets/js`]: '/assets/js',
		[`${rootDir}/assets/img`]: '/assets/img',
		[`${rootDir}/assets/audio`]: '/assets/audio',
		[`${rootDir}/assets/fonts`]: '/assets/fonts',
	});

	/* Watch targets */
	eleventyConfig.addWatchTarget(`./${rootDir}/assets/scss/**/*.scss`);
	eleventyConfig.addWatchTarget(`./${rootDir}/assets/js/**/*.js`);

	eleventyConfig.watchIgnores.add(`./${rootDir}/assets/scss/tools/_tokens.scss`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/css/**/*`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/_includes/assets/js/**/*`);

	eleventyConfig.setServerOptions({
		domDiff: false, // Due to runtime JS (mainly themes), it is preferrable to get a fresh copy of the DOM
	});

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
