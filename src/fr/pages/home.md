---
layout: layouts/home.njk
title: Accueil
summary: Christopher Kirk-Nielsen, développeur créatif
permalink: /fr/
templateEngineOverride: njk,md
i18n:
    page:
        description: |
            Un
            développeur créatif
            sans récompense
            qui bosse chez MOJO
            situé à Cincinnati
        now:
            heading: 'En ce moment'
            bookLabel: 'Livre'
            gameLabel: 'Jeu vidéo'
            showLabel: 'Série télé'
            seasonLabel: 'Saison'
        quickAccess:
            heading: 'Accès Rapide'
            about:
                label: 'Trop de détails sur moi'
                content: 'Pour en apprendre un peu (ou beaucoup ?) sur moi, c’est par ici. C’est pour le moins… exhaustif.'
            designs:
                label: 'Mes t-shirts et affiches'
                content: 'Je crée des designs, et j’en ai fait une "boutique" : dev, cinéma, gaming…'
            fonts:
                label: 'Mes quelques typos'
                content: 'Ayant une passion pour les typos, voici quelques humbles police d’écriture.'
            also:
                label: 'Plus…'
                usesPageLabel: 'Matos'
                nowPageLabel: 'Maintenant'
        writing:
            heading: 'Des pensées pour vos pensées'
            content: 'J’écris de manière très irrégulière, histoire de sortir des idées de ma tête. Si vous voulez me lire, voici le dernier article. J’ai aussi un flux RSS pour les intéressé·e·s!'
            blogLabel: 'Visiter le blog'
---

<!-- Je m'appelle **Christopher Kirk-Nielsen** mais vous pouvez m'appeler **Chris**. Je suis un graphiste devenu développeur n'ayant remporté aucun prix qui adore coder sur le web qui travaille chez MOJO PSG. -->

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