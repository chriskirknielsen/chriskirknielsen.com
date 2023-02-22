module.exports = {
	layout: 'layouts/post.njk',
	tags: ['post', 'post_fr'],
	language: 'fr',
	eleventyComputed: {
		date: '{{ date or page.date }}',
		permalink: 'fr/blog/{{ (slug or page.fileSlug) | slug }}/index.html',
	},
};
