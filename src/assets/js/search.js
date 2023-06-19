// https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
const formEl = document.getElementById('searchform');
const inputEl = document.getElementById('q');
const resultsEl = document.getElementById('results');

let database = null;
async function getDatabase() {
	if (database !== null) {
		return database;
	}

	return await fetch('/search.json')
		.then((response) => response.json())
		.then((data_server) => {
			database = data_server;
			return data_server;
		});
}

// Based on https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
const runQuery = async () => {
	resultsEl.innerHTML = `<li class="postlist-post">Loading…</li>`; // Reset
	const query = inputEl.value.toLowerCase().trim();
	if (query.length <= 0) return;
	const match = new RegExp(`${query}`, 'gi');
	let resultsMarkup = '';
	let data = await getDatabase();
	let result = data.filter((item) => match.test(item.title) || match.test(item.tags.join(' ')));
	if (result.length === 0) {
		resultsMarkup = `<li class="postlist-post">No results found 😢</li>`;
	}
	result.sort((a, b) => {
		return new Date(b.date) - new Date(a.date);
	});
	result.forEach((page) => {
		resultsMarkup += `
			<li class="postlist-post">
				<h3 class="h4">
					<a href="${page.url}" class="heading-link" hreflang="${page.lang}">${page.title}</a>
				</h3>
			</li>
		`;
	});
	setTimeout(() => {
		resultsEl.innerHTML = resultsMarkup;
	}, 100); // Fake a loading period
};

formEl.addEventListener('submit', function (e) {
	e.preventDefault();

	runQuery();

	return false;
});
