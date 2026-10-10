// ============================================================
// NATAL-FACTS.TS — Natal chart → versioned AstroFacts
//
// Every value carries explicit units in its key (degrees) and UTC
// timestamps are ISO strings. Missing data is OMITTED (never zero or
// house 1); unknown birth times drop all house/angle facts and turn
// the Moon into a whole-day interval with an explicit limitation.
// ============================================================

import type { AstroFact, BirthTimeQuality } from '../core/types';
import { natalAngleFactId, natalPositionFactId } from '../core/ids';
import type { CalculationProvenance } from '../../engine/calculations';
import { calculatePlanetLongitude, getDegreeInSign, getSignIndex } from '../../engine/calculations';
import { getHouseForLongitude } from '../../engine/houses';
import type { NatalChart } from '../../engine/types';

export interface NatalFactsOptions {
  timeQuality: BirthTimeQuality;
  timeUncertaintyMinutes?: number;
  positionsProvenance: Record<string, CalculationProvenance>;
  housesProvenance: { engine: string; source: string; precision: 'computed' | 'approximate' };
}

const BODIES = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'northNode', 'southNode', 'lilith', 'chiron',
] as const;

const ANGLES = ['asc', 'mc', 'dc', 'ic'] as const;

const ELEMENT_OF_SIGN = [
  'fire', 'earth', 'air', 'water', 'fire', 'earth',
  'air', 'water', 'fire', 'earth', 'air', 'water',
] as const;

const MODALITY_OF_SIGN = [
  'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable',
  'cardinal', 'fixed', 'mutable', 'cardinal', 'fixed', 'mutable',
] as const;

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

