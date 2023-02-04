module.exports = {
	layout: 'layouts/project.njk',
	tags: ['projects'],
	language: 'en',
	eleventyComputed: {
		permalink: 'projects/{{ (slug or page.fileSlug) | slug }}/index.html',
		customMetaImage: '{{ page.url | removeTrailingSlash }}/{{ customMetaImage }}',
	},
};
