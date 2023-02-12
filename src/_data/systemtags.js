const locales = Object.keys(require('./metadata.js').locales);
locales.push('all'); // We also want to filter out collections for all languages
const systemtags = ['all', 'post', 'page', 'designs', 'fonts', 'projects'];
for (let locale of locales) {
	systemtags.push(`page_${locale}`);
	systemtags.push(`post_${locale}`);
}
module.exports = systemtags;
