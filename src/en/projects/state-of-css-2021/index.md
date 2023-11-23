---
title: State of CSS 2021
summary: Making a logo and a t-shirt design celebrating CSS in a retro style
customMetaImage: soc2021-cover.jpg
externalUrl: https://2021.stateofcss.com/en-US/
date: 2021-12-24
projectButtonLabel: View survey
extraCta: [{ label: 'Get shirt', url: 'https://cottonbureau.com/products/css-retro-vhs#/13046404/tee-men-standard-tee-vintage-black-tri-blend-m', icon: 'shirt' }]
---

{% set shirtData = designs | find('slug', 'css-retro-vhs') %}
After seeing my WWW design series, Sacha Greif, maintainer of the State of CSS and JS surveys, reached out to me to design the logo and t-shirt design for the 2021 edition. It took a few weeks but we landed on a pretty solid design, if I do say so myself!

{% gallery %}
{% image customMetaImage, "A logo for the State of CSS, with CSS written in quarter-circles on top of a triple-layered yellow-to-hot pink gradient diamond.", "", { ratio: "600/600", group: true } %}
{% image '/' + assets.imagesDir + '/designs/' + shirtData.slug + '.jpg', "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+shirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } %}
{% endgallery %}

I also animated it for the survey landing page, because animations are fun! Click to restart the animation.

{% codepen "https://codepen.io/chriskirknielsen/pen/ExwgLNO" %}

## The State of Ass

When the survey was first opened, it had been pointed out to us that the logo didn't necessarily read as "CSS"… and while Sacha and I had seen it, we thought "No way anyone will read this as anything but CSS, right?".

We were wrong. So I adjusted the logo, but for your entertainment, here is the logo for… State of Ass:

{% image "./state-of-ass.jpg", 'A logo that should read as CSS made of quarter-circles, but the C can be mistaken for a lowercase A, spelling out "ass" instead…', "The State of Ass may be a thing but I am not involved", { width: 1280, height: 640 } %}
