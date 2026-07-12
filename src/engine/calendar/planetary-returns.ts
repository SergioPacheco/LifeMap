// ============================================================
// PLANETARY-RETURNS.TS — Retornos de Saturno, Júpiter, Marte, Vênus
// Referência: Liz Greene, Howard Sasportas
//
// Ciclos:
// - Saturno: ~29.5 anos (1° retorno: 27-30, 2°: 56-60)
// - Júpiter: ~12 anos (expansão cíclica)
// - Marte: ~2 anos (ciclo de energia/ação)
// - Vênus: ~1 ano (ciclo afetivo/estético — não é retorno, é volta ao signo)
//
// Fases de cada ciclo:
// - Conjunção (0°): retorno exato — novo ciclo começa
// - Quadratura crescente (90°): crise de ação, desafio ao novo
// - Oposição (180°): confronto/culminação — meio do ciclo
// - Quadratura minguante (270°): crise de consciência, liberação
// ============================================================

import type { NatalChart } from '../types';
import type { CalendarConfig, CalendarEvent } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex, norm } from '../calculations';

// ============================================================
// TYPES
// ============================================================

export interface PlanetaryReturnInfo {
  planet: string;
  natalLongitude: number;
  currentLongitude: number;
  distanceToReturn: number;   // Graus até o retorno exato
  phase: 'approaching' | 'exact' | 'separating' | 'first-quarter' | 'opposition' | 'last-quarter';
  phaseLabel: string;
  cycleYears: number;
  percentComplete: number;    // 0-100% do ciclo atual
  nextReturnEstimate?: Date;
  description: string;
}

// ============================================================
// CYCLE LENGTHS (aproximados em dias)
// ============================================================

const CYCLE_DAYS: Record<string, number> = {
  saturn: 10759,   // ~29.46 anos
  jupiter: 4333,   // ~11.86 anos
  mars: 687,       // ~1.88 anos
  venus: 365,      // ~1 ano (retorno ao mesmo grau)
};

const CYCLE_YEARS: Record<string, number> = {
  saturn: 29.5,
  jupiter: 11.86,
  mars: 1.88,
  venus: 1.0,
};

const PLANET_LABELS: Record<string, string> = {
  saturn: 'Saturno', jupiter: 'Júpiter', mars: 'Marte', venus: 'Vênus',
};

// ============================================================
// MAIN: Get planetary return info for all configured planets
// ============================================================

export function getPlanetaryReturns(
  natal: NatalChart,
  date: Date,
  cfg: CalendarConfig
): PlanetaryReturnInfo[] {
  const results: PlanetaryReturnInfo[] = [];
  const positions = calculatePositions(date);

  const planetsToCheck: string[] = [];
  if (cfg.returns.saturn) planetsToCheck.push('saturn');
  if (cfg.returns.jupiter) planetsToCheck.push('jupiter');
  if (cfg.returns.mars) planetsToCheck.push('mars');
  if (cfg.returns.venus) planetsToCheck.push('venus');

  for (const planet of planetsToCheck) {
    const natalPos = natal.positions[planet];
    const transitPos = positions[planet];
    if (!natalPos || !transitPos) continue;

    const info = calculateReturnInfo(planet, natalPos.longitude, transitPos.longitude, date, cfg);
    results.push(info);
  }

  return results;
}

// ============================================================
// Get return events for a specific month (for calendar)
// ============================================================

