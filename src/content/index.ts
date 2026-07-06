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
    // Other languages fall back to English until translated
    es: { /* falls back */ },
    fr: { /* falls back */ },
    de: { /* falls back */ },
    it: { /* falls back */ },
    nl: { /* falls back */ },
    tr: { /* falls back */ },
    ru: { /* falls back */ },
    zh: { /* falls back */ },
    ja: { /* falls back */ },
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
