module.exports = function (eleventyConfig) {
	/** Removes any slash at the end of a string. */
	eleventyConfig.addFilter('removeTrailingSlash', (str) => str.trim().replace(/\/$/g, ''));

	/** Removes any hyphenation-related character. */
	eleventyConfig.addFilter('stripHyphenChars', (str) => str.replace(/(&shy;|<wbr>)/gm, ''));

	/** Removes script tags (potentially unsafe). */
	//? Not 100% reliable, however I don't usually add `</script>` inside a script tag so it should be safe!
	eleventyConfig.addFilter('stripScripts', (str) => str.replace(/(<script( [^>]+)?>(.+)<\/script>)/gim, ''));
};
