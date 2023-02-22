module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post', 'post_en'],
	language: 'en',
	eleventyComputed: {
		date: '{{ date or page.date }}',
		permalink: 'blog/{{ (slug or page.fileSlug) | slug }}/index.html',
	},
};
