// ============================================================
// MONTH-CALCULATOR.TS — Calcula todos os eventos de 1 mês
// Core engine do Calendário Astrológico
//
// OTIMIZAÇÕES DE PERFORMANCE:
// 1. Pré-calcula posições a cada 1 dia (não múltiplas vezes/dia)
// 2. Cache interno de posições (evita recalcular ao detectar ingresses)
// 3. Score normalizado por média ponderada (não soma bruta)
// 4. Importância proporcional à velocidade do planeta (lentos = raros = impactantes)
// ============================================================

import type { NatalChart, Positions, AspectType } from '../types';
import { calculatePositions } from '../calculations';
import { calculateAspects } from '../aspects';
import { getHouseForLongitude } from '../houses';
import { getSignIndex, getDegreeInSign, norm } from '../calculations';
import type { CalendarConfig, CalendarEvent, DayData, MonthData, Theme } from './types';
import { DEFAULT_CALENDAR_CONFIG } from './types';
import { classifyDayEnergy } from './day-classifier';
import { mapEventThemes } from './theme-mapper';
import { getMoonPhaseForDate, getMoonIngresses } from './moon-phases';
import { getVoidOfCoursePeriods } from './void-moon';
import { getRetrogradeEvents } from './retrogrades';
import { getProfectionForDate } from './profection';
import { getTransitTextWithFallback } from './calendar-texts';
import { getEclipseEvents } from './eclipses';
import { getPlanetaryReturnEvents } from './planetary-returns';

// ============================================================
// POSITION CACHE — calcular uma vez, reusar
// ============================================================

interface PositionCache {
  positions: Map<number, Positions>; // key = day (1-31)
}

function buildPositionCache(year: number, month: number): PositionCache {
  const cache: PositionCache = { positions: new Map() };
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Calculate positions for day 0 (last day of prev month) through day daysInMonth
  for (let d = 0; d <= daysInMonth; d++) {
    const date = new Date(year, month, d + 1, 12, 0, 0);
    cache.positions.set(d, calculatePositions(date));
  }

  return cache;
}

// ============================================================
// MAIN: Calculate all events for a month
// ============================================================

export function calculateMonth(
  natal: NatalChart,
  year: number,
  month: number, // 0-based (0=Jan)
  config: Partial<CalendarConfig> = {}
): MonthData {
  const cfg = { ...DEFAULT_CALENDAR_CONFIG, ...config } as CalendarConfig;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // 1. Pre-calculate ALL positions (main performance optimization)
  const cache = buildPositionCache(year, month);

  // 2. Pre-calculate: retrograde periods
  const retroPeriods = getRetrogradeEvents(year, month, cfg);

  // 3. Pre-calculate: profection
  const profection = cfg.profection.show
    ? getProfectionForDate(natal, new Date(year, month, 15), cfg) ?? undefined
    : undefined;

  // 4. Eclipses
  const eclipseEvents = getEclipseEvents(natal, year, month, cfg);

  // 5. Planetary returns
  const returnEvents = getPlanetaryReturnEvents(natal, year, month, cfg);

  // 6. Calculate each day using cached positions
  const days: DayData[] = [];
  for (let d = 0; d < daysInMonth; d++) {
    const date = new Date(year, month, d + 1, 12, 0, 0);
    const todayPositions = cache.positions.get(d)!;
    const yesterdayPositions = cache.positions.get(d - 1) || cache.positions.get(0)!;

    const dayData = calculateDay(date, todayPositions, yesterdayPositions, natal, cfg);

    // Add eclipse events for this day
    for (const ecl of eclipseEvents) {
      if (ecl.date.getDate() === d + 1) {
        dayData.events.push(ecl);
      }
    }

    // Add return events for this day
    for (const ret of returnEvents) {
      if (ret.date.getDate() === d + 1) {
        dayData.events.push(ret);
      }
    }

    days.push(dayData);
  }

  // 7. Moon ingresses (using cache)
  if (cfg.moon.showIngresses) {
    const ingresses = getMoonIngresses(year, month);
    for (const ingress of ingresses) {
      const dayIndex = ingress.date.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex].events.push(ingress);
      }
    }
  }

  // 8. Void of Course
  if (cfg.moon.showVoidOfCourse) {
    const voidPeriods = getVoidOfCoursePeriods(year, month, cfg);
    for (const vp of voidPeriods) {
      const dayIndex = vp.startTime!.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex].events.push(vp);
        days[dayIndex].isVoidOfCourse = true;
        days[dayIndex].voidPeriods.push({ start: vp.startTime!, end: vp.endTime! });
      }
    }
  }

  // 9. Classify days + aggregate themes
  for (const day of days) {
    day.events.sort((a, b) => b.importance - a.importance);
    const classification = classifyDayEnergy(day.events, cfg);
    day.energy = classification.energy;
    day.energyScore = classification.score;
    day.tip = classification.tip;
    day.themes = aggregateThemes(day.events);
  }

  // 10. Month summary
  const summary = generateMonthSummary(days);

  return {
    year, month, days, retroPeriods,
    eclipses: eclipseEvents,
    profection,
    summary,
  };
}

