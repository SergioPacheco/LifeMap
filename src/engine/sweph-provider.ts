// ============================================================
// SWEPH-PROVIDER.TS — Swiss Ephemeris Wrapper
// Provides high-precision planetary positions via sweph (WASM)
// Same engine used by astro.com (Astrodienst)
// ============================================================

import type { CelestialPosition, Positions, HouseSystem } from './types';
import { norm } from './calculations';

// ============================================================
// LAZY IMPORT — sweph loads asynchronously
// ============================================================

let sweph: any = null;
let swephReady = false;
let swephLoadPromise: Promise<boolean> | null = null;

/**
 * Initialize Swiss Ephemeris (call once at app start)
 */
export async function initSweph(): Promise<boolean> {
  if (swephReady) return true;
  if (swephLoadPromise) return swephLoadPromise;

  // The npm `sweph` package is a native Node addon, not a browser/WASM module.
  // GitHub Pages runs this app entirely in the browser, so use the JS fallback there.
  if (typeof window !== 'undefined') {
    swephReady = false;
    return false;
  }

  swephLoadPromise = (async () => {
    try {
      sweph = await import(/* @vite-ignore */ 'sweph');
      swephReady = true;
      console.log('[SwissEph] Initialized v' + sweph.version());
      return true;
    } catch (e) {
      console.warn('[SwissEph] Failed to load, using fallback:', e);
      swephReady = false;
      return false;
    }
  })();

  return swephLoadPromise;
}

/**
 * Check if Swiss Ephemeris is ready
 */
export function isSwephReady(): boolean {
  return swephReady;
}

// ============================================================
// PLANET CONSTANTS
// ============================================================

// Planet IDs in Swiss Ephemeris
const SE_PLANETS: Record<string, number> = {
  sun: 0,       // SE_SUN
  moon: 1,      // SE_MOON
  mercury: 2,   // SE_MERCURY
  venus: 3,     // SE_VENUS
  mars: 4,      // SE_MARS
  jupiter: 5,   // SE_JUPITER
  saturn: 6,    // SE_SATURN
  uranus: 7,    // SE_URANUS
  neptune: 8,   // SE_NEPTUNE
  pluto: 9,     // SE_PLUTO
  northNode: 11, // SE_TRUE_NODE
  lilith: 12,   // SE_MEAN_APOG (Mean Black Moon Lilith)
  chiron: 15,   // SE_CHIRON
  // Asteroids (numbered from SE_AST_OFFSET + asteroid number)
  ceres: 17,    // SE_CERES
  pallas: 18,   // SE_PALLAS
  juno: 19,     // SE_JUNO
  vesta: 20,    // SE_VESTA
};

// Flags: compute speed + use Swiss Eph files (fallback to Moshier)
const SEFLG_SPEED = 256;
const SEFLG_SWIEPH = 2;
const CALC_FLAGS = SEFLG_SPEED | SEFLG_SWIEPH;

// House system codes for Swiss Ephemeris
const HOUSE_SYSTEM_CODES: Record<HouseSystem, string> = {
  'placidus': 'P',
  'koch': 'K',
  'equal': 'E',
  'whole-sign': 'W',
  'campanus': 'C',
  'regiomontanus': 'R',
};

// ============================================================
// POSITION CALCULATION
// ============================================================

/**
 * Calculate all planetary positions using Swiss Ephemeris
 * Returns null if sweph is not ready (caller should use fallback)
 */
export function calculatePositionsSweph(utcDate: Date): Positions | null {
  if (!swephReady || !sweph) return null;

  const jd = dateToJulianDay(utcDate);
  const positions: Positions = {};

  for (const [planetId, seId] of Object.entries(SE_PLANETS)) {
    try {
      const result = sweph.calc_ut(jd, seId, CALC_FLAGS);

      if (result && result.data) {
        const longitude = result.data[0];
        const latitude = result.data[1];
        const speed = result.data[3]; // Speed in longitude (°/day)

        positions[planetId] = {
          longitude: norm(longitude),
          latitude,
          speed,
          isRetrograde: speed < 0,
        };
      }
    } catch (e) {
      console.warn(`[SwissEph] Error calculating ${planetId}:`, e);
    }
  }

  // South Node = opposite of True Node
  if (positions.northNode) {
    positions.southNode = {
      longitude: norm(positions.northNode.longitude + 180),
      latitude: positions.northNode.latitude ? -positions.northNode.latitude : 0,
      speed: positions.northNode.speed,
      isRetrograde: true,
    };
  }

  return positions;
}

// ============================================================
// HOUSE CALCULATION
// ============================================================

export interface SwephHouseResult {
  cusps: number[];      // 12 house cusps
  ascendant: number;
  midheaven: number;
  armc: number;         // ARMC (sidereal time in degrees)
  vertex: number;
  equatorialAsc: number;
}

/**
 * Calculate houses using Swiss Ephemeris (real Placidus, Koch, etc.)
 * Returns null if sweph is not ready
 */
export function calculateHousesSweph(
  utcDate: Date, lat: number, lng: number, system: HouseSystem
): SwephHouseResult | null {
  if (!swephReady || !sweph) return null;

  const jd = dateToJulianDay(utcDate);
  const hsys = HOUSE_SYSTEM_CODES[system] || 'P';

  try {
    const result = sweph.houses(jd, lat, lng, hsys);

    if (result && result.data) {
      return {
        cusps: result.data.houses,           // 12 cusps (0-indexed)
        ascendant: result.data.points[0],    // ASC
        midheaven: result.data.points[1],    // MC
        armc: result.data.points[2],         // ARMC
        vertex: result.data.points[3],       // Vertex
        equatorialAsc: result.data.points[4], // Equatorial ASC
      };
    }
  } catch (e) {
    console.warn('[SwissEph] Error calculating houses:', e);
  }

  return null;
}

// ============================================================
// JULIAN DAY CALCULATION
// ============================================================

/**
 * Convert UTC Date to Julian Day Number
 */
export function dateToJulianDay(date: Date): number {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + 1;
  const d = date.getUTCDate();
  const h = date.getUTCHours() + date.getUTCMinutes() / 60 + date.getUTCSeconds() / 3600;

  // Use sweph's julday if available
  if (swephReady && sweph) {
    return sweph.julday(y, m, d, h, 1); // 1 = Gregorian calendar
  }

  // Fallback: manual calculation
  let yy = y, mm = m;
  if (mm <= 2) { yy--; mm += 12; }
  const A = Math.floor(yy / 100);
  const B = 2 - A + Math.floor(A / 4);
  const dayFrac = d + h / 24;
  return Math.floor(365.25 * (yy + 4716)) + Math.floor(30.6001 * (mm + 1)) + dayFrac + B - 1524.5;
}

// ============================================================
// UTILITY: Solar Return (exact Sun position search)
// ============================================================

/**
 * Find exact moment when Sun returns to natal degree (for Solar Return)
 * Uses Swiss Ephemeris solcross_ut for extreme precision
 */
export function findSolarReturn(natalSunLon: number, startJD: number): number | null {
  if (!swephReady || !sweph || !sweph.solcross_ut) return null;

  try {
    const result = sweph.solcross_ut(natalSunLon, startJD, 0);
    return result;
  } catch (e) {
    console.warn('[SwissEph] solcross_ut error:', e);
    return null;
  }
}
