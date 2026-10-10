import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { reportContextSchema } from '../../src/reports/core/schemas';
import type { ReportRequest } from '../../src/reports/core/types';
import { buildForecastDataset } from '../../src/engine/forecast/dataset';
import { buildReportContext } from '../../src/reports/facts/context';
import { reportSubjects } from '../fixtures/reports/profiles';

const houseSystem = 'placidus' as const;

function annualRequest(
  subjectIndex: number,
  period: { start: string; end: string; timeZoneId: string; basis: 'custom' },
  mode: 'sample' | 'complete' = 'complete'
): ReportRequest {
  return {
    reportType: 'annual',
    subjects: [reportSubjects[subjectIndex]],
    locale: 'pt',
    mode,
    houseSystem,
    period,
  };
}

describe('forecast dataset', () => {
  it('splits profection when the period crosses a birthday', async () => {
    const events = await buildForecastDataset(
      annualRequest(1, {
        start: '2026-03-15T00:00:00Z',
        end: '2026-03-25T00:00:00Z',
        timeZoneId: 'America/Sao_Paulo',
        basis: 'custom',
      })
    );
    const profections = events.filter((event) => event.kind === 'profection');
    // Born 1990-03-20: age 35 (house 12) before, 36 (house 1) after.
    expect(profections).toHaveLength(2);
    expect(profections[0].startUtc).toBe('2026-03-15T00:00:00.000Z');
    expect(profections[1].peakUtc).not.toBeNull();
    // Segments tile the period without gaps: Mar 15 → birthday Mar 20 → Mar 25.
    expect(profections[0].endUtc).toBe(profections[1].startUtc);
    expect(Date.parse(profections[1].startUtc)).toBeGreaterThan(Date.parse(profections[0].startUtc));
  });

  it('handles DST transitions and leap birthdays without failing', async () => {
    const dst = await buildForecastDataset(
      annualRequest(3, {
        start: '2026-03-07T00:00:00Z',
        end: '2026-03-11T00:00:00Z',
        timeZoneId: 'America/New_York',
        basis: 'custom',
      })
    );
    expect(dst.length).toBeGreaterThan(0);

    const leap = await buildForecastDataset(
      annualRequest(0, {
        start: '2026-02-20T00:00:00Z',
        end: '2026-03-10T00:00:00Z',
        timeZoneId: 'America/Sao_Paulo',
        basis: 'custom',
      })
    );
    expect(leap.filter((event) => event.kind === 'profection').length).toBeGreaterThanOrEqual(1);
  });

  it('keeps every event inside the requested half-open period', async () => {
    const period = { start: '2026-06-01T00:00:00Z', end: '2026-07-01T00:00:00Z', timeZoneId: 'Etc/UTC', basis: 'custom' as const };
    const events = await buildForecastDataset(annualRequest(2, period));
    expect(events.length).toBeGreaterThan(10);
    for (const event of events) {
      expect(Date.parse(event.startUtc)).toBeGreaterThanOrEqual(Date.parse(period.start));
      expect(Date.parse(event.startUtc)).toBeLessThan(Date.parse(period.end));
      expect(Date.parse(event.endUtc)).toBeGreaterThan(Date.parse(event.startUtc));
      expect(Date.parse(event.endUtc)).toBeLessThanOrEqual(Date.parse(period.end) + 24 * 3600 * 1000);
      expect(event.importance).toBeGreaterThanOrEqual(0);
      expect(event.importance).toBeLessThanOrEqual(10);
    }
  });

  it('blocks complete annual reports outside the eclipse catalog', async () => {
    const gap = {
      start: '2030-06-01T00:00:00Z',
      end: '2031-06-01T00:00:00Z',
      timeZoneId: 'Etc/UTC',
      basis: 'custom' as const,
    };
    await expect(buildForecastDataset(annualRequest(0, gap, 'complete'))).rejects.toThrow(
      /ECLIPSE_COVERAGE_GAP/
    );
    // Samples degrade to an explicit limitation instead of invented eclipses.
    const sample = await buildForecastDataset(annualRequest(0, gap, 'sample'));
    expect(sample.filter((event) => event.kind === 'eclipse-solar' || event.kind === 'eclipse-lunar')).toHaveLength(0);
  });

  it('requires a period for temporal content and stays empty for natal', async () => {
    // The contract rejects temporal requests without a period (schema-level).
    await expect(
      buildForecastDataset({
        reportType: 'annual',
        subjects: [reportSubjects[0]],
        locale: 'pt',
        mode: 'complete',
        houseSystem,
      })
    ).rejects.toThrow(/period/i);
    await expect(
      buildForecastDataset({
        reportType: 'natal',
        subjects: [reportSubjects[0]],
        locale: 'pt',
        mode: 'complete',
        houseSystem,
      })
    ).resolves.toEqual([]);
  });

  it('reproduces verified reference events within tolerance', async () => {
    const fixture = JSON.parse(
      readFileSync(resolve(__dirname, '../fixtures/engine/reference-events.json'), 'utf8')
    ) as {
      events: Array<{ id: string; kind: string; expectedUtc: string; toleranceMinutes: number }>;
    };
    const startMs = Math.min(...fixture.events.map((event) => Date.parse(event.expectedUtc))) - 3 * 86400000;
    const endMs = Math.max(...fixture.events.map((event) => Date.parse(event.expectedUtc))) + 3 * 86400000;
    const events = await buildForecastDataset(
      annualRequest(2, {
        start: new Date(startMs).toISOString().replace(/\.\d+Z$/, 'Z'),
        end: new Date(endMs).toISOString().replace(/\.\d+Z$/, 'Z'),
        timeZoneId: 'Etc/UTC',
        basis: 'custom',
      })
    );
    for (const reference of fixture.events) {
      const candidates = events.filter((event) => event.kind === reference.kind);
      expect(candidates.length).toBeGreaterThan(0);
      const closest = Math.min(
        ...candidates.map((event) => Math.abs(Date.parse(event.peakUtc ?? event.startUtc) - Date.parse(reference.expectedUtc)))
      );
      expect(closest).toBeLessThanOrEqual(reference.toleranceMinutes * 60000);
    }
  });
});

