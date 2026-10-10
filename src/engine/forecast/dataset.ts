// ============================================================
// DATASET.TS — Period forecast events over the deterministic engine
//
// Strategy (per spec §7):
// - A daily ephemeris cache discovers candidates cheaply: transit
//   contacts, stations, moon phases, ingresses and cycle phases.
// - Each candidate is refined with adaptive search (transit-windows or
//   bisection on single-body longitudes). Daily sampling alone never
//   certifies an exact peak.
// - Eclipses come from the versioned day-catalog with explicit coverage;
//   a missing catalog blocks complete annual-grade reports instead of
//   inventing events (coverage.ts).
// - Timing precision is declared per source: refined ephemeris contacts
//   are minute-grade; day-catalog and station detections are day-grade.
//   The 60 s tolerance applies only where the source supports it.
// - Windows shorter than 60 s (orb grazes) are dropped as marginalia.
//
// Deliberate scope: the Moon is covered by phases/ingresses, not by the
// refined transit search (hour-scale contacts are editorial noise for
// annual-grade reports). Void-of-course stays in the on-screen calendar
// only. Progressed houses/angles are NOT published (convention
// unvalidated) — only progressed-to-natal contacts as facts.
// ============================================================

import type {
  AspectType,
  BirthData,
  NatalChart,
} from '../types';
import type {
  ForecastEvent,
  ReportRequest,
} from '../../reports/core/types';
import type { Theme } from '../calendar/types';
import { validateReportRequest } from '../../reports/core/schemas';
import {
  calculatePlanetLongitude,
  calculatePositions,
  getSignIndex,
  norm,
} from '../calculations';
import { getHouseForLongitude } from '../houses';
import { calculateSolarReturn } from '../index';
import { calculateProgressedToNatalAspects, calculateProgressions } from '../progressions';
import { DEFAULT_CALENDAR_CONFIG, type CalendarEvent } from '../calendar/types';
import { getEclipseEvents } from '../calendar/eclipses';
import { getProfectionForDate } from '../calendar/profection';
import { mapEventThemes } from '../calendar/theme-mapper';
import {
  calendarDateAtLocalTime,
  calendarDateKeyForInstant,
  calendarDatePartsForInstant,
  getCalendarTimeContext,
  type CalendarTimeContext,
} from '../calendar/calendar-date';
import { findTransitWindows } from './transit-windows';
import { assertEclipseCoverage } from './coverage';
import { transitImportance } from './event-ranking';
import { buildSubjectChart } from './chart';
import {
  natalAngleFactId,
  natalPositionFactId,
  profectionFactId,
  progressedAspectFactId,
  solarReturnFactId,
} from '../../reports/core/ids';
import type { AstroFact } from '../../reports/core/types';

const DAY_MS = 86400000;
const MIN_WINDOW_MS = 60000;

const ASPECT_TARGETS: Array<{ type: AspectType; angle: number; orb: number }> = [
  { type: 'conjunction', angle: 0, orb: 2 },
  { type: 'sextile', angle: 60, orb: 1.5 },
  { type: 'square', angle: 90, orb: 2 },
  { type: 'trine', angle: 120, orb: 2 },
  { type: 'opposition', angle: 180, orb: 2 },
];

// Refined transit search covers slow-enough bodies; the Moon is handled
// by phases/ingresses (see header).
const TRANSIT_PLANETS = [
  'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn',
  'uranus', 'neptune', 'pluto', 'chiron', 'northNode',
];

const RETURN_PLANETS = ['saturn', 'jupiter', 'mars'];
const RETURN_ORB = 3;
const RETURN_EXACT_ORB = 1;

const MOON_PHASE_TARGETS = [
  { angle: 0, phase: 'new' },
  { angle: 90, phase: 'first-quarter' },
  { angle: 180, phase: 'full' },
  { angle: 270, phase: 'last-quarter' },
] as const;

export interface DatasetOptions {
  housesKnown: boolean;
  subjectIndex?: number;
  birth?: BirthData;
}

export interface TemporalFacts {
  facts: AstroFact[];
  limitations: string[];
}

