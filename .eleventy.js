// Data constants
const rootDir = 'src'; // Root folder
const outputDir = '_site'; // Build destination folder
const includesDir = '_includes'; // Include folder
const metadata = require(`./${rootDir}/_data/metadata.js`);
const assets = require(`./${rootDir}/_data/assets.js`);
const locales = Object.keys(metadata.locales);
const defaultLang = 'en';
const dictionaries = Object.fromEntries(locales.map((locale) => [locale, require(`./${rootDir}/${locale}/${locale}.json`).i18n]));

// Tools
const util = require('util');

// Plugins
const { EleventyI18nPlugin, EleventyRenderPlugin } = require('@11ty/eleventy');
const pluginRss = require('@11ty/eleventy-plugin-rss');
const pluginSyntaxHighlight = require('@11ty/eleventy-plugin-syntaxhighlight');
const markdownIt = require('markdown-it');
const md = new markdownIt().disable('code');

// Config
const purgeCssList = {
	_global: { safe: [':is', ':where', 'translated-rtl', ':target'], block: [] },
	home: { safe: ['data-section=home'], block: ['data-section=about'] },
	about: { safe: ['data-section=about'], block: ['data-section=home'] },
};

module.exports = function (eleventyConfig) {
	/* Before Build */
	eleventyConfig.addPlugin(require('./config/before/asset-compiler.js'));

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
	eleventyConfig.addPlugin(require('./config/libraries/markdown-it.js'), {
		anchorClass: 'heading-anchor',
		anchorSvgId: 'anchor-link',
		anchorSvgClass: 'heading-anchor-symbol',
	});

	/* Filters */
	eleventyConfig.addPlugin(require('./config/filters/string.js'));
	eleventyConfig.addPlugin(require('./config/filters/object.js'));
	eleventyConfig.addPlugin(require('./config/filters/array.js'));
	eleventyConfig.addPlugin(require('./config/filters/date.js'), { defaultLanguage: defaultLang });
	eleventyConfig.addPlugin(require('./config/filters/jsmin.js'), { useCache: true });
	eleventyConfig.addPlugin(require('./config/filters/color-token-var.js'));
	eleventyConfig.addFilter('incPath', (filename, dirName = '') => `./${rootDir}/${includesDir}/${dirName ? dirName + '/' : ''}${filename}`);
	eleventyConfig.addFilter('console', (value) => `<pre style="white-space: pre-wrap;">${unescape(util.inspect(value))}</pre>`);

	/* Shortcodes */
	eleventyConfig.addPlugin(require('./config/shortcodes/markdown.js'), { markdownEngine: md });
	eleventyConfig.addPlugin(require('./config/shortcodes/codepen.js'));
	eleventyConfig.addPlugin(require('./config/shortcodes/callout.js'), {
		labelByLang: Object.fromEntries(Object.keys(dictionaries).map((dictLang) => [dictLang, dictionaries[dictLang].callout])),
		defaultLanguage: defaultLang,
		markdownEngine: md,
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
		safelist: purgeCssList._global.safe,
		blocklist: purgeCssList._global.block,
		getPageList: (outputPath) => {
			if (new RegExp(`${outputDir}\/(index\.html|fr\/index\.html)`).exec(outputPath)) {
				return purgeCssList.home;
			} else if (new RegExp(`${outputDir}\/(about|fr\/a-propos)`).exec(outputPath)) {
				return purgeCssList.about;
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
