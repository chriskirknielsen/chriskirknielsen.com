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

	/** Attach a language indicator. */
	eleventyConfig.addTransform('hreflang', function (content, outputPath) {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		const $ = cheerio.load(content, null, true); // Load the contents into cheerio to get a DOM representation
		const contentLang = $('html').attr('lang');

		// If the page is already in English (default lang), return the content as is
		if (contentLang === 'en') {
			console.log('lang=en', outputPath);
			return content;
		}

		const hreflangLinks = $('a[href][hreflang]'); // Find all hreflang references
		hreflangLinks.each(function () {
			const link = $(this);
			const targetLang = link.attr('hreflang');
			if (contentLang !== targetLang) {
				link.append($(`<span class="visually-hidden hreflang-tip">(${targetLang})</span>`));
			}
		});

		return $.html();
	});

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
