module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post', 'post_da'],
	language: 'da',
	eleventyComputed: {
		date: function (data) {
			return data.date || data.page.date;
		},
		permalink: function (data) {
			return `da/blog/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
	},
};
