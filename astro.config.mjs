// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  output: 'static',
  site: 'https://john6810.github.io',
  base: '/chihiro-web',
  vite: {
    plugins: [tailwindcss()],
  },
});
