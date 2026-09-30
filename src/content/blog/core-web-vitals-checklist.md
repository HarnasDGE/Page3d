---
title: 'Core Web Vitals in 2026: a practical checklist'
description: The fixes that move LCP, INP and CLS the most, in the order I apply them on client audits.
pubDate: 2026-07-02
category: performance
tags: [performance, seo]
---

Every audit I run follows roughly the same order. These are the changes with the best effort-to-impact ratio.

## Largest Contentful Paint (LCP)

1. Serve the hero image in AVIF/WebP with explicit `width` and `height`.
2. Preload the LCP image and the main web font.
3. Remove render-blocking third-party scripts from the `<head>`.

## Interaction to Next Paint (INP)

- Break long tasks with `scheduler.yield()` or `setTimeout` chunks.
- Defer analytics and chat widgets until after first interaction.
- Avoid huge React re-renders on every keystroke.

## Cumulative Layout Shift (CLS)

- Reserve space for ads, embeds and cookie banners.
- Use `font-display: optional` or size-adjusted fallbacks.

## Measure in the field

Lab scores are a start, but real-user data from CrUX or your own RUM tells you what visitors actually experience. Fix, deploy, then watch the 28-day trend.
