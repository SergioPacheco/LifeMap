// ============================================================
// CALCULATIONS.TS — Dual Engine Position Calculator
// Primary: Swiss Ephemeris (sweph WASM) — identical to astro.com
// Fallback: Astronomy Engine — sub-arcminute for main planets
// ============================================================

import * as Astronomy from 'astronomy-engine';
import { calculatePositionsSweph, isSwephReady } from './sweph-provider';
import type { CelestialPosition, Positions, CalculationOptions } from './types';

// ============================================================
// MAIN FUNCTION — DUAL ENGINE
// ============================================================

/**
 * Calculate all celestial positions for a given UTC date.
 * Tries Swiss Ephemeris first (pro precision), falls back to Astronomy Engine.
 */
export function calculatePositions(utcDate: Date, options?: CalculationOptions): Positions {
  // Try Swiss Ephemeris first (sub-arcsecond precision)
  if (isSwephReady()) {
    const swephResult = calculatePositionsSweph(utcDate);
    if (swephResult && Object.keys(swephResult).length > 0) {
      return swephResult;
    }
  }

  // Fallback: Astronomy Engine (sub-arcminute for main planets)
  return calculatePositionsFallback(utcDate, options);
}

/**
 * Get which engine is currently active
 */
export function getActiveEngine(): 'swisseph' | 'astronomy-engine' {
  return isSwephReady() ? 'swisseph' : 'astronomy-engine';
}

// ============================================================
// FALLBACK: ASTRONOMY ENGINE
// ============================================================

// Extra points — mean elements (Astronomy Engine doesn't cover these)
const EXTRA_J2000 = { northNode: 125.04, lilith: 83.35, chiron: 209.37 };
const EXTRA_SPEED = { northNode: -0.05295, lilith: 0.11140, chiron: 0.01951 };

function calculatePositionsFallback(utcDate: Date, options?: CalculationOptions): Positions {
  const positions: Positions = {};

  try {
    const astroTime = new Astronomy.AstroTime(utcDate);

    // Moon (special handling)
    const moonEcl = Astronomy.EclipticGeoMoon(astroTime);
    positions.moon = {
      longitude: norm(moonEcl.lon),
      latitude: moonEcl.lat,
      speed: 13.176,
      isRetrograde: false,
    };

    // Sun and planets
    const bodyMap: Record<string, Astronomy.Body> = {
      sun: 'Sun' as Astronomy.Body,
      mercury: 'Mercury' as Astronomy.Body,
      venus: 'Venus' as Astronomy.Body,
      mars: 'Mars' as Astronomy.Body,
      jupiter: 'Jupiter' as Astronomy.Body,
      saturn: 'Saturn' as Astronomy.Body,
      uranus: 'Uranus' as Astronomy.Body,
      neptune: 'Neptune' as Astronomy.Body,
      pluto: 'Pluto' as Astronomy.Body,
    };

    for (const [key, body] of Object.entries(bodyMap)) {
      const equ = Astronomy.GeoVector(body, astroTime, true);
      const ecl = Astronomy.Ecliptic(equ);
      const isRetro = key !== 'sun' ? checkRetrograde(utcDate, body) : false;

      positions[key] = {
        longitude: norm(ecl.elon),
        latitude: ecl.elat,
        isRetrograde: isRetro,
      };
    }
  } catch (e) {
    console.warn('[AstronomyEngine] Error, using mean elements:', e);
    return calculateMeanPositions(utcDate);
  }

  // Extra points (mean elements — Astronomy Engine doesn't cover these)
  if (options?.includeExtraPoints !== false) {
    const d = daysSinceJ2000(utcDate);

    positions.northNode = {
      longitude: norm(EXTRA_J2000.northNode + EXTRA_SPEED.northNode * d),
      isRetrograde: true,
    };

    positions.southNode = {
      longitude: norm(positions.northNode.longitude + 180),
      isRetrograde: true,
    };

    positions.lilith = {
      longitude: norm(EXTRA_J2000.lilith + EXTRA_SPEED.lilith * d),
      isRetrograde: false,
    };

    positions.chiron = {
      longitude: norm(EXTRA_J2000.chiron + EXTRA_SPEED.chiron * d),
      isRetrograde: checkRetrogradeMean(utcDate, 'chiron'),
    };
  }

  return positions;
}

