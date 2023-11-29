class SearchData {
	data() {
		return {
			permalink: '/search.json',
			layout: false,
			eleventyExcludeFromCollections: true,
		};
	}

	async render(data) {
		const acceptedTags = ['_posts', '_fonts', '_designs', '_projects', '_pages']; // _pages must be last!
		let searchData = data.collections.all
			.filter((content) => {
				return acceptedTags.some((tag) => content.data.tags.includes(tag));
			})
			.map((content) => {
				// If the item is a page but is more specific (Design, Font, Project…), grab the tag that doesn't match _pages first, and if that fails, find the tag for _pages
				const itemType = content.data.tags.find((t) => acceptedTags.slice(0, -1).includes(t)) || acceptedTags.at(-1);
				return {
					type: itemType,
					title: content.data?.pageTitle || content.data.title,
					summary: content.data.summary || '',
					date: content.data?.date || content.page?.date || content.date,
					lang: content.page.lang,
					slug: content.page?.slug || content.fileSlug,
					url: content.url,
					tags: (content.page?.tags || content.data?.tags || []).map((t) => (t === 'javascript' ? 'js' : t)).filter((t) => !t.startsWith('_')), // Alias JS tags
				};
			})
			.sort((a, b) => {
				return new Date(b.date) - new Date(a.date);
			});

		return JSON.stringify(searchData);
	}
}

module.exports = SearchData;
