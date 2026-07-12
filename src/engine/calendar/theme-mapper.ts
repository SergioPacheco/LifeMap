// ============================================================
// THEME-MAPPER.TS — Mapeia eventos astrológicos para temas de vida
// Baseado em: casas, planetas, regências e aspectos
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarConfig, CalendarEvent, Theme } from './types';
import { getSignIndex } from '../calculations';

// ============================================================
// MAPEAMENTO: Planeta → Temas
// ============================================================

const PLANET_THEMES: Record<string, Theme[]> = {
  sun: ['career', 'creativity'],
  moon: ['family', 'health'],
  mercury: ['communication', 'communication'],
  venus: ['love', 'finances', 'creativity'],
  mars: ['health', 'sexuality', 'career'],
  jupiter: ['finances', 'travel', 'spirituality'],
  saturn: ['career', 'health'],
  uranus: ['freedom', 'communication'],
  neptune: ['spirituality', 'creativity'],
  pluto: ['transformation', 'sexuality'],
  chiron: ['health', 'spirituality'],
  northNode: ['spirituality', 'career'],
  southNode: ['family', 'spirituality'],
  // Ângulos
  asc: ['health', 'love'],
  mc: ['career'],
  dc: ['love'],
  ic: ['family'],
};

// ============================================================
// MAPEAMENTO: Casa Natal → Temas
// ============================================================

const HOUSE_THEMES: Record<number, Theme[]> = {
  1: ['health'],
  2: ['finances'],
  3: ['communication'],
  4: ['family'],
  5: ['love', 'creativity'],
  6: ['health', 'career'],
  7: ['love'],
  8: ['transformation', 'sexuality', 'finances'],
  9: ['travel', 'spirituality'],
  10: ['career'],
  11: ['freedom', 'communication'],
  12: ['spirituality', 'health'],
};

// ============================================================
// MAPEAMENTO: Aspecto × Planeta → contexto temático adicional
// ============================================================

const ASPECT_CONTEXT: Record<string, Record<string, Theme[]>> = {
  conjunction: {
    venus: ['love', 'finances'],
    mars: ['sexuality', 'health'],
    jupiter: ['finances', 'travel'],
    saturn: ['career'],
    pluto: ['transformation'],
  },
  square: {
    saturn: ['career'],
    mars: ['health'],
    pluto: ['transformation'],
  },
  trine: {
    venus: ['love', 'creativity'],
    jupiter: ['finances', 'travel'],
  },
  opposition: {
    mars: ['love'],         // Tensão com o outro
    saturn: ['career'],
    pluto: ['transformation'],
  },
};

// ============================================================
// REGENTES TRADICIONAIS (para profecção e regência de casas)
// ============================================================

const TRADITIONAL_RULERS: Record<number, string> = {
  0: 'mars',       // Áries
  1: 'venus',      // Touro
  2: 'mercury',    // Gêmeos
  3: 'moon',       // Câncer
  4: 'sun',        // Leão
  5: 'mercury',    // Virgem
  6: 'venus',      // Libra
  7: 'mars',       // Escorpião (trad: Marte)
  8: 'jupiter',    // Sagitário
  9: 'saturn',     // Capricórnio
  10: 'saturn',    // Aquário (trad: Saturno)
  11: 'jupiter',   // Peixes (trad: Júpiter)
};

const MODERN_RULERS: Record<number, string> = {
  0: 'mars', 1: 'venus', 2: 'mercury', 3: 'moon',
  4: 'sun', 5: 'mercury', 6: 'venus', 7: 'pluto',
  8: 'jupiter', 9: 'saturn', 10: 'uranus', 11: 'neptune',
};

// ============================================================
// MAIN: Map event to themes
// ============================================================

