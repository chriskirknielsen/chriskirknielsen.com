---
title: 'Snippet: git switcheroo'
summary: Precompiled Sass and JS files that become part of the source folder.
tags:
    - snippet
    - git
templateEngineOverride: njk,md
original: https://tweets.chriskirknielsen.com/1573313737502515206/
originalTitle: From chriskirknielsen's tweet archive
---

I aliased a git command to move commits from one branch to another (usually `main` to `dev`). A bad idea? 🤷
```bash:.gitconfig
[alias]
switcheroo = "!f(){ git checkout ${3}; git cherry-pick ${1}; git checkout ${2}; git reset --hard HEAD~1; }; f"
```
Usage: `git switcheroo {COMMIT HASH} {SOURCE BRANCH} {TARGET BRANCH}`
➡️ e.g: `git switcheroo 7edaf7 main dev`