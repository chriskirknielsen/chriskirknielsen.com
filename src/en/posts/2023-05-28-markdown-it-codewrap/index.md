---
title: "My plugin for Markdown-It: CodeWrap"
summary: 'My solution to adding "Copy" to markdown code blocks (and other things)'
tags:
    - markdown
    - plugin
    - oss
    - eleventy
toc: true
---

## Motivation

I've just released a plugin for Markdown-It. I wanted to have tighter control over how my code blocks were displayed on my site, adding a "Copy" button as well.

Maybe it's over-engineered. Maybe it's a niche need. But I certainly don't want to have to loop over my compiled code and edit every block to add a button to it. And given the options I saw weren't sufficient for me in terms of customisation, well, here we are.

## Where to get it

It is available as [an NPM package](https://www.npmjs.com/package/markdown-it-codewrap) and you can submit feedback in [the GitHub repository](https://github.com/chriskirknielsen/markdown-it-codewrap).

To install it, you can run the following command (you'll need `markdown-it` as well):

```
npm install markdown-it markdown-it-codewrap
```

## Eleventy customisations

Now, if I say customisation, you say "Eleventy"! At least I do… anyways! You can give the plugin a big ol' configuration object to customise the codeblock wrapper, the button, the copy button and even add a "toolbar". You can find a list of the options on the aforementioned NPM or GitHub links.

For this site, the configuration looks like this (and look, you can copy it!):

```js:.eleventy.js
const markdownIt = require('markdown-it');
const markdownItCodeWrap = require('markdown-it-codewrap');

module.exports = function(eleventyConfig, options = {}) {
    let markdownItOptions = {
        html: true,
        breaks: true,
        linkify: true,
    };
    
    let markdownItCodeWrapOptions = {
        wrapTag: 'figure',
        wrapClass: 'codeblock-wrap | content-wide',
        hasToolbar: true,
        hasCopyButton: true,
        toolbarTag: 'figcaption,
        toolbarClass: 'codeblock-toolbar',
        toolbarLabel: (tokens, idx, options, env, self) => {
            // If a "filename" is provided, isolate it
            if (tokens[idx].info.includes(':')) {
                const [lang, filename] = tokens[idx].info.split(':');
                tokens[idx].info = lang || 'text'; // Reset to a "normal" type
                tokens[idx]._filename = filename; // Create a private property
            }

            let toolbarLabel = '';
            let syntaxType = tokens[idx].info;

            if (!syntaxType || syntaxType === 'text') {
                toolbarLabel = tokens[idx]?._filename || '';
            } else if (tokens[idx]?._filename) {
                toolbarLabel = tokens[idx]._filename.includes('.') ? tokens[idx]._filename : tokens[idx]._filename + '.' + syntaxType;
            } else {
                switch (syntaxType) {
                    case 'js': {
                        toolbarLabel = 'JavaScript';
                        break;
                    }
                    default: {
                        toolbarLabel = syntaxType.toUpperCase();
                        break;
                    }
                }
            }

            return `<span class="codeblock-lang">${toolbarLabel}</span>`;
        },
        isButtonInToolbar: true,
        copyButtonAttrs: {
            class: 'codeblock-copy',
            'data-codewrap-copy-button': '',
        },
        copyButtonLabel: (tokens, idx, options, env, self) => {
            return `<span class="codeblock-copy__idle">${'📋 ' + (env?.i18n?.codeBlock?.copyLabel || 'Copy')}</span>
            <span class="codeblock-copy__copied">${'👍 ' + (env?.i18n?.codeBlock?.copiedLabel || 'OK')}</span>`;
        },
        inlineCopyHandler: false,
    };

    eleventyConfig.setLibrary('md',
        markdownIt(markdownItOptions).use(markdownItCodeWrap, markdownItCodeWrapOptions)
    );
}
```

Thanks to how `tokens[idx].info` is handled, I can actually type `` ```js:.eleventy.js`` and it will change the toolbar to `.eleventy.js` instead of simply "JS" (or JavaScript with that `switch` case). This is _not_ standard (which is also why the `info` property is reset after parsing the filename) and only a little nicety I'm adding for me, which is why it is not part of the plugin's code.

Given I set `inlineCopyHandler: false`, the `onclick` handler on the button is gone. So now I need to set up my own handler. In Eleventy, I do this with a transform that checks if a button exists, or rather, in this case, a specific data attribute, `data-codewrap-copy-button`. (there would be other ways to do this but this is the easiest) If that string exists (which I don't use anywhere else — the button gets its own CSS class name), I can assume there is a copy button in a code block, and inject a script in the `<head>`. Note that I actually use a slightly different approach, but the end result is pretty much the same:

```js:.eleventy.js
// Add this within the existing module.exports!
eleventyConfig.addTransform('mdit-codewrap-click-handler', function(content, outputPath) {
    if (!outputPath.endsWith('.html') || !content.includes(' data-codewrap-copy-button=')) {
        return content; // Not HTML, or no codeblocks with a copy button: return raw content
    }
    
    // Create a script tab with the click handler (yes, JS-in-JS is a little wild, I agree)
    const codeCopyHandler = `<script>
    if (navigator.clipboard.writeText) {
        document.addEventListener('click', function (e) {
            const copyButton = e.target.closest('.codeblock-copy');
            if (!copyButton) {
                return;
            }
            const codeBlock = copyButton.closest('.codeblock-wrap').querySelector('code');
            if (!codeBlock) {
                return;
            }
            const copyAction = navigator.clipboard.writeText(codeBlock.innerText);
            copyButton.classList.add('is-copied');
            copyAction.then(() => {
                setTimeout(() => {
                    copyButton.classList.remove('is-copied');
                    copyButton.blur();
                }, 2000);
            });
        });
    } else {
        Array.from(document.querySelectorAll('.codeblock-copy')).forEach((btn) => (btn.hidden = true));
    }
    </script>`;

    // Find the </head> tag index
    const headEndIndex = content.indexOf('</head>');

    // Inject the copy handler function right before </head>
    return content.substr(0, headEndIndex) + codeCopyHandler + content.substr(headEndIndex);
});
```

Give it a go, let me know what you think, and if you see any missing features that could be added!