/**
 * Quickly hash a string in an unsecure way.
 * @link https://gist.github.com/hyamamoto/fd435505d29ebfa3d9716fd2be8d42f0?permalink_comment_id=2694461#gistcomment-2694461
 * @param {string} s String to hash.
 * @returns {string} Hashed string.
 */
function quickHash(s) {
	// Using var allows the h variable to be read outside the for loop
	for (var i = 0, h = 0; i < s.length; i++) {
		h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
	}

	return Math.abs(h).toString(16); // Absolutely unnecessary, purely aesthetic, h would suffice, but the hash look more like a proper hash as a hex…
}

module.exports = function (eleventyConfig, options = {}) {
	if (typeof options.svgAssetFolder !== 'string') {
		throw new Error('The `options` argument expects a `svgAssetFolder` property to use as a folder path for the `svg` shortcode.');
	}
	if (typeof options.componentsFolder !== 'string') {
		throw new Error('The `options` argument expects a `componentsFolder` property to use as a folder path for the `component` shortcode.');
	}

	const { svgAssetFolder, componentsFolder, cacheSvg } = options;
	const svgCache = {}; // If caching is enabled, this object will be used to store recurring SVGs

	/** Render an SVG from the SVG assets folder. */
	eleventyConfig.addAsyncShortcode('svg', async function (filename, svgOptions = {}) {
		const cacheKey = filename + '_' + quickHash(JSON.stringify(svgOptions));

		if (cacheSvg && svgCache.hasOwnProperty(cacheKey)) {
			return await Promise.resolve(svgCache[cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
		}

		const isNjk = svgOptions.hasOwnProperty('isNjk') ? svgOptions.isNjk : true;
		if (!svgOptions.hasOwnProperty('title') && !svgOptions.hasOwnProperty('ariaLabel')) {
			svgOptions.ariaHidden = true; // Ensure SVGs are hidden from the a11y tree if no title or label is provided
		}
		const filePath = `${svgAssetFolder}/${filename}.svg${isNjk ? '.njk' : ''}`;
		const engine = svgOptions.hasOwnProperty('engine') ? svgOptions.engine : isNjk ? 'njk' : 'html'; // HTML for vanilla SVG
		const content = eleventyConfig.nunjucksAsyncShortcodes.renderFile(filePath, svgOptions, engine);
		if (cacheSvg) {
			svgCache[cacheKey] = content;
		}
		return await content;
	});

	/** Render a component from the component folder. */
	eleventyConfig.addAsyncShortcode('component', async function (filename, componentOptions = {}) {
		const filePath = `${componentsFolder}/${filename}.njk`;
		const content = eleventyConfig.nunjucksAsyncShortcodes.renderFile(filePath, componentOptions, 'njk');
		return await content;
	});
};
