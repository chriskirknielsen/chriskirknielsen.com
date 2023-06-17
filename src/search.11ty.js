class SearchData {
	data() {
		return {
			permalink: '/search.json',
			layout: false,
			eleventyExcludeFromCollections: true,
		};
	}

	async render(data) {
		let searchData = data.collections.all
			.filter((content) => {
				return content.data.tags.includes('post');
			})
			.map((content) => {
				return {
					title: content.data?.pageTitle || content.data.title,
					date: content.page?.date || content.date,
					lang: content.page.lang,
					slug: content.page?.slug || content.fileSlug,
					url: content.url,
					tags: content.data.tags.filter((t) => !t.startsWith('post')),
				};
			});

		return JSON.stringify(searchData);
	}
}

module.exports = SearchData;
