import pt from './pt.json';
import en from './en.json';
import es from './es.json';
import fr from './fr.json';
import de from './de.json';
import it from './it.json';
import ja from './ja.json';
import zh from './zh.json';
import ru from './ru.json';
import tr from './tr.json';
import nl from './nl.json';

export const languages = {
  pt: { label: 'Português', flag: '🇧🇷', translations: pt },
  en: { label: 'English', flag: '🇺🇸', translations: en },
  es: { label: 'Español', flag: '🇪🇸', translations: es },
  fr: { label: 'Français', flag: '🇫🇷', translations: fr },
  de: { label: 'Deutsch', flag: '🇩🇪', translations: de },
  it: { label: 'Italiano', flag: '🇮🇹', translations: it },
  ja: { label: '日本語', flag: '🇯🇵', translations: ja },
  zh: { label: '中文', flag: '🇨🇳', translations: zh },
  ru: { label: 'Русский', flag: '🇷🇺', translations: ru },
  tr: { label: 'Türkçe', flag: '🇹🇷', translations: tr },
  nl: { label: 'Nederlands', flag: '🇳🇱', translations: nl },
} as const;

export type Locale = keyof typeof languages;
export type TranslationKeys = typeof pt;

// Auxiliary types for typed access to nested structures
export type ProductTranslation = TranslationKeys['reports']['products'][keyof TranslationKeys['reports']['products']];
export type ReportCategories = TranslationKeys['reports']['categories'];
export type ReportTrust = TranslationKeys['reports']['trust'];

export const defaultLocale: Locale = 'pt';
export const supportedLocales = Object.keys(languages) as Locale[];

/**
 * Get translations for a locale
 */
export function getTranslations(locale: string): TranslationKeys {
  const lang = locale as Locale;
  return languages[lang]?.translations || languages[defaultLocale].translations;
}

/**
 * Get translation by dot-notation key
 * Usage: t('nav.home', 'pt') → "Início"
 */
export function t(key: string, locale: string): string {
  const translations = getTranslations(locale);
  const keys = key.split('.');
  let result: unknown = translations;

  for (const k of keys) {
    if (result && typeof result === 'object' && k in result) {
      result = (result as Record<string, unknown>)[k];
    } else {
      return key; // Fallback: return key itself
    }
  }

  return typeof result === 'string' ? result : key;
}

/**
 * Get locale from URL path (handles base path automatically)
 */
export function getLocaleFromPath(path: string): Locale {
  // Remove base path if present
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const cleanPath = base && path.startsWith(base) ? path.slice(base.length) : path;
  const segments = cleanPath.split('/').filter(Boolean);
  const first = segments[0] as Locale;
  return supportedLocales.includes(first) ? first : defaultLocale;
}

/**
 * Build localized path (works in both dev and production/GitHub Pages)
 */
export function localePath(path: string, locale: Locale): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/${locale}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Switch language while staying on the same page.
 * Extracts current route (without locale prefix) and rebuilds with new locale.
 * Usage in language switcher: href={switchLocalePath('en')}
 */
export function switchLocalePath(newLocale: Locale): string {
  if (typeof window === 'undefined') return localePath('/', newLocale);

  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  let currentPath = window.location.pathname;

  // Remove base prefix
  if (base && currentPath.startsWith(base)) {
    currentPath = currentPath.slice(base.length);
  }

  // Remove current locale prefix (e.g., /pt/chart/natal → /chart/natal)
  const segments = currentPath.split('/').filter(Boolean);
  if (segments.length > 0 && supportedLocales.includes(segments[0] as Locale)) {
    segments.shift();
  }

  const route = segments.length > 0 ? '/' + segments.join('/') : '/';
  return localePath(route, newLocale);
}
