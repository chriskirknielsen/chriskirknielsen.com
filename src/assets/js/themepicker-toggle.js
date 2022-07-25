(function () {
	window.setTheme(window.getTheme());
	function toggleThemePickerMenu(force = null) {
		const htmlEl = document.documentElement;
		const pickerEl = document.querySelector('.themepicker');
		const pickerAttr = 'data-themepicker';
		const isOpen = htmlEl.getAttribute(pickerAttr) === 'open';
		const newStatus = force !== null ? JSON.parse(force) : !isOpen;
		htmlEl.setAttribute(pickerAttr, newStatus ? 'open' : 'closed');
		pickerEl.setAttribute('aria-expanded', newStatus.toString());
	}
	document.addEventListener('click', function (e) {
		const setter = e.target.closest('[data-theme-set]');
		if (setter) {
			window.setTheme(setter.getAttribute('data-theme-set'));
			return;
		}

		const toggler = e.target.closest('[data-themepicker-toggler]');
		if (toggler) {
			const force = toggler.getAttribute('data-themepicker-toggler') || null;
			toggleThemePickerMenu(force);
		}
	});
	document.addEventListener('keypress', function (e) {
		if (e.altKey || e.metaKey || e.ctrlKey || e.shiftKey) {
			return;
		}
		if (e.key.toLowerCase() !== 'm') {
			return;
		}
		toggleThemePickerMenu();
	});
})();
