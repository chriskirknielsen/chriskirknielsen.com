---
layout: layouts/about.njk
title: About
pageTitle: Hello, I'm Chris (he/him)
subtitle: A designer turned developer who loves building on the web.
summary: Learn more about Christopher Kirk-Nielsen
permalink: /about/
facts:
    - ["👀", "Kinda knows the Cyrillic alphabet enough to read — but not understand — sentences."]
    - ["🕰", "Favourite movie is likely Back to the Future, though the dad is a creep."]
    - ["☕️", "Used to drink lots of tea, but now it's coffee!"]
    - ["🤓", "Enjoys maths/physics YouTube videos despite not grasping everything."]
    - ["🛹", "Practiced skateboarding for a while, then decided playing Tony Hawk was safer."]
    - ["⛰", "Truly wishes to be a more outdoorsy person (help)."]
    - ["🏃‍♂️", "Runs a few times a week, but still far from marathon-ready."]
    - ["🐈", "Loves animals, please introduce your pet."]
    - ["😴", "Sleeps on his side but wakes up on his back."]
    - ["📚", "Loves learning but also helping — ask away about anything!"]
    - ["🎸", "Favourite band is Thrice, just ask for a recommendation!"]
    - ["👾", "Knows the Konami code, totally not a hint."]
    - ["💜", "Appreciates you reading through these facts."]
i18n:
    page:
        randomFacts: "Click here to get random facts about me"
        vhsImageAlt: "A VHS tape design inspired by {{ name }}"
        mugImageAlt: "A plain mug with a {{ name }} on it"
        profile: "Half of Chris's head outlined, with nose, glasses, eyebrows and beard drawn"
        synth:
            skipButtons: "Skip synth controls"
            label: "Synthesiser"
            instructions: "Hold the <kbd>Shift</kbd> key to shift octaves"
            keyboardMode: "Keyboard Layout"
---

<p class="u-fontWeight-bold">I'm a <span class="about-country" data-flag="🇫🇷" data-icon="🥖">French</span> <span class="about-country" data-flag="🇩🇰" data-icon="🧜‍♀️">Dane</span> living in the <span class="about-country" data-flag="🇺🇸" data-icon="🏈">USA</span> who used to be a designer and who now likes to code.</p>

{% include 'components/about/random-fact.njk' %}


## Typing away, every day

<div class="about-first">
{%- set profile %}{% include 'components/about/ckn-profile.njk' %}{% endset -%}
{{- profile | htmlmin | safe }}

As a kid, I spent hours on Microsoft Paint, until I discovered Photoshop (I had a *totally* valid licence). I learned some code to customise MySpace pages, and eventually made my own websites. I even paid for domains and hosting, and proclaimed myself **"webmaster"** before I even had zits — the hubris. After graduating, I **studied graphic design** for 4 years, then did some freelancing, juggling between design work, video editing, and code for a few years with neat clients, before focusing on **web development.**

</div>

Writing code and having a thing show up on the screen felt (and still feels) a little like <em class="about-emoji" data-emoji="✨">magic</em>. Currently, I work at MOJO PSG as a senior front-end dev with a wonderful team, striving to make **accessible and performant** web pages, and learning new things in this constantly evolving field.

{% include 'components/about/visubezier.njk' %}

<p data-about="opensource">
I have contributed to a few open source projects, but only in small ways; if it counts, this little VS Code extension of mine called <a href="https://marketplace.visualstudio.com/items?itemName=chriskirknielsen.visubezier">VisuBezier</a> to preview CSS timing functions is worth a look. And I've been lucky enough to be featured on sites like <a href="https://css-tricks.com/author/chriskirknielsen/">CSS-Tricks</a> and <a href="https://www.smashingmagazine.com/author/chriskirknielsen/">Smashing Magazine</a>, if you can believe it!
</p>

## Still creative, on occasion

<p data-about="creative">
When inspiration strikes, <strong>I like to create designs</strong> that might look good on a t-shirt — still getting those creative juices flowing! You can check all those out in the <a href="/designs/">Designs "Shop"</a> if you're interested; it's got lots of dev-related designs, and a few <em class="about-emoji" data-emoji="🌴">'80s aesthetics</em> (my favourite!). I also enjoy movies and play video games from time to time, so if you want to make my day, a movie quote might work (or puns… <em>I really love puns</em>). You might want to know that <a href="/fonts/">I've created a few typefaces</a> — I consider myself a font nerd and will (try to) recognise the font used for every logo until my last breath.
</p>

<p class="about-quotebox">They used frickin’ Helvetica again! They can’t keep getting away with it!</p>

{% include 'components/about/vhs.njk' %}

Surprise, I like music! I listen to a lot of things, however, my playlists are largely (post-)rock and electronica flavoured. [Chronoise](https://chronoise.com) is a project for my mediocre musical musings that I haven't actively worked on in a while, but maybe in {{ metadata.currentYear + 1 }}. It's relaxing to play a little bit of guitar, and I find experimenting with *synthesisers incredibly fun*. <span class="nojs-hidden">Seriously, try it:</span>

{% include 'components/about/synth.njk' %}

## French… Dane?

<p class="about-quotebox" data-about="personal">My English accent is weird and kind of all over the place. But it's not French.</p>

<p>
I grew up in Lyon, France, to Danish parents. Australia was also my home for a year as a kid, speaking English with a Down Under accent, and I even held a baby koala. So if I blurt a word in French, sorry, <strong>three languages</strong> just keep blending in that bald head of mine. I do know a decent amount of Italian but lose all composure speaking to natives — <em lang="it" class="about-emoji" data-emoji="🤌">che peccato!</em> I took Japanese in high school, but didn't apply myself, so I'm not good at it, but DuoLingo is <del>trying</del> threatening to help. Anyways, I find languages fascinating!
</p>

## Profesh A.F.

I am a professional, as proven by the fact I have a [LinkedIn profile](https://www.linkedin.com/in/chriskirknielsen/) that I ignore. I can write in *HTML, CSS, JavaScript, PHP, and MySQL*; I favour the **Jamstack** for static sites, like Eleventy or Hugo, but I'm equally comfortable with a **WordPress** setup, neatly tracked in a repository. You'll also find that the **Adobe Creative Suite** is dear to me; my usual suspects are Photoshop, Illustrator, and After Effects. Oh, and I'm a French/Danish dual-citizen, and a US "Green Card" holder (yay, paperwork!).

## Fancy a chat?

<p data-about="contact">
If you feel like reaching out to me, you can send me a message <a href="https://{{ metadata.author.mastodonInstance }}/@{{ metadata.author.mastodon }}">@chriskirknielsen</a>, or email me if needed at <code>chriskirknielsen<wbr><span class="visually-hidden" aria-hidden="true" style="user-select:none;">contact</span>[at]gmail[dot]com</code>!
</p>

<p class="about-quotebox">Unknown phone numbers give me anxiety.</p>