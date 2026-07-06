// ============================================================
// ENGINE INDEX — Public API
// Orchestrates calculations, houses, aspects
// ============================================================

export * from './types';
export * from './calculations';
export * from './houses';
export * from './aspects';
export { initSweph, isSwephReady } from './sweph-provider';

import { calculatePositions, buildUTCDate, getSignIndex, getDegreeInSign, norm, getActiveEngine } from './calculations';
import { calculateFullHouses, getHouseForLongitude } from './houses';
import { initSweph, isSwephReady } from './sweph-provider';
import { calculateAspects } from './aspects';
import type {
  BirthData, NatalChart, TransitChart, SynastryChart,
  SolarReturnChart, CompositeChart, CalculationOptions,
  HouseSystem, Positions, CelestialPosition
} from './types';

const DEFAULT_HOUSE_SYSTEM: HouseSystem = 'placidus';

// ============================================================
// NATAL CHART
// ============================================================

export function calculateNatalChart(birth: BirthData, options?: CalculationOptions): NatalChart {
  const houseSystem = options?.houseSystem || DEFAULT_HOUSE_SYSTEM;
  const utcDate = buildUTCDate(birth.date, birth.time, birth.timezone);
  const positions = calculatePositions(utcDate, options);
  const houses = calculateFullHouses(utcDate, birth.lat, birth.lng, houseSystem);
  const aspects = calculateAspects(positions, positions, true, options);

  // Assign planets to houses
  const planetHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    planetHouses[planet] = getHouseForLongitude(pos.longitude, houses.cusps);
  }

  // Calculate dignities
  const dignities = calculateDignities(positions);

  return {
    type: 'natal',
    date: utcDate,
    positions,
    houses,
    aspects,
    planetHouses,
    dignities,
    meta: { lat: birth.lat, lng: birth.lng, timezone: birth.timezone, houseSystem, name: birth.name, city: birth.city },
  };
}

// ============================================================
// TRANSITS
// ============================================================

export function calculateTransits(transitDate: Date, natalChart: NatalChart, options?: CalculationOptions): TransitChart {
  const positions = calculatePositions(transitDate, options);
  const aspects = calculateAspects(positions, natalChart.positions, false, options);

  const transitHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    transitHouses[planet] = getHouseForLongitude(pos.longitude, natalChart.houses.cusps);
  }

  return {
    type: 'transit',
    date: transitDate,
    positions,
    natalPositions: natalChart.positions,
    aspects,
    transitHouses,
  };
}

// ============================================================
// SYNASTRY
// ============================================================

export function calculateSynastry(chartA: NatalChart, chartB: NatalChart, options?: CalculationOptions): SynastryChart {
  const aspects = calculateAspects(chartA.positions, chartB.positions, false, options);
  return { type: 'synastry', chartA, chartB, aspects };
}

// ============================================================
// COMPOSITE
// ============================================================

export function calculateComposite(chartA: NatalChart, chartB: NatalChart, options?: CalculationOptions): CompositeChart {
  const positions: Positions = {};

  for (const planet of Object.keys(chartA.positions)) {
    if (!chartB.positions[planet]) continue;
    const mid = midpoint(chartA.positions[planet].longitude, chartB.positions[planet].longitude);
    positions[planet] = { longitude: mid, isRetrograde: false };
  }

  const asc = midpoint(chartA.houses.ascendant, chartB.houses.ascendant);
  const mc = midpoint(chartA.houses.midheaven, chartB.houses.midheaven);
  const houseSystem = options?.houseSystem || DEFAULT_HOUSE_SYSTEM;
  const houses = calculateFullHouses(chartA.date, chartA.meta.lat, chartA.meta.lng, houseSystem);
  const aspects = calculateAspects(positions, positions, true, options);

  const planetHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    planetHouses[planet] = getHouseForLongitude(pos.longitude, houses.cusps);
  }

  return { type: 'composite', positions, houses, aspects, planetHouses };
}

