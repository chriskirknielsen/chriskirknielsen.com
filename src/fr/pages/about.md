---
layout: layouts/about.njk
title: À Propos
pageTitle: Salut, moi c'est Chris (il/lui)
subtitle: Un graphiste devenu développeur qui adore construire sur le web.
summary: En apprendre plus sur Christopher Kirk-Nielsen
permalink: /fr/a-propos/
facts:
    - 💜 Apprécie que vous lisiez ces faits
    - 👀 Connaît juste assez l'alphabet cyrillique pour le lire mais pas comprendre.
    - 🕰 Retour Vers Le Futur est probablement son film préféré.
    - ☕️ Avait l'habitude de boire du thé, maintenant c'est du café !
    - 🤓 Aime regarder des vidéos YouTube de maths et physique malgré ne pas tout comprendre.
    - 🛹 Faisait du skateboard pendant un temps puis a décidé que jouer à Tony Hawk était plus sûr.
    - ⛰ Aimerait vraiment être une personne plus fréquemment dehors (à l'aide).
    - 🐈 Adore les animaux, merci de présenter votre chien.
    - 😴 Dort sur son côté mais se réveille sur son dos.
    - 📚 Aime apprendre mais aussi aider — n'hésitez pas à demander !
    - 🎸 Thrice est son group préféré, n'hésitez pas à demander une recommandation !
    - 👾 Connaît le code Konami, ceci n'est pas du tout un indice.
i18n:
    page:
        randomFact: "Cliquez ici pour découvrir un fait aléatoire me concernant"
        vhsImageAlt: "Une face avant de boîte VHS inspiré par le {{ name }}"
        mugImageAlt: "Une tasse banale avec un design {{ name }} dessus"
        profile: "Moitié du visage de Chris avec le contour de sa tête, son nez, ses lunettes, sourcils et barbe dessinés"
        synth:
            label: "Synthétiseur"
            instructions: "Maintenez la touche <code>Maj</code> pour changer d'octave"
            keyboardMode: "Type de Clavier"
---

<p class="u-fontWeight-bold">Je suis un <span class="about-country" data-flag="🇫🇷" data-icon="🥖">franco</span>-<span class="about-country" data-flag="🇩🇰" data-icon="🧜‍♀️">danois</span> vivant aux <span class="about-country" data-flag="🇺🇸" data-icon="🏈">États-Unis</span> qui était graphiste et qui aime désormais coder.</p>

{% include 'components/about/random-fact.njk' %}

## Christopher, un développeur

<div class="about-first">
{%- set profile %}{% include 'components/about/ckn-profile.njk' %}{% endset -%}
{{- profile | htmlmin | safe }}

Bien que le développement front-end est mon activité principale ces jours-ci, étant petit je pensais devenir un graphiste après des heures sur Microsoft Paint puis Photoshop (avec une licence *totalement* valide). Je me suis aventuré dans du code sur MySpace et j'ai fini par créer mon propre site (dépensant de l'argent sur un domaine et un hébergement&nbsp;!), me proclamant **"webmaster"** avant mon premier bouton d'acné — l'audace&nbsp;!. J'ai fini par suivre **4 ans d'études de graphiste** et j'ai ensuite travaillé en freelance pour des clients de renom à faire du montage vidéo, des bannières publicitaires, ainsi que des pages "immersives".

</div>

Écrire des lignes de code et voir quelque chose apparaître à l'écran était, et est toujours, un peu <em class="about-emoji" data-emoji="✨">magique</em>, j'en ai donc fait mon boulot. Actuellement, je travaille chez MOJO comme développeur front-end senior avec une merveilleuse équipe, tentant de créer des sites **accessibles et optimisés**, apprenant de nouvelles choses constamment dans ce domaine en perpétuelle évolution tout en m'amusant avec le CSS.

{% include 'components/about/visubezier.njk' %}