describe('report context', () => {
  it('builds a schema-valid context with resolvable evidence links', async () => {
    const context = await buildReportContext(
      annualRequest(0, {
        start: '2026-06-01T00:00:00Z',
        end: '2026-07-01T00:00:00Z',
        timeZoneId: 'America/Sao_Paulo',
        basis: 'custom',
      })
    );
    expect(() => reportContextSchema.parse(context)).not.toThrow();
    expect(context.facts.length).toBeGreaterThan(20);
    expect(context.engineVersion).toContain('lifemap-facts-v1');
    expect(context.factsHash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic for the same request', async () => {
    const request = annualRequest(4, {
      start: '2026-06-01T00:00:00Z',
      end: '2026-08-01T00:00:00Z',
      timeZoneId: 'Europe/Paris',
      basis: 'custom',
    });
    const first = await buildReportContext(request);
    const second = await buildReportContext(request);
    expect(second.factsHash).toBe(first.factsHash);
    expect(second.events.map((event) => event.id)).toEqual(first.events.map((event) => event.id));
  });

  it('never invents houses for unknown birth times', async () => {
    const context = await buildReportContext(
      annualRequest(5, {
        start: '2026-06-01T00:00:00Z',
        end: '2026-07-01T00:00:00Z',
        timeZoneId: 'America/Sao_Paulo',
        basis: 'custom',
      })
    );
    expect(context.facts.some((fact) => fact.kind === 'house' || fact.kind === 'angle')).toBe(false);
    expect(context.limitations.length).toBeGreaterThan(0);
    expect(() => reportContextSchema.parse(context)).not.toThrow();
  });
});
