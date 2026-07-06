// ============================================================
// ASPECTS.TS — Aspect Calculation Engine
// ============================================================

import { angularDifference } from './calculations';
import type { Aspect, AspectType, AspectNature, Positions, CalculationOptions, DEFAULT_OPTIONS } from './types';

interface AspectDef {
  type: AspectType;
  angle: number;
  orb: number;
  nature: AspectNature;
}

const ASPECT_DEFS: AspectDef[] = [
  { type: 'conjunction', angle: 0, orb: 8, nature: 'neutral' },
  { type: 'sextile', angle: 60, orb: 5, nature: 'harmonic' },
  { type: 'square', angle: 90, orb: 7, nature: 'tense' },
  { type: 'trine', angle: 120, orb: 7, nature: 'harmonic' },
  { type: 'opposition', angle: 180, orb: 8, nature: 'tense' },
];

/**
 * Calculate aspects between two sets of positions
 * @param pos1 First set of positions
 * @param pos2 Second set of positions (same as pos1 for natal)
 * @param sameChart Whether both position sets are from the same chart
 * @param options Custom orb settings
 */
export function calculateAspects(
  pos1: Positions,
  pos2: Positions,
  sameChart: boolean,
  options?: CalculationOptions
): Aspect[] {
  const aspects: Aspect[] = [];
  const keys1 = Object.keys(pos1);
  const keys2 = Object.keys(pos2);
  const customOrbs = options?.aspectOrbs;

  for (let i = 0; i < keys1.length; i++) {
    const startJ = sameChart ? i + 1 : 0;
    for (let j = startJ; j < keys2.length; j++) {
      if (sameChart && keys1[i] === keys2[j]) continue;

      const p1 = keys1[i];
      const p2 = keys2[j];
      const lon1 = pos1[p1].longitude;
      const lon2 = pos2[p2].longitude;
      const diff = angularDifference(lon1, lon2);

      for (const def of ASPECT_DEFS) {
        const orb = customOrbs?.[def.type] ?? def.orb;
        const orbFromExact = Math.abs(diff - def.angle);

        if (orbFromExact <= orb) {
          aspects.push({
            planet1: p1,
            planet2: p2,
            type: def.type,
            angle: def.angle,
            orb: +orbFromExact.toFixed(2),
            exactness: +(1 - orbFromExact / orb).toFixed(3),
            applying: isApplying(pos1[p1], pos2[p2]),
            nature: def.nature,
          });
          break; // Only one aspect per pair
        }
      }
    }
  }

  return aspects.sort((a, b) => b.exactness - a.exactness);
}

/**
 * Determine if aspect is applying (getting tighter) or separating
 */
function isApplying(pos1: { longitude: number; speed?: number }, pos2: { longitude: number; speed?: number }): boolean {
  const speed1 = pos1.speed || 0;
  const speed2 = pos2.speed || 0;
  // Simplified: faster planet approaching slower = applying
  return Math.abs(speed1) > Math.abs(speed2);
}

/**
 * Get aspect symbol
 */
export function getAspectSymbol(type: AspectType): string {
  const symbols: Record<AspectType, string> = {
    conjunction: '☌',
    sextile: '⚹',
    square: '□',
    trine: '△',
    opposition: '☍',
  };
  return symbols[type];
}

/**
 * Get aspect color (Astro.com style: red=tense, blue=harmonic)
 */
export function getAspectColor(type: AspectType): string {
  const colors: Record<AspectType, string> = {
    conjunction: '#cc0000',
    sextile: '#0000cc',
    square: '#cc0000',
    trine: '#0000cc',
    opposition: '#cc0000',
  };
  return colors[type];
}
