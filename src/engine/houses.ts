// ============================================================
// HOUSES.TS — House System Calculations
// Primary: Swiss Ephemeris (real iterative Placidus/Koch)
// Fallback: Trigonometric approximation
// ============================================================

import { norm, daysSinceJ2000, buildUTCDate } from './calculations';
import { calculateHousesSweph, isSwephReady } from './sweph-provider';
import type { HouseData, HouseSystem } from './types';

// ============================================================
// MAIN FUNCTION — DUAL ENGINE
// ============================================================

/**
 * Calculate house cusps, ASC, and MC
 * Uses Swiss Ephemeris when available (real Placidus), falls back to approximation
 */
export function calculateFullHouses(
  utcDate: Date, lat: number, lng: number, system: HouseSystem
): HouseData {
  // Try Swiss Ephemeris first (exact results)
  if (isSwephReady()) {
    const swephResult = calculateHousesSweph(utcDate, lat, lng, system);
    if (swephResult) {
      return {
        cusps: swephResult.cusps,
        ascendant: swephResult.ascendant,
        midheaven: swephResult.midheaven,
        system,
      };
    }
  }

  // Fallback: own calculation
  const asc = calculateAscendant(utcDate, lat, lng);
  const mc = calculateMC(utcDate, lng);
  const cusps = calculateHouseCusps(asc, mc, lat, system);

  return { cusps, ascendant: asc, midheaven: mc, system };
}

// ============================================================
// FALLBACK: Ascendant & MC (trigonometric)
// ============================================================

/**
 * Calculate Ascendant (fallback when Swiss Ephemeris unavailable)
 */
export function calculateAscendant(utcDate: Date, lat: number, lng: number): number {
  const d = daysSinceJ2000(utcDate);
  const GMST = norm(280.46061837 + 360.98564736629 * d);
  const LST = norm(GMST + lng);
  const lstRad = LST * Math.PI / 180;
  const eps = (23.4393 - 3.563e-7 * d) * Math.PI / 180;
  const latRad = lat * Math.PI / 180;

  const y = -Math.cos(lstRad);
  const x = Math.sin(eps) * Math.tan(latRad) + Math.cos(eps) * Math.sin(lstRad);
  return norm(Math.atan2(y, x) * 180 / Math.PI);
}

/**
 * Calculate Midheaven / MC (fallback)
 */
export function calculateMC(utcDate: Date, lng: number): number {
  const d = daysSinceJ2000(utcDate);
  const GMST = norm(280.46061837 + 360.98564736629 * d);
  const LST = norm(GMST + lng);
  const lstRad = LST * Math.PI / 180;
  const eps = (23.4393 - 3.563e-7 * d) * Math.PI / 180;

  let mc = Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(eps)) * 180 / Math.PI;
  if (Math.cos(lstRad) < 0) mc += 180;
  return norm(mc);
}

// ============================================================
// FALLBACK: House Cusp Calculations
// ============================================================

function calculateHouseCusps(asc: number, mc: number, lat: number, system: HouseSystem): number[] {
  switch (system) {
    case 'whole-sign': return wholeSignHouses(asc);
    case 'equal': return equalHouses(asc);
    case 'placidus': return placidusApprox(asc, mc, lat);
    case 'koch': return placidusApprox(asc, mc, lat); // Koch approx = similar
    case 'campanus': return equalHouses(asc); // Simplified
    case 'regiomontanus': return equalHouses(asc); // Simplified
    default: return placidusApprox(asc, mc, lat);
  }
}

function equalHouses(asc: number): number[] {
  return Array.from({ length: 12 }, (_, i) => norm(asc + i * 30));
}

function wholeSignHouses(asc: number): number[] {
  const ascSign = Math.floor(asc / 30);
  return Array.from({ length: 12 }, (_, i) => norm((ascSign + i) * 30));
}

function placidusApprox(asc: number, mc: number, lat: number): number[] {
  const cusps = new Array<number>(12);
  const ic = norm(mc + 180);
  const dsc = norm(asc + 180);

  cusps[0] = asc;   // House 1 = ASC
  cusps[9] = mc;    // House 10 = MC
  cusps[3] = ic;    // House 4 = IC
  cusps[6] = dsc;   // House 7 = DSC

  // Semi-arc interpolation (approximation of Placidus)
  const mcToAsc = angleBetween(mc, asc);
  cusps[10] = norm(mc + mcToAsc / 3);
  cusps[11] = norm(mc + 2 * mcToAsc / 3);

  const ascToIc = angleBetween(asc, ic);
  cusps[1] = norm(asc + ascToIc / 3);
  cusps[2] = norm(asc + 2 * ascToIc / 3);

  const icToDsc = angleBetween(ic, dsc);
  cusps[4] = norm(ic + icToDsc / 3);
  cusps[5] = norm(ic + 2 * icToDsc / 3);

  const dscToMc = angleBetween(dsc, mc);
  cusps[7] = norm(dsc + dscToMc / 3);
  cusps[8] = norm(dsc + 2 * dscToMc / 3);

  return cusps;
}

// ============================================================
// HOUSE POSITION LOOKUP
// ============================================================

/**
 * Determine which house a longitude falls in
 */
export function getHouseForLongitude(longitude: number, cusps: number[]): number {
  for (let i = 0; i < 12; i++) {
    const next = (i + 1) % 12;
    const start = cusps[i];
    const end = cusps[next];

    if (start < end) {
      if (longitude >= start && longitude < end) return i + 1;
    } else {
      // Wraps around 0°
      if (longitude >= start || longitude < end) return i + 1;
    }
  }
  return 1;
}

// ============================================================
// HELPERS
// ============================================================

function angleBetween(from: number, to: number): number {
  let diff = to - from;
  if (diff < 0) diff += 360;
  return diff;
}
