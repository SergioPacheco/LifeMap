// ============================================================
// PROGRESSIONS.TS — Secondary Progressions & Solar Arc
// "Day for a year" method: 1 day after birth = 1 year of life
// ============================================================

import { calculatePositions, buildUTCDate, norm } from './calculations';
import { calculateFullHouses, getHouseForLongitude } from './houses';
import { calculateAspects } from './aspects';
import type { BirthData, NatalChart, ProgressedChart, Positions, HouseSystem, CalculationOptions } from './types';

// ============================================================
// SECONDARY PROGRESSIONS
// ============================================================

/**
 * Calculate Secondary Progressions for a given age/date
 * Method: "day for a year" — each day after birth represents one year of life
 *
 * @param natal The natal chart
 * @param birth Original birth data
 * @param targetDate Date to progress to
 * @param options Calculation options
 */
export function calculateProgressions(
  natal: NatalChart,
  birth: BirthData,
  targetDate: Date,
  options?: CalculationOptions
): ProgressedChart {
  const houseSystem = options?.houseSystem || 'placidus';

  // Calculate age in years (fractional)
  const birthUTC = buildUTCDate(birth.date, birth.time, birth.timezone);
  const ageMs = targetDate.getTime() - birthUTC.getTime();
  const ageYears = ageMs / (365.25 * 24 * 3600 * 1000);

  // Progressed date = birth + (age in days)
  // 1 year of life = 1 day after birth
  const progressedDate = new Date(birthUTC.getTime() + ageYears * 86400000);

  // Calculate positions for the progressed date
  const positions = calculatePositions(progressedDate, options);

  // Calculate houses for progressed ASC/MC
  const houses = calculateFullHouses(progressedDate, birth.lat, birth.lng, houseSystem);

  // Aspects between progressed positions
  const aspects = calculateAspects(positions, positions, true, options);

  return {
    type: 'progressions',
    date: progressedDate,
    age: Math.floor(ageYears),
    positions,
    houses,
    aspects,
  };
}

// ============================================================
// SOLAR ARC DIRECTIONS
// ============================================================

/**
 * Calculate Solar Arc Directions
 * All planets advance by the same arc as the progressed Sun
 *
 * @param natal The natal chart
 * @param birth Original birth data
 * @param targetDate Date to calculate for
 */
export function calculateSolarArc(
  natal: NatalChart,
  birth: BirthData,
  targetDate: Date,
  options?: CalculationOptions
): ProgressedChart {
  const houseSystem = options?.houseSystem || 'placidus';

  // Calculate progressed Sun position
  const birthUTC = buildUTCDate(birth.date, birth.time, birth.timezone);
  const ageMs = targetDate.getTime() - birthUTC.getTime();
  const ageYears = ageMs / (365.25 * 24 * 3600 * 1000);
  const progressedDate = new Date(birthUTC.getTime() + ageYears * 86400000);
  const progressedPositions = calculatePositions(progressedDate, options);

  // Solar arc = difference between progressed Sun and natal Sun
  const natalSunLon = natal.positions.sun.longitude;
  const progressedSunLon = progressedPositions.sun.longitude;
  let solarArc = progressedSunLon - natalSunLon;
  if (solarArc < 0) solarArc += 360;

  // Apply solar arc to all natal positions
  const positions: Positions = {};
  for (const [planet, pos] of Object.entries(natal.positions)) {
    positions[planet] = {
      longitude: norm(pos.longitude + solarArc),
      latitude: pos.latitude,
      isRetrograde: pos.isRetrograde,
    };
  }

  // Houses from solar arc ASC
  const houses = calculateFullHouses(progressedDate, birth.lat, birth.lng, houseSystem);
  const aspects = calculateAspects(positions, positions, true, options);

  return {
    type: 'progressions',
    date: progressedDate,
    age: Math.floor(ageYears),
    positions,
    houses,
    aspects,
  };
}

// ============================================================
// PROGRESSED TO NATAL ASPECTS
// ============================================================

/**
 * Calculate aspects between progressed and natal positions
 * This is the most commonly used form of progressions interpretation
 */
export function calculateProgressedToNatalAspects(
  progressedChart: ProgressedChart,
  natalChart: NatalChart,
  options?: CalculationOptions
) {
  return calculateAspects(progressedChart.positions, natalChart.positions, false, {
    ...options,
    aspectOrbs: {
      conjunction: 1.5,
      sextile: 1,
      square: 1.5,
      trine: 1,
      opposition: 1.5,
    },
  });
}
