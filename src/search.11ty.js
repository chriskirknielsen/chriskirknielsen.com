class SearchData {
	data() {
		return {
			permalink: '/search.json',
			layout: false,
			eleventyExcludeFromCollections: true,
		};
	}

	async render(data) {
		let acceptedTags = ['_posts', '_fonts', '_designs', '_projects'];
		let searchData = data.collections.all
			.filter((content) => {
				return acceptedTags.some((tag) => content.data.tags.includes(tag));
			})
			.map((content) => {
				return {
					type: content.data.tags.find((t) => acceptedTags.includes(t)),
					title: content.data?.pageTitle || content.data.title,
					summary: content.data.summary || '',
					date: content.data?.date || content.page?.date || content.date,
					lang: content.page.lang,
					slug: content.page?.slug || content.fileSlug,
					url: content.url,
					tags: (content.page?.tags || content.data?.tags || []).filter((t) => !t.startsWith('_')),
				};
			})
			.sort((a, b) => {
				return new Date(b.date) - new Date(a.date);
			});

		return JSON.stringify(searchData);
	}
}

module.exports = SearchData;
