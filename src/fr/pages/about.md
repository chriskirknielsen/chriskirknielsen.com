---
layout: layouts/about.njk
title: À Propos
pageTitle: Salut, moi c'est Chris (il/lui)
subtitle: Un graphiste devenu développeur qui adore construire sur le web.
summary: En apprendre plus sur Christopher Kirk-Nielsen
permalink: /fr/a-propos/
facts:
    - ["👀", "Connaît juste assez l'alphabet cyrillique pour le lire mais pas comprendre."]
    - ["🕰", "Retour Vers Le Futur est probablement son film préféré."]
    - ["☕️", "Avait l'habitude de boire du thé, maintenant c'est du café !"]
    - ["🤓", "Aime regarder des vidéos YouTube de maths et physique malgré ne pas tout comprendre."]
    - ["🛹", "Faisait du skateboard pendant un temps puis a décidé que jouer à Tony Hawk était plus sûr."]
    - ["⛰", "Aimerait vraiment être une personne plus fréquemment dehors (à l'aide)."]
    - ["🏃‍♂️", "Se fait un jogging quelques fois par semaine mais loin d'être prêt pour un marathon."]
    - ["🐈", "Adore les animaux, merci de présenter votre chien."]
    - ["😴", "Dort sur son côté mais se réveille sur son dos."]
    - ["📚", "Aime apprendre mais aussi aider — n'hésitez pas à demander !"]
    - ["🎸", "Thrice est son group préféré, n'hésitez pas à demander une recommandation !"]
    - ["🤭", "A une passion pour les jeux de mots, rigolos ou non !"]
    - ["🔢", "Aime prendre une petite pause Sudoku ça et là."]
    - ["👾", "Connaît le code Konami, ceci n'est pas du tout un indice."]
    - ["💜", "Apprécie que vous lisiez ces faits."]
i18n:
    page:
        randomFacts: "Cliquez ici pour découvrir des faits aléatoires me concernant"
        vhsImageAlt: "Une face avant de boîte VHS inspiré par le {{ name }}"
        mugImageAlt: "Une tasse banale avec un design {{ name }} dessus"
        profile: "Moitié du visage de Chris avec le contour de sa tête, son nez, ses lunettes, sourcils et barbe dessinés"
        synth:
            skipButtons: "Sauter après les contrôles du synthé"
            label: "Synthétiseur"
            instructions: "Maintenez la touche <kbd>Maj</kbd> pour changer d'octave"
            keyboardMode: "Type de Clavier"
---

<p class="u-fontWeight-bold">Je suis un <span class="about-country" data-flag="🇫🇷" data-icon="🥖">franco</span>-<span class="about-country" data-flag="🇩🇰" data-icon="🧜‍♀️">danois</span> vivant aux <span class="about-country" data-flag="🇺🇸" data-icon="🏈">États-Unis</span> qui était graphiste et qui aime désormais coder.</p>

{% include 'components/about/random-fact.njk' %}

## Christopher, un développeur

<div class="about-first">
{%- set profile %}{% include 'components/about/ckn-profile.njk' %}{% endset -%}
{{- profile | htmlmin | safe }}

Étant gamin, je passais des heures sur Microsoft Paint, jusquà ce que je découvre Photoshop (avec une licence *totalement* valide). J'ai appris à personnaliser des pages MySpace et j'ai fini par créer mes propres sites. J'ai même dépensé de l'argent sur un domaine et un hébergement, me proclamant **"webmaster"** avant mon premier bouton d'acné — quelle audace. Après le bac, j'ai suivi **4 ans d'études de graphisme**, puis j'ai travaillé en freelance pour des clients de renom à jongler entre du design, du montage vidéo et du code, avant de me concentrer sur le **développement sur le web.**

</div>

Écrire des lignes de code et voir quelque chose apparaître à l'écran était (et est toujours) un peu <em class="about-emoji" data-emoji="✨">magique</em>. Actuellement, je travaille chez MOJO comme développeur front-end senior avec une merveilleuse équipe, m'efforçant à créer des sites **accessibles et optimisés**, tout en apprenant de nouvelles choses dans ce domaine en perpétuelle évolution.

{% include 'components/about/visubezier.njk' %}

