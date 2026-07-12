// ============================================================
// MOON-PHASES.TS — Fases da Lua, ingressos e dados lunares
// Referência: ciclo sinódico de 29.53 dias
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarEvent } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex, norm } from '../calculations';
import { getHouseForLongitude } from '../houses';
import {
  calendarDateAtLocalTime,
  calendarDateKeyForInstant,
  daysInCalendarMonth,
  type CalendarTimeContext,
} from './calendar-date';

const SIGN_NAMES = ['Áries','Touro','Gêmeos','Câncer','Leão','Virgem','Libra','Escorpião','Sagitário','Capricórnio','Aquário','Peixes'];

const MOON_PHASE_NAMES: Record<string, string> = {
  'new': 'Lua Nova',
  'waxing-crescent': 'Crescente',
  'first-quarter': 'Quarto Crescente',
  'waxing-gibbous': 'Gibosa Crescente',
  'full': 'Lua Cheia',
  'waning-gibbous': 'Gibosa Minguante',
  'last-quarter': 'Quarto Minguante',
  'waning-crescent': 'Minguante',
};

const MOON_PHASE_ICONS: Record<string, string> = {
  'new': '🌑',
  'waxing-crescent': '🌒',
  'first-quarter': '🌓',
  'waxing-gibbous': '🌔',
  'full': '🌕',
  'waning-gibbous': '🌖',
  'last-quarter': '🌗',
  'waning-crescent': '🌘',
};

const EXACT_PHASES = [
  { angle: 0, phase: 'new', importance: 8 },
  { angle: 90, phase: 'first-quarter', importance: 5 },
  { angle: 180, phase: 'full', importance: 8 },
  { angle: 270, phase: 'last-quarter', importance: 5 },
] as const;

// ============================================================
// Get moon phase for a specific date
// Returns CalendarEvent only on exact phase days (New, Full, Quarters)
// ============================================================

export function getMoonPhaseForDate(date: Date, natal?: NatalChart): CalendarEvent | null {
  const positions = calculatePositions(date);
  if (!positions.sun || !positions.moon) return null;

  const sunLon = positions.sun.longitude;
  const moonLon = positions.moon.longitude;

  // Angular distance Sun→Moon (elongation)
  const elongation = norm(moonLon - sunLon);

  // Check if it's an exact phase day (within ~6° window = ~12h)
  const PHASE_WINDOW = 6;

  let phase: string | null = null;
  let importance = 5;

  if (elongation < PHASE_WINDOW || elongation > 360 - PHASE_WINDOW) {
    phase = 'new';
    importance = 8;
  } else if (Math.abs(elongation - 90) < PHASE_WINDOW) {
    phase = 'first-quarter';
    importance = 5;
  } else if (Math.abs(elongation - 180) < PHASE_WINDOW) {
    phase = 'full';
    importance = 8;
  } else if (Math.abs(elongation - 270) < PHASE_WINDOW) {
    phase = 'last-quarter';
    importance = 5;
  }

  if (!phase) return null;

  const moonSign = getSignIndex(moonLon);
  const moonHouse = natal ? getHouseForLongitude(moonLon, natal.houses.cusps) : undefined;

  const title = `${MOON_PHASE_ICONS[phase]} ${MOON_PHASE_NAMES[phase]} em ${SIGN_NAMES[moonSign]}`;

  const summaries: Record<string, string> = {
    'new': `Lua Nova em ${SIGN_NAMES[moonSign]} — momento de plantar sementes e definir intenções.${moonHouse ? ` Foco na Casa ${moonHouse} do seu mapa.` : ''}`,
    'first-quarter': `Quarto Crescente em ${SIGN_NAMES[moonSign]} — momento de ação e superação de obstáculos.`,
    'full': `Lua Cheia em ${SIGN_NAMES[moonSign]} — culminação, revelação e colheita.${moonHouse ? ` Ilumina sua Casa ${moonHouse}.` : ''}`,
    'last-quarter': `Quarto Minguante em ${SIGN_NAMES[moonSign]} — reavaliação, liberação e ajustes.`,
  };

  return {
    type: 'moon-phase',
    date,
    moonPhase: phase as any,
    moonSign,
    moonHouseNatal: moonHouse,
    themes: getMoonPhaseThemes(phase, moonSign, moonHouse),
    importance,
    energy: phase === 'new' || phase === 'full' ? 'neutral' : 'neutral',
    title,
    summary: summaries[phase] || '',
  };
}

