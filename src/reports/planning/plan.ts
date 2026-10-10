// ============================================================
// PLAN.TS — Deterministic editorial planning (4A)
//
// Natal slice first: chapters from the natal blueprint, evidence from
// scored facts. Temporal reports throw PLANNER_UNSUPPORTED until their
// slice lands — explicitly, never as a silent natal fallback.
// ============================================================

import type { ReportContext, ReportPlan, ReportRequest } from '../core/types.js';
import { scoreFacts } from '../scoring/score.js';
import { NATAL_BLUEPRINT, NATAL_EDITORIAL_VERSION } from './blueprints/natal.js';

function involves(factValues: Record<string, string | number | boolean | null>, planets: string[]): boolean {
  return planets.some(
    (planet) => factValues.point === planet || factValues.planet1 === planet || factValues.planet2 === planet
  );
}

export function planReport(request: ReportRequest, context: ReportContext): ReportPlan {
  if (request.reportType !== 'natal') {
    throw new Error(`PLANNER_UNSUPPORTED: ${request.reportType} lands in a later 4A slice`);
  }
  const scored = scoreFacts(context.facts);
  const knownIds = new Set(context.facts.map((fact) => fact.id));

  const chapters = NATAL_BLUEPRINT.map((spec) => {
    const factIds = scored
      .filter(({ fact }) => {
        if (fact.kind === 'position') {
          const point = fact.values.point;
          return typeof point === 'string' && spec.planets.includes(point);
        }
        if (fact.kind === 'angle') {
          // Ascendant opens identity; other angles lack curated texts in k1.
          return spec.id === 'identity' && fact.values.angle === 'asc';
        }
        if (fact.kind === 'house') {
          const point = fact.values.point;
          const house = fact.values.house;
          if (typeof point === 'string' && spec.planets.includes(point)) return true;
          if (typeof house === 'number' && typeof point === 'string' && spec.houses.includes(house)) return true;
          // Bare cusps (no point) belong to the integration houses tour only.
          if (spec.id === 'integration' && typeof house === 'number' && typeof point !== 'string') return true;
          return false;
        }
        if (fact.kind === 'aspect' || fact.kind === 'synastry-aspect') {
          return involves(fact.values, spec.planets);
        }
        // Dignities and distributions are read in the integration chapter.
        if (spec.id === 'integration' && (fact.kind === 'dignity' || fact.kind === 'distribution')) return true;
        // The overview temperament section reads distributions.
        if (spec.id === 'overview' && fact.kind === 'distribution') return true;
        return false;
      })
      .map(({ fact }) => fact.id);
    for (const id of factIds) {
      if (!knownIds.has(id)) throw new Error(`PLAN_INCONSISTENT: unknown fact ${id}`);
    }
    return {
      id: spec.id,
      titleKey: spec.titleKey,
      factIds,
      eventIds: [],
      minWords: spec.minWords,
      maxWords: spec.maxWords,
    };
  });

  // Required evidence: luminaries always, angles when known, top aspects.
  const required: string[] = [];
  const sun = context.facts.find((fact) => fact.kind === 'position' && fact.values.point === 'sun');
  const moon = context.facts.find((fact) => fact.kind === 'position' && fact.values.point === 'moon');
  if (sun) required.push(sun.id);
  if (moon) required.push(moon.id);
  const asc = context.facts.find((fact) => fact.kind === 'angle' && fact.values.angle === 'asc');
  if (asc) required.push(asc.id);
  const topAspects = scored
    .filter(({ fact }) => fact.kind === 'aspect')
    .slice(0, 3)
    .map(({ fact }) => fact.id);
  required.push(...topAspects);

  return {
    reportType: 'natal',
    chapters,
    requiredFactIds: [...new Set(required)],
    editorialVersion: NATAL_EDITORIAL_VERSION,
  };
}
