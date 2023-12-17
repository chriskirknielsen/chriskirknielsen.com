function filterTiles(context, inputName) {
	let hashIndicator = inputName + ':';
	let initialHash = window.location.hash.slice(1);
	let items = Array.from(context.querySelectorAll('[data-tags]'));
	let list = context.querySelector('[data-filtered-list]');

	function resetItem(item) {
		item.style.width = '';
		item.style.height = '';
		item.removeAttribute('data-first');
		item.removeAttribute('data-shown-from-to');
		item.getAnimations().forEach((anim) => anim.cancel());
	}

	function filterTo(filter, skipAnim = false) {
		let isShowAll = filter === '';
		let filterHash = filter ? '#' + hashIndicator + filter : './';
		let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

		history.replaceState(undefined, '', filterHash);
		sessionStorage.setItem('designHash', filterHash);

		// Don't animate in certain conditions
		if (skipAnim || prefersReducedMotion || !Element.prototype.animate) {
			// const visibleWidth = items.find((i) => i.getAttribute('aria-hidden') !== 'true').getBoundingClientRect().width;
			items.forEach(function (item) {
				let tags = item.getAttribute('data-tags').split(',');
				let wasShown = item.getAttribute('aria-hidden') === 'false';
				let isShown = tags.indexOf(filter) > -1 || isShowAll;

				item.hidden = true;
				let afterHidden = () => {
					item.setAttribute('aria-hidden', (!isShown).toString());
					item.hidden = false;
				};

				if (skipAnim || prefersReducedMotion) {
					// RAF avoids a flash of positioned blocks when there is a filter on page load
					requestAnimationFrame(afterHidden);
				} else {
					afterHidden();
				}
			});

			return; // No animation: stop here!
		}

		// Set up the FLIP (First-Last-Invert-Play) animation
		const animateOptions = {
			duration: 300,
			easing: getComputedStyle(items[0]).transitionTimingFunction || 'ease-in-out',
		};
		const listGeometry = list.getBoundingClientRect();
		const footerElement = document.querySelector('.footer');
		list.style.setProperty('--t', `${animateOptions.duration}ms`); // Sync up with CSS

		// First, capture the initial state
		items.forEach(function (item) {
			resetItem(item); // Reset if triggered mid-animation
			const tags = item.getAttribute('data-tags').split(',');
			const wasShown = item.getAttribute('aria-hidden') === 'false';
			const isShown = tags.indexOf(filter) > -1 || isShowAll;
			const first = item.getBoundingClientRect();
			item.setAttribute('data-first', JSON.stringify(first));
			item.setAttribute('data-shown-from-to', `${wasShown ? 1 : 0},${isShown ? 1 : 0}`);
		});
		const footerOffsetStart = footerElement.offsetTop;

		// Then apply the change so all objects can calculate their new geometry after the change (taking sibling position into account)
		items.forEach(function (item, i) {
			const shown = item
				.getAttribute('data-shown-from-to')
				.split(',')
				.map((i) => parseInt(i, 10));
			const isShown = shown[1] === 1;
			item.setAttribute('aria-hidden', (!isShown).toString());
		});
		const footerOffsetEnd = footerElement.offsetTop;

		// Finally, grab the new geometry for all items and apply animation
		items.forEach(function (item, i) {
			const shown = item
				.getAttribute('data-shown-from-to')
				.split(',')
				.map((i) => parseInt(i, 10));
			const wasShown = shown[0] === 1;
			const isShown = shown[1] === 1;
			const first = JSON.parse(item.getAttribute('data-first'));
			const last = item.getBoundingClientRect();
			const keyframeFrom = {};
			const keyframeTo = {};

			// Determine keyframes for each config
			if (wasShown && isShown) {
				// Move
				keyframeFrom.transform = `translate(${first.left - last.left}px, ${first.top - last.top}px)`;
				//keyframeFrom.width = `${first.width}px`;
				//keyframeFrom.height = `${first.height}px`;
				keyframeTo.transform = `translate(0, 0)`;
				//keyframeTo.width = `${last.width}px`;
				//keyframeTo.height = `${last.height}px`;
			} else if (wasShown && !isShown) {
				// Hide
				keyframeFrom.transform = `translate(${first.left - listGeometry.left}px, ${first.top - listGeometry.top}px) scale(1)`;
				keyframeFrom.opacity = '1';
				keyframeFrom.width = `${first.width}px`;
				keyframeFrom.height = `${first.height}px`;
				keyframeTo.transform = `translate(${first.left - listGeometry.left}px, ${first.top - listGeometry.top}px) scale(0)`;
				keyframeTo.opacity = '0';
				keyframeTo.width = `${first.width}px`;
				keyframeTo.height = `${first.height}px`;
			} else if (!wasShown && isShown) {
				// Reveal
				keyframeFrom.transform = `translate(${first.left - listGeometry.left}px, ${first.top - listGeometry.top}px) scale(0)`;
				keyframeFrom.opacity = '0';
				keyframeFrom.width = `${last.width}px`;
				keyframeFrom.height = `${last.height}px`;
				keyframeTo.transform = `translate(0, 0) scale(1)`;
				keyframeTo.opacity = '1';
				keyframeTo.width = `${last.width}px`;
				keyframeTo.height = `${last.height}px`;
			} else if (!wasShown && !isShown) {
				// Stay hidden
				keyframeFrom.transform = `scale(0)`;
				keyframeTo.transform = `scale(0)`;
			}

			const anim = item.animate([keyframeFrom, keyframeTo], animateOptions);
			anim.addEventListener('finish', (e) => resetItem(item));
		});
		const footerOffsetDelta = footerOffsetEnd - footerOffsetStart;
		footerElement.animate([{ transform: `translateY(${-1 * footerOffsetDelta}px)` }, { transform: 'translateY(0)' }], animateOptions);
	}

	if (initialHash.indexOf(hashIndicator) === 0) {
		let baseFilter = initialHash.slice(hashIndicator.length);
		let filterSelectBox = context.querySelector('#filter-' + (baseFilter || 'all'));
		if (!filterSelectBox) {
			baseFilter = '';
			filterSelectBox = context.querySelector('#filter-all');
		}
		filterSelectBox.checked = true;
		filterTo(baseFilter, true);
	}

	context.addEventListener('input', function (e) {
		let radio = e.target.closest(`[name="${inputName}"]`);
		if (!radio) {
			return;
		}
		let filter = radio.value;
		filterTo(filter);
	});
}