export function buildNatalFacts(
  chart: NatalChart,
  subjectIndex: number,
  options: NatalFactsOptions
): { facts: AstroFact[]; limitations: string[] } {
  const facts: AstroFact[] = [];
  const limitations: string[] = [];
  const housesKnown = options.timeQuality !== 'unknown';
  const housePrecision = options.timeQuality === 'approximate' ? 'approximate' : options.housesProvenance.precision;

  const provenanceOf = (point: string): CalculationProvenance =>
    options.positionsProvenance[point] ?? {
      engine: 'mean-elements',
      source: 'unknown:unattributed',
      precision: 'unavailable',
    };

  // ---- Positions -------------------------------------------------
  for (const point of BODIES) {
    const position = chart.positions[point];
    if (!position || !Number.isFinite(position.longitude)) continue;
    const provenance = provenanceOf(point);
    const isMoonUnknown = point === 'moon' && !housesKnown;
    facts.push({
      id: natalPositionFactId(subjectIndex, point),
      kind: 'position',
      values: {
        point,
        longitudeDeg: round3(position.longitude),
        latitudeDeg: position.latitude === undefined ? null : round3(position.latitude),
        signIndex: getSignIndex(position.longitude),
        degreeInSign: round3(getDegreeInSign(position.longitude)),
        retrograde: position.isRetrograde,
        ...(isMoonUnknown ? moonInterval(chart, position.longitude) : {}),
      },
      subjectIndex,
      source: provenance.source,
      precision: isMoonUnknown ? 'approximate' : provenance.precision,
    });
  }

  if (!housesKnown) {
    limitations.push(
      'Birth time unknown: houses, angles and house placements are omitted. ' +
        'A noon local reference lets the legacy calculators run, but it is NOT a known birth time. ' +
        'The Moon is reported as a whole-day longitude interval.'
    );
  } else {
    if (options.timeQuality === 'approximate') {
      limitations.push(
        `Birth time approximate (±${options.timeUncertaintyMinutes ?? '?'} min): ` +
          'angles, houses and fast-moving points are sensitivity-graded as approximate; ' +
          'conclusions that flip inside the uncertainty window must not be drawn.'
      );
    }
    if (options.housesProvenance.precision === 'approximate') {
      limitations.push(
        `Houses computed with the trigonometric fallback (${options.housesProvenance.source}); ` +
          'cusp precision is approximate, notably near the polar circle.'
      );
    }

    // ---- Cusps ---------------------------------------------------
    for (let house = 1; house <= 12; house++) {
      const cusp = chart.houses.cusps[house - 1];
      if (!Number.isFinite(cusp)) continue;
      facts.push({
        id: `s${subjectIndex}-house-cusp-${house}`,
        kind: 'house',
        values: { house, cuspLongitudeDeg: round3(cusp), signIndex: getSignIndex(cusp) },
        subjectIndex,
        source: options.housesProvenance.source,
        precision: housePrecision,
      });
    }

    // ---- Placements ----------------------------------------------
    for (const point of BODIES) {
      const position = chart.positions[point];
      if (!position || !Number.isFinite(position.longitude)) continue;
      facts.push({
        id: `s${subjectIndex}-house-of-${point}`,
        kind: 'house',
        values: { point, house: getHouseForLongitude(position.longitude, chart.houses.cusps) },
        subjectIndex,
        source: options.housesProvenance.source,
        precision: housePrecision,
      });
    }

    // ---- Angles ---------------------------------------------------
    const angleLongitudes: Record<(typeof ANGLES)[number], number> = {
      asc: chart.houses.ascendant,
      mc: chart.houses.midheaven,
      dc: (chart.houses.ascendant + 180) % 360,
      ic: (chart.houses.midheaven + 180) % 360,
    };
    for (const angle of ANGLES) {
      const longitude = angleLongitudes[angle];
      if (!Number.isFinite(longitude)) continue;
      facts.push({
        id: natalAngleFactId(subjectIndex, angle),
        kind: 'angle',
        values: { angle, longitudeDeg: round3(longitude), signIndex: getSignIndex(longitude) },
        subjectIndex,
        source: options.housesProvenance.source,
        precision: housePrecision,
      });
    }
  }

  // ---- Aspects ----------------------------------------------------
  chart.aspects.forEach((aspect, index) => {
    const involvesMoon = aspect.planet1 === 'moon' || aspect.planet2 === 'moon';
    facts.push({
      id: `s${subjectIndex}-aspect-${String(index + 1).padStart(2, '0')}`,
      kind: 'aspect',
      values: {
        planet1: aspect.planet1,
        planet2: aspect.planet2,
        type: aspect.type,
        orbDeg: aspect.orb,
        applying: aspect.applying,
      },
      subjectIndex,
      source: 'lifemap-engine:calculateAspects',
      precision: involvesMoon && !housesKnown ? 'approximate' : 'computed',
    });
  });

  // ---- Dignities --------------------------------------------------
  for (const [planet, dignity] of Object.entries(chart.dignities)) {
    facts.push({
      id: `s${subjectIndex}-dignity-${planet}`,
      kind: 'dignity',
      values: { point: planet, dignity },
      subjectIndex,
      source: provenanceOf(planet).source,
      precision: provenanceOf(planet).precision,
    });
  }

  // ---- Distribution (elements/modalities over sun..pluto) ---------
  const planets = BODIES.slice(0, 10);
  const counts: Record<string, number> = {
    fire: 0, earth: 0, air: 0, water: 0, cardinal: 0, fixed: 0, mutable: 0,
  };
  let counted = 0;
  for (const planet of planets) {
    const position = chart.positions[planet];
    if (!position || !Number.isFinite(position.longitude)) continue;
    counts[ELEMENT_OF_SIGN[getSignIndex(position.longitude)]]++;
    counts[MODALITY_OF_SIGN[getSignIndex(position.longitude)]]++;
    counted++;
  }
  if (counted > 0) {
    facts.push({
      id: `s${subjectIndex}-distribution`,
      kind: 'distribution',
      values: { ...counts, bodiesCounted: counted },
      subjectIndex,
      source: 'lifemap-engine:distribution',
      precision: 'computed',
    });
  }

  return { facts, limitations };
}

/**
 * Whole-day Moon interval around a noon reference instant. The local day
 * in UTC is exactly [noon − 12h, noon + 12h] for any UTC offset, so an
 * hourly scan of that window bounds the true daily motion.
 */
function moonInterval(
  chart: NatalChart,
  referenceLongitude: number
): { longitudeMinDeg: number; longitudeMaxDeg: number } {
  let min = referenceLongitude;
  let max = referenceLongitude;
  const center = chart.date.getTime();
  for (let offsetHours = -12; offsetHours <= 12; offsetHours++) {
    const longitude = calculatePlanetLongitude('moon', new Date(center + offsetHours * 3600000));
    if (longitude === null || !Number.isFinite(longitude)) continue;
    // Unwrap relative to the reference to survive 0° crossings.
    let delta = longitude - referenceLongitude;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    min = Math.min(min, referenceLongitude + delta);
    max = Math.max(max, referenceLongitude + delta);
  }
  return { longitudeMinDeg: round3(min), longitudeMaxDeg: round3(max) };
}
