// ============================================================
// MOON-PHASES.TS — Fases da Lua, ingressos e dados lunares
// Referência: ciclo sinódico de 29.53 dias
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarEvent } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex, norm } from '../calculations';
import { getHouseForLongitude } from '../houses';

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

// ============================================================
// Moon ingresses (sign changes) for a month
// ============================================================

export function getMoonIngresses(year: number, month: number): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let prevSign = -1;

  for (let d = 1; d <= daysInMonth; d++) {
    // Check multiple times per day (Moon moves fast ~12°/day)
    for (let h = 0; h < 24; h += 6) {
      const date = new Date(year, month, d, h);
      const positions = calculatePositions(date);
      if (!positions.moon) continue;

      const currentSign = getSignIndex(positions.moon.longitude);

      if (prevSign >= 0 && currentSign !== prevSign) {
        events.push({
          type: 'moon-ingress',
          date: new Date(year, month, d, h),
          moonSign: currentSign,
          themes: getMoonIngressThemes(currentSign),
          importance: 3,
          energy: 'neutral',
          title: `☽ Lua entra em ${SIGN_NAMES[currentSign]}`,
          summary: getMoonInSignSummary(currentSign),
        });
        prevSign = currentSign;
        break; // Only one ingress per day
      }

      if (prevSign < 0) prevSign = currentSign;
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