export function mapEventThemes(
  event: CalendarEvent,
  natal: NatalChart,
  cfg: CalendarConfig
): Theme[] {
  const themes = new Set<Theme>();

  // 1. Themes from the transiting planet
  if (event.transitPlanet) {
    const planetThemes = PLANET_THEMES[event.transitPlanet] || [];
    for (const t of planetThemes) themes.add(t);
  }

  // 2. Themes from the natal planet being aspected
  if (event.natalPlanet) {
    const natalThemes = PLANET_THEMES[event.natalPlanet] || [];
    for (const t of natalThemes) themes.add(t);
  }

  // 3. Themes from the natal house where the transit occurs
  if (event.natalHouse) {
    const houseThemes = HOUSE_THEMES[event.natalHouse] || [];
    for (const t of houseThemes) themes.add(t);
  }

  // 4. Context from aspect type × planet
  if (event.aspectType && event.transitPlanet) {
    const context = ASPECT_CONTEXT[event.aspectType]?.[event.transitPlanet];
    if (context) {
      for (const t of context) themes.add(t);
    }
  }

  // 5. House ruler activation (if enabled)
  if (cfg.themes.useHouseRulers && event.transitPlanet) {
    const rulerThemes = getThemesFromRuledHouses(event.transitPlanet, natal, cfg);
    for (const t of rulerThemes) themes.add(t);
  }

  // 6. Ingress themes: planet entering a sign activates that sign's house
  if (event.type === 'planet-ingress' && event.transitSign !== undefined) {
    const houseOfSign = findNatalHouseBySign(event.transitSign, natal);
    if (houseOfSign) {
      const houseThemes = HOUSE_THEMES[houseOfSign] || [];
      for (const t of houseThemes) themes.add(t);
    }
  }

  // Filter by enabled themes
  const enabled = new Set(cfg.themes.enabled);
  return Array.from(themes).filter(t => enabled.has(t));
}

// ============================================================
// HELPERS
// ============================================================

/**
 * If a planet rules a natal house, activating that planet
 * also activates the themes of that house.
 */
function getThemesFromRuledHouses(planet: string, natal: NatalChart, cfg: CalendarConfig): Theme[] {
  const themes: Theme[] = [];
  const rulers = cfg.profection.rulers === 'traditional' ? TRADITIONAL_RULERS : MODERN_RULERS;

  for (let house = 1; house <= 12; house++) {
    const cuspLon = natal.houses.cusps[house - 1];
    const cuspSign = getSignIndex(cuspLon);
    const ruler = rulers[cuspSign];

    if (ruler === planet) {
      const houseThemes = HOUSE_THEMES[house] || [];
      themes.push(...houseThemes);
    }
  }

  return themes;
}

/**
 * Find which natal house a sign falls in.
 * Used for ingresses: "Venus enters Cancer" → which house is Cancer in natal?
 */
function findNatalHouseBySign(sign: number, natal: NatalChart): number | null {
  for (let i = 0; i < 12; i++) {
    const cuspSign = getSignIndex(natal.houses.cusps[i]);
    if (cuspSign === sign) return i + 1;
  }
  return null;
}

// ============================================================
// THEME DISPLAY INFO
// ============================================================

export const THEME_INFO: Record<Theme, { icon: string; label: string; color: string }> = {
  love: { icon: '♡', label: 'Amor', color: '#e84393' },
  career: { icon: '💼', label: 'Carreira', color: '#0984e3' },
  finances: { icon: '💰', label: 'Finanças', color: '#00b894' },
  health: { icon: '🧘', label: 'Saúde', color: '#6c5ce7' },
  spirituality: { icon: '🔮', label: 'Espiritualidade', color: '#a29bfe' },
  family: { icon: '🏠', label: 'Família', color: '#fdcb6e' },
  creativity: { icon: '⭐', label: 'Criatividade', color: '#fd79a8' },
  communication: { icon: '🧠', label: 'Comunicação', color: '#74b9ff' },
  transformation: { icon: '♇', label: 'Transformação', color: '#d63031' },
  freedom: { icon: '⚡', label: 'Liberdade', color: '#00cec9' },
  travel: { icon: '✈', label: 'Viagens', color: '#55a3e8' },
  sexuality: { icon: '🔥', label: 'Sexualidade', color: '#e17055' },
};
