---
title: "Grouping posts by year with Nunjucks in Eleventy"
summary: "Group by year in a clear and readable manner"
tags:
    - eleventy
    - nunjucks
    - quick-tip
---

My blog has a list of all the posts I’ve published on a single page since I don’t post a whole lot. I had been asked in the past how I managed to group my posts by year. As I’ve recently updated that, I figured I’d explain a couple of methods.

Previously, the logic was rather simple: grab the list of posts, reverse it (so it is sorted by newest first), and loop over them. Storing the `currentYear` of a post in a Nunjucks variable, when its value is different from the previous loop iteration (so if the previous post was in 2023 and the current post is in 2022), inject an HTML element above the post with the year (highly simplified):

```njk{% raw %}
{% set currentYear = '' %}
{% for post in postslist | reverse %}
	{% set postYear = post.date | dateFormat({ format: 'year' }) %}
	{% if currentYear != postYear %}
	<h2>{{ postYear }}</h2>
	{% endif %}

	<p><a href="{{ post.url }}">{{ post.data.title }}</a></p>
	{% set currentYear = postYear %}
{% endfor %}
{% endraw %}```

{% callout %}I have a custom `dateFormat` filter where I can specify I want just the year from the date.{% endcallout %}

This worked absolutely fine, but I recently saw that [Bob Monsour added an “expand/collapse by year” feature](https://www.bobmonsour.com/posts/generating-the-firehose-page-on-the-11tybundle-site/) over on the [11ty Bundle Firehose](https://11tybundle.dev/firehose/) (excellent ressource for 11ty, don’t miss out!), and I very much liked the idea. As I set out to implement that on my blog, I noticed how Bob used the same approach as me, injecting some HTML when the year was different.

However, I wasn’t too happy about closing an element at the start of a loop and opening an element after, as it felt hacky (which it *kind of is* but it makes perfect sense: close the old, open the new). So instead I figured it’d be best to iterate over the list of years first, add the `<details>` and `<summary>` elements. Luckily, Nunjucks already provides a [`groupby` filter](https://mozilla.github.io/nunjucks/templating.html#groupby) which even accepts nested values via dot-notation. I didn’t want to calculate the year for each date in Nunjucks, so I added a property with `eleventyComputed` via `posts.11tydata.js` in my `posts` folder to automatically apply the same to every post (this is an [11ty data directory file](https://www.11ty.dev/docs/data-template-dir/)):

```js
module.exports = {
	/* Some cool stuff! */
	eleventyComputed: {
		year: function (data) {
			return new Date(data.date || data.page.date).getFullYear();
		},
		/* More cool stuff! */
	},
}
```

{% callout %}
I’m using a classic function because arrow functions do not have the same context for `this` and in some cases, I need to access it to grab filters declared in Eleventy. Not using it here, but for consistency, I’m keepin’ it old-school!
{% endcallout %}

My first intuition was to use `groupby` as-is, which outputs an object, whose keys are the years, and the values are arrays of posts for each of those years, which looks like this (also simplified!):

```njk{% raw %}
{% for year, posts in collections.posts | groupby("data.year") %}
<details class="postlist-group" open>
	<summary class="postlist-group-label">
		{{ year }}
	</summary>

	<div class="postlist-group-list">
	{% for post in posts | reverse %}
		<p class="postlist-post">
			<a href="{{ post.url | url }}">{{ post.data.title }}</a>
		</p>
	{% endfor %}
	</div>
</details>
{% endfor %}
{% endraw %}```

{% callout %}
We’re setting the `open` attribute to make sure that every group is expanded by default!
{% endcallout %}

The only issue with this approach is that the `year` keys we get are sorted in ascending order, and throwing in a `reverse` before grouping does nothing, while adding `reverse` at the end breaks object entirely — it only works for strings and arrays, and `sort` doesn’t operate on objects. So while we see posts within each year sorted from newest to oldest thanks to `reverse` in the second for-loop, the years themselves are sorted from oldest to newest.

If only we could sort objects… oh wait, [we can](https://www.notion.so/group-posts-by-year-in-nunjucks-eleventy-ef1149514e044ce1b3abeee59230e1b4?pvs=21) using the [`dictsort` filter!](https://mozilla.github.io/nunjucks/templating.html#dictsort) It slightly changes the value of our list in a beneficial way: basically, while `groupby` returns the equivalent of a JavaScript object (`{ 2019: [Object, Object, …], … }`), `dictsort` returns the `Object.entries` equivalent (`[['2019': [Object, Object, …], …]`) which means it is an array, and that can be plugged into a `reverse` filter. We can update our chain on the collection and [Nunjucks will unpack the array](https://mozilla.github.io/nunjucks/templating.html#for:~:text=Additionally%2C%20Nunjucks%20will%20unpack%20arrays%20into%20variables%3A) (in this case, basically doing `Object.fromEntries`) to get a key (`year`) and the value (`posts`) we can iterate over:

```njk{% raw %}
{% for year, posts in collections.posts | groupby("data.year") | dictsort | reverse %}
<details class="postlist-group" open>
	<summary class="postlist-group-label">
		{{ year }}
	</summary>

	<div class="postlist-group-list">
	{% for post in posts | reverse %}
		<p class="postlist-post">
			<a href="{{ post.url | url }}">{{ post.data.title }}</a>
		</p>
	{% endfor %}
	</div>
</details>
{% endfor %}
{% endraw %}```

And just like that, we have our posts in reverse chronological order, grouped by year, also in reverse chronological order. The HTML in the loop feels easier to read and maintain, and while a nested for-loop is usually bad, I think this is a perfectly valid use-case.

I know Nunjucks has its shortcomings but things like this just make me go "dang, that's neat".