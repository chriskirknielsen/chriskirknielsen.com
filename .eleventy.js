// Data constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const includesDir = '_includes'; // Include folder
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
const sass = require('sass'); // dart-sass
const esbuild = require('esbuild');
const assetCompiler = require('./config/tools/asset-compiler.js');

// Plugins
const { EleventyI18nPlugin } = require('@11ty/eleventy');
const { EleventyRenderPlugin } = require('@11ty/eleventy');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const md = new markdownIt().disable('code');

// Config
const purgeCssSafeList = {
	_global: [':is', ':where', 'translated-rtl', ':target'],
	home: ['home'],
	blog: [],
	about: [],
};

module.exports = function (eleventyConfig) {
	/* Variables */
	let jsminCache = {};

	eleventyConfig.on('eleventy.before', function (config) {
		let beforeStart = performance.now(); // Track execution time

		// Reset cache
		jsminCache = {};

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
		assetsMatching: '*.jpg|*.png|*.gif|*.mp4|*.otf|*.woff|*.woff2|*.zip',
		silent: true,
	});
	eleventyConfig.addPlugin(require('./config/libraries/markdown-it.js')); // Markdown Lib + Anchors

	/* Filters */
	eleventyConfig.addPlugin(require('./config/filters/string.js'));
	eleventyConfig.addPlugin(require('./config/filters/object.js'));
	eleventyConfig.addPlugin(require('./config/filters/array.js'));
	eleventyConfig.addPlugin(require('./config/filters/date.js'), { defaultLanguage: defaultLang });
	eleventyConfig.addFilter('incPath', (filename, dirName = '') => `./${rootDir}/${includesDir}/${dirName ? dirName + '/' : ''}${filename}`);
	eleventyConfig.addFilter('console', (value) => `<pre style="white-space: pre-wrap;">${unescape(util.inspect(value))}</pre>`);

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
	eleventyConfig.addPlugin(require('./config/shortcodes/markdown.js'), { md });
	eleventyConfig.addPlugin(require('./config/shortcodes/codepen.js'));
	eleventyConfig.addPlugin(require('./config/shortcodes/callout.js'), {
		labelByLang: Object.fromEntries(Object.keys(dictionaries).map((dictLang) => [dictLang, dictionaries[dictLang].callout])),
		defaultLanguage: defaultLang,
		md,
	});
	eleventyConfig.addPlugin(require('./config/shortcodes/media-gallery.js'), {
		galleryClasses: ['image-gallery', 'content-wide'],
	});
	eleventyConfig.addPlugin(require('./config/shortcodes/render-include.js'), {
		svgAssetFolder: `./${rootDir}/${includesDir}/assets/svg`,
		componentsFolder: `./${rootDir}/${includesDir}/components`,
		cacheSvg: true, // While serving locally, set to `false` if editing SVG assets so the cache doesn't persist across builds
	});

	/* Transforms (and related filters) */
	eleventyConfig.addPlugin(require('./config/transforms/html.js'), {
		useShortDoctype: true,
		removeComments: true,
		collapseWhitespace: true,
	});
	eleventyConfig.addPlugin(require('./config/transforms/css.js'), {
		placeholder: '/*INLINE_CSS*/',
		pathToCss: [`${rootDir}/${includesDir}/${assets.style}`],
		dynamicAttributes: ['data-theme', 'aria-pressed'],
		safelist: purgeCssSafeList._global,
		getPageSafelist: (outputPath) => {
			if (new RegExp(`${outputDir}\/(index\.html|fr\/index\.html)`).exec(outputPath)) {
				return purgeCssSafeList.home;
			} else if (new RegExp(`${outputDir}\/(about|fr\/a-propos)`).exec(outputPath)) {
				return purgeCssSafeList.about;
			} else if (new RegExp(`${outputDir}\/(blog|tags)\/`).exec(outputPath)) {
				return purgeCssSafeList.blog;
			}
		},
	});

	/* Passthroughs */
	eleventyConfig.addPassthroughCopy({
		[`${rootDir}/${includesDir}/assets/css`]: '/assets/css',
		[`${rootDir}/${includesDir}/assets/js`]: '/assets/js',
		[`${rootDir}/assets/img`]: '/assets/img',
		[`${rootDir}/assets/audio`]: '/assets/audio',
		[`${rootDir}/assets/fonts`]: '/assets/fonts',
	});

	/* Watch targets */
	eleventyConfig.addWatchTarget(`./${rootDir}/assets/scss/**/*.scss`);
	eleventyConfig.addWatchTarget(`./${rootDir}/assets/js/**/*.js`);

	eleventyConfig.watchIgnores.add(`./${rootDir}/assets/scss/tools/_tokens.scss`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/css/**/*`);
	eleventyConfig.watchIgnores.add(`./${rootDir}/${includesDir}/assets/js/**/*`);

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
			includes: includesDir,
		},
	};
};
