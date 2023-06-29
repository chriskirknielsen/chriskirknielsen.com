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
	resultsEl.innerHTML = `<li class="u-color-grey-med">Loading…</li>`; // Reset
	const query = inputEl.value.toLowerCase().trim();
	if (query.length <= 0) return;
	const match = new RegExp(`${query}`, 'gi');
	let resultsMarkup = '';
	let data = await getDatabase();
	let result = data.filter((item) => match.test(item.title) || match.test(item.tags.join(' ')));
	if (result.length === 0) {
		resultsMarkup = `<li>No results found 😢</li>`;
	}
	result.sort((a, b) => {
		return new Date(b.date) - new Date(a.date);
	});
	result.forEach((page) => {
		const dateInIso = new Date(page.date).toISOString().split('T').shift();
		resultsMarkup += `
			<li>
				<time datetime="${dateInIso}" class="u-color-aux-med u-fontSize-smallest u-fontVariant-tabularNums">${dateInIso}</time>
				<a href="${page.url}" hreflang="${page.lang}">${page.title}</a>
				<span class="u-color-gray-med">(${page.lang})</span>
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
