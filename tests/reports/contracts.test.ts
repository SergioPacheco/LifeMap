import { describe, expect, it } from 'vitest';
import { validateReportRequest, reportDocumentSchema } from '../../src/reports/core/schemas';
import { getReportPolicy } from '../../src/reports/core/policies';
import { reportSubjects } from '../fixtures/reports/profiles';
import { makeReportDocument } from '../fixtures/reports/documents';

const natal = { reportType: 'natal', subjects: [reportSubjects[0]], locale: 'pt', mode: 'complete', houseSystem: 'placidus' };
const period = { start: '2026-10-10T00:00:00Z', end: '2027-10-10T00:00:00Z', timeZoneId: 'America/Sao_Paulo', basis: 'next-12-months' };

describe('report request validation', () => {
  it('accepts all 24 synthetic profiles without changing unknown birth times', () => {
    for (const subject of reportSubjects) {
      expect(validateReportRequest({ ...natal, subjects: [subject] }).subjects[0]).toEqual(subject);
    }
  });
  it.each(['invalid', 'toString', 'forecasting'])('rejects unsupported report %s', reportType => {
    expect(() => validateReportRequest({ ...natal, reportType })).toThrow();
  });
  it.each(['xx', '', 'PT'])('rejects unsupported locale %s', locale => {
    expect(() => validateReportRequest({ ...natal, locale })).toThrow();
  });
  it('rejects full relationships without exactly two subjects', () => {
    expect(() => validateReportRequest({ ...natal, reportType: 'relationship' })).toThrow();
    expect(() => validateReportRequest({ ...natal, reportType: 'relationship', subjects: [reportSubjects[0], reportSubjects[1]] })).not.toThrow();
    expect(() => validateReportRequest({ ...natal, subjects: [reportSubjects[0], reportSubjects[1]] })).toThrow();
  });
  it('allows a single-profile relationship sample without pretending it is complete', () => {
    expect(validateReportRequest({ ...natal, reportType: 'relationship', mode: 'sample' }).mode).toBe('sample');
  });
  it.each(['annual', 'saturn-return', 'forecast'])('requires a period for %s', reportType => {
    expect(() => validateReportRequest({ ...natal, reportType })).toThrow();
  });
  it('requires forecast granularity and accepts a valid weekly period', () => {
    expect(() => validateReportRequest({ ...natal, reportType: 'forecast', period })).toThrow();
    expect(validateReportRequest({ ...natal, reportType: 'forecast', period, forecastGranularity: 'weekly' }).period).toEqual(period);
    expect(() => validateReportRequest({ ...natal, forecastGranularity: 'daily' })).toThrow();
  });
  it.each(['2026-10-10T00:00:00Z', '2026-01-01T00:00:00Z', '2027-10-10T00:00:00', '2027-10-10T00:00:00-03:00', '2027-02-30T00:00:00Z'])('rejects invalid period end %s', end => {
    expect(() => validateReportRequest({ ...natal, reportType: 'annual', period: { ...period, end } })).toThrow();
  });
  it('rejects invalid IANA zones instead of accepting the browser zone', () => {
    expect(() => validateReportRequest({ ...natal, period: { ...period, timeZoneId: 'Atlantis/City' } })).toThrow();
  });
  it.each([undefined, 0, -10, Infinity])('rejects approximate time without positive uncertainty %s', timeUncertaintyMinutes => {
    expect(() => validateReportRequest({ ...natal, subjects: [{ ...reportSubjects[0], timeQuality: 'approximate', timeUncertaintyMinutes }] })).toThrow();
  });
  it.each(['exact', 'approximate'])('rejects absent time marked %s', timeQuality => {
    expect(() => validateReportRequest({ ...natal, subjects: [{ birth: { ...reportSubjects[0].birth, time: '' }, timeQuality, timeUncertaintyMinutes: 30 }] })).toThrow();
  });
  it.each([{ date: '1990-02-30' }, { time: '24:00' }, { lat: 91 }, { lng: -181 }, { timezone: 15 }, { lat: NaN }])('rejects malformed birth data %o', invalid => {
    expect(() => validateReportRequest({ ...natal, subjects: [{ ...reportSubjects[0], birth: { ...reportSubjects[0].birth, ...invalid } }] })).toThrow();
  });
  it('limits focus to 1000 characters and rejects unknown options', () => {
    expect(() => validateReportRequest({ ...natal, focus: 'x'.repeat(1001) })).toThrow();
    expect(() => validateReportRequest({ ...natal, paid: true })).toThrow();
  });
});

describe('document contracts', () => {
  it('accepts short and long structured fixtures', () => {
    expect(reportDocumentSchema.parse(makeReportDocument()).schemaVersion).toBe(1);
    expect(reportDocumentSchema.parse(makeReportDocument('ja', true)).chapters[0].sections[0].paragraphs.length).toBeGreaterThan(100);
  });
  it('rejects references to invented facts and duplicate chapter IDs', () => {
    const doc = makeReportDocument();
    doc.chapters[0].sections[0].evidenceIds = ['invented'];
    expect(() => reportDocumentSchema.parse(doc)).toThrow();
    const duplicate = makeReportDocument();
    duplicate.chapters.push(duplicate.chapters[0]);
    expect(() => reportDocumentSchema.parse(duplicate)).toThrow();
  });
  it('rejects reversed event windows and missing planned chapters', () => {
    const doc = makeReportDocument();
    doc.context.events = [{ id: 'event', kind: 'transit-aspect', factIds: ['sun'], startUtc: period.end, endUtc: period.start, peakUtc: null, timingPrecision: 'minute', importance: 5, themes: ['career'] }];
    expect(() => reportDocumentSchema.parse(doc)).toThrow();
    const missing = makeReportDocument();
    missing.chapters = [];
    expect(() => reportDocumentSchema.parse(missing)).toThrow();
  });
  it('rejects incompatible plan types and open-ended fact kinds', () => {
    const doc = makeReportDocument();
    doc.plan.reportType = 'annual';
    expect(() => reportDocumentSchema.parse(doc)).toThrow();
    const invalid = makeReportDocument();
    (invalid.context.facts[0] as { kind: string }).kind = 'imaginary';
    expect(() => reportDocumentSchema.parse(invalid)).toThrow();
  });
});

describe('rollout policies', () => {
  it('keeps paid generation disabled until the pipeline is verified', () => {
    expect(getReportPolicy('natal', 'pt', 'complete')).toMatchObject({ enabled: false, totalMinWords: 8000, totalMaxWords: 12000 });
    expect(getReportPolicy('annual', 'en', 'complete').chapterRanges.month).toEqual({ min: 450, max: 650 });
    expect(getReportPolicy('natal', 'ja', 'complete').enabled).toBe(false);
    expect(getReportPolicy('natal', 'pt', 'sample').totalMaxWords).toBeLessThan(8000);
  });
});
