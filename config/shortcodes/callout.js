module.exports = function (eleventyConfig, options = {}) {
	// Like the EleventyI18nPlugin, don't assume English as the default and explicitely require a language.
	if (!options.defaultLanguage || typeof options.defaultLanguage !== 'string') {
		throw new Error('A default language as a string is required for fallback behaviour as a `defaultLanguage` property on the `options` object.');
	}

	if (!options || !options.hasOwnProperty('md')) {
		throw new Error('The callout shortcode requires a Markdown renderer passed as `options.md`.');
	}

	options = Object.assign({ labelByLang: { en: 'Note' } }, options);
	const { labelByLang, md, defaultLanguage } = options;

	eleventyConfig.addPairedShortcode('callout', function (content, pseudo = '', emoji = '') {
		const uniqueId = `co-${new Date().getTime().toString(36)}`;
		const context = this?.ctx || this.context?.environments;
		const lang = context.lang || defaultLanguage;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		pseudo ||= labelByLang[lang];

		return `<div class="callout" aria-labelledby="${uniqueId}">
			<p id="${uniqueId}" class="h3 | callout-label" ${emojiStyleAttr}>${pseudo}</p>
			<p>${md.renderInline(content.trim())}</p>
		</div>`;
	});
};
