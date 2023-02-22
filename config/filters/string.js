module.exports = function (eleventyConfig) {
	eleventyConfig.addFilter('removeTrailingSlash', (str) => str.trim().replace(/\/$/g, ''));
	eleventyConfig.addFilter('stripHyphenChars', (str) => str.replace(/(&shy;|<wbr>)/gm, ''));
	eleventyConfig.addFilter('stripScripts', (str) => str.replace(/(<script( [^>]+)?>(.+)<\/script>)/gim, '')); // Not 100% reliable, however I don't usually add `</script>` inside a script tag so it should be safe!
};
