// ============================================================
// SELECT.TS — Evidence-driven knowledge selection
//
// Every selected entry cites only existing fact IDs. Facts vetted
// upstream (Chiron omitted when mean-elements, unknown-time houses
// absent) simply select nothing — absence is never backfilled.
// ============================================================

import type { AstroFact } from '../core/types.js';
import {
  aspectPairKey,
  aspectRegisterOf,
  getCatalog,
  type KnowledgeEntry,
} from './catalog.js';
import type { AspectType } from '../../engine/types.js';

export interface SelectedEntry {
  entry: KnowledgeEntry;
  factIds: string[];
  weight: number;
}

function houseOf(facts: AstroFact[], subjectIndex: number, planet: string): number | null {
  const placement = facts.find(
    (fact) => fact.kind === 'house' && fact.subjectIndex === subjectIndex && fact.values.point === planet
  );
  const house = placement?.values.house;
  return typeof house === 'number' ? house : null;
}

export function selectEntries(facts: AstroFact[]): SelectedEntry[] {
  const catalog = getCatalog();
  const byId = new Map(catalog.map((entry) => [entry.id, entry]));
  const selected: SelectedEntry[] = [];

  const push = (id: string, factIds: string[], weight: number) => {
    const entry = byId.get(id);
    if (entry) selected.push({ entry, factIds, weight });
  };

  for (const fact of facts) {
    if (fact.kind === 'position' && typeof fact.values.point === 'string') {
      const planet = fact.values.point;
      const sign = fact.values.signIndex;
      if (typeof sign === 'number') {
        push(`ps-${planet}-${sign}`, [fact.id], 1);
      }
      const house = houseOf(facts, fact.subjectIndex, planet);
      if (house !== null) {
        push(`ph-${planet}-${house}`, [fact.id], 1.2);
      }
    }
    // House placements key their own entries: chapters holding the
    // placement (but not the position) still render it, citing the
    // placement fact. Same-chapter duplicates collapse (see assembler).
    if (
      fact.kind === 'house' &&
      typeof fact.values.point === 'string' &&
      typeof fact.values.house === 'number'
    ) {
      push(`ph-${fact.values.point}-${fact.values.house}`, [fact.id], 1.1);
    }
    if (fact.kind === 'aspect') {
      const { planet1, planet2, type } = fact.values as {
        planet1?: unknown;
        planet2?: unknown;
        type?: unknown;
      };
      if (typeof planet1 === 'string' && typeof planet2 === 'string' && typeof type === 'string') {
        const pair = aspectPairKey(planet1, planet2);
        if (pair) {
          const register = aspectRegisterOf(type as AspectType);
          const orb = typeof fact.values.orbDeg === 'number' ? fact.values.orbDeg : 8;
          push(`asp-${pair}-${register}`, [fact.id], Math.max(0.2, 1.6 - orb / 4));
        }
      }
    }
    if (fact.kind === 'angle' && fact.values.angle === 'asc' && typeof fact.values.signIndex === 'number') {
      push(`ang-asc-${fact.values.signIndex}`, [fact.id], 1.4);
    }
  }

  return selected;
}
