---
title: 'Plucking a nested property from an object'
summary: 'Retrieving a property of an object which is also in an object in JavaScript.'
tags:
    - quick-tip
    - javascript
toc: true
---

Have you ever wanted just one value from an array of JavaScript objects? Gently plucking a single property from each object and neatly placing them next to one another. It's got some use cases, and I certainly used that approach in PHP in the past with `array_column`, and `wp_list_pluck` on WordPress sites.

```php
$array = [
    'one' => ['fr' => 'un', 'ja' => 'ichi'],
    'two' => ['fr' => 'deux', 'ja' => 'ni'],
    'three' => ['fr' => 'trois', 'ja' => 'san'],
];
$french = array_column($array, 'fr'); // ['un', 'deux', 'trois'], and note the keys have disappeared.
```

In the case of an array of objects in JavaScript, it's a matter of looping over the array and returning the property we want for each object — which `map` lets us do:

```js
function pluckArray(list, prop) {
	return list.map((item) => item[prop]);
}

const array = [
	{ fr: 'un', ja: 'ichi' },
	{ fr: 'deux', ja: 'ni' },
	{ fr: 'trois', ja: 'san' },
];
const french = pluckArray(array, 'fr'); // ['un', 'deux', 'trois']
```

Okay, nice one-liner logic, but what about an object of objects? We need to preserve the top-level key, and access the associated object to retrieve the value at the provided property key. Can we get a one-liner here, too?

To get this in PHP, we'd need to grab the keys on one hand, and run the plucking logic on the other, then combine them back into a single associative array:

```php
function array_pluck($list, $prop) {
	return array_combine(array_keys($list), array_column($list, $prop));
}
$japanese = array_pluck($array, 'ja'); // ['one' => 'ichi', 'two' => 'ni', 'three' => 'san']
```

It feels a little convoluted but it still makes sense, I think. Now, we need to do the same in JavaScript, and we have different approaches. Here's what I came up with (that doesn't require additional blocks like a `for` loop), with the magic of `Object.fromEntries`.

## Keys and values

This is the closest to that PHP logic. We get the key on one side, and the plucked value from the original object on the other. Throw them into an array together and we got ourselves an entry that can be used to build an object.

```js
function pluckObject(list, prop) {
	return Object.fromEntries(Object.keys(list).map((key) => [key, list[key][prop]]));
}

const object = {
	one: { fr: 'un', ja: 'ichi' },
	two: { fr: 'deux', ja: 'ni' },
	three: { fr: 'trois', ja: 'san' },
};
const japanese = pluckObject(object, 'ja'); // { one: 'ichi', two: 'ni', three: 'san' }
```

## Entries in, entries out

We can convert the main object to entries with `Object.entries` which returns an array of arrays (key and value), and run the plucking logic on each item with `map` to get the value with the provided property name. We then return an entry with the key and plucked value. That then gets converted back to an object with `Object.fromEntries`, and that's it.

```js
function pluckObject(list, prop) {
	return Object.fromEntries(Object.entries(list).map((item) => [item[0], item[1][prop]]));
}

const object = {
	one: { fr: 'un', ja: 'ichi' },
	two: { fr: 'deux', ja: 'ni' },
	three: { fr: 'trois', ja: 'san' },
};
const japanese = pluckObject(object, 'ja'); // { one: 'ichi', two: 'ni', three: 'san' }
```

{% callout "Chaos" %}
In the `map`, you could do `map((item) => { item[1] = item[1][prop]; return item; })` but that's less readable to me and a bit destructive (I believe the original object might be mutated).
{% endcallout %}

## Plucking well done

Our top-level keys are preserved, and now each object has been replaced with a single property it contained.

I honestly think both ways are nearly identical. I assume the first method with `Object.keys` has the advantage of only creating one array with keys, and no additional objects, however I haven't run benchmark tests against it, and unless you have a lot of items, I don't think it'll make much of a difference. Just pick the one that makes the most sense to you!

## One function to rule them all

Since we are smart cookies (the good, soft-baked with slightly melted chocolate kind), we can make it into a single function that checks the type of the list to run the appropriate logic:

```js
function pluck(list, prop) {
	if (Array.isArray(list)) {
		return list.map((item) => item[prop]);
	}

	return Object.fromEntries(Object.keys(list).map((key) => [key, list[key][prop]]));
}
```

{% callout %}
I love early returns, such a good pattern.
{% endcallout %}

Let me know if you have other methods, even if it's "clever code" that's absolutely garbage to decypher, I'm just curious about alternative approaches to this.
