require('dotenv').config();
const { AssetCache } = require('@11ty/eleventy-fetch');
const { Client: NotionClient } = require('@notionhq/client');

/**
 * Group an array of objects by a property.
 * @link https://gist.github.com/robmathers/1830ce09695f759bf2c4df15c29dd22d
 * @param {object[]} data Array of objects to group.
 * @param {string} key Property of each object to use for grouping.
 * @returns {{ keyValue: object[] }[]} Grouped objects
 */
function groupBy(data, key) {
	// `data` is an array of objects, `key` is the key (or property accessor) to group by
	// reduce runs this anonymous function on each element of `data` (the `item` parameter,
	// returning the `storage` parameter at the end
	return data.reduce(function (storage, item) {
		// get the first instance of the key by which we're grouping
		var group = item[key];

		// set `storage` for this instance of group to the outer scope (if not empty) or initialize it
		storage[group] = storage[group] || [];

		// add this item to its group within `storage`
		storage[group].push(item);

		// return the updated storage to the reduce function, which will then loop through the next
		return storage;
	}, {}); // {} is the initial value of the storage
}

/** Converts a Notion rich text block to a Markdown string. */
function richTextBlockToMd(block) {
	const string = block.text.content;
	let wrap = [];
	if (block.annotations.bold) {
		wrap.push('**');
	}
	if (block.annotations.italic) {
		wrap.push('_');
	}
	if (block.annotations.strikethrough) {
		wrap.push('~~');
	}
	let mdString = `${wrap.join('')}${string}${wrap.reverse().join('')}`;
	return mdString;
}

module.exports = async () => {
	// Set up Notion stuff
	const notionClient = new NotionClient({ auth: process.env.NOTION_BEARER_TOKEN });
	const nowDatabaseId = process.env.NOTION_DATABASE_ID_NOW;

	// Initialise the asset caches
	const dbInfoCache = new AssetCache('now_database_last_edit');
	const dbDataCache = new AssetCache('now_database_content');

	// Grab the database's latest info (not the content, just metadata about it)
	const dbInfo = await notionClient.databases.retrieve({
		database_id: nowDatabaseId,
	});

	// Determine when the DB was last edited, or created
	const dbLastEdit = dbInfo.last_edited_time || dbInfo.created_time || '';

	// Get the last cached value for the DB info
	const cacheLastEdit = (await dbInfoCache.getCachedContents('text')) || null;

	// If the cached last edit matches the live last edit, return the cached DB contents and stop here
	if (false && dbLastEdit === cacheLastEdit) {
		const dbCache = await dbDataCache.getCachedContents('json');
		return dbCache;
	}

	// If this has changed, save the new last edit date value
	dbInfoCache.save(dbLastEdit, 'text');

	// Based on the DB info, build a list of the IDs for the properties needed for the Now page based on their name
	const databaseProps = dbInfo.properties;
	const propsToUse = ['title', 'detail', 'blurb', 'category', 'link'];
	let propsById = [];
	for (let p in databaseProps) {
		if (propsToUse.includes(p)) {
			propsById.push(databaseProps[p].id);
		}
	}

	// Grab the results from the database
	const dbData = await notionClient.databases
		.query({
			database_id: nowDatabaseId,
			filter_properties: propsById,
			filter: {
				property: 'archived',
				checkbox: { equals: false },
			},
		})
		.then((data) => data.results);

	// Only keep useful data
	const dbDataCleaned = dbData.map((entry) => {
		const props = entry.properties;

		return {
			title: props.title.title.pop().plain_text,
			detail: props.detail.rich_text.map((textBlock) => textBlock.plain_text).join(''),
			blurb: props.blurb.rich_text.map((textBlock) => richTextBlockToMd(textBlock)).join(''),
			category: props.category.select.name,
			link: props.link.url,
		};
	});

	// Group the data by category
	const dbDataGrouped = groupBy(dbDataCleaned, 'category');

	// Save the data in the cache
	dbDataCache.save(dbDataGrouped, 'json');

	// And finally, return the data
	return dbDataGrouped;
};