// ============================================================
// CALCULATE SINGLE DAY (uses pre-cached positions)
// ============================================================

function calculateDay(
  date: Date,
  todayPositions: Positions,
  yesterdayPositions: Positions,
  natal: NatalChart,
  cfg: CalendarConfig
): DayData {
  const events: CalendarEvent[] = [];

  // 1. Transit aspects to natal (main calculation)
  const transitAspects = findTransitToNatalAspects(todayPositions, yesterdayPositions, natal, date, cfg);
  events.push(...transitAspects);

  // 2. Moon phase
  if (cfg.moon.showPhases) {
    const moonPhase = getMoonPhaseForDate(date, natal);
    if (moonPhase) events.push(moonPhase);
  }

  // 3. Planet ingresses (using cached yesterday)
  const ingresses = detectIngresses(todayPositions, yesterdayPositions, date, cfg);
  events.push(...ingresses);

  // 4. Retrograde stations (using cached yesterday)
  if (cfg.retrogrades.showStations) {
    const stations = detectStations(todayPositions, yesterdayPositions, date);
    events.push(...stations);
  }

  // 5. Map themes to all events
  for (const event of events) {
    if (event.themes.length === 0) {
      event.themes = mapEventThemes(event, natal, cfg);
    }
  }

  return {
    date,
    dayOfWeek: date.getDay(),
    events,
    energy: 'neutral',
    energyScore: 0,
    moonPhase: undefined,
    moonSign: todayPositions.moon ? getSignIndex(todayPositions.moon.longitude) : undefined,
    isVoidOfCourse: false,
    voidPeriods: [],
    themes: [],
  };
}

// ============================================================
// TRANSIT-TO-NATAL ASPECTS (optimized: uses pre-cached positions)
// ============================================================

function findTransitToNatalAspects(
  todayPositions: Positions,
  yesterdayPositions: Positions,
  natal: NatalChart,
  date: Date,
  cfg: CalendarConfig
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const ASPECT_ANGLES: Record<string, number> = {
    conjunction: 0, sextile: 60, square: 90, trine: 120, opposition: 180,
    'semi-sextile': 30, 'semi-square': 45, 'sesquiquadrate': 135, quincunx: 150,
  };

  const ASPECT_NATURES: Record<string, 'positive' | 'negative' | 'neutral'> = {
    conjunction: 'neutral', sextile: 'positive', square: 'negative',
    trine: 'positive', opposition: 'negative',
    'semi-sextile': 'neutral', 'semi-square': 'negative',
    'sesquiquadrate': 'negative', quincunx: 'negative',
  };

  const activeAspects = Object.entries(ASPECT_ANGLES).filter(([key]) =>
    (cfg.aspects.major && ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(key)) ||
    (cfg.aspects.minor && ['semi-sextile', 'semi-square', 'sesquiquadrate', 'quincunx'].includes(key))
  );

  // Build natal points
  const natalPoints: Record<string, number> = {};
  for (const id of cfg.planets.natal) {
    if (natal.positions[id]) natalPoints[id] = natal.positions[id].longitude;
  }
  if (cfg.planets.includeAngles) {
    natalPoints['asc'] = natal.houses.ascendant;
    natalPoints['mc'] = natal.houses.midheaven;
    natalPoints['dc'] = norm(natal.houses.ascendant + 180);
    natalPoints['ic'] = norm(natal.houses.midheaven + 180);
  }

  for (const transitId of cfg.planets.transiting) {
    const transitPos = todayPositions[transitId];
    const yesterdayPos = yesterdayPositions[transitId];
    if (!transitPos) continue;

    for (const [natalId, natalLon] of Object.entries(natalPoints)) {
      for (const [aspectName, targetAngle] of activeAspects) {
        const orb = cfg.aspects.orbs[aspectName] || 2;
        const diff = Math.abs(angularDifference(transitPos.longitude, natalLon) - targetAngle);

        if (diff <= orb) {
          // Determine if applying or separating
          let isApplying: boolean | undefined;
          if (yesterdayPos) {
            const yesterdayDiff = Math.abs(angularDifference(yesterdayPos.longitude, natalLon) - targetAngle);
            isApplying = diff < yesterdayDiff; // Getting tighter = applying
          }

          const natalHouse = getHouseForLongitude(transitPos.longitude, natal.houses.cusps);
          const importance = calculateImportance(transitId, natalId, aspectName, diff, orb, transitPos, cfg);
          const text = getTransitTextWithFallback(transitId, natalId, aspectName);

          events.push({
            type: 'transit-aspect',
            date,
            transitPlanet: transitId,
            natalPlanet: natalId,
            aspectType: aspectName as AspectType,
            orb: diff,
            isApplying,
            transitSign: getSignIndex(transitPos.longitude),
            natalHouse,
            themes: [],
            importance,
            energy: ASPECT_NATURES[aspectName] || 'neutral',
            title: formatTransitTitle(transitId, natalId, aspectName),
            summary: text.summary,
            advice: text.advice,
            detail: undefined,
          });
        }
      }
    }
  }

  return events;
}

