// ============================================================
// SCORE.TS — Fact priority for planning and synthesis picks
//
// Mirrors the engine's speed-weighted philosophy: exact, slow and
// angular contacts outrank fast, wide ones. Luminaries get a bonus.
// Deterministic; the score is an editorial weight, never a prediction.
// ============================================================

import type { AstroFact } from '../core/types.js';

export interface ScoredFact {
  fact: AstroFact;
  weight: number;
  reasons: string[];
}

const SLOWNESS: Record<string, number> = {
  sun: 1.0, moon: 0.5, mercury: 0.8, venus: 1.0, mars: 1.5,
  jupiter: 2.5, saturn: 3.0, uranus: 2.0, neptune: 2.0, pluto: 2.5,
  chiron: 1.5, northNode: 1.5, southNode: 1.0, lilith: 1.0,
};

function slownessOf(point: string): number {
  return SLOWNESS[point] ?? 1.0;
}

export function scoreFacts(facts: AstroFact[]): ScoredFact[] {
  const scored = facts.map((fact) => {
    let weight = 1;
    const reasons: string[] = [];
    if (fact.kind === 'aspect') {
      const orb = typeof fact.values.orbDeg === 'number' ? fact.values.orbDeg : 8;
      const exactness = Math.max(0, 1 - orb / 8);
      weight += exactness * 2;
      reasons.push(`exactness:${exactness.toFixed(2)}`);
      for (const key of ['planet1', 'planet2'] as const) {
        const point = fact.values[key];
        if (typeof point === 'string') {
          weight += slownessOf(point) * 0.4;
          if (point === 'sun' || point === 'moon') {
            weight += 0.8;
            reasons.push('luminary');
          }
        }
      }
      if (fact.values.applying === true) {
        weight += 0.3;
        reasons.push('applying');
      }
    } else if (fact.kind === 'position') {
      const point = fact.values.point;
      if (typeof point === 'string') {
        weight += slownessOf(point) * 0.5;
        if (point === 'sun' || point === 'moon') weight += 1.2;
      }
    } else if (fact.kind === 'angle') {
      weight += 2.2;
      reasons.push('angle');
    } else if (fact.kind === 'house') {
      weight += 0.6;
    } else if (fact.kind === 'dignity' || fact.kind === 'distribution') {
      weight += 0.8;
    } else {
      weight += 0.4;
    }
    return { fact, weight: Math.round(weight * 100) / 100, reasons };
  });
  return scored.sort((a, b) => b.weight - a.weight);
}
