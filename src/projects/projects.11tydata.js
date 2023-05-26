module.exports = {
	layout: 'layouts/project.njk',
	tags: ['projects'],
	language: 'en',
	lang: 'en',
	eleventyComputed: {
		permalink: function (data) {
			return `projects/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
		customMetaImage: function (data) {
			return `${this.removeTrailingSlash(data.page.url)}/${data.customMetaImage}`;
		},
	},
};
