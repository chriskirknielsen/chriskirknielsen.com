---
layout: layouts/home.njk
title: Hjem
summary: Christopher Kirk-Nielsen, kreativ webdev
permalink: /da/
templateEngineOverride: njk,md
i18n:
    page:
        description: |
            Bare en
            Kreativ webdev
            uden priser
            der arbejder hos MOJO
            der bor i Cincinnati
        now:
            heading: 'Lige nu'
            bookLabel: 'Bog'
            gameLabel: 'Videospil'
            showLabel: 'TV Serier'
            seasonLabel: 'Sæson'
        quickAccess:
            heading: 'Hop ind'
            about:
                label: 'Alt for mange detaljer om mig'
                content: 'Hvis du vil lære lidt for meget om mig.'
            designs:
                label: 'Mine t-shirts og plakater'
                content: 'Jeg laver design, og jeg har en "shop": webdev, biograf/TV, videospil...'
            fonts:
                label: 'Mine få skrifttyper'
                content: 'Jeg elsker typografi og har selv lavet et par skrifttyper.'
            also:
                label: 'Mere…'
                usesPageLabel: 'Gear'
                nowPageLabel: 'Lige nu'
        writing:
            heading: 'Tanker til dine tanker'
            content: 'Jeg skriver ikke meget, men her er min seneste artikel. Jeg har også en RSS feed!'
            blogLabel: 'Se blog'
---

{% mdsafe %}
<h2>{{ 'page.now.heading' | i18n }} (<a href="/now/" class="heading-anchor">Now</a>)</h2>
<ul class="inline-list" role="list" style="--separator:radial-gradient(circle at 50%, currentColor 0.125em, transparent calc(0.125em + 1px))">
{% set nowBook = now.book | getFirst %}
{% if nowBook %}
    <li>
        <span aria-label="{{ 'page.now.bookLabel' | i18n }}">📚</span>&nbsp;{{ nowBook.title }}
        {% if nowBook.detail %}({{ nowBook.detail }}){% endif %}
    </li>
{% endif %}

{% set nowShow = now.show | getFirst %}
{% if nowShow %}
    <li>
        <span aria-label="{{ 'page.now.showLabel' | i18n }}">📺</span>&nbsp;{{ nowShow.title }}
        {% if nowShow.detail %}(<span arial-label="{{ 'page.now.seasonLabel' | i18n }}">S</span>{{ nowShow.detail }}){% endif %}
    </li>
{% endif %}

{% set nowGame = now.game | getFirst %}
{% if nowGame %}
    <li>
        <span aria-label="{{ 'page.now.gameLabel' | i18n }}">🕹️</span>&nbsp;{{ nowGame.title }}
        {% if nowGame.detail %}({{ nowGame.detail }}){% endif %}
    </li>
{% endif %}
</ul>
{% endmdsafe %}