/** Public entry: validated request → period events with resolved links. */
export async function buildForecastDataset(request: ReportRequest): Promise<ForecastEvent[]> {
  const validated = validateReportRequest(request);
  if (!isTemporal(validated.reportType)) return [];
  if (!validated.period) throw new Error('PERIOD_REQUIRED: temporal content needs an explicit period');
  const subject = validated.subjects[0];
  const { chart, housesKnown } = buildSubjectChart(subject, validated.houseSystem);
  const datasetOptions: DatasetOptions = { housesKnown, subjectIndex: 0, birth: subject.birth };
  const { events } = collectForecastEvents(chart, validated, datasetOptions);
  const temporal = buildTemporalFacts(chart, validated, datasetOptions);
  return retainKnownFactIds(events, knownFactIds(chart, temporal.facts, 0, housesKnown));
}

/** Keep only evidence links that resolve to a known fact ID. */
export function retainKnownFactIds(events: ForecastEvent[], known: Set<string>): ForecastEvent[] {
  for (const event of events) {
    event.factIds = event.factIds.filter((id) => known.has(id));
  }
  return events;
}

/** Fact IDs a standalone dataset run can vouch for (no invented links). */
export function knownFactIds(
  chart: NatalChart,
  temporalFacts: AstroFact[],
  subjectIndex: number,
  housesKnown: boolean
): Set<string> {
  const known = new Set<string>(temporalFacts.map((fact) => fact.id));
  for (const [point, position] of Object.entries(chart.positions)) {
    if (position && Number.isFinite(position.longitude)) {
      known.add(natalPositionFactId(subjectIndex, point));
    }
  }
  if (housesKnown) {
    for (const angle of ['asc', 'mc', 'dc', 'ic']) known.add(natalAngleFactId(subjectIndex, angle));
  }
  return known;
}

/** Temporal facts (profection segments, solar returns, progressed contacts). */
export function buildTemporalFacts(
  chart: NatalChart,
  request: ReportRequest,
  options: DatasetOptions
): TemporalFacts {
  const facts: AstroFact[] = [];
  const limitations: string[] = [];
  const period = request.period;
  if (!period || !isTemporal(request.reportType)) return { facts, limitations };
  const subjectIndex = options.subjectIndex ?? 0;
  const startMs = Date.parse(period.start);
  const endMs = Date.parse(period.end);

  // ---- Profection segments --------------------------------------
  const birthCtx = getCalendarTimeContext(chart);
  for (const segment of profectionSegments(chart, startMs, endMs, birthCtx)) {
    facts.push({
      id: profectionFactId(subjectIndex, segment.year),
      kind: 'profection',
      values: {
        house: segment.profection.house,
        signIndex: segment.profection.sign,
        lord: segment.profection.lord,
        age: segment.profection.age,
        startUtc: new Date(segment.startMs).toISOString(),
        endUtc: new Date(segment.endMs).toISOString(),
      },
      subjectIndex,
      source: 'lifemap-engine:profection:annual:traditional',
      precision: 'computed',
    });
  }

  // ---- Solar returns (instants inside the period) ----------------
  const birthYear = birthCtx ? calendarDatePartsForInstant(chart.date, birthCtx).year : chart.date.getUTCFullYear();
  const startYear = new Date(startMs).getUTCFullYear() - 1;
  const endYear = new Date(endMs).getUTCFullYear() + 1;
  for (let year = Math.max(startYear, birthYear); year <= endYear; year++) {
    let solar: ReturnType<typeof calculateSolarReturn>;
    try {
      solar = calculateSolarReturn(chart, year, chart.meta.lat, chart.meta.lng, chart.meta.timezone, chart.meta.timeZoneId);
    } catch {
      limitations.push(`Solar return ${year} could not be calculated; omitted.`);
      continue;
    }
    const instantMs = solar.date.getTime();
    if (!Number.isFinite(instantMs) || instantMs < startMs || instantMs >= endMs) continue;
    facts.push({
      id: solarReturnFactId(subjectIndex, year),
      kind: 'solar-return',
      values: {
        year,
        instantUtc: solar.date.toISOString(),
        latitude: chart.meta.lat,
        longitude: chart.meta.lng,
        sunLongitudeDeg: Math.round(solar.positions.sun.longitude * 1000) / 1000,
      },
      subjectIndex,
      source: 'lifemap-engine:solar-return:minute-search',
      precision: 'computed',
    });
  }

  // ---- Secondary progressions (documented method, no houses) -----
  // Progressed houses/angles depend on an unvalidated convention, so only
  // progressed-to-natal contacts are published, evaluated at the period
  // start (they move ~1°/year and stay valid across it).
  try {
    if (!options.birth) throw new Error('missing birth');
    const progressed = calculateProgressions(chart, options.birth, new Date(startMs));
    const contacts = calculateProgressedToNatalAspects(progressed, chart);
    contacts.slice(0, 24).forEach((aspect, index) => {
      facts.push({
        id: progressedAspectFactId(subjectIndex, index + 1),
        kind: 'progressed-aspect',
        values: {
          progressedPlanet: aspect.planet1,
          natalPlanet: aspect.planet2,
          type: aspect.type,
          orbDeg: aspect.orb,
          applying: aspect.applying,
          method: 'secondary:day-for-a-year',
        },
        subjectIndex,
        source: 'lifemap-engine:progressions:secondary',
        precision: 'approximate',
      });
    });
    limitations.push(
      'Progressed houses and angles are not published: their convention is unvalidated. ' +
        'Only progressed-to-natal contacts (secondary, day-for-a-year) are included.'
    );
  } catch {
    limitations.push('Secondary progressions unavailable for this period; omitted.');
  }

  return { facts, limitations };
}

