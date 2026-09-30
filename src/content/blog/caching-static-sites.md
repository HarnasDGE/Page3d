---
title: Caching strategies for static sites
description: Headers and CDN rules that make repeat visits almost free.
pubDate: 2026-04-28
category: performance
tags: [caching, cdn]
---

Headers and CDN rules that make repeat visits almost free.

## Hashed assets forever

Files with a content hash in the name can be cached for a year with `immutable`.

## HTML stays fresh

Pages get a short max-age plus `stale-while-revalidate`, so users see updates quickly without waiting on the network.

## Purge on deploy

Let the CDN purge automatically when a new build goes live.
