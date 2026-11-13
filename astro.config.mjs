// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://njason.dev',
  output: 'static',
  // every page but the 404, which search engines should never list (plan Task 7)
  integrations: [sitemap({ filter: (page) => !/\/404\/?$/.test(new URL(page).pathname) })],
  vite: { plugins: [tailwindcss()] },
});
