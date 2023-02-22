module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter('keys', (obj) => Object.keys(obj));
	eleventyConfig.addFilter('values', (obj) => Object.values(obj));
};
