(function () {
	window.setTheme(window.getTheme());
	function toggleThemePickerMenu(force = null) {
		const htmlEl = document.documentElement;
		const pickerEl = document.querySelector('.themepicker');
		const pickerAttr = 'data-themepicker';
		const prevIsOpenStatus = htmlEl.getAttribute(pickerAttr) === 'open';
		const newIsOpenStatus = force !== null ? JSON.parse(force) : !prevIsOpenStatus;
		htmlEl.setAttribute(pickerAttr, newIsOpenStatus ? 'open' : 'closed');
		pickerEl.setAttribute('aria-expanded', newIsOpenStatus.toString());
		pickerEl.inert = !newIsOpenStatus;
		return newIsOpenStatus;
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
		// Scroll to top if opening the picker
		const newStatus = toggleThemePickerMenu();
		if (newStatus) {
			document.body.scrollIntoView({ block: 'start', behavior: 'smooth' });
		}
	});
})();
