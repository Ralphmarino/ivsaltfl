// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Use the URL Netlify is actually serving (its `URL` env var = the site's
// primary domain, i.e. your custom domain once set, otherwise the
// *.netlify.app address). This makes canonical links and social-share images
// resolve on whatever domain is live right now, and auto-switches to
// ivsaltfl.com when you make it the primary domain in Netlify. Falls back to
// the production domain for local builds.
const SITE = process.env.URL || 'https://ivsaltfl.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [
    react(),
    // Keep noindex utility pages (e.g. the share-only /consent link) out of the sitemap.
    sitemap({ filter: (page) => !page.includes('/consent') }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    // Emit clean, share-friendly URLs (/book instead of /book/index.html)
    format: 'directory',
  },
});
