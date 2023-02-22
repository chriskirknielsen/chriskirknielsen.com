module.exports = function (eleventyConfig, options = {}) {
	if (!options || !options.hasOwnProperty('md')) {
		throw new Error('The callout shortcode requires a Markdown rendered passed as `options.md`.');
	}

	options = Object.assign({ dictionaries: { en: { callout: 'Note' } } }, options);
	const dictionaries = options.dictionaries;
	const md = options.md;

	eleventyConfig.addPairedShortcode('callout', function (content, pseudo = '', emoji = '') {
		const uniqueId = `co-${new Date().getTime().toString(36)}`;
		const context = this?.ctx || this.context?.environments;
		const lang = context.lang || defaultLang;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		pseudo ||= dictionaries[lang].callout;

		return `<div class="callout" aria-labelledby="${uniqueId}">
			<p id="${uniqueId}" class="h3 | callout-label" ${emojiStyleAttr}>${pseudo}</p>
			<p>${md.renderInline(content.trim())}</p>
		</div>`;
	});
};