export function getPlanetaryReturnEvents(
  natal: NatalChart,
  year: number,
  month: number,
  cfg: CalendarConfig
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const approachOrb = cfg.returns.approachOrb;

  const planetsToCheck: string[] = [];
  if (cfg.returns.saturn) planetsToCheck.push('saturn');
  if (cfg.returns.jupiter) planetsToCheck.push('jupiter');
  if (cfg.returns.mars) planetsToCheck.push('mars');
  if (cfg.returns.venus) planetsToCheck.push('venus');

  for (const planet of planetsToCheck) {
    const natalPos = natal.positions[planet];
    if (!natalPos) continue;

    // Check each day for approaching return
    let closestDay: { date: Date; dist: number } | null = null;

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d, 12);
      const positions = calculatePositions(date);
      const transitPos = positions[planet];
      if (!transitPos) continue;

      const dist = angularDistance(transitPos.longitude, natalPos.longitude);

      // Exact return this month (within 1°)
      if (dist <= 1) {
        events.push(createReturnEvent(planet, date, 'exact', dist, natal));
        closestDay = null; // Already got exact
        break;
      }

      // Track closest approach
      if (dist <= approachOrb && (!closestDay || dist < closestDay.dist)) {
        closestDay = { date, dist };
      }
    }

    // If approaching but not exact
    if (closestDay) {
      events.push(createReturnEvent(planet, closestDay.date, 'approaching', closestDay.dist, natal));
    }

    // Check for major phases (opposition, squares)
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d, 12);
      const positions = calculatePositions(date);
      const transitPos = positions[planet];
      if (!transitPos) continue;

      const separation = norm(transitPos.longitude - natalPos.longitude);

      // Opposition (180° ± 2°)
      if (Math.abs(separation - 180) <= 2) {
        events.push(createPhaseEvent(planet, date, 'opposition', separation - 180));
        break;
      }
      // Waxing square (90° ± 2°)
      if (Math.abs(separation - 90) <= 2) {
        events.push(createPhaseEvent(planet, date, 'first-quarter', separation - 90));
        break;
      }
      // Waning square (270° ± 2°)
      if (Math.abs(separation - 270) <= 2) {
        events.push(createPhaseEvent(planet, date, 'last-quarter', separation - 270));
        break;
      }
    }
  }

  return events;
}

// ============================================================
// HELPERS
// ============================================================

function calculateReturnInfo(
  planet: string,
  natalLon: number,
  currentLon: number,
  date: Date,
  cfg: CalendarConfig
): PlanetaryReturnInfo {
  const separation = norm(currentLon - natalLon);
  const distance = angularDistance(currentLon, natalLon);

  let phase: PlanetaryReturnInfo['phase'];
  let phaseLabel: string;

  if (distance <= cfg.returns.approachOrb) {
    phase = distance <= 1 ? 'exact' : 'approaching';
    phaseLabel = distance <= 1 ? 'Retorno Exato!' : `A ${distance.toFixed(1)}° do retorno`;
  } else if (Math.abs(separation - 90) <= 5) {
    phase = 'first-quarter';
    phaseLabel = 'Quadratura Crescente — crise de ação';
  } else if (Math.abs(separation - 180) <= 5) {
    phase = 'opposition';
    phaseLabel = 'Oposição — meio do ciclo, confronto';
  } else if (Math.abs(separation - 270) <= 5) {
    phase = 'last-quarter';
    phaseLabel = 'Quadratura Minguante — crise de consciência';
  } else {
    phase = 'separating';
    phaseLabel = `${separation.toFixed(0)}° do ciclo (${Math.round(separation / 3.6)}%)`;
  }

  const percentComplete = (separation / 360) * 100;
  const cycleYears = CYCLE_YEARS[planet] || 1;

  // Estimate next return
  const remainingDegrees = 360 - separation;
  const approxDaysPerDegree = (CYCLE_DAYS[planet] || 365) / 360;
  const daysToReturn = remainingDegrees * approxDaysPerDegree;
  const nextReturn = new Date(date.getTime() + daysToReturn * 86400000);

  const descriptions = getReturnDescription(planet, phase);

  return {
    planet,
    natalLongitude: natalLon,
    currentLongitude: currentLon,
    distanceToReturn: distance,
    phase,
    phaseLabel,
    cycleYears,
    percentComplete,
    nextReturnEstimate: nextReturn,
    description: descriptions,
  };
}

