const htmlmin = require('html-minifier');
const cheerio = require('cheerio');

module.exports = function (eleventyConfig, options = {}) {
	const minifyOpts = Object.assign(
		{
			useShortDoctype: true,
			removeComments: true,
			collapseWhitespace: true,
			defaultLang: 'en',
		},
		options
	);

	/** Add ability to minify inline markup. Also useful to bypass Markdown parsing. */
	eleventyConfig.addFilter('htmlmin', function (content) {
		return htmlmin.minify(content, minifyOpts);
	});

	/** Minify all HTML outputs. */
	eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		return htmlmin.minify(content, minifyOpts);
	});
};