// ============================================================
// INGRESSES (uses pre-cached yesterday — NO extra calc)
// ============================================================

function detectIngresses(todayPositions: Positions, yesterdayPositions: Positions, date: Date, cfg: CalendarConfig): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const planetId of cfg.planets.transiting) {
    if (planetId === 'moon') continue;
    const curr = todayPositions[planetId];
    const prev = yesterdayPositions[planetId];
    if (!curr || !prev) continue;

    const currSign = getSignIndex(curr.longitude);
    const prevSign = getSignIndex(prev.longitude);

    if (currSign !== prevSign) {
      events.push({
        type: 'planet-ingress',
        date,
        transitPlanet: planetId,
        transitSign: currSign,
        themes: [],
        importance: getIngressImportance(planetId),
        energy: 'neutral',
        title: formatIngressTitle(planetId, currSign),
        summary: '',
      });
    }
  }

  return events;
}

// ============================================================
// STATIONS (uses pre-cached yesterday — NO extra calc)
// ============================================================

function detectStations(todayPositions: Positions, yesterdayPositions: Positions, date: Date): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  for (const [planetId, pos] of Object.entries(todayPositions)) {
    const prev = yesterdayPositions[planetId];
    if (!prev || planetId === 'sun' || planetId === 'moon') continue;

    if (pos.isRetrograde && !prev.isRetrograde) {
      events.push({
        type: 'retrograde-start', date, retroPlanet: planetId,
        retroSign: getSignIndex(pos.longitude),
        themes: [], importance: getRetroImportance(planetId),
        energy: 'negative',
        title: `${PLANET_LABELS[planetId] || planetId} ℞ (retrógrado)`,
        summary: `${PLANET_LABELS[planetId]} inicia período retrógrado. Revisão e introspecção nas áreas regidas por este planeta.`,
        advice: 'Revise, não inicie. Reavalie planos em andamento.',
      });
    } else if (!pos.isRetrograde && prev.isRetrograde) {
      events.push({
        type: 'retrograde-end', date, retroPlanet: planetId,
        retroSign: getSignIndex(pos.longitude),
        themes: [], importance: getRetroImportance(planetId),
        energy: 'positive',
        title: `${PLANET_LABELS[planetId] || planetId} D (direto)`,
        summary: `${PLANET_LABELS[planetId]} retoma movimento direto. Projetos parados podem desbloquear.`,
        advice: 'Retome iniciativas pausadas. Ação progressiva favorecida.',
      });
    }
  }

  return events;
}

// ============================================================
// IMPORTANCE — proporcional a 1/velocidade (lentos = mais raros = mais impactantes)
// ============================================================

// Velocidades médias em °/dia (quanto menor, mais raro o aspecto exato)
const PLANET_SPEED: Record<string, number> = {
  moon: 13.0, sun: 1.0, mercury: 1.2, venus: 1.0, mars: 0.5,
  jupiter: 0.08, saturn: 0.03, uranus: 0.012, neptune: 0.006, pluto: 0.004,
  chiron: 0.02, northNode: 0.05,
};

