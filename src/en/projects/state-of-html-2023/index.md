---
title: State of HTML 2023
summary: Making a logo and a t-shirt design celebrating HTML in a retro style
customMetaImage: soh2023-cover.jpg
externalUrl: https://2023.stateofhtml.com/en-US/
date: 2023-09-01
projectButtonLabel: View survey
---

{% set shirtData = designs | find('slug', 'js-retro-vhs') %}
Having designed the recent State of CSS and State of JS logos, the collaboration between Sacha, the survey creator, and myself, is pretty smooth. When a new survey needed a logo, I was ready to answer the call! Still in a VHS-inspired style, the idea was to come up with something that would remind people of a good old HTML tag.

There were a few tests that looked a little too 3D-esque, others too complex, but we settled on this layered but still flat looking design.

{% gallery %}
{% image customMetaImage, "A logo for the State of HTML, with HTML written in blocky letters between two chevrons (lesser-than and greater-than) characters with a gradient from bright yellow to orange-red for the for section, and red to dark purple for the other. In the background centre is a group of slash characters extending past the chevrons with a turquoise-purple gradient.", "", { ratio: "600/600", group: true } %}
{% image '/' + assets.imagesDir + '/designs/' + shirtData.slug + '.jpg', "A rework of the logo for the survey rearranged to look like an old blank VHS tape, on a black t-shirt.", 'Get yours at <a href="'+shirtData.links.CottonBureau+'">CottonBureau</a>', { ratio: "600/600", group: true } %}
{% endgallery %}

Just like the CSS and JS designs, I animated this one to give the landing page a little more life. Click to restart the animation.

{% codepen "https://codepen.io/chriskirknielsen/pen/zYyZzyN" %}
