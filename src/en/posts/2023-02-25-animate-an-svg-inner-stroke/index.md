---
title: 'Animate an SVG shape‘s inner stroke'
summary: 'Grow a stroke on an SVG shape but only covering the inner part'
tags:
    - quick-tip
    - svg
    - css
---

If you have any theme besides "**Dusk**" selected on my website, you'll see a little animation on hover that fills in each letter of my logo. In case you _are_ using that theme, here's what that looks like:

{% video "./ckn-logo-anim.mp4", "The CKN logo letter each fill in from the edges one after another", "", { width: 660, height: 364 } %}

Users of software like Adobe Illustrator will know that you can determine on which edge the stroke sits. By default, it's in the centre, shared across both (so a 2px stroke wil have 1px inside the shape, 1px outside), but you can also select either to have it only "outside" or "inside". The issue is that you can't export an SVG with that feature (well, you can but it will offset the path or convert it to a shape instead): SVG only supports the centre stroke (for now).

I thought it would be cool to have the letters fill in from the sides instead of simply changing the fill colour. Easy, right? Animate the `stroke-width` from `0` to whichever value covers the full shape (`16` in my case). Let's take a look (hover to trigger the animation):

{% codepen "https://codepen.io/chriskirknielsen/pen/dyqpVgz" %}

Yikes. Not exactly what I'm after. The stroke should only be contained inside the shape itself, like… clipped? Ah, a clip path! Use a path, apply a stroke to it, and clip it to itself. That should work. I'll define a `<clipPath>` for each letter inside `<defs>`. But I don't want to have the path in the clip path element, and then repeat it as its own path… Well, SVG is _Super Very Good™_, because I can absolutely do something like this:

```html
<svg etc...>
	<defs>
		<clipPath id="letter-c-clip">
			<path id="letter-c-path" d="…" />
		</clipPath>
	</defs>
</svg>
```

This allows me to define a path as a clip, and then later reference the path itself as a regular shape. Gosh, SVG is so cool.

Anyways, so I have my clips defined, now I need to add the shapes. Easy enough, I'll use `<use>`! Set the `clip-path` attribute and that's all I need in the markup section.

```html
<use href="#letter-c-path" clip-path="url(#letter-c-clip)"/>
```

Now all I need is to set the adjusted CSS to change the stroke width on `use` instead (though there are many ways to do this, e.g.: assign a `data-letter="c"` attribute and select `[data-letter]`).

```css
use {
	fill: var(--color);
	stroke: var(--accent);
	stroke-width: 0;

	transition: stroke-width 500ms ease-in-out var(--delay, 0ms);
}

/* For added effect, a slight delay between letters ✨ */
[data-c] { --delay: 0ms; } /* Can be omitted */
[data-k] { --delay: 200ms; }
[data-n] { --delay: 400ms; }

svg:is(:hover, :focus) use {
	outline: 0;

	stroke-width: 16;
}
```

Which all in all looks like this:

{% codepen "https://codepen.io/chriskirknielsen/pen/NWLRayE" %}

You could definitely use masks (white rectangle covering the SVG, black fill on the letter) instead of clip-paths if you wanted to make the stroke grow outwards with a transparent shape. In the case of a solid fill, I'd say layer a copy of the shape below (so the fill appears above the stroke), or even better: use `paint-order="stroke"` to paint the stroke first, which avoids having to duplicate the shape.

Now this is pretty simple but I thought it was fun enough to share. Any excuse to talk about SVG should not be ignored.