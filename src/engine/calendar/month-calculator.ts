// ============================================================
// MONTH-CALCULATOR.TS — Calcula todos os eventos de 1 mês
// Core engine do Calendário Astrológico
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
  const days: DayData[] = [];

  // Pre-calculate: retrograde periods for the month
  const retroPeriods = getRetrogradeEvents(year, month, cfg);

  // Pre-calculate: profection
  const profection = cfg.profection.show
    ? getProfectionForDate(natal, new Date(year, month, 15), cfg)
    : undefined;

  // Calculate each day
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d, 12, 0, 0); // noon UTC-like
    const dayData = calculateDay(date, natal, cfg, retroPeriods);
    days.push(dayData);
  }

  // Moon ingresses for the month
  if (cfg.moon.showIngresses) {
    const ingresses = getMoonIngresses(year, month);
    for (const ingress of ingresses) {
      const dayIndex = ingress.date.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex].events.push(ingress);
      }
    }
  }

  // Void of Course periods
  if (cfg.moon.showVoidOfCourse) {
    const voidPeriods = getVoidOfCoursePeriods(year, month, cfg);
    for (const vp of voidPeriods) {
      const dayIndex = vp.startTime!.getDate() - 1;
      if (dayIndex >= 0 && dayIndex < days.length) {
        days[dayIndex].events.push(vp);
        days[dayIndex].isVoidOfCourse = true;
        days[dayIndex].voidPeriods.push({
          start: vp.startTime!,
          end: vp.endTime!,
        });
      }
    }
  }

  // Sort events by importance within each day
  for (const day of days) {
    day.events.sort((a, b) => b.importance - a.importance);
    // Classify day energy
    const classification = classifyDayEnergy(day.events, cfg);
    day.energy = classification.energy;
    day.energyScore = classification.score;
    day.tip = classification.tip;
    // Aggregate themes
    day.themes = aggregateThemes(day.events);
  }

  // Month summary
  const summary = generateMonthSummary(days);

  return {
    year,
    month,
    days,
    retroPeriods,
    eclipses: days.flatMap(d => d.events.filter(e => e.type === 'eclipse-solar' || e.type === 'eclipse-lunar')),
    profection,
    summary,
  };
}

// ============================================================
// CALCULATE SINGLE DAY
// ============================================================

function calculateDay(
  date: Date,
  natal: NatalChart,
  cfg: CalendarConfig,
  retroPeriods: any[]
): DayData {
  const events: CalendarEvent[] = [];

  // 1. Transit positions for this day
  const transitPositions = calculatePositions(date);

  // 2. Transit aspects to natal
  const transitAspects = findTransitToNatalAspects(transitPositions, natal, date, cfg);
  events.push(...transitAspects);

  // 3. Moon phase
  if (cfg.moon.showPhases) {
    const moonPhase = getMoonPhaseForDate(date, natal);
    if (moonPhase) {
      events.push(moonPhase);
    }
  }

  // 4. Planet ingresses (sign changes)
  const ingresses = detectIngresses(transitPositions, date, cfg);
  events.push(...ingresses);

  // 5. Retrograde stations
  if (cfg.retrogrades.showStations) {
    const stations = detectStations(transitPositions, date, retroPeriods);
    events.push(...stations);
  }

  // 6. Map themes to all events
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
    moonSign: transitPositions.moon ? getSignIndex(transitPositions.moon.longitude) : undefined,
    isVoidOfCourse: false,
    voidPeriods: [],
    themes: [],
  };
}

// ============================================================
// TRANSIT-TO-NATAL ASPECTS
// ============================================================

