const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItCodeWrap = require('markdown-it-codewrap');
const markdownItFootnote = require('markdown-it-footnote');
const cheerio = require('cheerio');

/* Markdown */
module.exports = (eleventyConfig, options = {}) => {
	if (['anchorSvgClass', 'anchorSvgId', 'anchorClass'].some((key) => typeof options[key] !== 'string')) {
		throw new Error('Both the `anchorSvgClass` and `anchorSvgId` properties must be provided on the options argument.');
	}

	const slugify = (s) =>
		encodeURIComponent(
			String(s)
				.trim()
				.normalize('NFD')
				.replace(/([\u0300-\u036f]|[,;:.…’'"?!&])/g, '')
				.toLowerCase()
				.replace(/\s+/g, '-')
		);
	const { anchorSvgClass, anchorSvgId, anchorClass } = options;

	class TableOfContents {
		constructor(options = {}) {
			this.markup = options.markup;
			this.selectors = options.selectors || 'h2, h3, h4, h5';
			this.listClass = options.listClass || '';
			this.$ = cheerio.load(this.markup, null, false);
			this.headings = this.$(this.selectors); // Find semantic headings
			this.levels = this.selectors.split(',').map((h) => h.trim()); // Get an array of the heading selectors
			this.hierachy = {};
		}

		/** Resolves the hierachy a heading belongs to. */
		getHierarchy(h) {
			let tree = [];

			const tag = h.prop('tagName').toLowerCase();
			const level = this.levels.findIndex((level) => level === tag);
			const parentHeading = level > 0 ? h.prevAll(this.levels[level - 1]).first() : false;

			if (!parentHeading) {
				return false;
			}

			const parentAnchor = parentHeading.find('a[href^="#"]').attr('href');
			tree.push(parentAnchor);
			const ancestors = this.getHierarchy(parentHeading);
			if (ancestors) {
				tree = tree.concat(ancestors.tree); // Add the ancestors after the parent (forms a low-to-high hierarchy)
			}

			return { level, tree };
		}

		parseHeading(h, parent) {
			const anchor = h.find('a[href^="#"]').attr('href');
			const title = h.text().trim();
			const hierarchy = this.getHierarchy(h);
			const item = {
				title: title,
				sub: {},
			};

			if (hierarchy) {
				// The tree is returned from lowest to highest level, so we reverse the list to start from the top
				let tree = hierarchy.tree.slice().reverse();
				while (tree.length > 0) {
					const ancestorAnchor = tree.shift(); // Removes the first item in the list and returns it
					parent = parent[ancestorAnchor].sub; // Go one level deeper
				}
			}
			parent[anchor] = item; // Assign the item to the hierarchy
		}

		/** Creates a list with all the hierarchy represented. */
		populateList(levelItems) {
			const list = this.$('<ul>');

			for (let heading in levelItems) {
				const headingData = levelItems[heading];
				const item = this.$('<li>');
				const link = this.$(`<a href="${heading}">`).text(headingData.title);
				item.append(link);
				list.append(item);

				if (headingData.sub && Object.keys(headingData.sub).length > 0) {
					const sublist = this.populateList(headingData.sub);
					item.append(sublist);
				}
			}

			return list;
		}

		render() {
			// If there are no headings, that's an error
			if (this.headings.length === 0) {
				return '<p>(This may be broken, please let me know on Mastodon!)</p>';
			}

			// Loop over all the found headings
			this.headings.each((i, el) => {
				const h = this.$(el);
				this.parseHeading(h, this.hierachy);
			});

			const list = this.populateList(this.hierachy, true);
			list.addClass(this.listClass);
			return list.prop('outerHTML');
		}
	}

	let markdownItOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};

	let markdownItAnchorOptions = {
		permalink: true,
		permalinkSpace: false,
		permalinkSymbol: '#',
		permalinkClass: anchorClass,
		renderPermalink: (slug, opts, state, idx) => {
			// Based on https://nicolas-hoizey.com/articles/2021/02/25/accessible-anchor-links-with-markdown-it-and-eleventy/
			// Itself based on fifth version from https://amberwilson.co.uk/blog/are-your-anchor-links-accessible/

			// Create the opening/closing <a> and the <svg><use /></svg> tokens
			const headingAnchorTokenOpen = Object.assign(new state.Token('link_open', 'a', 1), {
				attrs: [
					...(opts.permalinkClass ? [['class', opts.permalinkClass]] : []),
					['href', opts.permalinkHref(slug, state)],
					...Object.entries(opts.permalinkAttrs(slug, state)),
				],
			});
			const svgSymbolTokenOpen = Object.assign(new state.Token('svg_open', 'svg', 1), {
				attrs: [
					['width', 16],
					['height', 16],
					['class', anchorSvgClass],
					['aria-hidden', 'true'],
				],
			});
			const svgUseTokenOpen = Object.assign(new state.Token('use_open', 'use', 1), {
				attrs: [['xlink:href', `#${anchorSvgId}`]],
			});
			const svgUseTokenClose = Object.assign(new state.Token('use_close', 'use', -1));
			const svgSymbolTokenClose = Object.assign(new state.Token('svg_close', 'svg', -1));
			const headingAnchorTokenClose = Object.assign(new state.Token('link_close', 'a', -1));

			// idx is the index of the heading's first token
			const tokensBeforeContent = [headingAnchorTokenOpen, svgSymbolTokenOpen, svgUseTokenOpen, svgUseTokenClose, svgSymbolTokenClose];
			const tokensAfterContent = [headingAnchorTokenClose];
			// insert the anchor opening inside the heading, before the content token
			state.tokens.splice(idx + 1, 0, ...tokensBeforeContent);
			// insert the anchor closing after the heading opening and the content token + the tokens before the content
			state.tokens.splice(idx + 2 + tokensBeforeContent.length, 0, ...tokensAfterContent);
		},
		slugify: slugify,
	};

	let markdownItCodeWrapOptions = {
		wrapTag: options.codeWrapTag,
		wrapClass: options.codeWrapClass,
		hasToolbar: options.codeWrapToolbar,
		hasCopyButton: options.hasCopyButton,
		toolbarTag: options.codeToolbarTag,
		toolbarClass: options.codeToolbarClass,
		toolbarLabel: options.codeToolbarLabel,
		isButtonInToolbar: options.copyButtonInToolbar,
		copyButtonAttrs: options.copyButtonAttrs,
		copyButtonLabel: options.copyButtonLabel,
		inlineCopyHandler: options.inlineCopyHandler,
	};

	/** Configure the markdown-it library to use. */
	eleventyConfig.setLibrary(
		'md',
		markdownIt(markdownItOptions).disable('code').use(markdownItAnchor, markdownItAnchorOptions).use(markdownItFootnote).use(markdownItCodeWrap, markdownItCodeWrapOptions)
	);

	/** Take markup content and automatically create anchors for headings. Should only be used when content is not Markdown. */
	eleventyConfig.addFilter('autoHeadingAnchors', (markup) => {
		// If this isn't a string, there isn't anything we can do!
		if (typeof markup !== 'string') {
			return markup;
		}

		const $ = cheerio.load(markup, null, false); // Load the contents into cheerio to get a DOM representation
		const headings = $('h2, h3, h4, h5, h6'); // Look for all semantic headings

		// If there are no headings, just return the content
		if (headings.length === 0) {
			return markup;
		}

		// Iterate over each heading
		headings.each(function () {
			const h = $(this);
			const innerLinks = h.find('a');

			// If there is already a link within, do not process the node
			if (innerLinks.length > 0) {
				return h;
			}

			const text = h.text(); // Get the heading content
			const slug = slugify(text); // Create a slug from the content
			const inner = `<a class="${anchorClass}" href="#${slug}"><svg width="16" height="16" class="${anchorSvgClass}" aria-hidden="true"><use xlink:href="#${anchorSvgId}"></use></svg>${text}</a>`; //
			h.attr('id', slug);
			h.attr('tabindex', '-1');
			h.html(inner);
			return h;
		});

		return $.html();
	});

	eleventyConfig.addFilter('autoToc', function (markup) {
		// If this isn't a string, there isn't anything we can do!
		if (typeof markup !== 'string') {
			return markup;
		}

		const toc = new TableOfContents({ markup, selectors: 'h2, h3, h4', listClass: 'list-bullet-offset' });
		return toc.render();
	});

	/** Remove anchor-link symbol if unused */
	eleventyConfig.addTransform('unused-anchor-link', (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		// If the anchor SVG is in use, don't change anything!
		if (content.includes(`href="#${anchorSvgId}"`)) {
			return content;
		}

		// Else, remove the SVG from the markup
		return content.replace(/<svg ([^>]+) data-anchor-link>(.+)<\/svg>/s, '');
	});

	/** Add copy button to block blocks */
	eleventyConfig.addTransform('codeblock-copy', (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		// Look for our custom data attribute
		if (!content.includes(' data-codewrap-copy-button=')) {
			return content;
		}

		const $ = cheerio.load(content, null, true); // Load the contents into cheerio to get a DOM representation
		const codeBlockWrappers = $('.codeblock-wrap'); // Look for all codeblocks

		// If there are no codeblocks, just return the content
		if (codeBlockWrappers.length === 0) {
			return content;
		}

		const codeCopyHandler = `<script>
		const clipboard = navigator.clipboard.writeText;
		if (clipboard) {
			document.addEventListener('click', function(e) {
				const copyButton = e.target.closest('.codeblock-copy');
				if (!copyButton) { return; }
				const codeBlock = copyButton.closest('.codeblock-wrap').querySelector('code');
				if (!codeBlock) { return; }
				const copyAction = navigator.clipboard.writeText(codeBlock.innerText);
				copyButton.classList.add('is-copied');
				copyAction.then(() => {
					setTimeout(() => {
						copyButton.classList.remove('is-copied');
						copyButton.blur();
					}, 2000);
				});
			});
		}
		document.addEventListener('DOMContentLoaded', () => {
			Array.from(document.querySelectorAll('.codeblock-copy')).forEach(btn => btn.hidden = !clipboard);
		});
		</script>`;
		$('head').append(codeCopyHandler);

		return $.html();
	});
};
