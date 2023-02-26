const esbuild = require('esbuild');

module.exports = function (eleventyConfig, options = {}) {
	const jsminCache = options.useCache ? {} : null;

	/** Minify a block of JavaScript code and optionally caches the result for reuse if a key is provided. */
	eleventyConfig.addNunjucksAsyncFilter('jsmin', async function (code, ...rest) {
		const callback = rest.pop();
		const cacheKey = rest.length > 0 ? rest[0] : null;

		try {
			if (cacheKey && jsminCache && jsminCache.hasOwnProperty(cacheKey)) {
				const cacheValue = await Promise.resolve(jsminCache[cacheKey]); // Wait for the data, wrapped in a resolved promise in case the original value already was resolved
				callback(null, cacheValue.code); // Access the code property of the cached value
			} else {
				const minified = esbuild.transform(code, {
					minify: true,
				});
				if (cacheKey) {
					jsminCache[cacheKey] = minified; // Store the promise which has the minified output (an object with a code property)
				}
				callback(null, (await minified).code); // Await and use the return value in the callback
			}
		} catch (err) {
			console.error('jsmin error: ', err);
			callback(null, code); // Fail gracefully.
		}
	});
};
