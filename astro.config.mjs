// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import mdx from '@astrojs/mdx';

// https://astro.build/config
export default defineConfig({
  site: 'https://username.github.io',
  base: '/whimsy-hub',

  integrations: [
    vue(),
    tailwind(),
    mdx(),
  ],

  output: 'static',

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
