function imageGalleryShortcode(pictures, addClass = []) {
	const galleryClasses = [];
	if (addClass) {
		if (typeof addClass === 'string') {
			addClass = addClass.split(' ').filter((str) => str.length > 0);
		}
		addClass.forEach((className) => galleryClasses.push(className));
	}

	return `<div class="${galleryClasses.join(' ')}">${pictures.trim()}</div>`;
}

function mediaShortcode(type, src, alt, caption = '', options = {}) {
	if (!['image', 'video'].includes(type)) {
		throw new Error(`The type parameter must either be image or video.`);
	}
	if (typeof alt === 'undefined') {
		throw new Error(`The ${src} ${type} does not have an alt attribute! (empty string is allowed)`);
	}

	if (!options.ratio && !options.width && !options.height) {
		throw new Error(`The ${src} ${type} does not have a ratio or width/height attributes. At least two of the three must be provided.`);
	}

	const isGroupContext = type === 'image' && options.hasOwnProperty('group') && options.group; // Whether the image is part of a group
	const sizes = ['100vw', '(min-width: 50rem) 50rem'].join(', ');
	const widths = options.widths || [480, 800, 1200];
	const srcset = widths.map((w) => `${src}?nf_resize=fit&w=${w} ${w}w`);

	if (alt.indexOf('"') > -1) {
		alt = alt.split('"').join('&quot;');
	}
	if (alt.indexOf('<') > -1) {
		alt = alt.split('<').join('&lt;');
	}

	let attrs = {};

	if (type === 'video') {
		attrs = { controls: '', playsinline: '', muted: '', loop: '', 'aria-label': alt };
		if (options.hasOwnProperty('loop') && !options.loop) {
			delete attrs.loop;
		}
		if (options.hasOwnProperty('loop') && !options.muted) {
			delete attrs.muted;
		}
	} else if (type === 'image') {
		attrs = { loading: 'lazy', decoding: 'async', alt: alt, srcset: srcset.join(','), sizes: sizes };
	}

	// Assign a ratio to the media
	if (options.ratio) {
		// If the ratio is passed as a string, parse it to a number
		if (typeof options.ratio === 'string') {
			attrs['data-ratio'] = options.ratio; // Store the initial ratio provided

			if (options.ratio.includes('/')) {
				let ratioParts = options.ratio.split('/');
				options.ratio = parseFloat(ratioParts[0]) / parseFloat(ratioParts[1]);
			} else {
				options.ratio = parseFloat(options.ratio);
			}
		}

		// If only one dimension was provided, calculate the other based on the ratio
		if (options.width && !options.height) {
			options.height = options.width / options.ratio;
		} else if (!options.width && options.height) {
			options.height = options.height * options.ratio;
		} else if (!options.width && !options.height) {
			// If no dimensions were provided, assume a 1000px height and determine the width based on the ratio
			options.width = Math.floor(options.ratio * 1000);
			options.height = 1000;
		}
	}

	// Set the width and height attributes
	if (options.width) {
		attrs.width = options.width;
	}
	if (options.height) {
		attrs.height = options.height;
	}

	let ratioString = attrs['data-ratio'] || options.ratio ? parseFloat(options.ratio.toFixed(4)).toString() : `${options.width} / ${options.height}`;
	attrs.style = `aspect-ratio:${ratioString};`;
	if (type === 'video') {
		attrs.style += ' max-width: 100%;'; // For RSS feeds
	}

	const attrsStr = Object.entries(attrs)
		.map((attr) => `${attr[0]}="${attr[1]}"`)
		.join(' ');

	let mediaMarkup = '';
	if (type === 'video') {
		mediaMarkup = `<video src="${src}" ${attrsStr}></video>`;
	} else if (type === 'image') {
		mediaMarkup = `<a href="${src}"><img src="${src}?nf_resize=fit&w=${widths.at(-2)}" ${attrsStr} /></a>`;
	}

	let output;
	if (caption) {
		output = `<figure>${mediaMarkup}<figcaption>${caption}</figcaption></figure>`;
	} else {
		output = mediaMarkup;
	}

	// If not grouped in a gallery (wrapped in a {% gallery %} shortcode pair), make it a single-media gallery
	if (!isGroupContext) {
		return imageGalleryShortcode(output, options._galleryClasses);
	}

	return output;
}

function imageShortcode(src, alt, caption = '', options = {}) {
	return mediaShortcode('image', src, alt, caption, options);
}

function videoShortcode(src, alt, caption = '', options = {}) {
	return mediaShortcode('video', src, alt, caption, options);
}

module.exports = function (eleventyConfig, options = {}) {
	const galleryClasses = options.galleryClasses || null;

	eleventyConfig.addShortcode('image', (src, alt = '', caption = '', opts = {}) => imageShortcode(src, alt, caption, Object.assign({ _galleryClasses: galleryClasses }, opts)));
	eleventyConfig.addShortcode('video', (src, alt = '', caption = '', opts = {}) => videoShortcode(src, alt, caption, Object.assign({ _galleryClasses: galleryClasses }, opts)));
	eleventyConfig.addPairedShortcode('gallery', (pictures) => imageGalleryShortcode(pictures, galleryClasses));
};
