module.exports = function (eleventyConfig, options = {}) {
	// Like the EleventyI18nPlugin, don't assume English as the default and explicitly require a language.
	if (!options.defaultLanguage || typeof options.defaultLanguage !== 'string') {
		throw new Error('The `options` argument expects a `defaultLanguage` property to use for fallback behaviour.');
	}

	if (!options || !options.hasOwnProperty('markdownEngine')) {
		throw new Error('The `options` argument expects a `markdownEngine` property to use as a Markdown renderer.');
	}

	options = Object.assign({ labelByLang: { en: 'Note' } }, options);
	const { labelByLang, markdownEngine, defaultLanguage } = options;

	eleventyConfig.addPairedShortcode('callout', function (content, pseudo = '', emoji = '', isInline = true) {
		const uniqueId = `co-${parseInt(String(Math.random()).split('.')[1], 10).toString(36)}`;
		const context = this?.ctx || this.context?.environments;
		const lang = context.lang || defaultLanguage;
		const emojiStyleAttr = emoji ? `style="--callout-emoji: '${emoji}'"` : '';
		pseudo ||= labelByLang[lang];
		let render = isInline ? `<p>${markdownEngine.renderInline(content.trim())}</p>` : markdownEngine.render(content.trim());

		// Little dirty trick to avoid additional whitespace
		return ''.concat(
			`<div class="callout | content-wide" aria-labelledby="${uniqueId}">`,
			`<p id="${uniqueId}" class="h3 | callout-label" ${emojiStyleAttr}>${pseudo}</p>`,
			render.trim(),
			`</div>`
		);
	});
};