// ============================================================
// INTERNAL COLLECTION
// ============================================================

interface DaySample {
  t: number;
  lon: Record<string, number | null>;
  retro: Record<string, boolean>;
}

export function collectForecastEvents(
  chart: NatalChart,
  request: ReportRequest,
  options: DatasetOptions
): { events: ForecastEvent[]; limitations: string[] } {
  const period = request.period!;
  const startMs = Date.parse(period.start);
  const endMs = Date.parse(period.end);
  const subjectIndex = options.subjectIndex ?? 0;
  const cfg = DEFAULT_CALENDAR_CONFIG;
  const limitations: string[] = [];
  const events: ForecastEvent[] = [];

  const periodCtx: CalendarTimeContext = { timeZoneId: period.timeZoneId, timezone: chart.meta.timezone };
  const birthCtx = getCalendarTimeContext(chart);

  // Coverage first: complete annual-grade reports stop here, no invention.
  const coverage = assertEclipseCoverage(
    request.reportType, request.mode, request.forecastGranularity, startMs, endMs
  );
  if (!coverage.covered) {
    limitations.push(
      `Eclipse catalog covers ${coverage.catalogStartUtc}..${coverage.catalogEndUtc}; ` +
        'no eclipse events are generated outside it.'
    );
  }

  // ---- Daily cache (positions + retrograde flags) ----------------
  const days: DaySample[] = [];
  for (let t = startMs - DAY_MS; t <= endMs + DAY_MS; t += DAY_MS) {
    const date = new Date(t);
    let positions: Record<string, { longitude: number; isRetrograde: boolean }>;
    try {
      positions = calculatePositions(date);
    } catch {
      continue;
    }
    const lon: Record<string, number | null> = {};
    const retro: Record<string, boolean> = {};
    for (const planet of [...TRANSIT_PLANETS, 'moon']) {
      const point = (positions as Record<string, { longitude?: number; isRetrograde?: boolean }>)[planet];
      lon[planet] = point && Number.isFinite(point.longitude!) ? point.longitude! : null;
      retro[planet] = point?.isRetrograde ?? false;
    }
    days.push({ t, lon, retro });
  }

  // ---- Natal contact points --------------------------------------
  const natalPoints: Record<string, number> = {};
  for (const planet of TRANSIT_PLANETS) {
    const position = chart.positions[planet];
    if (position && Number.isFinite(position.longitude)) natalPoints[planet] = position.longitude;
  }
  if (options.housesKnown) {
    natalPoints.asc = chart.houses.ascendant;
    natalPoints.mc = chart.houses.midheaven;
    natalPoints.dc = norm(chart.houses.ascendant + 180);
    natalPoints.ic = norm(chart.houses.midheaven + 180);
  } else {
    limitations.push('Transit contacts to houses/angles omitted: birth time unknown.');
  }

  // ---- Refined transit windows ------------------------------------
  const counters = new Map<string, number>();
  const candidateDays = new Map<string, number[]>();
  for (const day of days) {
    for (const transitPlanet of TRANSIT_PLANETS) {
      const transitLon = day.lon[transitPlanet];
      if (transitLon === null || transitLon === undefined) continue;
      for (const [natalPoint, natalLon] of Object.entries(natalPoints)) {
        for (const aspect of ASPECT_TARGETS) {
          if (Math.abs(signedDiff(transitLon - natalLon, aspect.angle)) <= aspect.orb) {
            const key = `${transitPlanet}|${natalPoint}|${aspect.type}`;
            const list = candidateDays.get(key) ?? [];
            list.push(day.t);
            candidateDays.set(key, list);
          }
        }
      }
    }
  }

  for (const [key, times] of candidateDays) {
    const [transitPlanet, natalPoint, aspectType] = key.split('|');
    const aspect = ASPECT_TARGETS.find((entry) => entry.type === aspectType)!;
    const natalLon = natalPoints[natalPoint];
    for (const cluster of clusterTimes(times, 2 * DAY_MS)) {
      const rangeStart = Math.max(startMs, cluster[0] - 12 * 3600000);
      const rangeEnd = Math.min(endMs, cluster[cluster.length - 1] + 12 * 3600000);
      if (!(rangeEnd > rangeStart)) continue;
      const sample = (t: number) => {
        const lon = calculatePlanetLongitude(transitPlanet, new Date(t));
        if (lon === null) return Number.POSITIVE_INFINITY;
        return signedDiff(lon - natalLon, aspect.angle);
      };
      let windows;
      try {
        windows = findTransitWindows(sample, rangeStart, rangeEnd, aspect.orb, { coarseSamples: 48 });
      } catch {
        limitations.push(`Transit sampling unavailable for ${transitPlanet}; contact omitted, never zeroed.`);
        break;
      }
      for (const window of windows) {
        if (window.endUtcMs - window.startUtcMs < MIN_WINDOW_MS) continue;
        const peakLon = calculatePlanetLongitude(transitPlanet, new Date(window.peakUtcMs ?? window.startUtcMs));
        const minOrb = peakLon === null ? aspect.orb : Math.abs(signedDiff(peakLon - natalLon, aspect.angle));
        const occurrence = (counters.get(key) ?? 0) + 1;
        counters.set(key, occurrence);
        const stub = {
          type: 'transit-aspect',
          date: new Date(window.peakUtcMs ?? window.startUtcMs),
          transitPlanet,
          natalPlanet: natalPoint,
          aspectType: aspect.type,
          natalHouse: options.housesKnown
            ? getHouseForLongitude(peakLon ?? natalLon, chart.houses.cusps)
            : undefined,
        } as CalendarEvent;
        events.push({
          id: `t-${transitPlanet}-${aspect.type}-${natalPoint}-${String(occurrence).padStart(2, '0')}`,
          factIds: factIdsForTransit(subjectIndex, transitPlanet, natalPoint),
          kind: 'transit-aspect',
          startUtc: new Date(window.startUtcMs).toISOString(),
          peakUtc: window.peakUtcMs === null ? null : new Date(window.peakUtcMs).toISOString(),
          endUtc: new Date(window.endUtcMs).toISOString(),
          timingPrecision: 'minute',
          importance: transitImportance(transitPlanet, natalPoint, minOrb, aspect.orb),
          themes: mapEventThemes(stub, chart, cfg).filter(isTheme),
        });
      }
    }
  }

  // ---- Stations (day-grade retrograde flips) ----------------------
  for (let i = 1; i < days.length; i++) {
    const date = new Date(days[i].t);
    if (days[i].t < startMs || days[i].t >= endMs) continue;
    for (const planet of TRANSIT_PLANETS) {
      if (planet === 'sun' || planet === 'moon') continue;
      const before = days[i - 1].retro[planet];
      const after = days[i].retro[planet];
      if (before === after) continue;
      const kind = after && !before ? 'retrograde-start' : 'retrograde-end';
      const occurrence = (counters.get(`${kind}-${planet}`) ?? 0) + 1;
      counters.set(`${kind}-${planet}`, occurrence);
      events.push({
        id: `st-${planet}-${after ? 'r' : 'd'}-${dateKey(date, periodCtx)}`,
        factIds: [natalPositionFactId(subjectIndex, planet)],
        kind,
        startUtc: date.toISOString(),
        peakUtc: date.toISOString(),
        endUtc: new Date(days[i].t + DAY_MS).toISOString(),
        timingPrecision: 'day',
        importance: stationImportance(planet),
        themes: mapEventThemes({ type: kind, date, retroPlanet: planet } as CalendarEvent, chart, cfg).filter(isTheme),
      });
    }
  }

  // ---- Moon phases (refined crossings, minute-grade) ---------------
  for (const target of MOON_PHASE_TARGETS) {
    for (const crossing of findElongationCrossings(days, target.angle)) {
      const exactMs = refineElongation(crossing[0], crossing[1], target.angle);
      if (exactMs < startMs || exactMs >= endMs) continue;
      const moonLon = calculatePlanetLongitude('moon', new Date(exactMs)) ?? 0;
      events.push({
        id: `mph-${target.phase}-${dateKey(new Date(exactMs), periodCtx)}`,
        factIds: [natalPositionFactId(subjectIndex, 'moon'), natalPositionFactId(subjectIndex, 'sun')],
        kind: 'moon-phase',
        startUtc: new Date(exactMs).toISOString(),
        peakUtc: new Date(exactMs).toISOString(),
        endUtc: new Date(exactMs + MIN_WINDOW_MS).toISOString(),
        timingPrecision: 'minute',
        importance: target.phase === 'new' || target.phase === 'full' ? 8 : 5,
        themes: moonPhaseThemes(target.phase, getSignIndex(moonLon)),
      });
    }
  }

  // ---- Ingresses (sign changes, minute-grade) ----------------------
  const ingressPlanets = request.reportType === 'forecast' && request.forecastGranularity !== 'annual'
    ? [...TRANSIT_PLANETS, 'moon']
    : TRANSIT_PLANETS;
  for (const planet of ingressPlanets) {
    for (const [beforeMs, afterMs, sign] of findSignChanges(days, planet)) {
      const exactMs = refineSignIngress(beforeMs, afterMs, planet, sign);
      if (exactMs < startMs || exactMs >= endMs) continue;
      const occurrence = (counters.get(`ing-${planet}`) ?? 0) + 1;
      counters.set(`ing-${planet}`, occurrence);
      events.push({
        id: `ing-${planet}-${sign}-${dateKey(new Date(exactMs), periodCtx)}`,
        factIds: [natalPositionFactId(subjectIndex, planet)],
        kind: planet === 'moon' ? 'moon-ingress' : 'planet-ingress',
        startUtc: new Date(exactMs).toISOString(),
        peakUtc: new Date(exactMs).toISOString(),
        endUtc: new Date(exactMs + MIN_WINDOW_MS).toISOString(),
        timingPrecision: 'minute',
        importance: planet === 'moon' ? 3 : ingressImportance(planet),
        themes: mapEventThemes({
          type: planet === 'moon' ? 'moon-ingress' : 'planet-ingress',
          date: new Date(exactMs),
          transitPlanet: planet,
          transitSign: sign,
        } as CalendarEvent, chart, cfg).filter(isTheme),
      });
    }
  }

  // ---- Numeric planetary returns (all passes, minute-grade) --------
  for (const planet of RETURN_PLANETS) {
    const natalLon = natalPoints[planet];
    if (natalLon === undefined) continue;
    const sample = (t: number) => {
      const lon = calculatePlanetLongitude(planet, new Date(t));
      if (lon === null) return Number.POSITIVE_INFINITY;
      return signedDiff(lon - natalLon, 0);
    };
    let windows;
    try {
      windows = findTransitWindows(sample, startMs, endMs, RETURN_ORB);
    } catch {
      limitations.push(`Return sampling unavailable for ${planet}; omitted, never zeroed.`);
      continue;
    }
    let occurrence = 0;
    for (const window of windows) {
      if (window.endUtcMs - window.startUtcMs < MIN_WINDOW_MS) continue;
      occurrence++;
      const peakLon = calculatePlanetLongitude(planet, new Date(window.peakUtcMs ?? window.startUtcMs));
      const exact = peakLon !== null && Math.abs(signedDiff(peakLon - natalLon, 0)) <= RETURN_EXACT_ORB;
      events.push({
        id: `ret-${planet}-${exact ? 'exact' : 'approach'}-${String(occurrence).padStart(2, '0')}`,
        factIds: [natalPositionFactId(subjectIndex, planet)],
        kind: 'planetary-return',
        startUtc: new Date(window.startUtcMs).toISOString(),
        peakUtc: window.peakUtcMs === null ? null : new Date(window.peakUtcMs).toISOString(),
        endUtc: new Date(window.endUtcMs).toISOString(),
        timingPrecision: 'minute',
        importance: exact ? 10 : 7,
        themes: mapEventThemes({ type: 'planetary-return', date: new Date(window.startUtcMs), returnPlanet: planet, transitPlanet: planet } as CalendarEvent, chart, cfg).filter(isTheme),
      });
    }
    // Cycle opposition/squares from the daily cache (day-grade).
    for (const phase of findCyclePhases(days, planet, natalLon)) {
      if (phase.t < startMs || phase.t >= endMs) continue;
      events.push({
        id: `ret-${planet}-${phase.label}-${dateKey(new Date(phase.t), periodCtx)}`,
        factIds: [natalPositionFactId(subjectIndex, planet)],
        kind: 'planetary-return',
        startUtc: new Date(phase.t).toISOString(),
        peakUtc: new Date(phase.t).toISOString(),
        endUtc: new Date(phase.t + DAY_MS).toISOString(),
        timingPrecision: 'day',
        importance: 5,
        themes: mapEventThemes({ type: 'planetary-return', date: new Date(phase.t), returnPlanet: planet, transitPlanet: planet } as CalendarEvent, chart, cfg).filter(isTheme),
      });
    }
  }

  // ---- Eclipses (day-catalog, day-grade; never invented) ------------
  if (coverage.covered) {
    const months = monthsInRange(startMs, endMs, periodCtx);
    const seen = new Set<string>();
    for (const { year, month } of months) {
      for (const eclipse of getEclipseEvents(chart, year, month, cfg)) {
        const key = `${eclipse.type}|${eclipse.eclipseType}|${eclipse.date.getTime()}`;
        if (seen.has(key)) continue;
        seen.add(key);
        const t = eclipse.date.getTime();
        if (t < startMs || t >= endMs) continue;
        const touched = (eclipse.eclipseNatalAspect ? [eclipse.eclipseNatalAspect] : [])
          .map((point) => natalPositionFactId(subjectIndex, point));
        events.push({
          id: `ecl-${eclipse.type === 'eclipse-solar' ? 'solar' : 'lunar'}-${dateKey(eclipse.date, periodCtx)}`,
          factIds: touched,
          kind: eclipse.type as 'eclipse-solar' | 'eclipse-lunar',
          startUtc: eclipse.date.toISOString(),
          peakUtc: eclipse.date.toISOString(),
          endUtc: new Date(t + DAY_MS).toISOString(),
          timingPrecision: 'day',
          importance: eclipse.importance,
          themes: (eclipse.themes as Theme[]).filter(isTheme),
        });
      }
    }
  }

  // ---- Profection segments (day-grade activations) ------------------
  for (const segment of profectionSegments(chart, startMs, endMs, birthCtx)) {
    events.push({
      id: `prof-${segment.profection.house}-${segment.year}`,
      factIds: [profectionFactId(subjectIndex, segment.year)],
      kind: 'profection',
      startUtc: new Date(segment.startMs).toISOString(),
      peakUtc: new Date(segment.startMs).toISOString(),
      endUtc: new Date(segment.endMs).toISOString(),
      timingPrecision: 'day',
      importance: 8,
      themes: mapEventThemes({
        type: 'profection',
        date: new Date(segment.startMs),
        transitPlanet: segment.profection.lord,
        profectedHouse: segment.profection.house,
      } as CalendarEvent, chart, cfg).filter(isTheme),
    });
  }

  events.sort((a, b) => Date.parse(a.startUtc) - Date.parse(b.startUtc));
  return { events, limitations };
}

