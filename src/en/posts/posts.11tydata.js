module.exports = {
	layout: 'layouts/post.njk',
	tags: ['_posts', '_posts_en'],
	language: 'en',
	eleventyComputed: {
		date: function (data) {
			return data.date || data.page.date;
		},
		year: function (data) {
			return new Date(data.date || data.page.date).getFullYear();
		},
		permalink: function (data) {
			return `blog/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
	},
};
