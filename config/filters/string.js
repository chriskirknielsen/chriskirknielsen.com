module.exports = function (eleventyConfig) {
	/** Removes any slash at the end of a string. */
	eleventyConfig.addFilter('removeTrailingSlash', (str) => str.trim().replace(/\/$/g, ''));

	/** Removes any hyphenation-related character. */
	eleventyConfig.addFilter('stripHyphenChars', (str) => str.replace(/(&shy;|<wbr>)/gm, ''));

	/** Converts line breaks to <br> elements. */
	eleventyConfig.addFilter('nl2br', (str) => str.replace(/\r|\n|\r\n/g, '<br>'));

	/** Splits a string by word or letter and wraps them in an element. */
	eleventyConfig.addFilter('textsplit', (str, type = 'word', wrap = 'span') => {
		const isWordSplit = ['word', 'both'].includes(type);
		const isLetterSplit = ['letter', 'both'].includes(type);
		let words = str.trim().replace(/(\n)+/g, '\n ').split(' ').filter(Boolean);
		let wordTracker = structuredClone(words);

		if (isLetterSplit) {
			words = words.map((w) => {
				let letters = w.split('');
				letters = letters.map((l) => (l === '\n' ? l : `<${wrap} data-letter>${l}</${wrap}>`)); // Don't wrap new lines
				return letters.join('');
			});
		}

		if (isWordSplit) {
			words = words.map((w, i) => {
				const wordLabel = isLetterSplit ? ' aria-label="' + wordTracker[i].trim() + '"' : '';
				const endsInNewline = w.length > 0 && w.match(/(\n)+$/g);

				return `<${wrap} data-word${wordLabel} style="--w:${i}">${w.trim()}</${wrap}>` + (endsInNewline ? `\n` : ''); // Don't wrap newlines into the word
			});
		}
		return words.join(' ');
	});

	/** Removes script tags (potentially unsafe). */
	//? Not 100% reliable, however I don't usually add `</script>` inside a script tag so it should be safe!
	eleventyConfig.addFilter('stripScripts', (str) => str.replace(/(<script( [^>]+)?>(.+)<\/script>)/gim, ''));
};
