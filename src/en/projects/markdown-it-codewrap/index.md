---
title: markdown-it-codewrap
summary: A Markdown-It plugin to wrap custom markup around blocks of code, optionally adding a Copy button.
customMetaImage: markdown-it-codewrap-cover.png
externalUrl: https://github.com/chriskirknielsen/markdown-it-codewrap
date: 2023-05-28
projectButtonLabel: View plugin
---

I looked around for a [Markdown-It plugin](https://mdit-plugins.github.io/) that would allow me to wrap my code blocks in custom markup so that I could add a "Copy code" button, and perhaps do a few more things. While there are some out there, they didn't do exactly what I needed them too. So of course, I wrote my own plugin.

It basically wraps up code fences or code blocks, and with options you can determine if there should be a "toolbar" where you can display custom labels (like the language of the code in the block) and add the Copy button. You can also bypass the toolbar and inject the button at the end of the block instead. The button itself is also highly customisable (any attribute can be provided as well as the label) and by default, an `onclick` attribute is present to copy the code, which can be overwritten, or removed if you want to have a global `click` event handler in your page instead. And the labels/button attributes can be functions to change their contents based on the renderer context. Magic!

Below is a demo on how it runs on my site with custom CSS and script to handle clicks on the button:

```js
function whoIsAwesome() {
	return 'You are!';
}
```

I wrote [an article about this implementation](/blog/markdown-it-codewrap) if you're interested!