// ============================================================
// SOLAR RETURN
// ============================================================

export function calculateSolarReturn(
  natalChart: NatalChart, year: number, lat: number, lng: number, tz: number, options?: CalculationOptions
): SolarReturnChart {
  const natalSunLon = natalChart.positions.sun.longitude;
  const houseSystem = options?.houseSystem || DEFAULT_HOUSE_SYSTEM;

  // Find when Sun returns to natal degree
  const birthMonth = natalChart.date.getUTCMonth();
  const birthDay = natalChart.date.getUTCDate();
  let searchDate = new Date(Date.UTC(year, birthMonth, birthDay - 5));
  let bestDate = searchDate;
  let bestDiff = 999;

  // Coarse search (day by day)
  for (let d = 0; d < 15; d++) {
    const testDate = new Date(searchDate.getTime() + d * 86400000);
    const pos = calculatePositions(testDate, options);
    const diff = Math.abs(pos.sun.longitude - natalSunLon);
    const actualDiff = diff > 180 ? 360 - diff : diff;
    if (actualDiff < bestDiff) { bestDiff = actualDiff; bestDate = testDate; }
  }

  // Fine search (hour by hour)
  const fineStart = new Date(bestDate.getTime() - 86400000);
  for (let h = 0; h < 48; h++) {
    const testDate = new Date(fineStart.getTime() + h * 3600000);
    const pos = calculatePositions(testDate, options);
    const diff = Math.abs(pos.sun.longitude - natalSunLon);
    const actualDiff = diff > 180 ? 360 - diff : diff;
    if (actualDiff < bestDiff) { bestDiff = actualDiff; bestDate = testDate; }
  }

  const positions = calculatePositions(bestDate, options);
  const houses = calculateFullHouses(bestDate, lat, lng, houseSystem);
  const aspects = calculateAspects(positions, positions, true, options);

  const planetHouses: Record<string, number> = {};
  for (const [planet, pos] of Object.entries(positions)) {
    planetHouses[planet] = getHouseForLongitude(pos.longitude, houses.cusps);
  }

  return {
    type: 'solar-return',
    date: bestDate,
    year,
    positions,
    houses,
    aspects,
    planetHouses,
    meta: { lat, lng, timezone: tz, houseSystem },
  };
}

// ============================================================
// DIGNITIES
// ============================================================

const DIGNITY_MAP: Record<string, { domicile: number[]; exaltation: number; detriment: number[]; fall: number }> = {
  sun: { domicile: [4], exaltation: 0, detriment: [10], fall: 6 },
  moon: { domicile: [3], exaltation: 1, detriment: [9], fall: 7 },
  mercury: { domicile: [2, 5], exaltation: 5, detriment: [8, 11], fall: 11 },
  venus: { domicile: [1, 6], exaltation: 11, detriment: [7, 0], fall: 5 },
  mars: { domicile: [0, 7], exaltation: 9, detriment: [6, 1], fall: 3 },
  jupiter: { domicile: [8, 11], exaltation: 3, detriment: [2, 5], fall: 9 },
  saturn: { domicile: [9, 10], exaltation: 6, detriment: [3, 4], fall: 0 },
};

function calculateDignities(positions: Positions): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [planet, data] of Object.entries(DIGNITY_MAP)) {
    if (!positions[planet]) continue;
    const signIdx = getSignIndex(positions[planet].longitude);

    if (data.domicile.includes(signIdx)) result[planet] = 'domicile';
    else if (signIdx === data.exaltation) result[planet] = 'exaltation';
    else if (data.detriment.includes(signIdx)) result[planet] = 'detriment';
    else if (signIdx === data.fall) result[planet] = 'fall';
  }

  return result;
}

// ============================================================
// HELPERS
// ============================================================

function midpoint(a: number, b: number): number {
  let diff = b - a;
  if (diff > 180) diff -= 360;
  if (diff < -180) diff += 360;
  return norm(a + diff / 2);
}
