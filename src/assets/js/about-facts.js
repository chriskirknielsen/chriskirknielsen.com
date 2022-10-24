(function () {
	// The order of the facts is randomised on page load, but then each button click ensures a sequential fact so you can see them all if you really want without repetition
	function shuffle(toShuffle) {
		for (let i = toShuffle.length - 1; i > 0; i -= 1) {
			const randomIndex = Math.floor(Math.random() * (i + 1));
			[toShuffle[i], toShuffle[randomIndex]] = [toShuffle[randomIndex], toShuffle[i]];
		}
		return toShuffle;
	}
	const facts = shuffle(Array.from(document.querySelectorAll('[data-facts] > li')).map((factEl) => `${factEl.getAttribute('data-fact-emoji')} ${factEl.textContent}`));

	const blockDetails = document.querySelector('.about-facts');
	const blockDiv = Object.assign(document.createElement('div'), { className: blockDetails.className });

	const ctaSummary = document.querySelector('.about-fact-get');
	const ctaButton = Object.assign(document.createElement('button'), { className: ctaSummary.className });
	ctaButton.style.setProperty('--btn-justify-content', ctaSummary.style.getPropertyValue('--btn-justify-content'));
	const ctaIcon = ctaSummary.querySelector('.about-facts-icon');
	const ctaText = document.createTextNode(ctaSummary.querySelector('[data-cta-text]').getAttribute('data-cta-text'));

	const factDisplayP = document.querySelector('.about-fact-show');
	const factDisplayEl = Object.assign(document.createElement('p'), { className: factDisplayP.className, hidden: true });

	ctaButton.appendChild(ctaIcon);
	ctaButton.appendChild(ctaText);
	blockDiv.appendChild(ctaButton);
	blockDiv.appendChild(factDisplayEl);

	blockDetails.replaceWith(blockDiv);

	let currentFactIndex = -1;

	function newFact() {
		const newFactIndex = (currentFactIndex + 1) % facts.length;

		if (factDisplayEl.hidden || currentFactIndex === -1) {
			factDisplayEl.hidden = false;
		}

		factDisplayEl.textContent = facts[newFactIndex];
		currentFactIndex = newFactIndex;
	}
	document.querySelector('.about-fact-get').addEventListener('click', newFact);
})();
