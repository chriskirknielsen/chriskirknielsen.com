const themeStorage = 'cknTheme';
window.setTheme = function (theme) {
	if (!themeKeys.includes(theme)) {
		return;
	}
	document.documentElement.setAttribute('data-theme', theme);
	localStorage.setItem(themeStorage, theme);
};
let activeTheme = localStorage.getItem(themeStorage);
if (!themeKeys.includes(activeTheme)) {
	const mq = window.matchMedia('(prefers-color-scheme: dark)').matches;
	activeTheme = themeDefault[mq ? 'dark' : 'light'];
}
setTheme(activeTheme);
