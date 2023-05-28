module.exports = {
	// ...require('../en.json'), // Import basic English data
	layout: 'layouts/project.njk',
	tags: ['projects'],
	eleventyComputed: {
		permalink: function (data) {
			return `projects/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
		customMetaImage: function (data) {
			return `${this.removeTrailingSlash(data.page.url)}/${data.customMetaImage}`;
		},
	},
};
