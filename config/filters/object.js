module.exports = function (eleventyConfig) {
	/** Runs Object.keys() on an object. */
	eleventyConfig.addFilter('keys', (obj) => Object.keys(obj));

	/** Runs Object.values() on an object. */
	eleventyConfig.addFilter('values', (obj) => Object.values(obj));
};
