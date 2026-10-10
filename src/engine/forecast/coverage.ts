// ============================================================
// COVERAGE.TS — Validity windows of day-precision catalogs
//
// The eclipse table covers 2024–2028. Periods outside it must NOT
// receive invented eclipse events: complete annual-grade reports are
// blocked, samples degrade to an explicit limitation.
// ============================================================

import { ECLIPSE_CATALOG_END, ECLIPSE_CATALOG_START, isEclipseRangeCovered } from '../../engine/calendar/eclipses';
import type { ForecastGranularity, ReportType } from '../../reports/core/types';

export interface EclipseCoverage {
  covered: boolean;
  catalogStartUtc: string;
  catalogEndUtc: string;
}

export function getEclipseCoverage(startUtcMs: number, endUtcMs: number): EclipseCoverage {
  return {
    covered: isEclipseRangeCovered(startUtcMs, endUtcMs),
    catalogStartUtc: `${ECLIPSE_CATALOG_START}T00:00:00Z`,
    catalogEndUtc: `${ECLIPSE_CATALOG_END}T00:00:00Z`,
  };
}

/** Report kinds whose complete edition requires eclipse coverage. */
export function requiresEclipseCoverage(reportType: ReportType, granularity?: ForecastGranularity): boolean {
  if (reportType === 'annual') return true;
  if (reportType === 'forecast' && granularity === 'annual') return true;
  return false;
}

export function assertEclipseCoverage(
  reportType: ReportType,
  mode: 'sample' | 'complete',
  granularity: ForecastGranularity | undefined,
  startUtcMs: number,
  endUtcMs: number
): EclipseCoverage {
  const coverage = getEclipseCoverage(startUtcMs, endUtcMs);
  if (!coverage.covered && mode === 'complete' && requiresEclipseCoverage(reportType, granularity)) {
    throw new Error(
      `ECLIPSE_COVERAGE_GAP: complete ${reportType} requires eclipse coverage for the whole period, ` +
        `but the catalog spans ${coverage.catalogStartUtc}..${coverage.catalogEndUtc}.`
    );
  }
  return coverage;
}
