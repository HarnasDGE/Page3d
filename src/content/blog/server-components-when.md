---
title: 'React Server Components: when they help'
description: Where RSC pays off and where a simpler approach wins.
pubDate: 2026-04-09
category: frontend
tags: [react]
---

Where RSC pays off and where a simpler approach wins.

## Great for data-heavy pages

Fetching on the server removes waterfalls and ships less JavaScript.

## Not needed for brochure sites

If a page is mostly static, Astro or plain HTML is simpler and faster.

## Mind the boundary

Keep interactive components small and push `use client` as deep into the tree as you can.