<p data-about="opensource">
J'ai contribué à quelques projets open source mais rien de folichon ; si ça compte, cette petite extension pour VS Code nommée <a href="/projects/visubezier/">VisuBezier</a> pour visualiser les courbes de lissages en CSS que j'ai créée vaut le coup d'œil. Et j'ai la chance d'avoir été publié sur des sites tels que <a href="https://css-tricks.com/author/chriskirknielsen/">CSS-Tricks</a> et <a href="https://www.smashingmagazine.com/author/chriskirknielsen/">Smashing Magazine</a>, si vous arrivez à le croire&nbsp;!
</p>

## Créatif quand inactif

<p data-about="creative">
Quand je me sens inventif, <strong>j'aime créer des illustrations</strong> qui passeraient bien sur un t-shirt — la passion créative&nbsp;! Vous pouvez voir tout ce beau monde dans la <a href="/designs/">"Boutique"</a> si ça vous chante ; des designs de dev et un peu inspiré par <em class="about-emoji" data-emoji="🌴">les années 80</em> (un style favori&nbsp;!). J'adore les films et apprécie un bon jeu vidéo par moments, alors si vous souhaitez me faire sourire, une citation de film devrait le faire. Si ça vous intéresse, <a href="/fonts/">j'ai créé des polices d'écriture</a> — je suis un peu un mordu de typo qui tentera de reconnaître la police utilisée dans chaque logo jusqu'à son trépas&nbsp;!
</p>

<p class="about-quotebox">Ils ont encore utilisé de la foutue Helvetica&nbsp;! Ils peuvent pas continuer comme ça&nbsp;!</p>

{% include 'components/about/vhs.njk' %}

Surprise, j'aime la musique&nbsp;! J'écoute beaucoup de styles mais mes playlists tournent largement autour du (post-)rock et de la musique électronique. [Chronoise](https://chronoise.com) est mon projet pour mes modestes mélodies que je n'ai pas touché depuis des années mais bon, peut-être en {{ metadata.currentYear + 1 }}. C'est reposant de jouer un peu de guitare et je trouve que d'expérimenter avec un *synthé est super chouette*. <span class="nojs-hidden">Sérieusement, essayez par vous-même&nbsp;:</span>

{% include 'components/about/synth.njk' %}

## Des infos perso

<p class="about-quotebox" data-about="personal">Mon accent anglais est bizarre et un peu mixte, sans passer par la France.</p>

<p>
J'ai principalement grandi à Lyon, en France, avec mes parents danois. L'Australie a aussi été ma maison pendant un an quand j'étais petit, apprenant l'anglais avec l'accent du coin, et j'ai même tenu un bébé koala. Par conséquent, si je sors un mot dans une autre langue, c'est que <strong>trois langues</strong> se mélangent fréquemment dans mon crâne chauve. Je connais pas mal d'italien mais je perds mes moyens quand je parle à une personne locale — <em lang="it" class="about-emoji" data-emoji="🤌">che peccato!</em> J'ai étudié le japonais au lycée mais n'étais pas studieux donc je suis mauvais mais DuoLingo <del>essaie</del> menace d'y remédier. Bref, les langues étrangères sont fascinantes&nbsp;!
</p>

## Un réel professionnel

Je suis un vrai pro, prouvé par le fait que j'ai un [profil LinkedIn](https://www.linkedin.com/in/chriskirknielsen/) que je ne consulte jamais. Je sais programmer *en HTML, CSS, JavaScript, PHP et MySQL*, j'aime la **Jamstack** pour les sites statiques, comme Eleventy ou Hugo, et je suis tout aussi à l'aise avec un site **WordPress**. Sachez que la **suite Adobe** me tient à cœur, avec Photoshop, Illustrator et After Effects étant de bons amis. Ah, et je détiens la double-nationalité franco-danoise et une "Green Card" américaine (les joies de la paperasse).

## Pour discuter, c'est au clavier

<p data-about="contact">
Si vous souhaitez me parler, vous pouvez envoyer un message via <a href="https://{{ metadata.author.mastodonInstance }}/@{{ metadata.author.mastodon }}">@chriskirknielsen</a> ou envoyer un e-mail si besoin à <code><code>chriskirknielsen<wbr><span class="visually-hidden" aria-hidden="true" style="user-select:none;">contact</span>[arobase]gmail<wbr>[point]com</code></code> !
</p>

<p class="about-quotebox">Les numéros inconnus me mettent la pression.</p>