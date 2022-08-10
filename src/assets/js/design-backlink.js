(function () {
	// Send back to a potential filtered view
	let backlinkEl = document.querySelector('[data-backlink][href="/designs/"]');
	if (document.referrer.replace(/\/$/, '') === backlinkEl.href.replace(/\/$/, '')) {
		backlinkEl.addEventListener('click', function (e) {
			e.preventDefault();
			window.history.go(-1);
			// If there is an issue with history and nothing happens, go to the basic URL after a short while
			setTimeout(function () {
				window.location.href = backlinkEl.href;
			}, 300);
			return false;
		});
	}
})();