// ============================================================
// HELPERS
// ============================================================

function isTemporal(reportType: ReportRequest['reportType']): boolean {
  return reportType === 'annual' || reportType === 'saturn-return' || reportType === 'forecast';
}

/** Signed deviation of (value − target), normalized to [−180, 180). */
function signedDiff(value: number, target: number): number {
  let diff = norm(value - target);
  if (diff > 180) diff -= 360;
  return diff;
}

function clusterTimes(times: number[], maxGapMs: number): number[][] {
  const sorted = [...times].sort((a, b) => a - b);
  const clusters: number[][] = [];
  for (const t of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && t - last[last.length - 1] <= maxGapMs) last.push(t);
    else clusters.push([t]);
  }
  return clusters;
}

function factIdsForTransit(subjectIndex: number, transitPlanet: string, natalPoint: string): string[] {
  const ids = [natalPositionFactId(subjectIndex, natalPoint)];
  if (transitPlanet !== natalPoint) ids.push(natalPositionFactId(subjectIndex, transitPlanet));
  if (['asc', 'mc', 'dc', 'ic'].includes(natalPoint)) ids.push(natalAngleFactId(subjectIndex, natalPoint));
  return ids;
}

function stationImportance(planet: string): number {
  const weights: Record<string, number> = {
    mercury: 8, venus: 7, mars: 6, jupiter: 5, saturn: 6,
    uranus: 4, neptune: 3, pluto: 3, chiron: 4, northNode: 4,
  };
  return weights[planet] ?? 4;
}

