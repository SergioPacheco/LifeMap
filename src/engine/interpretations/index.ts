// ============================================================
// INTERPRETATIONS — Loader (index.ts)
// ============================================================

import * as pt from './pt';
import * as en from './en';
import * as es from './es';

export type InterpLocale = 'pt' | 'en' | 'es';

export interface InterpretationTexts {
  SUN_IN_HOUSE: string[];
  MOON_IN_HOUSE: string[];
  MERCURY_IN_HOUSE: string[];
  SIGN_NAMES: string[];
  SECTION_TITLES: {
    sun: (house: number, sign: string) => string;
    moon: (house: number, sign: string) => string;
    mercury: (house: number, sign: string) => string;
    venus: (house: number, sign: string) => string;
    mars: (house: number, sign: string) => string;
    northNode: (house: number, sign: string) => string;
    chiron: (house: number, sign: string) => string;
    ascendant: (sign: string) => string;
  };
}

/**
 * Returns the interpretation texts for the given locale.
 *
 * Fallback strategy (per array):
 *  - 'pt': full PT texts
 *  - 'en': full EN texts
 *  - 'es': SUN + MOON in ES; MERCURY falls back to PT
 */
export function getInterpretations(locale: InterpLocale = 'pt'): InterpretationTexts {
  switch (locale) {
    case 'en':
      return {
        SUN_IN_HOUSE: en.SUN_IN_HOUSE,
        MOON_IN_HOUSE: en.MOON_IN_HOUSE,
        MERCURY_IN_HOUSE: en.MERCURY_IN_HOUSE,
        SIGN_NAMES: en.SIGN_NAMES,
        SECTION_TITLES: en.SECTION_TITLES,
      };

    case 'es':
      return {
        SUN_IN_HOUSE: es.SUN_IN_HOUSE,
        MOON_IN_HOUSE: es.MOON_IN_HOUSE,
        // Mercury not yet translated to ES — fall back to PT
        MERCURY_IN_HOUSE: es.MERCURY_IN_HOUSE ?? pt.MERCURY_IN_HOUSE,
        SIGN_NAMES: es.SIGN_NAMES,
        SECTION_TITLES: es.SECTION_TITLES,
      };

    case 'pt':
    default:
      return {
        SUN_IN_HOUSE: pt.SUN_IN_HOUSE,
        MOON_IN_HOUSE: pt.MOON_IN_HOUSE,
        MERCURY_IN_HOUSE: pt.MERCURY_IN_HOUSE,
        SIGN_NAMES: pt.SIGN_NAMES,
        SECTION_TITLES: pt.SECTION_TITLES,
      };
  }
}
