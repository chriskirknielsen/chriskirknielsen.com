function normalizeApostrophe(str) {
	return str.replace(/(‘|’)/, "'");
}
function getTypeLabel(type) {
	switch (type) {
		case '*':
			return 'All';
		case '_fonts':
			return 'Typeface';
		case '_designs':
			return 'Design';
		case '_projects':
			return 'Project';
		case '_pages':
			return 'Page';
		case '_posts':
		default:
			return 'Blogpost';
	}
}

class InstantSearch extends HTMLElement {
	hasRunOnce = false;

	connectedCallback() {
		const searchInputId = this.getAttribute('search-input');
		// https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
		const formEl = this.querySelector('form');
		const inputEl = this.querySelector(`[name="${searchInputId}"]`);
		const resultsEl = this.querySelector('[data-results-list]');
		const resultItemTemplate = this.querySelector('template');
		const resultCountEl = this.querySelector('[data-results-count]');
		const resultFilterEl = this.querySelector('[data-results-filter]');

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

		// Based on https://daily-dev-tips.com/posts/eleventy-creating-a-static-javascript-search/
		const runQuery = async () => {
			let query = normalizeApostrophe(inputEl.value.toLowerCase().trim());
			if (query.length < 1) {
				return;
			}

			// Alias some search terms
			switch (query) {
				case '11ty':
					query = 'eleventy';
					break;
				case 'javascript':
					query = 'js';
					break;
			}

			// First time?
			if (!this.hasRunOnce) {
				this.firstRunCallback();
			}

			resultsEl.innerHTML = `<li>Loading…</li>`; // Instant feedback: search is running
			resultFilterEl.innerHTML = '<option value="*">All</option>'; // Reset after every search

			let data = await getDatabase();
			let result = data.filter(
				(item) =>
					normalizeApostrophe(item.title.toLowerCase()).includes(query) ||
					normalizeApostrophe(item.summary.toLowerCase()).includes(query) ||
					normalizeApostrophe(item.tags.join(' ').toLowerCase()).includes(query)
			);

			setTimeout(() => {
				resultFilterEl.disabled = result.length === 0;

				if (result.length === 0) {
					resultCountEl.innerText = `(0)`;
					resultsEl.innerHTML = `<li>No results found 😢</li>`;
					return;
				}

				const resultsFragment = new DocumentFragment();
				resultsEl.innerHTML = '';
				let resultsTypes = new Set();

				result.forEach((page) => {
					const type = page.type;
					const tpl = resultItemTemplate.content.cloneNode(true);
					const listItemEl = tpl.querySelector('[data-result-type]');
					const typeEl = tpl.querySelector('[data-result-slot="type"]');
					const resultInfoEl = tpl.querySelector('[data-result-slot="info"]');
					const dateEl = tpl.querySelector('time[datetime]');
					const anchorEl = tpl.querySelector('a[href]');
					const langEl = tpl.querySelector('[data-result-slot="lang"]');

					const dateInIso = new Date(page.date).toISOString().split('T').shift();
					const typePretty = getTypeLabel(type);
					resultsTypes.add(type);

					listItemEl.setAttribute('data-result-type', type);
					typeEl.innerText = `${typePretty}`;
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

				const availableTypes = Array.from(resultsTypes).sort();
				availableTypes.forEach((type) => {
					const opt = Object.assign(document.createElement('option'), { value: type, innerText: getTypeLabel(type) });
					resultFilterEl.appendChild(opt);
				});
			}, 100); // Fake a loading period
		};

		formEl.addEventListener('submit', function (e) {
			e.preventDefault();

			runQuery();

			return false;
		});

		resultFilterEl.addEventListener('change', function (e) {
			const selection = resultFilterEl.value || '*';
			Array.from(resultsEl.querySelectorAll('[data-result-type]')).forEach((result) => {
				result.hidden = selection !== '*' && result.getAttribute('data-result-type') !== selection;
			});
		});
	}

	firstRunCallback() {
		Array.from(this.querySelectorAll('[data-show-on-first-run]')).forEach((el) => {
			el.hidden = false;
		});

		this.hasRunOnce = true;
	}
}

customElements.define('instant-search', InstantSearch);
