---
title: CSS Wishlist 2024
summary: My Wishlist for CSS in 2024
tags: ['css']
---

The amount of new features we have gotten in the past few years is staggering. I remember when flexbox just started rolling out, but I think the real change in pace came with grid. Since then, we’ve seen feature after feature, and I gotta say, as a CSS nerd, this pleases me: thank you CSS experts for all you do!

But, as someone probably once said: never be `display:contents`. So here’s some content for you to read!

{% callout "Beware!" %}
Note that pretty much all the code snippets in here are invalid CSS!
{% endcallout %}

## Allow attr(…) with other properties

**TL;DR:** Gimme `attr(data-something value-type, fallback-value)` in all properties.

Let’s start with an oldie! I would really appreciate being able to do something like `<button type="button" data-hue="189">` and in my CSS, reference this via `attr` like `background-color: hsl(attr(data-hue angle, 0), 50, 80)`.

Currently, only the `content` property can use `attr()` and it’s always a string. I know you can do this with custom properties but it’s a little cleaner to use a dedicated attribute in more complex cases, and that feels more organised, as long as it isn’t overused. I can see this being super useful for example in a custom WordPress Gutenberg block where you pass attributes, instead of classes or an inline style value.

## Container Style Queries

**TL;DR:** Gimme `@container style(--myVar: myValue)` to test a container’s styles.

I have [a whole article](https://chriskirknielsen.com/blog/future-themes-with-container-style-queries/) about what this would allow for my use case, but overall I think it would be great to have this feature across all browsers, given how much I use custom properties. For best results, `@property` would need to ship as well so that `red` and `#ff0000` can both be parsed as the same value.

## Regular expression attribute selectors

**TL;DR:** Gimme `[data-col#="^[1-6]{1}$"]` as a regular expression attribute selector.

I’ve needed this less and less [since 2021](https://github.com/w3c/csswg-drafts/issues/1010#issuecomment-842535686) but I still think it would be useful. I realise running a regular expression on attributes is heavy, so I’d be fine with using them more so for the value of an attribute to keep things *relatively* lean. The idea is to allow you to find elements by a specific attribute that have a value that matches your regex.

For example: in a grid (created by a tool whose output markup we have no control over) with items that have attributes to determine their size, we want the items with a column count of 1 through 6 get a larger font… or something. Instead of listing the 6 possible attribute configurations, we could match them with a single regex:

```css
/* Current option: repetitive… */
.card[data-col="1"],
.card[data-col="2"],
.card[data-col="3"],
.card[data-col="4"],
.card[data-col="5"],
.card[data-col="6"] {
	font-size: 1.5em; 
}

/* Proposed idea: compact! */
.card[data-col#="^[1-6]{1}$"] {
	font-size: 1.5em;
}
```

(this is not a great use-case example, but gets the idea across, I hope!)

Pushing this even further, we could imagine a new CSS function that returns the matches as a usable value. Though it gets muddy if two selectors with different regular expressions (or one without!) are used, so the matches would need to be named, not numbered, and offer fallback values. Luckily, named capture groups already exist, and the fallback syntax is pretty common thanks to custom properties (as we saw in the `attr()` section).

```sass
.card[data-category#="gaming-(<platform>pc|nintendo|xbox|playstation)"],
.card[data-category#="music-(<platform>streaming|cd|radio|live)"],
.card[data-pinned] {
	grid-area: matchgroup(platform, auto);
}
```

(once again, not a very good use-case example, eh?)

For the function name, I would favour `matchgroup` over `matches`, as the latter would be easily confused with the legacy zero-specificity CSS pseudo-class `:matches()` (replaced by `:where()`, which I absolutely love that we have, by the way!). Unique, unambiguous names are pretty essential at this point!

Calling back to the global `attr()` usage, we could imagine a range selection for a lightness attribute, like `[data-lightness#="(<lightness>[0-4]?[0-9])")` to grab only element with an attribute value between 0 and 49…

While these examples aren’t super realistic use cases, in the context of markup you do not control but want to style, it might make sense. For example: adding a quick and dirty line of CSS on a client’s CMS without edit rights on the original files. If you can think of some useful scenarios, please do share!

## Logical everything

**TL;DR:** Gimme a way to write properties in logical syntax for everything: transforms, shadows, etc.

While I am usually working on English-centric websites, when I am not, it’s still Latin-heavy, so I don’t personally *need* this but I’d love to see the logical properties adoption get pushed to `transform`s and other properties like `text/box-shadow`. That would allow you to write the same CSS regardless of document reading direction (`dir` attribute).

```css
.move { /* Works: Physical */
	transform: translateX(50%)
}
.move { /* Does not exist (yet?): Logical, option 1 */
	transform: translateInline(50%);
}
.move { /* Does not exist (yet?): Logical, option 2 */
	transform-mapping: logical;
	transform: translate(50%);
}
```

On a similar note, I wish that shorthand properties like `margin` would resolve to logical longhands instead of physical ones. Either via a flag à-la `@charset` that could look like `@mapping "logical";`, or via some inheritable property like `property-mapping: logical` (the default would be `physical` to retain backward compatibility) that could be set on the root element. This latter approach would allow you to switch it up if you needed to based on a context on the page, like a section in Japanese in the middle of an English page, but where you’d want to preserve the overall layout’s margins or transforms. For example if you had a zigzag pattern of blocks of content, you’d want the flow to be preserved despite `margin-inline-start/end: auto`.

## Absolute scale transforms

**TL;DR:** Gimme a way to scale things based on an absolute value (e.g.: `transform: scale(4rem, 50px)`).

I wrote [a proposal in 2020](https://github.com/w3c/csswg-drafts/issues/5273) but it didn't pick up, and granted it's a niche need, but I’d love to be able to run a transform on an element without knowing its original size while needing a specific final size. This is a little FLIP-like, I suppose, minus having to do any math, but the idea would be to define an element’s scaled size by absolute values, not relative to the base element:

```css
.resized {
	transform: scale(4rem, 50px);
	scale: 4rem 50px; /* when using individual transforms */
}
```

View transitions might alleviate the need for this kind of thing in most scenarios since my use-cases are typically for “morphing” an element to another.

To make it even more useful, if you could use `calc()`? Oh that’d be neat. Grow any element to be 10px bigger in each direction regardless of initial size? `scale: calc(100% + 10px);`, job done… now that’d be nice. Double-bonus if we can use `auto` for one of the two values so it scales proportionally…

## Other things I'd like
- `@scope`, really needing this in a current project.
- View Transitions everywhere, and [View Transition Classes](https://github.com/w3c/csswg-drafts/issues/8319).
- Transitions on discrete properties to animate to/from `display: none`, and I'd be happy with animating to/from `height: 0` to `auto`!
- Regions to flow content in non-rectagular shapes

## Other wishlists around the web

- [Tyler Sticka](https://cloudfour.com/thinks/tylers-css-wish-list-for-2024/)
- [Sarah Gebauer](https://www.sarahgebauer.com/post/day-25-css-wishlist/)
- [Nathan Knowler](https://knowler.dev/blog/2024-css-wishlist)
- [Manuel Matuzović](https://www.matuzo.at/blog/2024/css-wish-list)