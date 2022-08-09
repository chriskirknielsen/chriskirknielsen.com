const locales = Object.keys(require('./metadata.js').locales);
locales.push('all');
const systemTags = ['post', 'page', 'designs', 'fonts'];
for (let locale of locales) {
	systemTags.push(`pages_${locale}`);
	systemTags.push(`posts_${locale}`);
}
module.exports = systemTags;
