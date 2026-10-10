// ============================================================
// TRANSIT-WINDOWS.TS — Refined orb-entry/exit search for transits
//
// A daily ephemeris scan finds candidate contacts cheaply, but it cannot
// certify exact peaks. This module refines each candidate with an adaptive
// search over a caller-provided deviation function:
//
//   sample(utcMs) → signed, normalized angular deviation in degrees,
//                   0 = exact contact, in [-180, 180).
//
// Temporal precision of the search itself is sub-second (bisection +
// ternary-style minimization). The *declared* precision of a resulting
// ForecastEvent is a separate, per-source decision made by the dataset
// layer (minute for refined ephemeris contacts, day for day-catalogs).
// ============================================================

export interface TransitWindow {
  startUtcMs: number;
  peakUtcMs: number | null;
  endUtcMs: number;
}

export type DeviationSample = (utcMs: number) => number;

const MAX_SAMPLES = 4096;
const MIN_SAMPLES = 128;
const TARGET_STEP_MS = 15 * 60 * 1000; // ~15 minutes base resolution
const BISECTION_ITERATIONS = 60;
const PEAK_ITERATIONS = 80;

/**
 * Find every continuous interval of [startUtcMs, endUtcMs] where
 * |sample(t)| <= orbDeg, with entry/exit refined by bisection and the
 * closest approach (peak) located by interval minimization.
 *
 * peakUtcMs is null only when the closest approach cannot be certified
 * inside the queried period: the contact is already active at a period
 * edge and still tightening toward that edge (true peak outside).
 */
export function findTransitWindows(
  sample: DeviationSample,
  startUtcMs: number,
  endUtcMs: number,
  orbDeg: number,
  options?: { coarseSamples?: number; targetStepMs?: number }
): TransitWindow[] {
  if (!Number.isFinite(startUtcMs) || !Number.isFinite(endUtcMs) || endUtcMs <= startUtcMs) {
    throw new Error('INVALID_PERIOD: transit window search requires end > start');
  }
  if (!Number.isFinite(orbDeg) || orbDeg <= 0 || orbDeg >= 180) {
    throw new Error('INVALID_ORB: orb must be within (0, 180) degrees');
  }
  const probeStart = sample(startUtcMs);
  const probeEnd = sample(endUtcMs);
  if (!Number.isFinite(probeStart) || !Number.isFinite(probeEnd)) {
    throw new Error('INVALID_SAMPLE: deviation function must return finite numbers');
  }

  const rangeMs = endUtcMs - startUtcMs;
  const targetStep = options?.targetStepMs ?? TARGET_STEP_MS;
  const coarse = options?.coarseSamples;
  const steps =
    coarse !== undefined
      ? Math.min(MAX_SAMPLES, Math.max(8, Math.floor(coarse)))
      : Math.min(MAX_SAMPLES, Math.max(MIN_SAMPLES, Math.ceil(rangeMs / targetStep)));
  const stepMs = rangeMs / steps;

  const inside = (value: number) => Math.abs(value) <= orbDeg;

  // Coarse scan: collect raw in/out transition points.
  const times: number[] = [startUtcMs];
  const values: number[] = [probeStart];
  for (let i = 1; i <= steps; i++) {
    const t = i === steps ? endUtcMs : startUtcMs + i * stepMs;
    const value = sample(t);
    if (!Number.isFinite(value)) {
      throw new Error('INVALID_SAMPLE: deviation function must return finite numbers');
    }
    times.push(t);
    values.push(value);
  }

  const windows: TransitWindow[] = [];
  let openStart: number | null = inside(values[0]) ? startUtcMs : null;

  for (let i = 1; i < times.length; i++) {
    const wasIn = inside(values[i - 1]);
    const isIn = inside(values[i]);
    if (!wasIn && isIn) {
      openStart = refineBoundary(sample, times[i - 1], times[i], orbDeg, true);
    } else if (wasIn && !isIn && openStart !== null) {
      const close = refineBoundary(sample, times[i - 1], times[i], orbDeg, false);
      windows.push({ startUtcMs: openStart, peakUtcMs: 0, endUtcMs: close });
      openStart = null;
    }
  }
  if (openStart !== null) {
    windows.push({ startUtcMs: openStart, peakUtcMs: 0, endUtcMs: endUtcMs });
  }

  // Refine the peak of each window by minimizing |sample| inside it.
  // A grazing contact can refine to a zero-duration instant; callers that
  // need strict end > start (e.g. ForecastEvent) must drop or widen it.
  return windows.map((window) => {
    let { startUtcMs: wStart, endUtcMs: wEnd } = window;
    if (!(wEnd > wStart)) {
      const mid = (wStart + wEnd) / 2;
      wStart = mid;
      wEnd = mid;
    }
    return {
      startUtcMs: wStart,
      peakUtcMs: refinePeak(sample, wStart, wEnd, startUtcMs, endUtcMs),
      endUtcMs: wEnd,
    };
  });
}

/** Bisect an entry (outside→inside) or exit (inside→outside) orb crossing. */
function refineBoundary(
  sample: DeviationSample,
  tA: number,
  tB: number,
  orbDeg: number,
  entering: boolean
): number {
  // Coarse scan order guarantees tA < tB here.
  let lo = tA;
  let hi = tB;
  for (let i = 0; i < BISECTION_ITERATIONS; i++) {
    const mid = (lo + hi) / 2;
    const inOrb = Math.abs(sample(mid)) <= orbDeg;
    if (entering) {
      if (inOrb) hi = mid;
      else lo = mid;
    } else {
      if (inOrb) lo = mid;
      else hi = mid;
    }
  }
  return entering ? hi : lo;
}

/**
 * Locate the closest approach inside [wStart, wEnd]. Returns null when the
 * minimum provably lies against a clipped period edge (true peak outside
 * the queried range).
 */
function refinePeak(
  sample: DeviationSample,
  wStart: number,
  wEnd: number,
  periodStart: number,
  periodEnd: number
): number | null {
  if (!(wEnd > wStart)) {
    // Degenerate single-instant contact: the instant itself is the peak,
    // unless it sits on a clipped edge with tightening deviation.
    if (wStart === periodStart || wStart === periodEnd) return null;
    return wStart;
  }
  let lo = wStart;
  let hi = wEnd;
  for (let i = 0; i < PEAK_ITERATIONS; i++) {
    const m1 = lo + (hi - lo) / 3;
    const m2 = hi - (hi - lo) / 3;
    if (Math.abs(sample(m1)) <= Math.abs(sample(m2))) hi = m2;
    else lo = m1;
  }
  const peak = (lo + hi) / 2;

  // Certify: a peak exactly on a clipped period edge with deviation still
  // tightening toward that edge means the true extremum is outside.
  const edgeEpsilon = Math.max(1, (wEnd - wStart) / 1e6);
  if (wStart === periodStart && peak - wStart <= edgeEpsilon) {
    const after = sample(Math.min(wEnd, wStart + Math.max(60000, (wEnd - wStart) / 100)));
    if (Math.abs(sample(wStart)) <= Math.abs(after)) return null;
  }
  if (wEnd === periodEnd && wEnd - peak <= edgeEpsilon) {
    const before = sample(Math.max(wStart, wEnd - Math.max(60000, (wEnd - wStart) / 100)));
    if (Math.abs(sample(wEnd)) <= Math.abs(before)) return null;
  }
  return peak;
}
