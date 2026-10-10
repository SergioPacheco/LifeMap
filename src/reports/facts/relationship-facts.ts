// ============================================================
// RELATIONSHIP-FACTS.TS — Synastry, overlays and composite facts
//
// The composite reuses the existing calculateComposite() midpoint engine.
// House overlays need known birth times on the *receiving* side; when a
// partner's time is unknown the overlay is omitted (never defaulted).
// ============================================================

import type { AstroFact } from '../core/types';
import type { CalculationProvenance } from '../../engine/calculations';
import { getDegreeInSign, getSignIndex } from '../../engine/calculations';
import { calculateAspects } from '../../engine/aspects';
import { calculateComposite } from '../../engine/index';
import { getHouseForLongitude } from '../../engine/houses';
import type { HouseData, NatalChart } from '../../engine/types';

export interface RelationshipFactsOptions {
  positionsProvenanceA: Record<string, CalculationProvenance>;
  positionsProvenanceB: Record<string, CalculationProvenance>;
  housesKnownA: boolean;
  housesKnownB: boolean;
  housesA: HouseData;
  housesB: HouseData;
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function buildRelationshipFacts(
  chartA: NatalChart,
  chartB: NatalChart,
  options: RelationshipFactsOptions
): { facts: AstroFact[]; limitations: string[] } {
  const facts: AstroFact[] = [];
  const limitations: string[] = [];

  // ---- Synastry (A × B, both directions covered by ordered pairs) --
  const synastry = calculateAspects(chartA.positions, chartB.positions, false);
  synastry.forEach((aspect, index) => {
    facts.push({
      id: `r-synastry-${String(index + 1).padStart(2, '0')}`,
      kind: 'synastry-aspect',
      values: {
        planetA: aspect.planet1,
        planetB: aspect.planet2,
        type: aspect.type,
        orbDeg: aspect.orb,
        applying: aspect.applying,
      },
      subjectIndex: 0,
      source: 'lifemap-engine:calculateAspects:synastry',
      precision: 'computed',
    });
  });

  // ---- Overlays: A's planets in B's houses (and vice versa) -------
  const overlay = (
    from: NatalChart,
    intoHouses: HouseData,
    fromLabel: 'a' | 'b',
    subjectIndex: 0 | 1
  ) => {
    for (const [planet, position] of Object.entries(from.positions)) {
      if (!Number.isFinite(position.longitude)) continue;
      facts.push({
        id: `r-overlay-${fromLabel}-${planet}`,
        kind: 'house-overlay',
        values: {
          point: planet,
          house: getHouseForLongitude(position.longitude, intoHouses.cusps),
          fromSubject: fromLabel === 'a' ? 0 : 1,
          inSubject: fromLabel === 'a' ? 1 : 0,
        },
        subjectIndex,
        source: 'lifemap-engine:house-overlay',
        precision: 'computed',
      });
    }
  };

  if (options.housesKnownA && options.housesKnownB) {
    overlay(chartA, options.housesB, 'a', 0);
    overlay(chartB, options.housesA, 'b', 1);
  } else {
    limitations.push(
      'House overlays omitted: at least one partner has an unknown birth time, ' +
        'so receiving houses cannot be established.'
    );
  }

  // ---- Composite (midpoint engine, positions + aspects) ------------
  const composite = calculateComposite(chartA, chartB);
  for (const [planet, position] of Object.entries(composite.positions)) {
    if (!Number.isFinite(position.longitude)) continue;
    facts.push({
      id: `r-composite-${planet}`,
      kind: 'composite-position',
      values: {
        point: planet,
        longitudeDeg: round3(position.longitude),
        signIndex: getSignIndex(position.longitude),
        degreeInSign: round3(getDegreeInSign(position.longitude)),
      },
      subjectIndex: 0,
      source: 'lifemap-engine:calculateComposite:midpoint',
      precision: 'computed',
    });
  }
  composite.aspects.forEach((aspect, index) => {
    facts.push({
      id: `r-composite-aspect-${String(index + 1).padStart(2, '0')}`,
      kind: 'composite-aspect',
      values: {
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        type: aspect.type,
        orbDeg: aspect.orb,
        applying: aspect.applying,
      },
      subjectIndex: 0,
      source: 'lifemap-engine:calculateComposite:aspects',
      precision: 'computed',
    });
  });

  return { facts, limitations };
}
