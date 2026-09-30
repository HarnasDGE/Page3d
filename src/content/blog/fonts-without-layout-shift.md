---
title: Loading web fonts without layout shift
description: How to keep custom typography from pushing your content around.
pubDate: 2026-05-20
category: performance
tags: [fonts, cls]
---

How to keep custom typography from pushing your content around.

## Self-host and subset

Ship only the weights and character sets you use. A Latin subset of a variable font is often under 30 kB.

## Match the fallback

Use `size-adjust` and `ascent-override` so the fallback font takes the same space as the web font.

## Preload the one that matters

Preload the font used above the fold, and nothing else.
