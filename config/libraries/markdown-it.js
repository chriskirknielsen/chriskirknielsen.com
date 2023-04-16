const markdownIt = require('markdown-it');
const markdownItAnchor = require('markdown-it-anchor');
const markdownItFootnote = require('markdown-it-footnote');
const cheerio = require('cheerio');

/* Markdown */
module.exports = (eleventyConfig, options = {}) => {
	if (typeof options.anchorSvgClass !== 'string' || typeof options.anchorSvgId !== 'string') {
		throw new Error('Both the `anchorSvgClass` and `anchorSvgId` properties must be provided on the options argument.');
	}

	const slugify = (s) =>
		encodeURIComponent(
			String(s)
				.trim()
				.normalize('NFD')
				.replace(/([\u0300-\u036f]|[,;:.…'"?!&])/g, '')
				.toLowerCase()
				.replace(/\s+/g, '-')
		);
	const { anchorSvgClass, anchorSvgId } = options;
	let markdownItOptions = {
		html: true,
		breaks: true,
		linkify: true,
	};
	let markdownItAnchorOptions = {
		permalink: true,
		permalinkSpace: false,
		permalinkSymbol: '#',
		permalinkClass: 'heading-anchor',
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
			const svgUseTokenClose = Object.assign(new state.Token('use_close', 'svg', -1));
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
	eleventyConfig.setLibrary('md', markdownIt(markdownItOptions).disable('code').use(markdownItAnchor, markdownItAnchorOptions).use(markdownItFootnote));

	/** Take markup content and automatically create anchors for headings. Should only be used when content is not Markdown. */
	eleventyConfig.addFilter('autoHeadingAnchors', (markup) => {
		// If this isnt' a string, there isn't anything we can do!
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
			const inner = `<a class="heading-anchor" href="#${slug}"><svg width="16" height="16" class="heading-anchor-symbol" aria-hidden="true"><use xlink:href="#anchor-link"></use></svg>${text}</a>`; //
			h.attr('id', slug);
			h.attr('tabindex', '-1');
			h.html(inner);
			return h;
		});

		return $.html();
	});

	// Remove anchor-link if unused
	eleventyConfig.addTransform('unused-anchor-link', (content, outputPath) => {
		if (!outputPath.endsWith('.html')) {
			return content;
		}

		if (content.includes('href="#anchor-link"')) {
			return content;
		}

		return content.replace(/<svg ([^>]+) data-anchor-link>(.+)<\/svg>/s, '');
	});
};
