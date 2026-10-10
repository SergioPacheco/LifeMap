// ============================================================
// EPHEMERIS-SPIKE.TS — sweph (nativo) × astronomy-engine (fallback)
//
// Time-boxed: decide se o path serverless (Workers, sem addon nativo)
// mantém precisão suficiente. Mede deltas de longitude por corpo,
// instantes de fases, estações e retorno solar. Critério: fases dentro
// de ±2h (tolerância da fixture), estações em day-grade, planetas
// maiores em arcminutes.
// ============================================================

import {
  calculatePositionsFallback,
  norm,
} from '../../src/engine/calculations';
import { calculatePositionsSweph, initSweph, isSwephReady } from '../../src/engine/sweph-provider';

const BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'northNode', 'lilith', 'chiron'] as const;

function moonElongation(date: Date, get: (body: string, date: Date) => number | null): number | null {
  const sun = get('sun', date);
  const moon = get('moon', date);
  if (sun === null || moon === null) return null;
  return norm(moon - sun);
}

function refinePhase(
  target: number,
  fromMs: number,
  toMs: number,
  get: (body: string, date: Date) => number | null
): number | null {
  const sd = (v: number) => {
    const d = norm(v - target);
    return d > 180 ? d - 360 : d;
  };
  let prevT = fromMs;
  let prev = moonElongation(new Date(fromMs), get);
  if (prev === null) return null;
  for (let t = fromMs + 600000; t <= toMs; t += 600000) {
    const current = moonElongation(new Date(t), get);
    if (current === null) {
      prev = null;
      continue;
    }
    if (prev !== null && (sd(prev) === 0 || sd(current) === 0 || sd(prev) * sd(current) < 0)) {
      let low = prevT;
      let high = t;
      for (let i = 0; i < 40; i++) {
        const mid: number = (low + high) / 2;
        const midEl = moonElongation(new Date(mid), get);
        const loEl = moonElongation(new Date(low), get);
        if (midEl === null || loEl === null) break;
        if (sd(loEl) === 0 || sd(loEl) * sd(midEl) <= 0) high = mid;
        else low = mid;
      }
      return (low + high) / 2;
    }
    prev = current;
    prevT = t;
  }
  return null;
}

async function main(): Promise<void> {
  const ready = await initSweph();
  console.log(`sweph native ready: ${ready} (isSwephReady=${isSwephReady()})`);
  if (!ready) {
    console.error('SPIKE BLOCKED: sweph did not load in this environment');
    process.exitCode = 2;
    return;
  }

  const getSweph = (body: string, date: Date): number | null => {
    const all = calculatePositionsSweph(date);
    const point = all?.[body];
    return point && Number.isFinite(point.longitude) ? point.longitude : null;
  };
  const getFallback = (body: string, date: Date): number | null => {
    const point = calculatePositionsFallback(date)[body];
    return point && Number.isFinite(point.longitude) ? point.longitude : null;
  };

  // 1. Longitude deltas at the reference full moon instant.
  const ref = new Date(Date.UTC(2025, 2, 14, 6, 55, 0));
  console.log('\nlongitude delta @ 2025-03-14T06:55Z (arcminutes, sweph − fallback):');
  let worst = 0;
  let worstBody = '';
  for (const body of BODIES) {
    const a = getSweph(body, ref);
    const b = getFallback(body, ref);
    if (a === null || b === null) {
      console.log(`  ${body}: unavailable on one engine`);
      continue;
    }
    let delta = a - b;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const arcmin = Math.abs(delta) * 60;
    if (arcmin > worst) {
      worst = arcmin;
      worstBody = body;
    }
    console.log(`  ${body}: ${arcmin.toFixed(2)}'`);
  }
  console.log(`worst: ${worstBody} ${worst.toFixed(2)}'`);

  // 2. Phase instants, March 2025.
  const fullSweph = refinePhase(180, Date.UTC(2025, 2, 12), Date.UTC(2025, 2, 16), getSweph);
  const fullFallback = refinePhase(180, Date.UTC(2025, 2, 12), Date.UTC(2025, 2, 16), getFallback);
  const newSweph = refinePhase(0, Date.UTC(2025, 2, 27), Date.UTC(2025, 2, 31), getSweph);
  const newFallback = refinePhase(0, Date.UTC(2025, 2, 27), Date.UTC(2025, 2, 31), getFallback);
  const minutes = (a: number | null, b: number | null) =>
    a === null || b === null ? 'n/a' : `${(Math.abs(a - b) / 60000).toFixed(1)} min`;
  console.log('\nphase instant deltas (sweph vs fallback):');
  console.log(`  full Mar 14: sweph=${fullSweph ? new Date(fullSweph).toISOString() : 'n/a'} delta=${minutes(fullSweph, fullFallback)}`);
  console.log(`  new Mar 29:  sweph=${newSweph ? new Date(newSweph).toISOString() : 'n/a'} delta=${minutes(newSweph, newFallback)}`);

  // 3. Mercury station day, March 2025 (daily flip scan per engine).
  const stationDay = (get: (body: string, date: Date) => number | null, retroOf: (date: Date) => boolean | null) => {
    void get;
    let prev: boolean | null = null;
    for (let d = 8; d <= 22; d++) {
      const flag = retroOf(new Date(Date.UTC(2025, 2, d, 12)));
      if (flag === null) {
        prev = null;
        continue;
      }
      if (prev !== null && flag !== prev) return `2025-03-${d} retro=${flag}`;
      prev = flag;
    }
    return 'not found';
  };
  const swephRetro = (date: Date) => {
    const all = calculatePositionsSweph(date);
    return all?.mercury ? all.mercury.isRetrograde : null;
  };
  const fallbackRetro = (date: Date) => calculatePositionsFallback(date).mercury.isRetrograde;
  console.log('\nmercury station flip:');
  console.log(`  sweph:    ${stationDay(getSweph, swephRetro)}`);
  console.log(`  fallback: ${stationDay(getFallback, fallbackRetro)}`);
}

void main();
