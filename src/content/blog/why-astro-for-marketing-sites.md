---
title: Why I build marketing sites with Astro
description: Shipping zero JavaScript by default changed how fast my client sites feel — here is why Astro became my default.
pubDate: 2026-08-18
tags: [astro, performance]
---

Most marketing sites are **content first**: a hero, a few sections, a blog and a contact form. Yet for years we shipped them as full single-page apps, sending hundreds of kilobytes of JavaScript to render text.

## Islands instead of apps

Astro renders everything to HTML at build time and only hydrates the interactive parts — the *islands*. A pricing toggle or a carousel gets its JavaScript; the rest of the page stays static.

- Faster first paint on slow phones
- Better Core Web Vitals without heroic optimisation
- Freedom to use React, Svelte or Vue where it actually helps

## Content collections keep editors happy

Typed content collections validate every post and page at build time. Pair them with a headless CMS and non-technical editors can publish without breaking layouts.

## When I don't use it

Highly interactive dashboards and apps with lots of client state still belong in a framework like Next.js. Pick the tool for the job — for brochure sites, that tool is usually Astro.
