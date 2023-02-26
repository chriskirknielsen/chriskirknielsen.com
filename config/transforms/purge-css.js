const { PurgeCSS } = require('purgecss');

module.exports = function (eleventyConfig, options = {}) {
	if (!options.placeholder) {
		throw new Error('The `options` argument expects a `placeholder` property (string) to enable find and replace in the HTML document.');
	}
	if (!options.pathToCss) {
		throw new Error('The `options` argument expects a `pathToCss` property (string or string[]) to pass in CSS.');
	}

	// Default values
	options = Object.assign(
		{
			keyframes: true,
			safelist: [],
			dynamicAttributes: [],
			getPageSafelist: () => [],
		},
		options
	);

	if (!Array.isArray(options.pathToCss)) {
		options.pathToCss = [options.pathToCss];
	}
	const { pathToCss, placeholder, keyframes, getPageSafelist, dynamicAttributes } = options;

	/** Inline only the necessary CSS based on the page content and outputPath, if provided */
	eleventyConfig.addTransform('purge-and-inline-css', async (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		const safelist = options.safelist.concat(getPageSafelist(outputPath) || []);
		const purgeCSSResults = await new PurgeCSS().purge({
			content: [{ raw: content }],
			css: pathToCss,
			keyframes, // Removes unused keyframes
			safelist,
			dynamicAttributes,
		});

		return content.replace(placeholder, purgeCSSResults[0].css || '');
	});
};
