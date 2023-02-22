module.exports = function (eleventyConfig) {
	eleventyConfig.addShortcode('codepen', function (url, tabs = 'result', height = '480', theme = '') {
		const path = new URL(url).pathname;
		const id = path.split('/')[3];
		let markup = `<p class="codepen" data-height="${height}" data-theme-id="${theme}" data-default-tab="${tabs}" data-slug-hash="${id}">
			<a href="${url}" class="button">See the Pen</a>
		</p>`;

		// Only inject the CodePen embed once per page
		if (!this.page.hasOwnProperty('__codepen_embed_script_injected__')) {
			markup += `<script async src="https://static.codepen.io/assets/embed/ei.js"></script>`;
			this.page.__codepen_embed_script_injected__ = true;
		}

		return markup;
	});
};
