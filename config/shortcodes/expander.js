module.exports = function (eleventyConfig, options = {}) {
	eleventyConfig.addPairedShortcode('expander', function (content, title = 'Expand', showArrow = true) {
		return `<details class="expander">
<summary class="cta expander-cta | u-width100" style="--btn-justify-content:center">${
			showArrow ? `<span class="expander-cta--arrow" aria-hidden="true"></span> ` : ''
		}${title}</summary>
<div class="expander-content | flow">
${content}
</div>
</details>`;
	});
};