function ingressImportance(planet: string): number {
  const speed: Record<string, number> = {
    sun: 1.0, mercury: 1.2, venus: 1.0, mars: 0.5, jupiter: 0.08,
    saturn: 0.03, uranus: 0.012, neptune: 0.006, pluto: 0.004,
    chiron: 0.02, northNode: 0.05,
  };
  return Math.min(10, Math.round(3 + 1 / (speed[planet] ?? 1)));
}

function isTheme(value: unknown): value is Theme {
  return typeof value === 'string';
}

function dateKey(date: Date, ctx: CalendarTimeContext): string {
  return calendarDateKeyForInstant(date, ctx).replaceAll('-', '');
}

function moonPhaseThemes(phase: string, sign: number): Theme[] {
  const themes: Theme[] = [];
  if (phase === 'new') themes.push('creativity');
  if (phase === 'full') themes.push('love');
  const signThemes: Record<number, Theme[]> = {
    0: ['health'], 1: ['finances'], 2: ['communication'], 3: ['family'],
    4: ['creativity'], 5: ['health'], 6: ['love'], 7: ['transformation'],
    8: ['travel', 'spirituality'], 9: ['career'], 10: ['freedom'], 11: ['spirituality'],
  };
  themes.push(...(signThemes[sign] ?? []));
  return [...new Set(themes)];
}

