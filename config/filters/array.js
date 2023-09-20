module.exports = function (eleventyConfig) {
	/** Checks if a value is present in the provided list. */
	eleventyConfig.addFilter('includes', (list, value) => list.includes(value));

	/** Ensure every value of the provided list is unique. */
	eleventyConfig.addFilter('unique', (arr) => [...new Set(arr)]);

	/** Flattens an array to a single level. */
	eleventyConfig.addFilter('flatten', (array) => array.flat(Infinity));

	/** Removes unwanted values from a provided list. */
	eleventyConfig.addFilter('filterOut', (list, values) => list.filter((value) => !values.includes(value)));

	/** Removes values from a list that don't begin with the provided string. Can be reverse with a boolean argument */
	eleventyConfig.addFilter('filterStartsWith', (list, str, flip = false) => list.filter((value) => String(value).startsWith(str) ^ flip)); // Bitwise XOR, wild stuff

	/** Finds the first object in a provided list whose prop matches the value. */
	eleventyConfig.addFilter('find', (array, prop, value) => array.find((item) => item[prop] === value));

	/** Plucks out the property of each object in a provided list, returns an array of those plucked properties. */
	eleventyConfig.addFilter('pluck', function (list, key) {
		const arr = Array.isArray(list) ? list : Object.values(list); // Make sure our list is an array, if not, turn the values of the object into an array
		return arr.map((o) => o[key]);
	});

	/** Gets the first item, and if it is not an array, returns the value as-is */
	eleventyConfig.addFilter('getFirst', (listOrItem) => (Array.isArray(listOrItem) ? listOrItem[0] : listOrItem));

	/** Gets the list of items, and if it is not an array, returns the value wrapped in an array */
	eleventyConfig.addFilter('getList', (listOrItem) => (Array.isArray(listOrItem) ? listOrItem : [listOrItem]));
};
