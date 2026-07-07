// ============================================================
// CONTENT LOADER — Loads content by locale dynamically
// Supports all 11 languages from astro.com
// ============================================================

import type { Locale } from '../i18n';

// Supported locales (same as astro.com)
export const ALL_LOCALES = ['pt', 'en', 'es', 'fr', 'de', 'it', 'nl', 'tr', 'ru', 'zh', 'ja'] as const;
export type ContentLocale = typeof ALL_LOCALES[number];

/**
 * Load content module for a given locale and section.
 * Falls back to 'en' then 'pt' if locale not available.
 */
export async function getContent(locale: string, section: string): Promise<any> {
  const loaders: Record<string, Record<string, () => Promise<any>>> = {
    pt: {
      planets: () => import('./pt/planets').then(m => m.planets),
      signs: () => import('./pt/signs').then(m => m.signs),
      houses: () => import('./pt/houses').then(m => m.houses),
      aspects: () => import('./pt/aspects').then(m => m.aspects),
      learn: () => import('./pt/learn').then(m => m.learn),
      horoscope: () => import('./pt/horoscope').then(m => m.horoscope),
      chiron: () => import('./pt/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./pt/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./pt/new-moon').then(m => m.newMoon),
    },
    en: {
      planets: () => import('./en/planets').then(m => m.planets),
      signs: () => import('./en/signs').then(m => m.signs),
      houses: () => import('./en/houses').then(m => m.houses),
      aspects: () => import('./en/aspects').then(m => m.aspects),
      learn: () => import('./en/learn').then(m => m.learn),
      horoscope: () => import('./en/horoscope').then(m => m.horoscope),
      chiron: () => import('./en/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./en/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./en/new-moon').then(m => m.newMoon),
    },
    es: {
      planets: () => import('./es/planets').then(m => m.planets),
      signs: () => import('./es/signs').then(m => m.signs),
      houses: () => import('./es/houses').then(m => m.houses),
      aspects: () => import('./es/aspects').then(m => m.aspects),
      learn: () => import('./es/learn').then(m => m.learn),
      horoscope: () => import('./es/horoscope').then(m => m.horoscope),
      chiron: () => import('./es/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./es/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./es/new-moon').then(m => m.newMoon),
    },
    fr: {
      planets: () => import('./fr/planets').then(m => m.planets),
      signs: () => import('./fr/signs').then(m => m.signs),
      houses: () => import('./fr/houses').then(m => m.houses),
      aspects: () => import('./fr/aspects').then(m => m.aspects),
      learn: () => import('./fr/learn').then(m => m.learn),
      horoscope: () => import('./fr/horoscope').then(m => m.horoscope),
      chiron: () => import('./fr/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./fr/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./fr/new-moon').then(m => m.newMoon),
    },
    de: {
      planets: () => import('./de/planets').then(m => m.planets),
      signs: () => import('./de/signs').then(m => m.signs),
      houses: () => import('./de/houses').then(m => m.houses),
      aspects: () => import('./de/aspects').then(m => m.aspects),
      learn: () => import('./de/learn').then(m => m.learn),
      horoscope: () => import('./de/horoscope').then(m => m.horoscope),
      chiron: () => import('./de/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./de/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./de/new-moon').then(m => m.newMoon),
    },
    it: {
      planets: () => import('./it/planets').then(m => m.planets),
      signs: () => import('./it/signs').then(m => m.signs),
      houses: () => import('./it/houses').then(m => m.houses),
      aspects: () => import('./it/aspects').then(m => m.aspects),
      learn: () => import('./it/learn').then(m => m.learn),
      horoscope: () => import('./it/horoscope').then(m => m.horoscope),
      chiron: () => import('./it/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./it/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./it/new-moon').then(m => m.newMoon),
    },
    nl: {
      planets: () => import('./nl/planets').then(m => m.planets),
      signs: () => import('./nl/signs').then(m => m.signs),
      houses: () => import('./nl/houses').then(m => m.houses),
      aspects: () => import('./nl/aspects').then(m => m.aspects),
      learn: () => import('./nl/learn').then(m => m.learn),
      horoscope: () => import('./nl/horoscope').then(m => m.horoscope),
      chiron: () => import('./nl/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./nl/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./nl/new-moon').then(m => m.newMoon),
    },
    tr: {
      planets: () => import('./tr/planets').then(m => m.planets),
      signs: () => import('./tr/signs').then(m => m.signs),
      houses: () => import('./tr/houses').then(m => m.houses),
      aspects: () => import('./tr/aspects').then(m => m.aspects),
      learn: () => import('./tr/learn').then(m => m.learn),
      horoscope: () => import('./tr/horoscope').then(m => m.horoscope),
      chiron: () => import('./tr/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./tr/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./tr/new-moon').then(m => m.newMoon),
    },
    ru: {
      planets: () => import('./ru/planets').then(m => m.planets),
      signs: () => import('./ru/signs').then(m => m.signs),
      houses: () => import('./ru/houses').then(m => m.houses),
      aspects: () => import('./ru/aspects').then(m => m.aspects),
      learn: () => import('./ru/learn').then(m => m.learn),
      horoscope: () => import('./ru/horoscope').then(m => m.horoscope),
      chiron: () => import('./ru/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./ru/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./ru/new-moon').then(m => m.newMoon),
    },
    zh: {
      planets: () => import('./zh/planets').then(m => m.planets),
      signs: () => import('./zh/signs').then(m => m.signs),
      houses: () => import('./zh/houses').then(m => m.houses),
      aspects: () => import('./zh/aspects').then(m => m.aspects),
      learn: () => import('./zh/learn').then(m => m.learn),
      horoscope: () => import('./zh/horoscope').then(m => m.horoscope),
      chiron: () => import('./zh/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./zh/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./zh/new-moon').then(m => m.newMoon),
    },
    ja: {
      planets: () => import('./ja/planets').then(m => m.planets),
      signs: () => import('./ja/signs').then(m => m.signs),
      houses: () => import('./ja/houses').then(m => m.houses),
      aspects: () => import('./ja/aspects').then(m => m.aspects),
      learn: () => import('./ja/learn').then(m => m.learn),
      horoscope: () => import('./ja/horoscope').then(m => m.horoscope),
      chiron: () => import('./ja/chiron').then(m => m.chiron),
      planetaryCycles: () => import('./ja/planetary-cycles').then(m => m.planetaryCycles),
      newMoon: () => import('./ja/new-moon').then(m => m.newMoon),
    },
  };

  // Try requested locale
  const localeLoaders = loaders[locale];
  if (localeLoaders && localeLoaders[section]) {
    return localeLoaders[section]();
  }

  // Fallback to English
  if (loaders.en[section]) {
    return loaders.en[section]();
  }

  // Final fallback to Portuguese
  if (loaders.pt[section]) {
    return loaders.pt[section]();
  }

  return null;
}

/**
 * Synchronous content loader for Astro pages (uses static imports)
 * For use in .astro frontmatter where await is available
 */
export function getContentSync(locale: string, section: string): any {
  // This will be resolved at build time by Astro/Vite
  return getContent(locale, section);
}