function moonElongationAt(t: number): number | null {
  const sun = calculatePlanetLongitude('sun', new Date(t));
  const moon = calculatePlanetLongitude('moon', new Date(t));
  if (sun === null || moon === null) return null;
  return norm(moon - sun);
}

function findElongationCrossings(days: DaySample[], target: number): Array<[number, number]> {
  const crossings: Array<[number, number]> = [];
  let previous: number | null = null;
  let previousT = 0;
  for (const day of days) {
    const sun = day.lon.sun;
    const moon = day.lon.moon;
    if (sun === null || sun === undefined || moon === null || moon === undefined) {
      previous = null;
      continue;
    }
    const elongation = norm(moon - sun);
    if (previous !== null) {
      const prevDiff = signedDiff(previous, target);
      const currDiff = signedDiff(elongation, target);
      if (prevDiff === 0 || currDiff === 0 || prevDiff * currDiff < 0) {
        crossings.push([previousT, day.t]);
      }
    }
    previous = elongation;
    previousT = day.t;
  }
  return crossings;
}

function refineElongation(beforeMs: number, afterMs: number, target: number): number {
  let lo = beforeMs;
  let hi = afterMs;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const value = moonElongationAt(mid);
    if (value === null) break;
    const loValue = moonElongationAt(lo);
    if (loValue === null) break;
    const loDiff = signedDiff(loValue, target);
    const midDiff = signedDiff(value, target);
    if (loDiff === 0 || loDiff * midDiff <= 0) hi = mid;
    else lo = mid;
  }
  return (lo + hi) / 2;
}

