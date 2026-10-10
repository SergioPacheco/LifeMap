import { z } from 'zod';
import { REPORT_TYPES, FACT_KINDS, EVENT_KINDS, THEMES, type ReportRequest } from './types';

const text = z.string().trim().min(1);
export const localeSchema = z.enum(['pt', 'en', 'es', 'fr', 'de', 'it', 'ja', 'zh', 'ru', 'tr', 'nl']);
export const reportTypeSchema = z.enum(REPORT_TYPES);
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(value => {
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}, 'Invalid calendar date');
const utcSchema = z.iso.datetime({ offset: false }).refine(value => {
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value.slice(0, 10);
}, 'Invalid UTC timestamp');
const timeZoneSchema = text.refine(value => {
  try { new Intl.DateTimeFormat('en', { timeZone: value }); return !/^[+-]/.test(value); }
  catch { return false; }
}, 'Invalid IANA time zone');
const ids = z.array(text);

export const forecastPeriodSchema = z.strictObject({
  start: utcSchema, end: utcSchema, timeZoneId: timeZoneSchema,
  basis: z.enum(['calendar', 'next-12-months', 'birthday-cycle', 'custom']),
}).refine(period => Date.parse(period.end) > Date.parse(period.start), 'Period end must follow start');

export const reportSubjectSchema = z.strictObject({
  birth: z.strictObject({
    name: z.string().optional(), date: dateSchema,
    time: z.union([z.literal(''), z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/)]),
    lat: z.number().min(-90).max(90), lng: z.number().min(-180).max(180), timezone: z.number().min(-12).max(14),
    timeZoneId: timeZoneSchema.optional(), city: z.string().optional(), country: z.string().optional(),
  }),
  timeQuality: z.enum(['exact', 'approximate', 'unknown']),
  timeUncertaintyMinutes: z.number().positive().optional(),
}).superRefine((subject, ctx) => {
  if (subject.timeQuality !== 'unknown' && !subject.birth.time) ctx.addIssue({ code: 'custom', path: ['birth', 'time'], message: 'Known birth time required' });
  if (subject.timeQuality === 'approximate' && subject.timeUncertaintyMinutes === undefined) ctx.addIssue({ code: 'custom', path: ['timeUncertaintyMinutes'], message: 'Approximate birth time requires uncertainty' });
});

export const reportRequestSchema = z.strictObject({
  reportType: reportTypeSchema, subjects: z.array(reportSubjectSchema).min(1).max(2), locale: localeSchema,
  mode: z.enum(['sample', 'complete']), houseSystem: z.enum(['placidus', 'koch', 'equal', 'whole-sign', 'campanus', 'regiomontanus']),
  period: forecastPeriodSchema.optional(), forecastGranularity: z.enum(['daily', 'weekly', 'monthly', 'annual']).optional(),
  focus: z.string().max(1000).optional(),
}).superRefine((request, ctx) => {
  const expected = request.reportType === 'relationship' ? (request.mode === 'complete' ? 2 : null) : 1;
  if (expected !== null && request.subjects.length !== expected) ctx.addIssue({ code: 'custom', path: ['subjects'], message: `Expected ${expected} subjects` });
  if (['annual', 'saturn-return', 'forecast'].includes(request.reportType) && !request.period) ctx.addIssue({ code: 'custom', path: ['period'], message: 'Explicit period required' });
  if (request.reportType === 'forecast' && !request.forecastGranularity) ctx.addIssue({ code: 'custom', path: ['forecastGranularity'], message: 'Forecast granularity required' });
  if (request.reportType !== 'forecast' && request.forecastGranularity) ctx.addIssue({ code: 'custom', path: ['forecastGranularity'], message: 'Granularity applies only to forecast' });
});

export function validateReportRequest(input: unknown): ReportRequest { return reportRequestSchema.parse(input); }

export const astroFactSchema = z.strictObject({
  id: text, kind: z.enum(FACT_KINDS), values: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
  subjectIndex: z.number().int().min(0).max(1), source: text, precision: z.enum(['computed', 'approximate', 'unavailable']),
});
export const forecastEventSchema = z.strictObject({
  id: text, factIds: ids, kind: z.enum(EVENT_KINDS), startUtc: utcSchema, peakUtc: utcSchema.nullable(), endUtc: utcSchema,
  timingPrecision: z.enum(['minute', 'day', 'approximate']), importance: z.number().min(0).max(10), themes: z.array(z.enum(THEMES)),
}).superRefine((event, ctx) => {
  const start = Date.parse(event.startUtc), end = Date.parse(event.endUtc);
  if (end <= start) ctx.addIssue({ code: 'custom', path: ['endUtc'], message: 'Event end must follow start' });
  if (event.peakUtc !== null && (Date.parse(event.peakUtc) < start || Date.parse(event.peakUtc) >= end)) ctx.addIssue({ code: 'custom', path: ['peakUtc'], message: 'Peak must be within the half-open event window' });
});

