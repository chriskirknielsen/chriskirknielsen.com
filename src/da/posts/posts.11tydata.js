module.exports = {
	layout: 'layouts/post.njk',
	tags: ['_posts', '_posts_da'],
	language: 'da',
	eleventyComputed: {
		date: function (data) {
			return data.date || data.page.date;
		},
		year: function (data) {
			return new Date(data.date || data.page.date).getFullYear();
		},
		permalink: function (data) {
			return `da/blog/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
	},
};
