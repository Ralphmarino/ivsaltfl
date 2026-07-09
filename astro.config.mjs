// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// The public production URL. Update if the domain changes.
const SITE = 'https://ivsaltfl.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Emit clean, share-friendly URLs (/book instead of /book/index.html)
    format: 'directory',
  },
});