export function getMoonPhaseEvents(
  year: number,
  month: number,
  natal: NatalChart,
  ctx: CalendarTimeContext
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = daysInCalendarMonth(year, month);
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;
  const start = calendarDateAtLocalTime(year, month, 0, 0, 0, ctx);
  const end = calendarDateAtLocalTime(year, month, daysInMonth + 2, 0, 0, ctx);
  const stepMs = 2 * 3600000;
  const seen = new Set<string>();

  let previousDate = start;
  let previousElongation = moonElongation(previousDate);

  for (let t = start.getTime() + stepMs; t <= end.getTime(); t += stepMs) {
    const currentDate = new Date(t);
    const currentElongation = moonElongation(currentDate);

    for (const phaseDef of EXACT_PHASES) {
      const prevDiff = signedAngleDiff(previousElongation, phaseDef.angle);
      const currDiff = signedAngleDiff(currentElongation, phaseDef.angle);
      const crossed = prevDiff === 0 || currDiff === 0 || prevDiff * currDiff < 0;
      if (!crossed) continue;

      const exactDate = refinePhaseTime(previousDate, currentDate, phaseDef.angle);
      const dateKey = calendarDateKeyForInstant(exactDate, ctx);
      if (!dateKey.startsWith(monthPrefix)) continue;

      const seenKey = `${phaseDef.phase}-${dateKey}`;
      if (seen.has(seenKey)) continue;
      seen.add(seenKey);

      events.push(createMoonPhaseEvent(exactDate, phaseDef.phase, phaseDef.importance, natal));
    }

    previousDate = currentDate;
    previousElongation = currentElongation;
  }

  return events.sort((a, b) => a.date.getTime() - b.date.getTime());
}

// ============================================================
// Moon ingresses (sign changes) for a month
// ============================================================

export function getMoonIngresses(year: number, month: number, ctx?: CalendarTimeContext): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = daysInCalendarMonth(year, month);
  const scanDate = (day: number, hour: number) => ctx
    ? calendarDateAtLocalTime(year, month, day, hour, 0, ctx)
    : new Date(year, month, day, hour);
  const monthPrefix = `${year}-${String(month + 1).padStart(2, '0')}`;

  let prevDate = scanDate(0, 23);
  let prevSign = getSignIndex(calculatePositions(prevDate).moon?.longitude || 0);

  for (let d = 1; d <= daysInMonth; d++) {
    // Hourly scan; binary refinement below gets the ingress close to the minute.
    for (let h = 0; h < 24; h += 1) {
      const date = scanDate(d, h);
      const positions = calculatePositions(date);
      if (!positions.moon) continue;

      const currentSign = getSignIndex(positions.moon.longitude);

      if (prevSign >= 0 && currentSign !== prevSign) {
        const ingressDate = refineSignIngressTime(prevDate, date, 'moon', currentSign);
        const dateKey = ctx ? calendarDateKeyForInstant(ingressDate, ctx) : '';
        if (ctx && !dateKey.startsWith(monthPrefix)) {
          prevSign = currentSign;
          prevDate = date;
          continue;
        }

        events.push({
          type: 'moon-ingress',
          date: ingressDate,
          moonSign: currentSign,
          themes: getMoonIngressThemes(currentSign),
          importance: 3,
          energy: 'neutral',
          title: `☽ Lua entra em ${SIGN_NAMES[currentSign]}`,
          summary: getMoonInSignSummary(currentSign),
        });
        prevSign = currentSign;
      }

      prevDate = date;
    }
  }

  return events;
}

// ============================================================
// Get current moon phase name (for display, any day)
// ============================================================

export function getMoonPhaseName(date: Date): string {
  const positions = calculatePositions(date);
  if (!positions.sun || !positions.moon) return 'unknown';

  const elongation = norm(positions.moon.longitude - positions.sun.longitude);

  if (elongation < 22.5 || elongation > 337.5) return 'new';
  if (elongation < 67.5) return 'waxing-crescent';
  if (elongation < 112.5) return 'first-quarter';
  if (elongation < 157.5) return 'waxing-gibbous';
  if (elongation < 202.5) return 'full';
  if (elongation < 247.5) return 'waning-gibbous';
  if (elongation < 292.5) return 'last-quarter';
  return 'waning-crescent';
}

// ============================================================
// HELPERS
// ============================================================

function getMoonPhaseThemes(phase: string, sign: number, house?: number): any[] {
  const themes: string[] = [];

  // Phases have inherent themes
  if (phase === 'new') themes.push('creativity');
  if (phase === 'full') themes.push('love');

  // Sign-based themes
  const signThemes: Record<number, string[]> = {
    0: ['health'], 1: ['finances'], 2: ['communication'], 3: ['family'],
    4: ['creativity'], 5: ['health'], 6: ['love'], 7: ['transformation'],
    8: ['travel', 'spirituality'], 9: ['career'], 10: ['freedom'], 11: ['spirituality'],
  };
  themes.push(...(signThemes[sign] || []));

  return [...new Set(themes)] as any[];
}

