(function () {
	// Send back to a potential filtered view
	let backlinkEl = document.querySelector('[data-backlink][href="/designs/"]');
	let backlinkHash = sessionStorage.getItem('designHash') || null;
	if (document.referrer.replace(/\/$/, '') === backlinkEl.href.replace(/\/$/, '') && backlinkHash) {
		let backlinkTarget = new URL(backlinkEl.href);
		backlinkTarget.hash = backlinkHash;
		backlinkEl.href = backlinkTarget.href;
	}
})();