function findSignChanges(days: DaySample[], planet: string): Array<[number, number, number]> {
  const changes: Array<[number, number, number]> = [];
  let previous: number | null = null;
  let previousT = 0;
  for (const day of days) {
    const lon = day.lon[planet];
    if (lon === null || lon === undefined) {
      previous = null;
      continue;
    }
    const sign = getSignIndex(lon);
    if (previous !== null && sign !== previous) changes.push([previousT, day.t, sign]);
    previous = sign;
    previousT = day.t;
  }
  return changes;
}

function refineSignIngress(beforeMs: number, afterMs: number, planet: string, sign: number): number {
  let lo = beforeMs;
  let hi = afterMs;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    const lon = calculatePlanetLongitude(planet, new Date(mid));
    if (lon === null) break;
    if (getSignIndex(lon) === sign) hi = mid;
    else lo = mid;
  }
  return hi;
}

function findCyclePhases(
  days: DaySample[],
  planet: string,
  natalLon: number
): Array<{ t: number; label: string }> {
  const phases: Array<{ t: number; label: string }> = [];
  const seen = new Set<string>();
  for (const day of days) {
    const lon = day.lon[planet];
    if (lon === null || lon === undefined) continue;
    const separation = norm(lon - natalLon);
    const candidates: Array<[number, string]> = [
      [90, 'square-waxing'],
      [180, 'opposition'],
      [270, 'square-waning'],
    ];
    for (const [target, label] of candidates) {
      if (Math.abs(separation - target) <= 2 && !seen.has(`${planet}-${label}-${Math.floor(day.t / DAY_MS)}`)) {
        // One event per phase passage: keep the closest day.
        seen.add(`${planet}-${label}-${Math.floor(day.t / DAY_MS)}`);
        phases.push({ t: day.t, label });
      }
    }
  }
  // Keep a single representative per label (closest to exact).
  const best = new Map<string, { t: number; label: string; orb: number }>();
  for (const phase of phases) {
    const lon = days.find((day) => day.t === phase.t)?.lon[planet];
    if (lon === null || lon === undefined) continue;
    const target = phase.label === 'opposition' ? 180 : phase.label === 'square-waxing' ? 90 : 270;
    const orb = Math.abs(norm(lon - natalLon) - target);
    const key = `${planet}-${phase.label}`;
    const current = best.get(key);
    if (!current || orb < current.orb) best.set(key, { ...phase, orb });
  }
  return [...best.values()];
}

