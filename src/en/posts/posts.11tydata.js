module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post', 'post_en'],
	language: 'en',
	eleventyComputed: {
		date: function (data) {
			return data.date || data.page.date;
		},
		permalink: function (data) {
			return `blog/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
	},
};
