---
title: Acknow&shy;ledge&shy;ments
subtitle: This site wouldn't look nearly as good, or exist at all, if not for…
summary: Some info about this site
permalink: /acknowledgements/
---

This site is built with [Eleventy](https://www.11ty.dev/), a fantastic static site generator. I [pre-compile](/blog/eleventy-asset-pipeline-precompiled-assets/) my Sass files to CSS, and minify my scripts. I then inline that to reduce HTTP requests, and this whole thing is hosted via [Netlify](https://netlify.com/). Also used: [PurgeCSS](https://purgecss.com), [ImageOptim](https://imageoptim.com/mac), [GlyphHanger](https://github.com/zachleat/glyphhanger), [SVGOMG](https://jakearchibald.github.io/svgomg/)… Also [see what I use on the daily here](/uses).

The theme picker is more than a little inspired by [Max Böck's own](https://mxb.dev), while the eclecticism is inspired by [Sophie Koonin's site](https://localghost.dev/). The synth on the [About page](/about/) is based on [Bret Cameron's tutorial](https://css-tricks.com/how-to-code-a-playable-synth-keyboard/), and extended with envelope shaping and lowpass filtering by peeking at [Daniel Schulz's code](https://iamschulz.com/building-a-synthesizer-in-javascript/).

{% mdsafe %}
<details class="expander">
    <summary class="cta expander-cta | u-width100" style="--btn-justify-content:center">More info about themes &amp; fonts 🎨</summary>
    <div class="expander-content">
        <ul class="list-bullet-offset">
            <li><strong>Dusk:</strong> A neon-infused, retrowave-inspired theme which is basically my entire online personality. It uses the gorgeous <a href="https://www.readvisions.com/marvin">Marvin Visions</a> typeface.</li>
            <li><strong>Dawn:</strong> This very-off-white theme aims to be a light-mode version of Dusk, with enough changes to give it its own spin.</li>
            <li><strong>Vapor:</strong> A vaporwave interpretation of a theme which was a lot of fun to make, I'll thank Sophie Koonin here again for embracing this aesthetic! <a href="https://www.dafont.com/vcr-osd-mono.font">VCR OSD Mono</a> was the obvious typeface choice.</li>
            <li><strong>Y2K:</strong> I grew up using Windows 98 and XP, so I kinda had to make this one as a little hommage. Don't miss out on the footer logo.</li>
            <li><strong>Neo-Tokyo:</strong> Retrowave is cool, but dystopian cyberpunk styles are cool too. This one is a little Akira-flavoured! The wide-as-heck headings are set in <a href="https://fonts.google.com/specimen/Syncopate">Syncopate</a>.</li>
            <li><strong>Campfire:</strong> Opposite from the previous one, this takes heavy inspiration from the video game Firewatch and <a href="http://ollymoss.com/#/firewatch/">Olly Moss</a>'s beautiful artwork, and goes for a "national parks" vibe, with headings looking perfect in <a href="https://www.dafont.com/hagona.font">Hagona</a>, and the shape of Mount Blanc in the homepage background, which is sometimes visible from my home town. The hero sections used most of <a href="https://codepen.io/scottkellum/details/poOWGQg">Scott Kellum</a>'s code for generative topography. (oh and also, <a href="https://alistairshepherd.uk/">Alistair</a> did all this better)</li>
        </ul>
    </div>
</details>
{% endmdsafe %}

You can check out the [full source code on GitHub]({{ metadata.repo }}) to see plugins and other packages used. I only ask that you don't steal my code and slap your own name on it.

Thanks for stopping by, friend, it is mighty kind of you! 👋