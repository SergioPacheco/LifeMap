import type { BirthData, HouseSystem } from '../../engine/types';
import type { EventType, Theme } from '../../engine/calendar/types';
import type { Locale } from '../../i18n';

export const REPORT_TYPES = ['natal', 'annual', 'relationship', 'psychological', 'career', 'seven-sins', 'financial', 'spiritual', 'saturn-return', 'child', 'forecast'] as const;
export type ReportType = typeof REPORT_TYPES[number];
export type ForecastGranularity = 'daily' | 'weekly' | 'monthly' | 'annual';
export type BirthTimeQuality = 'exact' | 'approximate' | 'unknown';
export type GenerationMode = 'sample' | 'complete';
export type JobStage = 'queued' | 'calculating' | 'planning' | 'writing' | 'reviewing' | 'rendering' | 'ready' | 'failed' | 'cancelled';
export const FACT_KINDS = ['position', 'house', 'angle', 'aspect', 'dignity', 'distribution', 'chart-pattern', 'synastry-aspect', 'house-overlay', 'composite-position', 'composite-aspect', 'profection', 'progressed-position', 'progressed-aspect', 'solar-return'] as const;
export const EVENT_KINDS = ['transit-aspect', 'moon-phase', 'moon-ingress', 'planet-ingress', 'void-of-course', 'retrograde-start', 'retrograde-end', 'station', 'eclipse-solar', 'eclipse-lunar', 'planetary-return', 'profection', 'elective'] as const satisfies readonly EventType[];
export const THEMES = ['love', 'career', 'finances', 'health', 'spirituality', 'family', 'creativity', 'communication', 'transformation', 'freedom', 'travel', 'sexuality'] as const satisfies readonly Theme[];

export interface ForecastPeriod {
  start: string;
  end: string;
  timeZoneId: string;
  basis: 'calendar' | 'next-12-months' | 'birthday-cycle' | 'custom';
}
export interface ReportSubject { birth: BirthData; timeQuality: BirthTimeQuality; timeUncertaintyMinutes?: number }
export interface ReportRequest {
  reportType: ReportType;
  subjects: ReportSubject[];
  locale: Locale;
  mode: GenerationMode;
  houseSystem: HouseSystem;
  period?: ForecastPeriod;
  forecastGranularity?: ForecastGranularity;
  focus?: string;
}
export interface AstroFact {
  id: string;
  kind: typeof FACT_KINDS[number];
  values: Record<string, string | number | boolean | null>;
  subjectIndex: number;
  source: string;
  precision: 'computed' | 'approximate' | 'unavailable';
}
export interface ForecastEvent {
  id: string;
  factIds: string[];
  kind: EventType;
  startUtc: string;
  peakUtc: string | null;
  endUtc: string;
  timingPrecision: 'minute' | 'day' | 'approximate';
  importance: number;
  themes: Theme[];
}
export interface ReportContext { facts: AstroFact[]; events: ForecastEvent[]; limitations: string[]; engineVersion: string; factsHash: string }
export interface PlannedChapter { id: string; titleKey: string; factIds: string[]; eventIds: string[]; minWords: number; maxWords: number }
export interface ReportPlan { reportType: ReportType; chapters: PlannedChapter[]; requiredFactIds: string[]; editorialVersion: string }
export interface NarrativeSection {
  id: string;
  heading: string;
  paragraphs: string[];
  evidenceIds: string[];
  eventIds: string[];
  possibleExpressions: string[];
  recommendations: string[];
  reflectionQuestions: string[];
}
export interface ChapterDraft { id: string; title: string; sections: NarrativeSection[] }
export interface QualityIssue { code: string; chapterId: string | null; message: string }
export interface QualityResult { accepted: boolean; issues: QualityIssue[] }
export interface ReportDocument {
  schemaVersion: 1;
  id: string;
  locale: Locale;
  reportType: ReportType;
  title: string;
  summary: string[];
  chapters: ChapterDraft[];
  context: ReportContext;
  plan: ReportPlan;
  metadata: { generatedAt: string; period: ForecastPeriod | null; model: string; promptVersion: string; layoutVersion: string };
}
export interface PresentationData {
  subjects: Array<{ displayName: string; birthDate: string; birthTime: string | null; birthCity: string }>;
  editionLabel: string;
}
