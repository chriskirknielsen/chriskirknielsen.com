class FollowFeed {
	data() {
		return {
			permalink: '/follow.rss',
			layout: false,
			eleventyExcludeFromCollections: true,
		};
	}

	async render() {
		const metadata = require('./_data/metadata.js');
		const { ActivityFeed } = await import('@11ty/eleventy-activity-feed');

		let feed = new ActivityFeed();

		feed.setCacheDuration('4h');

		feed.addSource('atom', 'Blog', `${metadata.url}/rss.xml`);
		feed.addSource('atom', 'Designs', `${metadata.url}/designs.xml`);
		feed.addSource('rss', 'Mastodon', `https://${metadata.author.mastodonInstance}/users/${metadata.author.mastodon}.rss`);
		feed.addSource('twitterUser', 'Twitter', 'ckirknielsen', '974614220124942337');

		return feed.toRssFeed({
			title: `${metadata.author.name}'s Activity Feed`,
			language: 'en',
			url: `${metadata.url}/follow/`,
			subtitle: 'One Feed to rule them all, and in the web, bind them.',
		});
	}
}

module.exports = FollowFeed;
