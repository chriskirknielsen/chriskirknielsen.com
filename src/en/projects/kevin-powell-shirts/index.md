---
title: Kevin Powell Shirts
summary: Designing CSS-themed t-shirts for YouTube educator Kevin Powell
customMetaImage: front-end-friends-shirts.jpg
externalUrl: https://cottonbureau.com/people/kevin-powell
date: 2023-12-31
projectButtonLabel: View shirts
status: draft
---

{% set shirtData1 = designs | find('slug', 'kevin-powell-grid') %}
{% set shirtData2 = designs | find('slug', 'kevin-powell-css') %}
{% set shirtData3 = designs | find('slug', 'kevin-powell-color-space') %}
Kevin Powell, a brilliant CSS educator on YouTube needed to refresh his merchandise, and I was very happy to help! CSS is a subject that is very dear to me, and having the opportunity to work on designs on the topic was a lot of fun! Kevin wanted to celebrate CSS, with a retro feeling — to avoid monotone designs, I opted for a different style for each: neon, Swiss (ish?), and retrofuturism.

{% gallery %}
{% image '/' + assets.imagesDir + '/designs/' + shirtData1.slug + '.jpg', "A TRON-inspired design on a black shirt with a cyan blue grid and a large GRID logo above, and some abstract shapes in some of the grid cells.", '<a href="'+shirtData1.links.CottonBureau+'">Grid Layout design on CottonBureau</a>', { ratio: "600/600", group: true } %}
{% image '/' + assets.imagesDir + '/designs/' + shirtData2.slug + '.jpg', "A retro black VHS style design on a white shirt with wavy bands of black, purple, red, and orange on a yellow square. Symbols remeniscent of CSS selectors appear woven into the bands, with a large Cascading Stylesheet text at the top, and Backward Compatibility at the bottom.", '<a href="'+shirtData2.links.CottonBureau+'">CSS design on CottonBureau</a>', { ratio: "600/600", group: true } %}
{% image '/' + assets.imagesDir + '/designs/' + shirtData3.slug + '.jpg', "A illustrative representation of a rocket taking off into space", '<a href="'+shirtData3.links.CottonBureau+'">Color Space design on CottonBureau</a>', { ratio: "600/600", group: true } %}
{% endgallery %}
