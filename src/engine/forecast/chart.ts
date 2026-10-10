// ============================================================
// CHART.TS — Subject birth data → natal chart with provenance
//
// Unknown birth times use a noon local reference purely so the legacy
// calculators run; the result is flagged (noonReference, housesKnown)
// and MUST never be presented as a known time. Approximate times keep
// the stated time and propagate sensitivity through limitations.
// ============================================================

import type { HouseSystem, NatalChart } from '../types';
import type { ReportSubject } from '../../reports/core/types';
import { buildUTCDate, calculatePositionsWithProvenance, type CalculationProvenance } from '../calculations';
import { calculateHousesWithProvenance } from '../houses';
import { calculateNatalChart } from '../index';

export interface SubjectChart {
  chart: NatalChart;
  chartProvenance: {
    positions: Record<string, CalculationProvenance>;
    houses: { engine: string; source: string; precision: 'computed' | 'approximate' };
  };
  limitations: string[];
  housesKnown: boolean;
  noonReference: boolean;
}

export function buildSubjectChart(subject: ReportSubject, houseSystem: HouseSystem): SubjectChart {
  const birth = subject.birth;
  const noonReference = subject.timeQuality === 'unknown' || !birth.time;
  const timeForCalc = noonReference ? '12:00' : birth.time;
  const chart = calculateNatalChart({ ...birth, time: timeForCalc }, { houseSystem });
  const utcDate = buildUTCDate(birth.date, timeForCalc, birth.timezone, birth.timeZoneId);
  const { provenance } = calculatePositionsWithProvenance(utcDate);
  const { provenance: housesProvenance } = calculateHousesWithProvenance(utcDate, birth.lat, birth.lng, houseSystem);

  const limitations: string[] = [];
  if (noonReference) {
    limitations.push(
      'Birth time unknown: the chart was calculated with a noon local reference ' +
        'so deterministic calculators can run. Houses, angles and house placements ' +
        'derived from it are omitted from facts; the reference instant itself is not evidence.'
    );
  }
  if (subject.timeQuality === 'approximate') {
    limitations.push(
      `Birth time approximate (±${subject.timeUncertaintyMinutes ?? '?'} min): ` +
        'fast-moving points carry that sensitivity window.'
    );
  }

  return {
    chart,
    chartProvenance: { positions: provenance, houses: housesProvenance },
    limitations,
    housesKnown: subject.timeQuality !== 'unknown',
    noonReference,
  };
}
