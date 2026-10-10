import type { Locale } from '../../i18n';
import type { ForecastGranularity, GenerationMode, ReportType } from './types';

export interface ReportPolicy {
  totalMinWords: number;
  totalMaxWords: number;
  chapterRanges: Record<string, { min: number; max: number }>;
  enabled: boolean;
}
const ranges: Record<Exclude<ReportType, 'forecast'>, [number, number]> = {
  natal: [8000, 12000], annual: [10000, 15000], relationship: [7000, 10000], psychological: [6000, 9000],
  career: [5000, 8000], financial: [5000, 8000], spiritual: [5000, 8000], 'saturn-return': [5000, 8000],
  'seven-sins': [3500, 6000], child: [3500, 6000],
};
const forecastRanges: Record<ForecastGranularity, [number, number]> = { daily: [400, 700], weekly: [1200, 2000], monthly: [2000, 3500], annual: [10000, 15000] };

export function getReportPolicy(reportType: ReportType, _locale: Locale, mode: GenerationMode, granularity?: ForecastGranularity): ReportPolicy {
  if (reportType === 'forecast' && !granularity) throw new Error('FORECAST_GRANULARITY_REQUIRED');
  const [min, max] = reportType === 'forecast' ? forecastRanges[granularity!] : ranges[reportType];
  return {
    enabled: false, // Enabled per product/locale only after measured pipeline validation.
    totalMinWords: mode === 'sample' ? Math.min(min, 400) : min,
    totalMaxWords: mode === 'sample' ? Math.min(max, 1200) : max,
    chapterRanges: reportType === 'annual' || (reportType === 'forecast' && granularity === 'annual') ? { month: { min: 450, max: 650 } } : {},
  };
}
