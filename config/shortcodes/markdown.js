module.exports = function (eleventyConfig, options = {}) {
	if (!options || !options.hasOwnProperty('md')) {
		throw new Error('The `options` argument expects a `md` property to use as a Markdown renderer.');
	}
	const md = options.md;

	/** Removes all whitespace characters that can trigger Markdown to attempt to parse into a single space, ensuring existing markup stays untouched. */
	eleventyConfig.addPairedShortcode('mdsafe', (content) => content.replace(/(\t|\n|\r|(    ))/g, ' '));

	/** Converts a Markdown string into markup. */
	eleventyConfig.addPairedShortcode('markdown', (content, inline = null) => (inline ? md.renderInline(content) : md.render(content)));
};