function createMoonPhaseEvent(date: Date, phase: string, importance: number, natal?: NatalChart): CalendarEvent {
  const positions = calculatePositions(date);
  const moonLon = positions.moon?.longitude || 0;
  const moonSign = getSignIndex(moonLon);
  const moonHouse = natal ? getHouseForLongitude(moonLon, natal.houses.cusps) : undefined;
  const title = `${MOON_PHASE_ICONS[phase]} ${MOON_PHASE_NAMES[phase]} em ${SIGN_NAMES[moonSign]}`;
  const summaries: Record<string, string> = {
    'new': `Lua Nova em ${SIGN_NAMES[moonSign]} — momento de plantar sementes e definir intenções.${moonHouse ? ` Foco na Casa ${moonHouse} do seu mapa.` : ''}`,
    'first-quarter': `Quarto Crescente em ${SIGN_NAMES[moonSign]} — momento de ação e superação de obstáculos.`,
    'full': `Lua Cheia em ${SIGN_NAMES[moonSign]} — culminação, revelação e colheita.${moonHouse ? ` Ilumina sua Casa ${moonHouse}.` : ''}`,
    'last-quarter': `Quarto Minguante em ${SIGN_NAMES[moonSign]} — reavaliação, liberação e ajustes.`,
  };

  return {
    type: 'moon-phase',
    date,
    moonPhase: phase as any,
    moonSign,
    moonHouseNatal: moonHouse,
    themes: getMoonPhaseThemes(phase, moonSign, moonHouse),
    importance,
    energy: 'neutral',
    title,
    summary: summaries[phase] || '',
  };
}

function moonElongation(date: Date): number {
  const positions = calculatePositions(date);
  if (!positions.sun || !positions.moon) return 0;
  return norm(positions.moon.longitude - positions.sun.longitude);
}

function signedAngleDiff(value: number, target: number): number {
  let diff = norm(value - target);
  if (diff > 180) diff -= 360;
  return diff;
}

function refinePhaseTime(start: Date, end: Date, targetAngle: number): Date {
  let lo = start.getTime();
  let hi = end.getTime();
  let loDiff = signedAngleDiff(moonElongation(start), targetAngle);

  for (let i = 0; i < 18; i++) {
    const mid = new Date((lo + hi) / 2);
    const midDiff = signedAngleDiff(moonElongation(mid), targetAngle);
    if (loDiff === 0 || loDiff * midDiff <= 0) {
      hi = mid.getTime();
    } else {
      lo = mid.getTime();
      loDiff = midDiff;
    }
  }

  return new Date((lo + hi) / 2);
}

function refineSignIngressTime(start: Date, end: Date, planet: string, targetSign: number): Date {
  let lo = start.getTime();
  let hi = end.getTime();

  for (let i = 0; i < 14; i++) {
    const mid = new Date((lo + hi) / 2);
    const sign = getSignIndex(calculatePositions(mid)[planet]?.longitude || 0);
    if (sign === targetSign) {
      hi = mid.getTime();
    } else {
      lo = mid.getTime();
    }
  }

  return new Date(hi);
}

function getMoonIngressThemes(sign: number): any[] {
  const signThemes: Record<number, string[]> = {
    0: ['health'], 1: ['finances', 'love'], 2: ['communication'],
    3: ['family', 'health'], 4: ['creativity', 'love'], 5: ['health', 'career'],
    6: ['love'], 7: ['transformation', 'sexuality'], 8: ['travel', 'spirituality'],
    9: ['career'], 10: ['freedom', 'communication'], 11: ['spirituality', 'creativity'],
  };
  return (signThemes[sign] || []) as any[];
}

function getMoonInSignSummary(sign: number): string {
  const summaries: Record<number, string> = {
    0: 'Energia para ação, coragem e novos começos. Impaciência possível.',
    1: 'Foco em conforto, finanças e prazeres sensoriais. Estabilidade emocional.',
    2: 'Mente ativa, comunicação fluida. Bom para conversas e aprendizado.',
    3: 'Necessidade de acolhimento, lar e família. Sensibilidade elevada.',
    4: 'Criatividade, expressão pessoal e romance. Alegria e diversão.',
    5: 'Atenção aos detalhes, organização e saúde. Autocuidado.',
    6: 'Foco em relacionamentos, harmonia e beleza. Busca de equilíbrio.',
    7: 'Intensidade emocional, transformação e profundidade. Verdades emergem.',
    8: 'Otimismo, expansão e aventura. Boa para viagens e filosofia.',
    9: 'Seriedade, responsabilidade e foco em objetivos. Disciplina.',
    10: 'Originalidade, liberdade e conexões sociais. Ideias inovadoras.',
    11: 'Sensibilidade, intuição e compaixão. Momentos de introspecção.',
  };
  return summaries[sign] || '';
}
