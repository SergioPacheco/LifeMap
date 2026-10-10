// ============================================================
// EVENT-RANKING.TS — Importance scoring and ordering
//
// Mirrors the calendar's speed-weighted importance so the dataset and
// the on-screen calendar agree: slow (rare) contacts outrank fast ones,
// exact outranks wide, angles and luminaries get a bonus. The score is
// an editorial weight, never a probability of personal events.
// ============================================================

import type { ForecastEvent } from '../../reports/core/types';

// Mean daily motion (°/day); slower = rarer exact contact = more weight.
const PLANET_SPEED: Record<string, number> = {
  moon: 13.0, sun: 1.0, mercury: 1.2, venus: 1.0, mars: 0.5,
  jupiter: 0.08, saturn: 0.03, uranus: 0.012, neptune: 0.006, pluto: 0.004,
  chiron: 0.02, northNode: 0.05,
};

export function transitImportance(
  transitPlanet: string,
  natalPoint: string,
  minOrbDeg: number,
  maxOrbDeg: number
): number {
  let score = 4;
  const speed = PLANET_SPEED[transitPlanet] ?? 1.0;
  score += Math.min(3, 1 / speed);
  const orbFactor = maxOrbDeg > 0 ? Math.pow(Math.max(0, 1 - minOrbDeg / maxOrbDeg), 1.5) : 0;
  score += orbFactor * 2;
  if (['asc', 'mc', 'dc', 'ic'].includes(natalPoint)) score += 2;
  if (['sun', 'moon'].includes(natalPoint)) score += 1;
  return Math.min(10, Math.max(1, Math.round(score)));
}

/** Importance desc, then start asc — the editorial priority order. */
export function rankForecastEvents(events: ForecastEvent[]): ForecastEvent[] {
  return [...events].sort((a, b) => {
    if (b.importance !== a.importance) return b.importance - a.importance;
    return Date.parse(a.startUtc) - Date.parse(b.startUtc);
  });
}

/** Drop duplicate IDs, keeping the first occurrence. */
export function dedupeForecastEvents(events: ForecastEvent[]): ForecastEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    if (seen.has(event.id)) return false;
    seen.add(event.id);
    return true;
  });
}
