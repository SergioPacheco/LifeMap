// ============================================================
// HOUSES.TS — House System Calculations
// Primary: Swiss Ephemeris (real iterative Placidus/Koch)
// Fallback: Browser-safe trigonometric Placidus
// ============================================================

import { norm, daysSinceJ2000 } from './calculations';
import { calculateHousesSweph, isSwephReady } from './sweph-provider';
import type { HouseData, HouseSystem } from './types';

// ============================================================
// MAIN FUNCTION — DUAL ENGINE
// ============================================================

/**
 * Calculate house cusps, ASC, and MC
 * Uses Swiss Ephemeris when available, falls back to browser-safe calculations
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
  const cusps = calculateHouseCusps(utcDate, asc, mc, lat, lng, system);

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
  // This formula yields the western horizon intersection; the astrological
  // Ascendant is the eastern horizon, exactly opposite.
  return norm(Math.atan2(y, x) * 180 / Math.PI + 180);
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

  return norm(Math.atan2(Math.sin(lstRad), Math.cos(lstRad) * Math.cos(eps)) * 180 / Math.PI);
}

// ============================================================
// FALLBACK: House Cusp Calculations
// ============================================================

function calculateHouseCusps(
  utcDate: Date, asc: number, mc: number, lat: number, lng: number, system: HouseSystem
): number[] {
  switch (system) {
    case 'whole-sign': return wholeSignHouses(asc);
    case 'equal': return equalHouses(asc);
    case 'placidus': return placidusHouses(utcDate, asc, mc, lat, lng);
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

function placidusHouses(utcDate: Date, asc: number, mc: number, lat: number, lng: number): number[] {
  const d = daysSinceJ2000(utcDate);
  const armc = localSiderealTime(utcDate, lng);
  const eps = 23.4393 - 3.563e-7 * d;

  // Placidus is undefined inside the polar circle; use the previous quadrant
  // interpolation there instead of returning NaN cusps.
  if (Math.abs(lat) >= 90 - eps) return placidusApprox(asc, mc, lat);

  const sine = sinDeg(eps);
  const cose = cosDeg(eps);
  const tane = tanDeg(eps);
  const tanfi = tanDeg(lat);
  const a = asinDeg(tanfi * tane);
  const fh1 = atanDeg(sinDeg(a / 3) / tane);
  const fh2 = atanDeg(sinDeg(a * 2 / 3) / tane);
  const cusps = new Array<number>(12);

  cusps[0] = asc;
  cusps[9] = mc;
  cusps[10] = placidusIntermediateCusp(armc + 30, fh1, 3, tanfi, sine, cose);
  cusps[11] = placidusIntermediateCusp(armc + 60, fh2, 1.5, tanfi, sine, cose);
  cusps[1] = placidusIntermediateCusp(armc + 120, fh2, 1.5, tanfi, sine, cose);
  cusps[2] = placidusIntermediateCusp(armc + 150, fh1, 3, tanfi, sine, cose);

  cusps[3] = norm(cusps[9] + 180);
  cusps[4] = norm(cusps[10] + 180);
  cusps[5] = norm(cusps[11] + 180);
  cusps[6] = norm(cusps[0] + 180);
  cusps[7] = norm(cusps[1] + 180);
  cusps[8] = norm(cusps[2] + 180);

  return cusps;
}

function placidusIntermediateCusp(
  rectAscension: number,
  initialPole: number,
  divisor: number,
  tanLatitude: number,
  sinObliquity: number,
  cosObliquity: number
): number {
  const rectasc = norm(rectAscension);
  const maxIterations = 100;
  const convergence = 1 / 360000;

  let tangent = tanDeg(asinDeg(sinObliquity * sinDeg(asc1(rectasc, initialPole, sinObliquity, cosObliquity))));
  if (Math.abs(tangent) < 1e-12) return rectasc;

  let pole = atanDeg(sinDeg(asinDeg(tanLatitude * tangent) / divisor) / tangent);
  let cusp = asc1(rectasc, pole, sinObliquity, cosObliquity);
  let previous = cusp;

  for (let i = 1; i <= maxIterations; i++) {
    tangent = tanDeg(asinDeg(sinObliquity * sinDeg(cusp)));
    if (Math.abs(tangent) < 1e-12) return rectasc;

    pole = atanDeg(sinDeg(asinDeg(tanLatitude * tangent) / divisor) / tangent);
    cusp = asc1(rectasc, pole, sinObliquity, cosObliquity);

    if (i > 1 && Math.abs(diffDeg2n(cusp, previous)) < convergence) break;
    previous = cusp;
  }

  return cusp;
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

function localSiderealTime(utcDate: Date, lng: number): number {
  const d = daysSinceJ2000(utcDate);
  const gmst = norm(280.46061837 + 360.98564736629 * d);
  return norm(gmst + lng);
}

function asc1(x1: number, poleHeight: number, sinObliquity: number, cosObliquity: number): number {
  const x = norm(x1);
  const quadrant = Math.floor(x / 90) + 1;
  let value: number;

  if (Math.abs(90 - poleHeight) < 1e-12) return 180;
  if (Math.abs(90 + poleHeight) < 1e-12) return 0;

  if (quadrant === 1) value = asc2(x, poleHeight, sinObliquity, cosObliquity);
  else if (quadrant === 2) value = 180 - asc2(180 - x, -poleHeight, sinObliquity, cosObliquity);
  else if (quadrant === 3) value = 180 + asc2(x - 180, -poleHeight, sinObliquity, cosObliquity);
  else value = 360 - asc2(360 - x, poleHeight, sinObliquity, cosObliquity);

  return norm(value);
}

function asc2(x: number, poleHeight: number, sinObliquity: number, cosObliquity: number): number {
  let cot = -tanDeg(poleHeight) * sinObliquity + cosObliquity * cosDeg(x);
  let sinx = sinDeg(x);

  if (Math.abs(cot) < 1e-12) cot = 0;
  if (Math.abs(sinx) < 1e-12) sinx = 0;

  if (sinx === 0) return cot < 0 ? 180 : 0;
  if (cot === 0) return sinx < 0 ? -90 : 90;

  const value = atanDeg(sinx / cot);
  return value < 0 ? 180 + value : value;
}

function diffDeg2n(a: number, b: number): number {
  const diff = norm(a - b);
  return diff >= 180 ? diff - 360 : diff;
}

function sinDeg(value: number): number {
  return Math.sin(value * Math.PI / 180);
}

function cosDeg(value: number): number {
  return Math.cos(value * Math.PI / 180);
}

function tanDeg(value: number): number {
  return Math.tan(value * Math.PI / 180);
}

function asinDeg(value: number): number {
  return Math.asin(Math.max(-1, Math.min(1, value))) * 180 / Math.PI;
}

function atanDeg(value: number): number {
  return Math.atan(value) * 180 / Math.PI;
}
