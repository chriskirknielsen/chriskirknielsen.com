const { DateTime } = require('luxon');

module.exports = function (eleventyConfig, options = {}) {
	// Like the EleventyI18nPlugin, don't assume English as the default and explicitly require a language.
	if (!options.defaultLanguage) {
		throw new Error('The `options` argument expects a `defaultLanguage` property to use for fallback behaviour.');
	}

	const { defaultLanguage } = options;

	eleventyConfig.addFilter('dateFormat', (date, opts = {}) => {
		const format = opts.format || 'machine';
		const locale = opts.locale || defaultLanguage;
		const dateObj = new Date(date);
		const utcDate = DateTime.fromJSDate(dateObj).toUTC();

		switch (format) {
			case 'obj': {
				return new Date(utcDate.toISO());
			}
			case 'rfc2822': {
				return utcDate.toRFC2822();
			}
			case 'iso': {
				return utcDate.toISO();
			}
			case 'year': {
				return utcDate.toFormat('yyyy');
			}
			case 'machine': {
				return utcDate.toFormat('yyyy-MM-dd');
			}
			case 'nice': {
				// In French, you usually say "1st" instead of "1" for the first of the month, but the rest of the days can be said as "13 October 1984", no ordinal needed
				if (locale === 'fr' && parseInt(utcDate.toFormat('d'), 10) === 1) {
					return `1er ${utcDate.toFormat('LLLL yyyy')}`;
				}
				return utcDate.setLocale(locale).toFormat('d LLLL yyyy');
			}
		}
	});
};
