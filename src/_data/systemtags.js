const locales = Object.keys(require('./metadata.js').locales);
locales.push('all'); // We also want to filter out collections for all languages
const systemtags = ['all', 'post', 'page', 'designs', 'fonts', 'projects'];
for (let lang of locales) {
	systemtags.push(`page_${lang}`);
	systemtags.push(`post_${lang}`);
}
module.exports = systemtags;
