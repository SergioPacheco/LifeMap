// ============================================================
// CALCULATIONS.TS — Dual Engine Position Calculator
// Primary: Swiss Ephemeris (sweph WASM) — identical to astro.com
// Fallback: Astronomy Engine — sub-arcminute for main planets
// ============================================================

import * as Astronomy from 'astronomy-engine';
import { calculatePositionsSweph, isSwephReady, swephLongitude } from './sweph-provider';
import type { CelestialPosition, Positions, CalculationOptions } from './types';
import { zonedDateTimeToUtc } from '../utils/dateTime';

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
// PROVENANCE — per-result engine attribution
// The global ready flag alone never proves which engine produced a
// value; every factual pipeline must carry this per-point record.
// ============================================================

export type EngineId = 'swisseph' | 'astronomy-engine' | 'mean-elements';

export interface CalculationProvenance {
  engine: EngineId;
  /** Human-readable origin, e.g. 'swiss-ephemeris:native:calc_ut'. */
  source: string;
  /** 'computed' (ephemeris), 'approximate' (mean elements/trig), 'unavailable'. */
  precision: 'computed' | 'approximate' | 'unavailable';
}

export interface PositionsWithProvenance {
  positions: Positions;
  provenance: Record<string, CalculationProvenance>;
}

/** Points served by linear mean elements when the JS fallback is active. */
const MEAN_ELEMENT_POINTS = new Set(['northNode', 'southNode', 'lilith', 'chiron']);

/**
 * Calculate all positions and record, per body, which engine produced it.
 * Missing Swiss Ephemeris bodies are completed with the JS fallback and
 * attributed accordingly — never silently.
 */
export function calculatePositionsWithProvenance(
  utcDate: Date,
  options?: CalculationOptions
): PositionsWithProvenance {
  const positions: Positions = {};
  const provenance: Record<string, CalculationProvenance> = {};

  if (isSwephReady()) {
    const swephResult = calculatePositionsSweph(utcDate);
    if (swephResult) {
      for (const [key, value] of Object.entries(swephResult)) {
        positions[key] = value;
        provenance[key] = {
          engine: 'swisseph',
          source: 'swiss-ephemeris:native:calc_ut',
          precision: 'computed',
        };
      }
    }
  }

  const fallback = calculatePositionsFallback(utcDate, options);
  for (const [key, value] of Object.entries(fallback)) {
    if (positions[key]) continue;
    positions[key] = value;
    const mean = MEAN_ELEMENT_POINTS.has(key);
    provenance[key] = {
      engine: mean ? 'mean-elements' : 'astronomy-engine',
      source: mean ? 'mean-elements:linear:J2000' : 'astronomy-engine:GeoVector+Ecliptic',
      precision: mean ? 'approximate' : 'computed',
    };
  }

  return { positions, provenance };
}

// Single-body map for cheap refinement sampling (no full-chart cost).
const SINGLE_BODY_MAP: Record<string, Astronomy.Body> = {
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

/**
 * Longitude of one body at one instant, with real-engine priority.
 * Used by the adaptive transit search: sampling one body costs a
 * fraction of a full chart calculation. Returns null when unavailable
 * (callers must treat the contact as unavailable, never as zero).
 */
export function calculatePlanetLongitude(planet: string, utcDate: Date): number | null {
  if (planet === 'southNode') {
    const node = calculatePlanetLongitude('northNode', utcDate);
    return node === null ? null : norm(node + 180);
  }
  const swephLon = swephLongitude(planet, utcDate);
  if (swephLon !== null) return swephLon;
  try {
    if (planet === 'moon') {
      const ecl = Astronomy.EclipticGeoMoon(new Astronomy.AstroTime(utcDate));
      return Number.isFinite(ecl.lon) ? norm(ecl.lon) : null;
    }
    const body = SINGLE_BODY_MAP[planet];
    if (body) {
      const ecl = Astronomy.Ecliptic(
        Astronomy.GeoVector(body, new Astronomy.AstroTime(utcDate), true)
      );
      return Number.isFinite(ecl.elon) ? norm(ecl.elon) : null;
    }
    const base = EXTRA_J2000[planet as keyof typeof EXTRA_J2000];
    const speed = EXTRA_SPEED[planet as keyof typeof EXTRA_SPEED];
    if (base !== undefined && speed !== undefined) {
      return norm(base + speed * daysSinceJ2000(utcDate));
    }
  } catch {
    return null;
  }
  return null;
}

// ============================================================
// FALLBACK: ASTRONOMY ENGINE
// ============================================================

// Extra points — mean elements (Astronomy Engine doesn't cover these).
// Verified 2026-10-10 against sweph SE_MEAN_APOG/SE_TRUE_NODE across
// 2000–2030: northNode ≤ 0.4°, lilith ≤ 0.11° (constant was +180° off —
// the perigee — before; see scripts/reports/ephemeris-spike.ts). Chiron's
// eccentric orbit defeats any linear model (~29° off): callers must omit
// Chiron when this is the active source, never publish it as computed.
const EXTRA_J2000 = { northNode: 125.04, lilith: 263.35, chiron: 209.37 };
const EXTRA_SPEED = { northNode: -0.05295, lilith: 0.11140, chiron: 0.01951 };

export function calculatePositionsFallback(utcDate: Date, options?: CalculationOptions): Positions {
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
 * Convert local date+time to UTC Date.
 * dateStr: "YYYY-MM-DD", timeStr: "HH:MM", tzOffset: hours from UTC (e.g. -3 for Brazil)
 * We parse the components manually to avoid the browser interpreting the string
 * in the device's local timezone (which would be wrong if user is abroad).
 */
export function buildUTCDate(dateStr: string, timeStr: string, tzOffset: number, timeZoneId?: string): Date {
  return zonedDateTimeToUtc(dateStr, timeStr, timeZoneId, tzOffset);
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
