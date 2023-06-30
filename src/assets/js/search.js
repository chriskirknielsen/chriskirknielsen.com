// https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
const formEl = document.getElementById('searchform');
const inputEl = document.getElementById('q');
const resultsEl = document.getElementById('results');
const resultItemTemplate = document.getElementById('search-result-item');
const resultHeadingEl = document.getElementById('search-results-heading');
const resultCountEl = document.getElementById('search-results-count');

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
	const query = inputEl.value.toLowerCase().trim();
	if (query.length <= 0) {
		return;
	}

	formEl.setAttribute('data-state', 'changed');
	resultsEl.innerHTML = `<li>Loading…</li>`;

	let data = await getDatabase();
	let result = data.filter((item) => item.title.toLowerCase().includes(query) || item.tags.join(' ').toLowerCase().includes(query));

	setTimeout(() => {
		if (result.length === 0) {
			resultsEl.innerHTML = `<li>No results found 😢</li>`;
			return;
		}

		const resultsFragment = new DocumentFragment();
		resultsEl.innerHTML = '';

		result.sort((a, b) => {
			return new Date(b.date) - new Date(a.date);
		});
		result.forEach((page) => {
			const tpl = resultItemTemplate.content.cloneNode(true);
			const dateEl = tpl.querySelector('time[datetime]');
			const anchorEl = tpl.querySelector('a[href]');
			const langEl = tpl.querySelector('[data-lang-code]');

			const dateInIso = new Date(page.date).toISOString().split('T').shift();

			dateEl.setAttribute('datetime', dateInIso);
			dateEl.innerText = dateInIso;

			anchorEl.setAttribute('href', page.url);
			anchorEl.setAttribute('hreflang', page.lang);
			anchorEl.innerText = page.title;

			langEl.innerText = `(${page.lang})`;

			resultsFragment.append(tpl);
		});
		resultCountEl.innerText = `(${result.length})`;
		resultsEl.append(resultsFragment);
	}, 100); // Fake a loading period
};

formEl.addEventListener('submit', function (e) {
	e.preventDefault();

	runQuery();

	return false;
});
