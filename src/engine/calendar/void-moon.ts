// ============================================================
// VOID-MOON.TS — Lua Vazia de Curso (Void of Course)
// Referência: Ivy Goldstein-Jacobson + Café Astrology
//
// Definição: A Lua está "vazia de curso" quando não faz mais
// nenhum aspecto maior (Ptolemaico) antes de mudar de signo.
// Tradicionais consideram apenas os 5 maiores até Saturno.
// Modernos incluem aspectos a Urano, Netuno e Plutão.
//
// Regras:
// - Apenas aspectos APLICATIVOS (Moon moving toward exact)
// - Tradicionais: 5 aspectos maiores (0, 60, 90, 120, 180)
// - Apenas planetas visíveis (até Saturno) na versão tradicional
// - Duração mínima configurável
// ============================================================

import type { CalendarConfig, CalendarEvent } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex, norm } from '../calculations';
import { calendarDateAtLocalTime, daysInCalendarMonth, type CalendarTimeContext } from './calendar-date';

const TRADITIONAL_PLANETS = ['sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn'];
const MODERN_PLANETS = [...TRADITIONAL_PLANETS, 'uranus', 'neptune', 'pluto'];

const MAJOR_ASPECTS = [0, 60, 90, 120, 180]; // Ptolemaic aspects
const ALL_ASPECTS = [0, 30, 45, 60, 90, 120, 135, 150, 180]; // Including minor

// ============================================================
// MAIN: Get Void of Course periods for a month
// ============================================================

export function getVoidOfCoursePeriods(
  year: number,
  month: number,
  cfg: CalendarConfig,
  ctx?: CalendarTimeContext
): CalendarEvent[] {
  const events: CalendarEvent[] = [];
  const daysInMonth = daysInCalendarMonth(year, month);

  const planets = cfg.moon.vocPlanets === 'traditional' ? TRADITIONAL_PLANETS : MODERN_PLANETS;
  const aspects = cfg.moon.vocAspects === 'traditional' ? MAJOR_ASPECTS : ALL_ASPECTS;

  // Scan every 30 minutes for Moon sign changes and approximate VoC periods.
  const STEP_MINUTES = 30;
  let inVoid = false;
  let voidStart: Date | null = null;

  for (let d = 0; d <= daysInMonth; d++) {
    for (let minuteOfDay = 0; minuteOfDay < 1440; minuteOfDay += STEP_MINUTES) {
      if (d === daysInMonth && minuteOfDay > 0) break; // Stop at end of month
      const hour = Math.floor(minuteOfDay / 60);
      const minute = minuteOfDay % 60;
      const date = ctx
        ? calendarDateAtLocalTime(year, month, d + 1, hour, minute, ctx)
        : new Date(year, month, d + 1, hour, minute);

      const positions = calculatePositions(date);
      if (!positions.moon) continue;

      const moonLon = positions.moon.longitude;
      const moonSign = getSignIndex(moonLon);

      // Check next step for sign change
      const nextDate = new Date(date.getTime() + STEP_MINUTES * 60000);
      const nextPositions = calculatePositions(nextDate);
      const nextMoonSign = nextPositions.moon ? getSignIndex(nextPositions.moon.longitude) : moonSign;

      // If Moon changes sign, void ends
      if (nextMoonSign !== moonSign && inVoid && voidStart) {
        const ingressDate = refineMoonSignChange(date, nextDate, nextMoonSign);
        const duration = (ingressDate.getTime() - voidStart.getTime()) / 60000; // minutes

        if (duration >= cfg.moon.vocMinDuration) {
          events.push({
            type: 'void-of-course',
            date: voidStart,
            startTime: voidStart,
            endTime: ingressDate,
            themes: [],
            importance: duration > 240 ? 5 : 3, // >4h = more important
            energy: 'neutral',
            title: `☽ Lua Vazia de Curso (${formatDuration(duration)})`,
            summary: `Evite iniciar atividades importantes, assinar contratos ou tomar decisões definitivas. Bom para rotina, meditação e descanso.`,
            advice: 'Não inicie nada novo. Complete tarefas em andamento ou descanse.',
          });
        }

        inVoid = false;
        voidStart = null;
      }

      // Check if Moon is currently void
      if (!inVoid) {
        const hasApplyingAspect = checkMoonHasApplyingAspect(moonLon, moonSign, positions, planets, aspects);

        if (!hasApplyingAspect) {
          // Moon has no more aspects to make in this sign → void starts
          inVoid = true;
          voidStart = date;
        }
      } else {
        // Re-check: maybe a new aspect formed (can happen with faster planets)
        const hasApplyingAspect = checkMoonHasApplyingAspect(moonLon, moonSign, positions, planets, aspects);
        if (hasApplyingAspect) {
          inVoid = false;
          voidStart = null;
        }
      }
    }
  }

  return events;
}

// ============================================================
// Check if Moon has any applying aspect before leaving its sign
// ============================================================

function checkMoonHasApplyingAspect(
  moonLon: number,
  moonSign: number,
  positions: any,
  planets: string[],
  aspects: number[]
): boolean {
  // Moon's remaining degrees in current sign
  const degInSign = moonLon % 30;
  const remainingInSign = 30 - degInSign;

  // Moon moves ~12-15° per day, so we check if any planet is within
  // the remaining degrees at an aspect angle
  for (const planetId of planets) {
    const planetPos = positions[planetId];
    if (!planetPos || planetId === 'moon') continue;

    const planetLon = planetPos.longitude;

    for (const angle of aspects) {
      // The exact aspect point from Moon's perspective
      const targetLon = norm(planetLon - angle);
      const targetLon2 = norm(planetLon + angle);

      // Check if Moon will reach this target before leaving the sign
      for (const target of [targetLon, targetLon2]) {
        const targetSign = getSignIndex(target);
        if (targetSign !== moonSign) continue; // Target not in Moon's current sign

        // Distance Moon needs to travel to reach the aspect
        const distance = norm(target - moonLon);
        if (distance > 0 && distance <= remainingInSign && distance < 30) {
          return true; // Moon will make this aspect before leaving the sign
        }
      }
    }
  }

  return false; // No applying aspects found → Moon is Void of Course
}

// ============================================================
// HELPERS
// ============================================================

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h${mins}min`;
}

function refineMoonSignChange(start: Date, end: Date, targetSign: number): Date {
  let lo = start.getTime();
  let hi = end.getTime();

  for (let i = 0; i < 12; i++) {
    const mid = new Date((lo + hi) / 2);
    const sign = getSignIndex(calculatePositions(mid).moon?.longitude || 0);
    if (sign === targetSign) {
      hi = mid.getTime();
    } else {
      lo = mid.getTime();
    }
  }

  return new Date(hi);
}