class FilteredTiles extends HTMLElement {
	connectedCallback() {
		if (!this.querySelector('[data-filtered-tiles-template]')) {
			throw new Error('A template must be provided to create the filter elements.');
		}
		if (!this.querySelector('[data-filtered-tiles-group]')) {
			throw new Error('A group for the items must be provided to enable filtering.');
		}

		// Manipulate the component contents to be easier to interact with
		const tilesGroup = this.querySelector('[data-filtered-tiles-group]');
		tilesGroup.setAttribute('data-filtered-list', '');
		Array.from(tilesGroup.children).forEach((c) => c.setAttribute('data-filtered-item', ''));

		// Grab all the relevant attributes
		const filters = this.getAttribute('filters')
			.split(',')
			.map((f) => f.trim().toLowerCase());
		const filterClass = this.getAttribute('filter-class') || '';
		const fieldsetLegend = this.getAttribute('filter-legend') || 'Filter';
		const filterAllLabel = this.getAttribute('filter-all-label') || 'All';
		const inputName = this.getAttribute('input-name') || 'filter';

		// Set up the fieldset
		const fieldset = Object.assign(document.createElement('fieldset'), { className: 'filtering' });
		if (filterClass) {
			fieldset.classList.add(filterClass);
		}

		// Set up the legend: once accessibly, and once for aesthetic reasons (not correctly stylable in all browsers)
		const legendAccessible = Object.assign(document.createElement('legend'), { className: 'visually-hidden', innerText: fieldsetLegend });
		const legendVisible = Object.assign(document.createElement('strong'), { ariaHidden: true, className: 'filtering-legend', innerText: fieldsetLegend });
		fieldset.appendChild(legendAccessible);
		fieldset.appendChild(legendVisible);

		// Set up each filter item in the provided list
		let template = this.querySelector('[data-filtered-tiles-template]');
		const createFilter = (slug, label = null, checked = false) => {
			const newItemElement = template.content.cloneNode(true);
			const newItemRadio = newItemElement.querySelector('input');
			const newItemLabel = newItemElement.querySelector('label');

			const checkboxId = `filter-${(label || slug).toLowerCase()}`;
			newItemRadio.id = checkboxId;
			newItemRadio.name = inputName;
			newItemRadio.value = slug || '';
			newItemRadio.checked = checked;
			newItemLabel.htmlFor = checkboxId;
			newItemLabel.innerText = label || slug;

			return newItemElement;
		};

		const filterItems = [createFilter('', filterAllLabel, true)].concat(filters.map((f) => createFilter(f)));
		filterItems.forEach((f) => fieldset.appendChild(f.firstChild));

		// Finally add the created element into the DOM
		this.insertBefore(fieldset, this.firstChild);

		// Once we have created the elements, run the logic to process filters
		filterTiles(this, inputName);
	}
}
customElements.define('filtered-tiles', FilteredTiles);
