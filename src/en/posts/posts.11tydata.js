module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post'],
	language: 'en',
	eleventyComputed: {
		date: '{{ date or page.date }}',
		permalink: 'blog/{{ (slug or page.fileSlug) | slug }}/index.html',
	},
};
