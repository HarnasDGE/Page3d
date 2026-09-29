// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// Fully static build (dist/) for Cloudflare Pages. Server-side logic lives in
// Pages Functions under /functions (e.g. the contact form endpoint).
export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});
