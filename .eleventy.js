// Data constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const metadata = require(`./${rootDir}/_data/metadata.js`);
const assets = require(`./${rootDir}/_data/assets.js`);
const locales = Object.keys(metadata.locales);
const defaultLang = 'en';
const dictionaries = locales.reduce((localesData, locale) => {
	const localeData = require(`./${rootDir}/${locale}/${locale}.json`);
	localesData[locale] = localeData.i18n;
	return localesData;
}, {});

// Tools
const util = require('util');
const fs = require('fs');
const jsonSass = require('json-sass');
const { PurgeCSS } = require('purgecss');
const { DateTime } = require('luxon');
const htmlmin = require('html-minifier');
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
const assetCompiler = require('./config/tools/asset-compiler.js');

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

// Config
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
	eleventyConfig.addPlugin(require('./config/filters/i18n.js'), {
		defaultLanguage: defaultLang,
		dictionaries: dictionaries,
	});
	eleventyConfig.addPlugin(require('./internal_modules/eleventy-plugin-page-assets-mxbck-fix'), {
		mode: 'directory',
		postsMatching: [`${rootDir}/fonts/*/*.njk`, `${rootDir}/**/posts/**/index.{njk,md}`, `${rootDir}/projects/**/index.{njk,md}`],
		assetsMatching: '*.jpg|*.png|*.gif|*.otf|*.woff|*.woff2|*.zip',
		silent: true,
	});
	eleventyConfig.addPlugin(require('./config/libraries/markdown-it.js')); // Markdown Anchors

	/* Filters */
	eleventyConfig.addPlugin(require('./config/filters/string.js'));
	eleventyConfig.addPlugin(require('./config/filters/object.js'));
	eleventyConfig.addFilter('mdsafe', mdsafe);
	eleventyConfig.addFilter('incPath', (filename, incDir = '', subdir = '') => `./${rootDir}/_includes/${incDir ? incDir + '/' : ''}${subdir ? subdir + '/' : ''}${filename}`);
	eleventyConfig.addFilter('console', (value) => `<pre style="white-space: pre-wrap;">${unescape(util.inspect(value))}</pre>`);
	eleventyConfig.addFilter('collectionInLocale', function (collection, locale = null) {
		// Determine the target language, or use the default
		const context = this?.ctx || this.context?.environments;
		locale = locale || context.lang || defaultLang;
		return collection.filter((item) => item?.data?.lang === locale);
	});
	eleventyConfig.addFilter('includes', (list, value) => list.includes(value));
	eleventyConfig.addFilter('unique', (arr) => [...new Set(arr)]);
	eleventyConfig.addFilter('flatten', (array) => array.flat(Infinity));
	eleventyConfig.addFilter('filterOut', (list, values) => list.filter((value) => !values.includes(value)));
	eleventyConfig.addFilter('find', (array, prop, value) => array.find((item) => item[prop] === value));
	eleventyConfig.addFilter('removePrivateProps', (arr) => arr.filter((item) => String(item).startsWith('_')));
	eleventyConfig.addFilter('pluck', function (list, key) {
		const arr = Array.isArray(list) ? list : Object.values(list);
		return arr.map((o) => o[key]);
	});
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

	/* Shortcodes */
	eleventyConfig.addPairedShortcode('mdsafe', mdsafe);
	eleventyConfig.addPlugin(require('./config/shortcodes/callout.js'), { dictionaries, md });
	eleventyConfig.addPlugin(require('./config/shortcodes/codepen.js'));
	eleventyConfig.addPairedShortcode('markdown', (content, inline = null) => (inline ? md.renderInline(content) : md.render(content)));

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
	eleventyConfig.addPlugin(require('./config/shortcodes/image-gallery.js'), {
		galleryClasses: ['image-gallery', 'content-wide'],
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

	// Minify HTML output
	eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		return htmlMinify(content);
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