function createReturnEvent(planet: string, date: Date, type: 'exact' | 'approaching', dist: number, natal: NatalChart): CalendarEvent {
  const label = PLANET_LABELS[planet] || planet;
  const isExact = type === 'exact';

  return {
    type: 'planetary-return',
    date,
    returnPlanet: planet,
    returnType: type,
    themes: getReturnThemes(planet),
    importance: isExact ? 10 : 7,
    energy: planet === 'saturn' ? 'neutral' : 'positive',
    title: isExact
      ? `↺ Retorno de ${label} — Novo Ciclo!`
      : `↺ ${label} se aproxima do retorno (${dist.toFixed(1)}°)`,
    summary: isExact
      ? getReturnDescription(planet, 'exact')
      : `${label} está a ${dist.toFixed(1)}° da posição natal. O retorno exato se aproxima.`,
    advice: getReturnAdvice(planet, type),
  };
}

function createPhaseEvent(planet: string, date: Date, phase: string, orb: number): CalendarEvent {
  const label = PLANET_LABELS[planet] || planet;
  const phaseLabels: Record<string, string> = {
    'first-quarter': 'Quadratura Crescente',
    'opposition': 'Oposição',
    'last-quarter': 'Quadratura Minguante',
  };

  return {
    type: 'planetary-return',
    date,
    returnPlanet: planet,
    returnType: 'separating',
    themes: getReturnThemes(planet),
    importance: 5,
    energy: phase === 'opposition' ? 'negative' : 'neutral',
    title: `${label} — ${phaseLabels[phase] || phase} do ciclo`,
    summary: getPhaseDescription(planet, phase),
    advice: '',
  };
}

function angularDistance(a: number, b: number): number {
  let diff = Math.abs(a - b) % 360;
  if (diff > 180) diff = 360 - diff;
  return diff;
}

function getReturnThemes(planet: string): any[] {
  const themes: Record<string, string[]> = {
    saturn: ['career', 'transformation'],
    jupiter: ['finances', 'spirituality', 'travel'],
    mars: ['health', 'career'],
    venus: ['love', 'creativity', 'finances'],
  };
  return (themes[planet] || []) as any[];
}

function getReturnDescription(planet: string, phase: string): string {
  if (phase === 'exact') {
    const descriptions: Record<string, string> = {
      saturn: 'Retorno de Saturno — momento de reestruturação profunda. Você é chamado a assumir plena responsabilidade pela sua vida. O que não está alinhado com quem você realmente é será testado e possivelmente removido.',
      jupiter: 'Retorno de Júpiter — novo ciclo de expansão começa. Oportunidades de crescimento, viagem, aprendizado e abundância se renovam. Defina intenções grandiosas mas realistas.',
      mars: 'Retorno de Marte — renovação do impulso vital. Sua energia, desejo e capacidade de ação se reciclam. Bom momento para iniciar projetos que exigem coragem.',
      venus: 'Retorno de Vênus — renovação dos valores afetivos e estéticos. O que você ama, como ama e o que considera belo se atualiza.',
    };
    return descriptions[planet] || 'Retorno planetário — novo ciclo começa.';
  }
  return '';
}

function getPhaseDescription(planet: string, phase: string): string {
  const label = PLANET_LABELS[planet] || planet;
  const descriptions: Record<string, string> = {
    'first-quarter': `${label} em quadratura crescente com posição natal. Crise de ação — o novo ciclo encontra resistência que exige ajuste.`,
    'opposition': `${label} oposto à posição natal. Meio do ciclo — confronto com resultados do que foi iniciado no retorno. Avaliação necessária.`,
    'last-quarter': `${label} em quadratura minguante com posição natal. Crise de consciência — liberação do que não funciona antes do próximo retorno.`,
  };
  return descriptions[phase] || '';
}

function getReturnAdvice(planet: string, type: string): string {
  if (type === 'exact') {
    const advice: Record<string, string> = {
      saturn: 'Aceite a realidade como ela é. Construa sobre fundações sólidas.',
      jupiter: 'Expanda com sabedoria. Não exagere — cresça com sustentabilidade.',
      mars: 'Direcione sua energia com intenção. Inicie o que vem adiando.',
      venus: 'Reconecte-se com o que genuinamente ama e valoriza.',
    };
    return advice[planet] || '';
  }
  return 'Observe como a energia deste ciclo se manifesta.';
}