// ============================================================
// LAST-RESORT FALLBACK: Mean Elements (no dependencies)
// ============================================================

const J2000_POSITIONS: Record<string, number> = {
  sun: 280.4664, moon: 218.3165, mercury: 252.2509, venus: 181.9797,
  mars: 355.4330, jupiter: 34.3515, saturn: 49.9429,
  uranus: 313.2322, neptune: 304.8800, pluto: 238.9286,
};

const MEAN_SPEEDS: Record<string, number> = {
  sun: 0.98564736, moon: 13.17639040, mercury: 4.09233443, venus: 1.60213019,
  mars: 0.52402078, jupiter: 0.08309122, saturn: 0.03344421,
  uranus: 0.01172539, neptune: 0.00597994, pluto: 0.00396466,
};

function calculateMeanPositions(utcDate: Date): Positions {
  const d = daysSinceJ2000(utcDate);
  const positions: Positions = {};

  for (const [planet, j2000Lon] of Object.entries(J2000_POSITIONS)) {
    const speed = MEAN_SPEEDS[planet];
    positions[planet] = {
      longitude: norm(j2000Lon + speed * d),
      isRetrograde: false,
    };
  }

  // Extra points
  const extraPlanets = ['northNode', 'lilith', 'chiron'] as const;
  for (const pt of extraPlanets) {
    positions[pt] = {
      longitude: norm(EXTRA_J2000[pt] + EXTRA_SPEED[pt] * d),
      isRetrograde: EXTRA_SPEED[pt] < 0,
    };
  }

  positions.southNode = {
    longitude: norm((positions.northNode?.longitude || 0) + 180),
    isRetrograde: true,
  };

  return positions;
}

// ============================================================
// RETROGRADE DETECTION
// ============================================================

function checkRetrograde(date: Date, body: Astronomy.Body): boolean {
  try {
    const d1 = new Date(date.getTime() - 86400000);
    const d2 = new Date(date.getTime() + 86400000);

    const t1 = new Astronomy.AstroTime(d1);
    const t2 = new Astronomy.AstroTime(d2);

    const ecl1 = Astronomy.Ecliptic(Astronomy.GeoVector(body, t1, true));
    const ecl2 = Astronomy.Ecliptic(Astronomy.GeoVector(body, t2, true));

    let diff = ecl2.elon - ecl1.elon;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;

    return diff < 0;
  } catch {
    return false;
  }
}

function checkRetrogradeMean(date: Date, point: keyof typeof EXTRA_SPEED): boolean {
  // For mean elements with constant speed, retrograde = negative speed
  // Chiron's actual retrogradation requires the Swiss Ephemeris
  return EXTRA_SPEED[point] < 0;
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

export function norm(angle: number): number {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

export function daysSinceJ2000(date: Date): number {
  const j2000ms = Date.UTC(2000, 0, 1, 12, 0, 0);
  return (date.getTime() - j2000ms) / 86400000;
}

export function dateToJD(date: Date): number {
  let y = date.getUTCFullYear();
  let m = date.getUTCMonth() + 1;
  const d = date.getUTCDate() +
            date.getUTCHours() / 24 +
            date.getUTCMinutes() / 1440 +
            date.getUTCSeconds() / 86400;
  if (m <= 2) { y--; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + B - 1524.5;
}

/**
 * Convert local date+time to UTC Date
 */
export function buildUTCDate(dateStr: string, timeStr: string, tzOffset: number): Date {
  const local = new Date(`${dateStr}T${timeStr}:00`);
  return new Date(local.getTime() - tzOffset * 3600000);
}

/**
 * Get sign index (0-11) from longitude
 */
export function getSignIndex(longitude: number): number {
  return Math.floor(norm(longitude) / 30);
}

/**
 * Get degree within sign (0-30)
 */
export function getDegreeInSign(longitude: number): number {
  return norm(longitude) % 30;
}

/**
 * Format degrees to DDD°MM' format
 */
export function formatDegMin(decimalDeg: number): string {
  const deg = Math.floor(decimalDeg);
  const min = Math.floor((decimalDeg - deg) * 60);
  return `${deg}°${min < 10 ? '0' : ''}${min}'`;
}

/**
 * Angular difference (shortest path)
 */
export function angularDifference(a: number, b: number): number {
  let d = Math.abs(norm(a) - norm(b));
  return d > 180 ? 360 - d : d;
}