function calculateImportance(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  orb: number,
  maxOrb: number,
  transitPos: any,
  cfg: CalendarConfig
): number {
  let score = 4; // base

  // Speed-based weight: slower planet = rarer aspect = more important
  const speed = PLANET_SPEED[transitPlanet] || 1.0;
  const speedBonus = Math.min(3, 1 / speed); // Pluto: +250, Jupiter: +12, Sun: +1
  score += speedBonus;

  // Tighter orb = more important (exponential decay)
  const orbFactor = Math.pow(1 - orb / maxOrb, 1.5); // 0° = 1.0, maxOrb = 0.0
  score += orbFactor * 2;

  // Angles are very important
  if (['asc', 'mc', 'dc', 'ic'].includes(natalPlanet)) score += 2;

  // Luminaries
  if (['sun', 'moon'].includes(natalPlanet)) score += 1;

  // Applying bonus
  if (cfg.aspects.applicationBonus) score += 0.5;

  return Math.min(10, Math.max(1, Math.round(score)));
}

// Ingress importance: slow planets changing sign is VERY rare
function getIngressImportance(planet: string): number {
  const speed = PLANET_SPEED[planet] || 1.0;
  return Math.min(10, Math.round(3 + 1 / speed));
}

function getRetroImportance(planet: string): number {
  const weights: Record<string, number> = {
    mercury: 8, venus: 7, mars: 6, jupiter: 5, saturn: 6, uranus: 4, neptune: 3, pluto: 3, chiron: 4,
  };
  return weights[planet] || 4;
}

// ============================================================
// FORMATTERS
// ============================================================

const PLANET_LABELS: Record<string, string> = {
  sun: 'Sol', moon: 'Lua', mercury: 'Mercúrio', venus: 'Vênus', mars: 'Marte',
  jupiter: 'Júpiter', saturn: 'Saturno', uranus: 'Urano', neptune: 'Netuno', pluto: 'Plutão',
  chiron: 'Quíron', northNode: 'Nodo Norte', southNode: 'Nodo Sul',
  asc: 'Ascendente', mc: 'Meio do Céu', dc: 'Descendente', ic: 'Fundo do Céu',
};

const ASPECT_SYMBOLS: Record<string, string> = {
  conjunction: '☌', sextile: '✶', square: '□', trine: '△', opposition: '☍',
  'semi-sextile': '⚺', 'semi-square': '∠', 'sesquiquadrate': '⚻', quincunx: '⚻',
};

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

function formatTransitTitle(transitPlanet: string, natalPlanet: string, aspect: string): string {
  const tp = PLANET_LABELS[transitPlanet] || transitPlanet;
  const np = PLANET_LABELS[natalPlanet] || natalPlanet;
  const sym = ASPECT_SYMBOLS[aspect] || aspect;
  return `${tp} ${sym} ${np} natal`;
}

function formatIngressTitle(planet: string, sign: number): string {
  return `${PLANET_LABELS[planet] || planet} entra em ${SIGN_NAMES[sign]}`;
}

function angularDifference(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function aggregateThemes(events: CalendarEvent[]): Theme[] {
  const themeCount: Record<string, number> = {};
  for (const event of events) {
    for (const theme of event.themes) {
      themeCount[theme] = (themeCount[theme] || 0) + event.importance;
    }
  }
  return Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 4)
    .map(([theme]) => theme as Theme);
}

function generateMonthSummary(days: DayData[]): any {
  const bestDays = days.filter(d => d.energy === 'favorable').map(d => d.date.getDate()).slice(0, 5);
  const challengingDays = days.filter(d => d.energy === 'tense').map(d => d.date.getDate()).slice(0, 5);
  const specialDays = days.filter(d => d.energy === 'special').map(d => d.date.getDate());
  const themeCount: Record<string, number> = {};
  for (const day of days) { for (const theme of day.themes) { themeCount[theme] = (themeCount[theme] || 0) + 1; } }
  const dominantThemes = Object.entries(themeCount).sort(([, a], [, b]) => b - a).slice(0, 3).map(([t]) => t as Theme);

  return { bestDays, challengingDays, specialDays, dominantThemes, overview: '' };
}
