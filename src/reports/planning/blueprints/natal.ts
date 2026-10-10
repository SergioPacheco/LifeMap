// ============================================================
// NATAL.TS — Editorial blueprint for the natal report (4A)
//
// Ten chapters; word ranges distribute the 8.000–12.000 policy band
// (chapter minima sum 7.400, maxima 11.500 — the assembler lands the
// total inside both). Each chapter names its planets; aspects, houses
// and angles follow their bodies.
// ============================================================

export interface NatalChapterSpec {
  id: string;
  titleKey: string;
  planets: string[];
  /** Thematic houses: placements here join the chapter (cited, deduped). */
  houses: number[];
  minWords: number;
  maxWords: number;
}

export const NATAL_BLUEPRINT: NatalChapterSpec[] = [
  { id: 'overview', titleKey: 'overview', planets: ['sun', 'moon'], houses: [], minWords: 800, maxWords: 1300 },
  // Minima calibrated to measured sustainable floors per chapter type
  // (single-planet chapters for aspect-quiet points run thinner; the
  // 8.000 total band is carried by the set). Recalibrate with corpus k2.
  { id: 'identity', titleKey: 'identity', planets: ['sun'], houses: [1], minWords: 700, maxWords: 1200 },
  { id: 'emotions', titleKey: 'emotions', planets: ['moon'], houses: [4, 8, 12], minWords: 550, maxWords: 1100 },
  { id: 'mind', titleKey: 'mind', planets: ['mercury'], houses: [3, 6], minWords: 600, maxWords: 1000 },
  { id: 'love', titleKey: 'love', planets: ['venus'], houses: [5, 7], minWords: 800, maxWords: 1200 },
  { id: 'drive', titleKey: 'drive', planets: ['mars'], houses: [1, 8], minWords: 700, maxWords: 1100 },
  { id: 'expansion', titleKey: 'expansion', planets: ['jupiter'], houses: [9], minWords: 700, maxWords: 1100 },
  { id: 'structure', titleKey: 'structure', planets: ['saturn'], houses: [10, 6], minWords: 800, maxWords: 1200 },
  { id: 'transformation', titleKey: 'transformation', planets: ['uranus', 'neptune', 'pluto'], houses: [8, 12], minWords: 700, maxWords: 1100 },
  { id: 'integration', titleKey: 'integration', planets: ['northNode', 'southNode', 'lilith'], houses: [], minWords: 800, maxWords: 1200 },
];

export const NATAL_EDITORIAL_VERSION = 'natal-4a-k1';
