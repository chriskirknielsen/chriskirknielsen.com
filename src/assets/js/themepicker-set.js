// Included in head.njk, which also provides themeKeys and themeDefault
const themeStore = 'cknTheme';
window.setTheme = function (theme) {
	if (!themeKeys.includes(theme)) {
		return;
	}
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem(themeStore, theme);
	document.querySelectorAll('[data-theme-set]').forEach(function (btn) {
		btn.setAttribute('aria-pressed', (btn.getAttribute('data-theme-set') === theme).toString());
	});
};
window.getTheme = function () {
	let activeTheme = localStorage.getItem(themeStore);
	if (!themeKeys.includes(activeTheme)) {
		const mq = window.matchMedia('(prefers-color-scheme: dark)').matches;
		activeTheme = themeDefault[mq ? 'dark' : 'light'];
	}
	return activeTheme;
};
setTheme(getTheme());
