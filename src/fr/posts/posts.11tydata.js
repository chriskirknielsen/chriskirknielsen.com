module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post', 'post_fr'],
	language: 'fr',
	eleventyComputed: {
		date: function (data) {
			return data.date || data.page.date;
		},
		permalink: function (data) {
			return `fr/blog/${this.slug(data.slug || data.page.fileSlug)}/index.html`;
		},
	},
};
