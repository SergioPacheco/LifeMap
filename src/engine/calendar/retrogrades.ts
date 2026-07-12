// ============================================================
// RETROGRADES.TS — Detecta períodos retrógrados e estações
// Referência: Erin Sullivan "Retrograde Planets"
//
// Conceitos:
// - Estação Retrógrada: planeta "para" e inverte direção (Rx)
// - Estação Direta: planeta "para" e retoma movimento direto (D)
// - Zona de Sombra: graus que o planeta percorre 3x (pré-retro, retro, pós-retro)
// - Velocidade ~0 = estação (ponto de máxima intensidade)
// ============================================================

import type { CalendarConfig } from './types';
import type { RetroPeriod } from './types';
import { calculatePositions } from '../calculations';
import { getSignIndex } from '../calculations';
import { calendarDateAtLocalTime, type CalendarTimeContext } from './calendar-date';

// ============================================================
// MAIN: Get retrograde periods visible in a month
// ============================================================

export function getRetrogradeEvents(
  year: number,
  month: number,
  cfg: CalendarConfig,
  ctx?: CalendarTimeContext
): RetroPeriod[] {
  if (!cfg.retrogrades.show) return [];

  const periods: RetroPeriod[] = [];
  const planets = cfg.planets.transiting.filter(p => p !== 'sun' && p !== 'moon' && p !== 'northNode' && p !== 'southNode');

  // Scan the month + padding (to catch retrogrades that start before/end after)
  const scanStart = ctx ? calendarDateAtLocalTime(year, month - 1, 1, 12, 0, ctx) : new Date(year, month - 1, 1, 12);
  const scanEnd = ctx ? calendarDateAtLocalTime(year, month + 2, 0, 12, 0, ctx) : new Date(year, month + 2, 0, 12);

  for (const planet of planets) {
    const retro = findRetrogradePeriod(planet, scanStart, scanEnd);
    if (retro) {
      // Only include if the period overlaps with the target month
      const monthStart = ctx ? calendarDateAtLocalTime(year, month, 1, 0, 0, ctx) : new Date(year, month, 1);
      const monthEnd = ctx ? calendarDateAtLocalTime(year, month + 1, 0, 23, 59, ctx) : new Date(year, month + 1, 0, 23, 59);

      if (retro.startDate <= monthEnd && retro.endDate >= monthStart) {
        periods.push(retro);
      }
    }
  }

  return periods;
}

// ============================================================
// Find a retrograde period for a planet in a date range
// ============================================================

function findRetrogradePeriod(
  planet: string,
  scanStart: Date,
  scanEnd: Date
): RetroPeriod | null {
  let retroStart: Date | null = null;
  let retroEnd: Date | null = null;
  let retroSign = 0;
  let prevRetro = false;

  const STEP_DAYS = 1;
  const totalDays = Math.ceil((scanEnd.getTime() - scanStart.getTime()) / 86400000);

  for (let d = 0; d <= totalDays; d += STEP_DAYS) {
    const date = new Date(scanStart.getTime() + d * 86400000);
    const positions = calculatePositions(date);
    const pos = positions[planet];
    if (!pos) continue;

    const isRetro = pos.isRetrograde || false;

    // Detect station retrograde (transition direct → retrograde)
    if (isRetro && !prevRetro) {
      retroStart = date;
      retroSign = getSignIndex(pos.longitude);
    }

    // Detect station direct (transition retrograde → direct)
    if (!isRetro && prevRetro && retroStart) {
      retroEnd = date;
      return {
        planet,
        startDate: retroStart,
        endDate: retroEnd,
        sign: retroSign,
        stationRetroDate: retroStart,
        stationDirectDate: retroEnd,
      };
    }

    prevRetro = isRetro;
  }

  // If still retrograde at end of scan, return partial period
  if (retroStart && !retroEnd) {
    return {
      planet,
      startDate: retroStart,
      endDate: scanEnd,
      sign: retroSign,
      stationRetroDate: retroStart,
    };
  }

  return null;
}
