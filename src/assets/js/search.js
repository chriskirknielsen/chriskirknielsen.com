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

	return fetch('/search.json')
		.then((response) => response.json())
		.then((data_server) => {
			database = data_server;
			return data_server;
		});
}
const normalizeApostrophe = (str) => str.replace(/(‘|’)/, "'");

// Based on https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
const runQuery = async () => {
	const query = normalizeApostrophe(inputEl.value.toLowerCase().trim());
	if (query.length <= 0) {
		return;
	}

	formEl.setAttribute('data-state', 'changed');
	resultHeadingEl.hidden = false;
	resultsEl.innerHTML = `<li>Loading…</li>`;

	let data = await getDatabase();
	let result = data.filter(
		(item) =>
			normalizeApostrophe(item.title.toLowerCase()).includes(query) ||
			normalizeApostrophe(item.summary.toLowerCase()).includes(query) ||
			normalizeApostrophe(item.tags.join(' ').toLowerCase()).includes(query)
	);

	setTimeout(() => {
		if (result.length === 0) {
			resultCountEl.innerText = `(0)`;
			resultsEl.innerHTML = `<li>No results found 😢</li>`;
			return;
		}

		const resultsFragment = new DocumentFragment();
		resultsEl.innerHTML = '';

		result.forEach((page) => {
			const type = page.type;
			const tpl = resultItemTemplate.content.cloneNode(true);
			const typeEl = tpl.querySelector('[data-page-type]');
			const dateEl = tpl.querySelector('time[datetime]');
			const anchorEl = tpl.querySelector('a[href]');
			const langEl = tpl.querySelector('[data-lang-code]');

			const dateInIso = new Date(page.date).toISOString().split('T').shift();
			let typePretty = '';
			switch (type) {
				case '_fonts':
					typePretty = 'Typeface';
					break;
				case '_designs':
					typePretty = 'Design';
					break;
				case '_projects':
					typePretty = 'Project';
					break;
				case '_posts':
				default:
					typePretty = 'Blogpost';
					break;
			}

			typeEl.innerText = `${typePretty} |`;
			anchorEl.setAttribute('href', page.url);
			anchorEl.setAttribute('hreflang', page.lang);
			anchorEl.innerHTML = page.title;

			if (type === '_posts') {
				dateEl.setAttribute('datetime', dateInIso);
				dateEl.innerText = dateInIso;

				langEl.innerText = `(${page.lang})`;
			} else {
				dateEl.hidden = true;
				langEl.hidden = true;
			}

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