function monthsInRange(startMs: number, endMs: number, ctx: CalendarTimeContext): Array<{ year: number; month: number }> {
  const months: Array<{ year: number; month: number }> = [];
  const startParts = calendarDatePartsForInstant(new Date(startMs), ctx);
  const endParts = calendarDatePartsForInstant(new Date(endMs - 1), ctx);
  let year = startParts.year;
  let month = startParts.month - 1;
  for (let i = 0; i < 36; i++) {
    months.push({ year, month });
    if (year === endParts.year && month === endParts.month - 1) break;
    month++;
    if (month > 11) {
      month = 0;
      year++;
    }
  }
  return months;
}

export interface ProfectionSegment {
  year: number;
  startMs: number;
  endMs: number;
  profection: {
    house: number;
    sign: number;
    lord: string;
    lordNatalHouse: number;
    lordNatalSign: number;
    age: number;
    startDate: Date;
    endDate: Date;
  };
}

/** Profection segments clipped to [startMs, endMs), split at birthdays. */
export function profectionSegments(
  chart: NatalChart,
  startMs: number,
  endMs: number,
  birthCtx: CalendarTimeContext
): ProfectionSegment[] {
  const cfg = DEFAULT_CALENDAR_CONFIG;
  const birthParts = calendarDatePartsForInstant(chart.date, birthCtx);
  const boundaries = [startMs];
  const startYear = new Date(startMs).getUTCFullYear() - 1;
  const endYear = new Date(endMs).getUTCFullYear() + 1;
  for (let year = startYear; year <= endYear; year++) {
    // Birthday noon in birth-local calendar; Feb 29 normalizes per JS Date.
    const normalized = new Date(Date.UTC(year, birthParts.month - 1, birthParts.day, 12));
    const birthday = calendarDateAtLocalTime(
      normalized.getUTCFullYear(), normalized.getUTCMonth(), normalized.getUTCDate(), 12, 0, birthCtx
    );
    const t = birthday.getTime();
    if (t > startMs && t < endMs) boundaries.push(t);
  }
  boundaries.push(endMs);
  boundaries.sort((a, b) => a - b);

  const segments: ProfectionSegment[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    const segStart = boundaries[i];
    const segEnd = boundaries[i + 1];
    if (!(segEnd > segStart)) continue;
    const profection = getProfectionForDate(chart, new Date(segStart + 1), cfg);
    if (!profection) continue;
    segments.push({
      year: new Date(segStart).getUTCFullYear(),
      startMs: segStart,
      endMs: segEnd,
      profection,
    });
  }
  return segments;
}
