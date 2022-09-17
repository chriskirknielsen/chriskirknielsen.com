---
layout: layouts/about.njk
title: About
pageTitle: Hello, I'm Chris (he/him)
subtitle: A designer turned developer who loves building on the web.
summary: Learn more about Christopher Kirk-Nielsen
permalink: /about/
facts:
    - ❤️ Appreciates you reading through these facts.
    - 👀 Kinda knows the Cyrillic alphabet enough to read — but not understand — sentences.
    - 🕰 Favourite movie is Back to the Future, most likely.
    - ☕️ Used to drink lots of tea, but now it's coffee!
    - 🤓 Enjoys maths/physics YouTube videos despite not understanding everything.
    - 🛹 Practiced skateboarding for a little, then decided playing Tony Hawk was safer.
    - ⛰ Truly wishes to be a more outdoorsy person (help).
    - 🐈 Loves animals, please introduce your pet.
    - 😴 Sleeps on his side but wakes up on his back.
    - 🎸 Favourite band is Thrice, just ask for a recommendation!
i18n:
    page:
        randomFact: "Click here to get a random fact about me"
        vhsImageAlt: "A VHS tape design inspired by {{ name }}"
        mugImageAlt: "A plain mug with a {{ name }} on it"
        profile: "Half of Chris's head outlined, with nose, glasses, eyebrows and beard drawn"
---

**I'm a <span class="about-country" data-flag="🇫🇷" data-icon="🥖">French</span> <span class="about-country" data-flag="🇩🇰" data-icon="🧜‍♀️">Dane</span> living in the <span class="about-country" data-flag="🇺🇸" data-icon="🏈">United States</span> who used to be a designer and who now likes to code. You want to know more? Well, be my guest!**

{% include 'components/about/random-fact.njk' %}


## Typing away, every day

<div class="about-first">
{%- set profile %}{% include 'components/about/ckn-profile.njk' %}{% endset -%}
{{- profile | htmlmin | safe }}

While front-end development is my focus nowadays, I grew up thinking I'd be a designer after playing with Microsoft Paint and then Photoshop (with a *totally* valid licence). I dabbled in code on MySpace and eventually made my own site (I even paid for a domain and hosting!), calling myself a **"webmaster"** before I even had zits on my face — the hubris. I ended up **studying graphic design for 4 years** then freelanced for neat clients on video editing, ad banners, and "immersive" pages.

</div>

Writing code and having a thing show up on the screen felt (and still feels) a little like <em class="about-emoji" data-emoji="✨">magic</em>, so I pursued that. Currently, I work at MOJO PSG as a senior front-end dev with a wonderful team, trying to make **accessible and performant** web pages, and learning new things in this constantly evolving field while having fun with CSS.

{% include 'components/about/visubezier.njk' %}

<p data-about="opensource">
I have contributed to a few open source projects, but only in small ways; if it counts, this little VS Code extension of mine called <a href="https://marketplace.visualstudio.com/items?itemName=chriskirknielsen.visubezier">VisuBezier</a> to preview CSS easings is great, in my unbiased and trustworthy opinion. And I've been lucky enough to be featured on sites like <a href="https://css-tricks.com/author/chriskirknielsen/">CSS-Tricks</a> and <a href="https://www.smashingmagazine.com/author/chriskirknielsen/">Smashing Magazine</a>, if you can believe it!</p>
</p>

## Still creative, on occasion

<p data-about="creative">
When inspiration strikes, <strong>I like to create designs</strong> that might look good on a t-shirt — still getting those creative juices flowing! You can check all those out in the <a href="/designs/">Designs "Shop"</a> if you're interested; it's got lots of dev-related designs, and a few <em class="about-emoji" data-emoji="🌴">'80s aesthetics</em> (my favourite!). I also to play a video games from time to time and enjoy movies, so if you want to make my day, a movie quote might work (or puns — <em>I really love puns</em>). You might like to know that <a href="/fonts/">I've created some typefaces</a> — I consider myself a font nerd and will (try to) recognise the font used for every logo until my last breath.
</p>

<p class="about-quotebox">They used frickin’ Helvetica again! They can’t keep getting away with it!</p>

{% include 'components/about/vhs.njk' %}

I am also a music enthusiast! I listen to a lot of things, however rock- and electronica-oriented styles take up most of my playlists. I have a project called [Chronoise](https://chronoise.com) for my mediocre musical musings that I haven't actively worked on in years but it sounds neat to say you write music. I need to get back into that because *synthesisers are incredibly fun*. Plus, my guitar skills are lacking, computers help me feel competent!

## About me, not my marketable skills

<p class="about-quotebox" data-about="personal">My English accent is weird and kind of all over the place.</p>

<p>
I mostly grew up in Lyon, France, to Danish parents. I did spend a year in Australia as a kid, speaking English with an Aussie accent, and even held a baby koala. As a result, <strong>three languages</strong> keep overriding each other; it's not confusing at all. I do know a decent amount of Italian but lose all composure speaking to natives — <em lang="it" class="about-emoji" data-emoji="🤌">che peccato!</em> I studied Japanese in high-school, at peak slacking-off mentality, so I'm not good at it, but DuoLingo is <del>trying</del> threatening to help. Anyways, I like languages!
</p>

## Speaking of skills…

I am a professional, as proven by the fact I have a [LinkedIn profile](https://www.linkedin.com/in/chriskirknielsen/) that I ignore. I can *program in HTML, CSS,* JavaScript, PHP, and MySQL, I favour the **Jamstack** for static sites, like Eleventy or Hugo, but I'm equally comfortable with a **WordPress** setup, all versioned in repositories. You'll also find that the **Adobe Creative Suite** is dear to me; my usual suspects are Photoshop, Illustrator, and After Effects. Oh, and I'm a French/Danish dual-citizen, and a US "Green Card" holder.

## Fancy a chat?

<p data-about="contact">
If you got through this and thought “Wow I need to talk to Chris!”, I’ll take the compliment. You can send me a tweet <a href="https://twitter.com/ckirknielsen">@ckirknielsen</a>, or email me if needed at <code>chriskirknielsen[at]gmail[dot]com</code>!
</p>

<p class="about-quotebox">Unknown phone numbers give me anxiety.</p>