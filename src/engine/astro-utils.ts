// ============================================================
// ASTRO-UTILS.TS — Pure utility functions (no WASM dependencies)
// Safe to import in any browser component without pulling sweph
// ============================================================

/**
 * Normalize angle to 0-360 range
 */
export function norm(angle: number): number {
  angle = angle % 360;
  return angle < 0 ? angle + 360 : angle;
}

/**
 * Get sign index (0-11) from ecliptic longitude
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
