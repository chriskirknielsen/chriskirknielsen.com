---
title: State of JS 2021
summary: Making a logo and a t-shirt design celebrating JS in a retro style
customMetaImage: soj2021-cover.jpg
externalUrl: https://2021.stateofjs.com/en-US/
date: 2022-03-01
---

{% set shirtData = designs | find('slug', 'js-retro-vhs') %}
Following a pretty successful collaboration on the CSS shirt, Sacha asked me once more if I'd be up to design a VHS-styled logo and shirt, but for the STate of JS this time around. This one was a little more tricky to nail down as balancing "simple" with "massive ecosystem" is a tall order.

We went through quite a few iterations, especially for the background shape that ended up being this tesseract-looking thing with multiple light sources.

{% gallery %}
{% image customMetaImage, "A logo for the State of JS, with JS written in stacked lines on top of a multi-faceted haxagon with blue, cyan, and pink highlights. Inside of it is another hexagon with three colours covering it fully: yellow, red, and blue.", "", { ratio: "600/600", group: true } %}
{% image '/' + assets.imagesDir + '/designs/js-retro-vhs.jpg', "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="{{shirtData.link.CottonBureau}}">CottonBureau</a>', { ratio: "600/600", group: true } %}
{% endgallery %}

Just like the CSS design, I animated this one for extra fun. Click to restart the animation.

{% codepen "https://codepen.io/chriskirknielsen/pen/wvPPWKq" %}

I was also quite happy with this detail for the t-shirt, coming up with a symbol for optional chaining, which in JavaScript, lets you access a sub-property if it exists with the syntax `prop?.subprop`.

{% image "./optional-chaining.jpg", "A close-up for the Optional Chaining section on the shirt, featuring a chain link, with one of them being a question mark", "", { width: 1280, height: 720 } %}
