// ============================================================
// INTERPRETATIONS LOADER — index.ts
// Fallback: locale → en → pt
// ============================================================

import * as pt from './pt';
import * as en from './en';
import * as es from './es';
import * as fr from './fr';
import * as de from './de';
import * as it from './it';
import * as nl from './nl';
import * as tr from './tr';
import * as ru from './ru';
import * as zh from './zh';
import * as ja from './ja';

// All available locale modules
const MODULES: Record<string, typeof pt> = { pt, en, es, fr, de, it, nl, tr, ru, zh, ja };

export type InterpLocale = 'pt' | 'en' | 'es' | 'fr' | 'de' | 'it' | 'nl' | 'tr' | 'ru' | 'zh' | 'ja';

export interface InterpretationTexts {
  SUN_IN_HOUSE: string[];
  MOON_IN_HOUSE: string[];
  MERCURY_IN_HOUSE: string[];
  VENUS_IN_HOUSE: string[];
  MARS_IN_HOUSE: string[];
  JUPITER_IN_HOUSE: string[];
  SATURN_IN_HOUSE: string[];
  URANUS_IN_HOUSE: string[];
  NEPTUNE_IN_HOUSE: string[];
  PLUTO_IN_HOUSE: string[];
  CHIRON_IN_HOUSE: string[];
  CHIRON_IN_SIGN: string[];
  NORTH_NODE_HOUSE: string[];
  NORTH_NODE_IN_SIGN: string[];
  SIGN_NAMES: string[];
  PLANET_NAMES: Record<string, string>;
  MONTHS: string[];
  SECTION_TITLES: Record<string, (...args: any[]) => string>;
  PLANET_SUBTITLES: Record<string, string>;
  LABELS: Record<string, string>;
  TRANSITIONS: Record<string, string>;
}

/**
 * Returns interpretation texts for the given locale.
 * Fallback: requested locale → 'en' → 'pt'
 */
export function getInterpretations(locale: string = 'pt'): InterpretationTexts {
  const mod = MODULES[locale] || MODULES.en || MODULES.pt;
  return {
    SUN_IN_HOUSE: mod.SUN_IN_HOUSE,
    MOON_IN_HOUSE: mod.MOON_IN_HOUSE,
    MERCURY_IN_HOUSE: mod.MERCURY_IN_HOUSE,
    VENUS_IN_HOUSE: mod.VENUS_IN_HOUSE,
    MARS_IN_HOUSE: mod.MARS_IN_HOUSE,
    JUPITER_IN_HOUSE: mod.JUPITER_IN_HOUSE,
    SATURN_IN_HOUSE: mod.SATURN_IN_HOUSE,
    URANUS_IN_HOUSE: mod.URANUS_IN_HOUSE,
    NEPTUNE_IN_HOUSE: mod.NEPTUNE_IN_HOUSE,
    PLUTO_IN_HOUSE: mod.PLUTO_IN_HOUSE,
    CHIRON_IN_HOUSE: mod.CHIRON_IN_HOUSE,
    CHIRON_IN_SIGN: mod.CHIRON_IN_SIGN,
    NORTH_NODE_HOUSE: mod.NORTH_NODE_HOUSE,
    NORTH_NODE_IN_SIGN: mod.NORTH_NODE_IN_SIGN,
    SIGN_NAMES: mod.SIGN_NAMES,
    PLANET_NAMES: mod.PLANET_NAMES,
    MONTHS: mod.MONTHS,
    SECTION_TITLES: mod.SECTION_TITLES as any,
    PLANET_SUBTITLES: mod.PLANET_SUBTITLES,
    LABELS: mod.LABELS as any,
    TRANSITIONS: mod.TRANSITIONS,
  };
}
