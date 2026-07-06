import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  integrations: [
    solidJs(),
    tailwind(),
  ],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru', 'tr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: 'static',
});