function uniqueIds(items: { id: string }[], ctx: z.RefinementCtx, path: (string | number)[]): void {
  const seen = new Set<string>();
  items.forEach((item, i) => {
    if (seen.has(item.id)) ctx.addIssue({ code: 'custom', path: [...path, i, 'id'], message: 'Duplicate ID' });
    seen.add(item.id);
  });
}
function references(refs: string[], allowed: Set<string>, ctx: z.RefinementCtx, path: (string | number)[]): void {
  refs.forEach((id, i) => {
    if (!allowed.has(id)) ctx.addIssue({ code: 'custom', path: [...path, i], message: `Unknown evidence ID: ${id}` });
  });
}

export const reportContextSchema = z.strictObject({
  facts: z.array(astroFactSchema), events: z.array(forecastEventSchema), limitations: z.array(text), engineVersion: text, factsHash: text,
}).superRefine((context, ctx) => {
  uniqueIds(context.facts, ctx, ['facts']); uniqueIds(context.events, ctx, ['events']);
  const facts = new Set(context.facts.map(fact => fact.id));
  context.events.forEach((event, i) => references(event.factIds, facts, ctx, ['events', i, 'factIds']));
});
export const plannedChapterSchema = z.strictObject({
  id: text, titleKey: text, factIds: ids, eventIds: ids, minWords: z.number().int().nonnegative(), maxWords: z.number().int().positive(),
}).refine(chapter => chapter.maxWords >= chapter.minWords, 'Invalid chapter word range');
export const reportPlanSchema = z.strictObject({
  reportType: reportTypeSchema, chapters: z.array(plannedChapterSchema).min(1), requiredFactIds: ids, editorialVersion: text,
}).superRefine((plan, ctx) => uniqueIds(plan.chapters, ctx, ['chapters']));
export const narrativeSectionSchema = z.strictObject({
  id: text, heading: text, paragraphs: z.array(text).min(1), evidenceIds: ids, eventIds: ids,
  possibleExpressions: z.array(text), recommendations: z.array(text), reflectionQuestions: z.array(text),
});
export const chapterDraftSchema = z.strictObject({
  id: text, title: text, sections: z.array(narrativeSectionSchema).min(1),
}).superRefine((chapter, ctx) => uniqueIds(chapter.sections, ctx, ['sections']));
export const presentationDataSchema = z.strictObject({
  subjects: z.array(z.strictObject({ displayName: text, birthDate: dateSchema, birthTime: z.string().regex(/^(?:[01]\d|2[0-3]):[0-5]\d$/).nullable(), birthCity: z.string() })).min(1).max(2),
  editionLabel: text,
});

export const reportDocumentSchema = z.strictObject({
  schemaVersion: z.literal(1), id: text, locale: localeSchema, reportType: reportTypeSchema, title: text, summary: z.array(text),
  chapters: z.array(chapterDraftSchema).min(1), context: reportContextSchema, plan: reportPlanSchema,
  metadata: z.strictObject({ generatedAt: utcSchema, period: forecastPeriodSchema.nullable(), model: text, promptVersion: text, layoutVersion: text }),
}).superRefine((document, ctx) => {
  if (document.reportType !== document.plan.reportType) ctx.addIssue({ code: 'custom', path: ['plan', 'reportType'], message: 'Plan and document report types must match' });
  if (['annual', 'saturn-return', 'forecast'].includes(document.reportType) && !document.metadata.period) ctx.addIssue({ code: 'custom', path: ['metadata', 'period'], message: 'Temporal report requires period' });
  uniqueIds(document.chapters, ctx, ['chapters']);
  const facts = new Set(document.context.facts.map(fact => fact.id)), events = new Set(document.context.events.map(event => event.id));
  const planned = new Set(document.plan.chapters.map(chapter => chapter.id)), written = new Set(document.chapters.map(chapter => chapter.id));
  if (planned.size !== written.size || [...planned].some(id => !written.has(id))) ctx.addIssue({ code: 'custom', path: ['chapters'], message: 'Written chapters must match the complete plan' });
  references(document.plan.requiredFactIds, facts, ctx, ['plan', 'requiredFactIds']);
  document.plan.chapters.forEach((chapter, i) => {
    references(chapter.factIds, facts, ctx, ['plan', 'chapters', i, 'factIds']); references(chapter.eventIds, events, ctx, ['plan', 'chapters', i, 'eventIds']);
  });
  document.chapters.forEach((chapter, i) => chapter.sections.forEach((section, j) => {
    references(section.evidenceIds, facts, ctx, ['chapters', i, 'sections', j, 'evidenceIds']); references(section.eventIds, events, ctx, ['chapters', i, 'sections', j, 'eventIds']);
  }));
});
