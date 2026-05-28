// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';

// On GH Pages without a custom domain, the site lives at
// https://starburst1977.github.io/portfolio/ — so we need a base path.
// When the svenread.com custom domain is wired up, switch to:
//   site: 'https://svenread.com',
//   base: '/',
export default defineConfig({
  site: 'https://starburst1977.github.io',
  base: '/portfolio',
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
