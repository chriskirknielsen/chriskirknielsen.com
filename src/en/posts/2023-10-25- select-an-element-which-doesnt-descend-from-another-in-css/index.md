---
title: "Select an element which doesn’t descend from another in CSS"
summary: 'Avoid false positives when using :not() to exclude ancestors from a scope'
tags:
    - css
    - quick-tip
---

**Update:** This article initially proposed `a:not(.archived a)`, but [Šime Vidas suggested](https://mastodon.social/@simevidas/111294439227937167) `a:not(.archived *)` which avoids repeating the target. This has been adjusted throughout the article. Thanks, Šime!

<hr>

{% callout "TL;DR", "", false %}
**Situation:** we want to select all links that aren’t inside an `.archived` element.

**Don't do this:** `:not(.archived) a`

**Instead, do:** `a:not(.archived *)`
{% endcallout %}

I ran into this issue the other day and was talking with my coworker Joel about this. He reminded me of a neat trick that can come in handy when you’re working with some HTML you don’t control (in our case, a library that loves wrappin’ in `<div>`s!). Since I am likely to forget, I am blogging for myself, and maybe you'll get something out of it too, dear reader!

If we want to select a link (`<a>` element) that is not a direct descendant of an element with the class `.archived`, our first instinct might be to do `:not(.archived) > a`. If our DOM looks like this, we'll be able to easily distinguish between archived and non-archived blocks:

```html
<article class="archived">
	<a href="#">Link</a>
</article>
```

However, if we do not know how many elements sit between our negated selector ``.archived`` and our target element `a`, then we’re out of luck if we try to use `:not(.archived) a`, as every `a` will match. Consider the following markup:

```html
<body>
	...
		<article class="archived">
			<p>
				<a href="#">Link</a>
			</p>
		</article>
```

With `:not(.archived) a`, then `<body>` matches `:not(.archived)`, and so does `<p>`, resulting in our `<a>` element being matched. Not what we wanted!

But we know that we _can_ find any element inside of an archived element with `.archived *`, so if we combine that with a negation, we can use `a:not(.archived *)`, which means “select every `a` which is not (an element which is a descendant of `.archived`)”.

With that little tweak, we can now safely use our CSS selector to find links outside of archived blocks. Neat!

Note that if you’re in control of the markup, this is pretty unlikely to be all that useful, but if you’re imposed a library that just hands out `<div>`s like candy on Halloween, then it might be useful! In my case, we were looking for interactive elements in automated browser tests that were not inside a disabled component, but those could wildly vary in terms of markup. So `button:not([aria-disabled=true] *)` resolved it.

{% image "is-this-scope.jpg", "A variation of the meme where an anime character looks at a butterfly and says 'Is this a pigeon?'. This one is captioned 'Is this at-scope?' with the text ':has()' superimposed on the butterfly.", null, { ratio: 1200/630 } %}

It kind of looks like "doughnut scoping" when I think about it. If we wanted to do something like this in a card component but not for links inside of the card content, we might do:

```css
/* Using this trick */
.card a:not(.card-content *) {
    color: var(--accent);
}

/* Using CSS Scope */
@scope (.card) to (.card-content) {
    a {
        color: var(--accent);
    }
}
```

Both of these will technically "scope" the selector, however `@scope` has a few more advantages I'd say, namely specificity won't go out of control as much, and the selector has way better legibility (~~it's never good to repeat the target element in the same selector!~~ no longer an issue after the update), but still cool we can get to similar results in simple setups with relatively old browser versions!