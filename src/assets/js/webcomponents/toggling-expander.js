class TogglingExpander extends HTMLElement {
	connectedCallback() {
		// Helper to filthily create an element with assigned properties
		function spawn(type, properties) {
			return Object.assign(document.createElement(type), properties);
		}
		// The order of the items is randomised on page load, but then each button click ensures a sequential item so you can see them all if you really want without repetition
		function shuffle(toShuffle) {
			for (let i = toShuffle.length - 1; i > 0; i -= 1) {
				const randomIndex = Math.floor(Math.random() * (i + 1));
				[toShuffle[i], toShuffle[randomIndex]] = [toShuffle[randomIndex], toShuffle[i]];
			}
			return toShuffle;
		}

		// Randomise the list after grabbing each item and extracting the contents into an HTML string
		const itemsList = shuffle(
			Array.from(this.querySelectorAll('[data-expander="content-items"] > li')).map(
				(itemEl) => `<span aria-hidden="true">${itemEl.getAttribute('data-item-emoji')}</span> ${itemEl.textContent}`
			)
		);

		// Find the fallback details block and create its equivalent div (yuck, I know!)
		const blockDetails = this.querySelector('[data-expander="wrapper"]');
		const blockDiv = spawn('div', { className: blockDetails.className });

		// Capture the contents of the trigger and create a replica as a button
		const ctaSummary = this.querySelector('[data-expander="trigger"]');
		const ctaChildren = Array.from(ctaSummary.children);
		const ctaButton = spawn('button', { className: ctaSummary.className });
		ctaButton.style.setProperty('--btn-justify-content', ctaSummary.style.getPropertyValue('--btn-justify-content'));

		// Find the fallbck
		const contentWrap = this.querySelector('[data-expander="content"]');
		const outputContainer = spawn('p', { className: contentWrap.className, hidden: true });

		// Populate the newly created elements
		if (ctaChildren.length > 0) {
			ctaButton.append(...ctaChildren); // Move the contents of the original trigger into the new button
		} else {
			ctaButton.innerText = ctaSummary.innerText; // Copy the text node
		}
		blockDiv.appendChild(ctaButton);
		blockDiv.appendChild(outputContainer);

		// Replace the fallback with the interactive version
		blockDetails.replaceWith(blockDiv);

		// Keep track of which item is currently displayed
		let currentItemIndex = -1;

		ctaButton.addEventListener('click', () => {
			const newItemIndex = (currentItemIndex + 1) % itemsList.length;

			if (outputContainer.hidden || currentItemIndex === -1) {
				outputContainer.hidden = false;
				blockDiv.setAttribute('data-open', 'true');
			}

			outputContainer.innerHTML = itemsList[newItemIndex];
			currentItemIndex = newItemIndex; // Using modulo above, we cycle between all values and fall back to zero, so users can't click a bazillion times and exceed the MAX_INTEGER value
		});
	}
}

customElements.define('toggling-expander', TogglingExpander);
