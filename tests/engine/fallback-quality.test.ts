import { describe, expect, it } from 'vitest';
import { calculatePlanetLongitude } from '../../src/engine/calculations';

// Fallback quality pins (spike 2026-10-10, scripts/reports/ephemeris-spike.ts).
// The mean Lilith constant was 180° off (perigee) before the fix; this test
// pins it against the sweph SE_MEAN_APOG value so the trap cannot return.
// Chiron's linear model (~29° off) is gated by omission, covered in facts.test.ts.
describe('fallback ephemeris quality', () => {
  it('tracks mean Lilith within one degree across decades', () => {
    const pins: Array<[string, number]> = [
      ['2000-01-01T12:00:00Z', 263.46],
      ['2010-06-15T12:00:00Z', 328.58],
      ['2020-01-01T12:00:00Z', 357.11],
      ['2025-03-14T12:00:00Z', 208.61],
      ['2030-07-01T12:00:00Z', 64.32],
    ];
    for (const [iso, expected] of pins) {
      const longitude = calculatePlanetLongitude('lilith', new Date(iso));
      expect(longitude).not.toBeNull();
      let delta = Math.abs((longitude ?? 0) - expected);
      if (delta > 180) delta = 360 - delta;
      expect(delta).toBeLessThan(1);
    }
  });
});