<p data-about="opensource">
J'ai contribué à quelques projets open source mais rien de folichon ; si ça compte, j'ai crée une petite extension pour VS Code nommée <a href="https://marketplace.visualstudio.com/items?itemName=chriskirknielsen.visubezier">VisuBezier</a> pour visualiser les courbes de lissages en CSS, qui est bien utile, si je puis me permettre. Et j'ai la chance d'avoir été publié sur des sites tels que <a href="https://css-tricks.com/author/chriskirknielsen/">CSS-Tricks</a> et <a href="https://www.smashingmagazine.com/author/chriskirknielsen/">Smashing Magazine</a>, si vous arrivez à le croire&nbsp;!</p>
</p>

## Créatif quand inactif

<p data-about="creative">
Quand je me sens inventif, <strong>j'aime créer des illustrations</strong> qui passeraient bien sur un t-shirt — la passion créative&nbsp;! Vous pouvez voir tout ce beau monde dans la <a href="/designs/">"Boutique"</a> si ça vous chante ; des designs de dev et un peu inspiré par <em class="about-emoji" data-emoji="🌴">les années 80</em> (quelle esthétique&nbsp;!). J'apprécie un bon jeu vidéo par moments et adore regarder des films, alors si vous souhaitez me faire sourire, une citation de film devrait le faire (ou un jeu de mots, <em>je suis passionné de jeux de mots&nbsp;!</em>). Si ça vous captive, <a href="/fonts/">j'ai créé des polices d'écriture</a> — je suis un peu un mordu de typo qui tentera de reconnaître la police utilisée dans chaque logo jusqu'à son trépas&nbsp;!
</p>

<p class="about-quotebox">Ils ont encore utilisé de la foutue Helvetica&nbsp;! Ils peuvent pas continuer comme ça&nbsp;!</p>

{% include 'components/about/vhs.njk' %}

Je suis aussi un fan de musique&nbsp;! Mes satiétés sonores tournent principalement autour du rock et de la musique électronique. J'ai un projet nommé [Chronoise](https://chronoise.com) pour mes modiques minces mélodies que je n'ai pas touché depuis des années mais bon, c'est tendance de dire que je fais de la musique. Je trouve que *les synthés sont super chouettes* et jouer quelques accords sur la guitare de temps en temps, même si je suis assez novice, est reposant.

    {% include 'components/about/synth.njk' %}

## Des infos perso

<p class="about-quotebox" data-about="personal">Mon accent anglais est bizarre et un peu mixte sans passer par la France.</p>

<p>
J'ai principalement grandi à Lyon, en France, avec mes parents danois. J'ai passé une année en Australie étant petit, apprenant l'anglais avec l'accent du coin, et j'ai même tenu un bébé koala. Par conséquent, <strong>trois langues</strong> se battent pour le contrôle de ma matière grise ; c'est sympa. Je connais pas mal d'italien mais je perds mes moyens quand je parle à une personne locale — <em lang="it" class="about-emoji" data-emoji="🤌">che peccato!</em> J'ai étudié le japonais au lycée, quand j'étais glandeur donc je suis mauvais mais DuoLingo <del>essaie</del> menace d'y remédier. Bref, les langues étrangères sont fascinantes&nbsp;!
</p>

## Un réel professionnel

Je suis un vrai pro, prouvé par le fait que j'ai un [profil LinkedIn](https://www.linkedin.com/in/chriskirknielsen/) que je ne consulte jamais. Je sais programmer *en HTML, CSS, JavaScript, PHP et MySQL*, j'aime la **Jamstack** pour les sites statiques, comme Eleventy ou Hugo, et je suis tout aussi à l'aise avec un site **WordPress**. Sachez que la **suite Adobe** me tient à cœur, avec Photoshop, Illustrator et After Effects étant de bons amis. Ah, et je détiens la double-nationalité franco-danoise et une "Green Card" américaine.

## Pour discuter, c'est au clavier

<p data-about="contact">
Si vous avez lu tout ceci et pensez "Wow il faut que je discute avec Chris&nbsp;!", je suis flatté. Vous pouvez envoyer un tweet <a href="https://twitter.com/ckirknielsen">@ckirknielsen</a> ou envoyer un e-mail à <code><code>chriskirknielsen<wbr><span class="visually-hidden" aria-hidden="true" style="user-select:none;">contact</span>[arobase]gmail<wbr>[point]com</code></code> !
</p>

<p class="about-quotebox">Les numéros inconnus me mettent la pression.</p>