function findTransitToNatalAspects(
  transitPositions: Positions,
  natal: NatalChart,
  date: Date,
  cfg: CalendarConfig
): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  const ASPECT_ANGLES: Record<string, number> = {
    conjunction: 0,
    sextile: 60,
    square: 90,
    trine: 120,
    opposition: 180,
    'semi-sextile': 30,
    'semi-square': 45,
    'sesquiquadrate': 135,
    quincunx: 150,
  };

  const ASPECT_NATURES: Record<string, 'positive' | 'negative' | 'neutral'> = {
    conjunction: 'neutral',
    sextile: 'positive',
    square: 'negative',
    trine: 'positive',
    opposition: 'negative',
    'semi-sextile': 'neutral',
    'semi-square': 'negative',
    'sesquiquadrate': 'negative',
    quincunx: 'negative',
  };

  const activeAspects = cfg.aspects.major
    ? Object.entries(ASPECT_ANGLES).filter(([key]) =>
        cfg.aspects.major && ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(key) ||
        cfg.aspects.minor && ['semi-sextile', 'semi-square', 'sesquiquadrate', 'quincunx'].includes(key)
      )
    : [];

  // Build natal points (planets + optionally angles)
  const natalPoints: Record<string, number> = {};
  for (const id of cfg.planets.natal) {
    if (natal.positions[id]) {
      natalPoints[id] = natal.positions[id].longitude;
    }
  }
  if (cfg.planets.includeAngles) {
    natalPoints['asc'] = natal.houses.ascendant;
    natalPoints['mc'] = natal.houses.midheaven;
    natalPoints['dc'] = norm(natal.houses.ascendant + 180);
    natalPoints['ic'] = norm(natal.houses.midheaven + 180);
  }

  // Check each transit planet × natal point
  for (const transitId of cfg.planets.transiting) {
    const transitPos = transitPositions[transitId];
    if (!transitPos) continue;

    for (const [natalId, natalLon] of Object.entries(natalPoints)) {
      for (const [aspectName, targetAngle] of activeAspects) {
        const orb = cfg.aspects.orbs[aspectName] || 2;
        const diff = Math.abs(angularDifference(transitPos.longitude, natalLon) - targetAngle);

        if (diff <= orb) {
          const natalHouse = getHouseForLongitude(transitPos.longitude, natal.houses.cusps);
          const importance = calculateImportance(transitId, natalId, aspectName, diff, orb, cfg);
          const text = getTransitTextWithFallback(transitId, natalId, aspectName);

          events.push({
            type: 'transit-aspect',
            date,
            transitPlanet: transitId,
            natalPlanet: natalId,
            aspectType: aspectName as AspectType,
            orb: diff,
            isApplying: undefined, // TODO: calcular comparando com dia anterior
            transitSign: getSignIndex(transitPos.longitude),
            natalHouse,
            themes: [], // Preenchido depois por theme-mapper
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
// INGRESSES (Planeta muda de signo)
// ============================================================

function detectIngresses(positions: Positions, date: Date, cfg: CalendarConfig): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Compare with previous day
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevPositions = calculatePositions(prevDate);

  for (const planetId of cfg.planets.transiting) {
    if (planetId === 'moon') continue; // Moon ingresses handled separately (too frequent)
    const curr = positions[planetId];
    const prev = prevPositions[planetId];
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
// STATIONS (Retrograde/Direct)
// ============================================================

function detectStations(positions: Positions, date: Date, retroPeriods: any[]): CalendarEvent[] {
  const events: CalendarEvent[] = [];

  // Compare retrograde status with previous day
  const prevDate = new Date(date);
  prevDate.setDate(prevDate.getDate() - 1);
  const prevPositions = calculatePositions(prevDate);

  for (const [planetId, pos] of Object.entries(positions)) {
    const prev = prevPositions[planetId];
    if (!prev || planetId === 'sun' || planetId === 'moon') continue;

    if (pos.isRetrograde && !prev.isRetrograde) {
      events.push({
        type: 'retrograde-start',
        date,
        retroPlanet: planetId,
        retroSign: getSignIndex(pos.longitude),
        themes: [],
        importance: getRetroImportance(planetId),
        energy: 'negative',
        title: `${PLANET_LABELS[planetId] || planetId} ℞ (retrógrado)`,
        summary: '',
      });
    } else if (!pos.isRetrograde && prev.isRetrograde) {
      events.push({
        type: 'retrograde-end',
        date,
        retroPlanet: planetId,
        retroSign: getSignIndex(pos.longitude),
        themes: [],
        importance: getRetroImportance(planetId),
        energy: 'positive',
        title: `${PLANET_LABELS[planetId] || planetId} D (direto)`,
        summary: '',
      });
    }
  }

  return events;
}

// ============================================================
// HELPERS
// ============================================================

function angularDifference(lon1: number, lon2: number): number {
  let diff = Math.abs(lon1 - lon2) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function calculateImportance(
  transitPlanet: string,
  natalPlanet: string,
  aspect: string,
  orb: number,
  maxOrb: number,
  cfg: CalendarConfig
): number {
  let score = 5; // base

  // Planet weight
  const transitWeight = cfg.dayClassification.planetWeights[transitPlanet] || 1;
  const natalWeight = cfg.dayClassification.planetWeights[natalPlanet] || 1;
  score += (transitWeight + natalWeight) / 2;

  // Tighter orb = more important
  if (cfg.aspects.applicationBonus) {
    score += (1 - orb / maxOrb) * 2;
  }

  // Angles are very important
  if (['asc', 'mc', 'dc', 'ic'].includes(natalPlanet)) {
    score += 2;
  }

  // Luminaries
  if (['sun', 'moon'].includes(natalPlanet) || ['sun', 'moon'].includes(transitPlanet)) {
    score += 1;
  }

  return Math.min(10, Math.max(1, Math.round(score)));
}

function getIngressImportance(planet: string): number {
  const weights: Record<string, number> = {
    mercury: 4, venus: 5, mars: 6, jupiter: 7, saturn: 8, uranus: 9, neptune: 9, pluto: 10, chiron: 6,
  };
  return weights[planet] || 3;
}

function getRetroImportance(planet: string): number {
  const weights: Record<string, number> = {
    mercury: 7, venus: 6, mars: 6, jupiter: 5, saturn: 6, uranus: 4, neptune: 3, pluto: 3, chiron: 4,
  };
  return weights[planet] || 4;
}

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
  const p = PLANET_LABELS[planet] || planet;
  return `${p} entra em ${SIGN_NAMES[sign]}`;
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
  const bestDays = days
    .filter(d => d.energy === 'favorable')
    .map(d => d.date.getDate())
    .slice(0, 5);
  const challengingDays = days
    .filter(d => d.energy === 'tense')
    .map(d => d.date.getDate())
    .slice(0, 5);
  const specialDays = days
    .filter(d => d.energy === 'special')
    .map(d => d.date.getDate());

  // Dominant themes
  const themeCount: Record<string, number> = {};
  for (const day of days) {
    for (const theme of day.themes) {
      themeCount[theme] = (themeCount[theme] || 0) + 1;
    }
  }
  const dominantThemes = Object.entries(themeCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([t]) => t as Theme);

  return {
    bestDays,
    challengingDays,
    specialDays,
    dominantThemes,
    overview: '',
  };
}
