import { defineConfig } from 'astro/config';
import solidJs from '@astrojs/solid-js';
import tailwind from '@astrojs/tailwind';

const isProd = process.env.CI === 'true';

export default defineConfig({
  site: 'https://SergioPacheco.github.io',
  base: isProd ? '/LifeMap' : '/',
  integrations: [
    solidJs(),
    tailwind(),
  ],
  i18n: {
    defaultLocale: 'pt',
    locales: ['pt', 'en', 'es', 'fr', 'de', 'it', 'nl', 'ja', 'zh', 'ru', 'tr'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  output: 'static',
});
