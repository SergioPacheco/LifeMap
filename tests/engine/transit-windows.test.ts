import { describe, expect, it } from 'vitest';
import { findTransitWindows } from '../../src/engine/forecast/transit-windows';

const HOUR = 3600000;
const DAY = 24 * HOUR;

// Linear exact contact at t0 drifting 0.5°/day (e.g. Sun-like motion).
function linearSample(t0: number, rateDegPerDay = 0.5) {
  return (t: number) => ((t - t0) / DAY) * rateDegPerDay;
}

// Triple retrograde passage: deviation crosses zero three times.
function retrogradeSample(t0: number, spanDays = 120) {
  const t1 = t0 + (spanDays * DAY) / 2;
  return (t: number) => {
    const x = (t - t0) / DAY; // 0..spanDays
    // Forward, back, forward: crosses the contact three times.
    const lon = 8 * Math.sin((x / spanDays) * Math.PI * 2.2) + (x - spanDays / 2) * 0.12;
    void t1;
    return lon;
  };
}

describe('findTransitWindows', () => {
  it('finds a single exact contact with entry, peak and exit', () => {
    const start = Date.UTC(2026, 2, 1);
    const end = Date.UTC(2026, 2, 31);
    const exact = Date.UTC(2026, 2, 15, 12);
    const windows = findTransitWindows(linearSample(exact), start, end, 1);
    expect(windows).toHaveLength(1);
    const [window] = windows;
    expect(window.startUtcMs).toBeLessThan(exact);
    expect(window.endUtcMs).toBeGreaterThan(exact);
    // 1° orb at 0.5°/day → ±2 days around the exact contact.
    expect(window.startUtcMs).toBeCloseTo(exact - 2 * DAY, -3);
    expect(window.endUtcMs).toBeCloseTo(exact + 2 * DAY, -3);
    expect(window.peakUtcMs).not.toBeNull();
    expect(window.peakUtcMs!).toBeCloseTo(exact, -3);
  });

  it('preserves three retrograde passages as separate windows', () => {
    const start = Date.UTC(2026, 0, 1);
    const end = Date.UTC(2026, 3, 30);
    const windows = findTransitWindows(retrogradeSample(start, 119), start, end, 2);
    expect(windows.length).toBeGreaterThanOrEqual(3);
    for (const window of windows) {
      expect(window.endUtcMs).toBeGreaterThan(window.startUtcMs);
      expect(window.peakUtcMs).not.toBeNull();
      expect(window.peakUtcMs!).toBeGreaterThanOrEqual(window.startUtcMs);
      expect(window.peakUtcMs!).toBeLessThanOrEqual(window.endUtcMs);
    }
    // Windows are ordered and disjoint.
    for (let i = 1; i < windows.length; i++) {
      expect(windows[i].startUtcMs).toBeGreaterThanOrEqual(windows[i - 1].endUtcMs);
    }
  });

  it('handles a 359°→0° wrap without splitting the window', () => {
    const start = Date.UTC(2026, 5, 1);
    const end = Date.UTC(2026, 5, 11);
    const exact = Date.UTC(2026, 5, 6);
    // Transit longitude crosses 0° Aries; natal point at 0.5°.
    // 359° + 0.3°/day reaches 0.5° exactly 5 days after start.
    const sample = (t: number) => {
      const transitLon = (359 + ((t - start) / DAY) * 0.3) % 360;
      let dev = transitLon - 0.5;
      if (dev > 180) dev -= 360;
      if (dev < -180) dev += 360;
      return dev;
    };
    const windows = findTransitWindows(sample, start, end, 1);
    expect(windows).toHaveLength(1);
    expect(windows[0].peakUtcMs!).toBeCloseTo(exact, -2);
  });

  it('ignores an orb tangency that never enters orb', () => {
    const start = Date.UTC(2026, 7, 1);
    const end = Date.UTC(2026, 7, 31);
    const mid = (start + end) / 2;
    // Closest approach stays 0.05° outside a 1° orb.
    const sample = (t: number) => 1.05 + Math.pow((t - mid) / DAY, 2) * 0.01;
    expect(findTransitWindows(sample, start, end, 1)).toHaveLength(0);
  });

  it('keeps an event active at the period start with a clipped edge', () => {
    const start = Date.UTC(2026, 8, 1);
    const end = Date.UTC(2026, 8, 31);
    // Exact contact 10 days before the period; still inside a wide orb at start, separating.
    const windows = findTransitWindows(linearSample(start - 10 * DAY, 0.5), start, end, 8);
    expect(windows).toHaveLength(1);
    expect(windows[0].startUtcMs).toBe(start);
    // True peak lies before the period, so no peak can be certified inside it.
    expect(windows[0].peakUtcMs).toBeNull();
  });

  it('keeps an event active at the period end with a clipped edge', () => {
    const start = Date.UTC(2026, 9, 1);
    const end = Date.UTC(2026, 9, 30);
    // Exact contact after the period; enters orb before the end while still applying.
    const windows = findTransitWindows(linearSample(end + 5 * DAY, 0.5), start, end, 8);
    expect(windows).toHaveLength(1);
    expect(windows[0].endUtcMs).toBe(end);
    expect(windows[0].peakUtcMs).toBeNull();
  });

  it('rejects invalid ranges and orbs', () => {
    const start = Date.UTC(2026, 0, 1);
    expect(() => findTransitWindows(() => 0, start, start, 1)).toThrow();
    expect(() => findTransitWindows(() => 0, start + 1, start, 1)).toThrow();
    expect(() => findTransitWindows(() => 0, start, start + 1, 0)).toThrow();
    expect(() => findTransitWindows(() => 0, start, start + 1, 180)).toThrow();
    expect(() => findTransitWindows(() => Number.NaN, start, start + 1, 1)).toThrow();
  });
});
