import { describe, expect, it } from 'vitest';
import { assembleReport } from '../../src/reports/assembler/assemble';
import { planReport } from '../../src/reports/planning/plan';
import { buildReportContext } from '../../src/reports/facts/context';
import { reportDocumentSchema } from '../../src/reports/core/schemas';
import { getReportPolicy } from '../../src/reports/core/policies';
import { documentWords } from '../../src/reports/quality/validate';
import type { ReportContext, ReportRequest } from '../../src/reports/core/types';
import { reportSubjects } from '../fixtures/reports/profiles';

const natal: ReportRequest = {
  reportType: 'natal',
  subjects: [reportSubjects[0]],
  locale: 'pt',
  mode: 'complete',
  houseSystem: 'placidus',
};

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

describe('rules assembler (4A natal)', () => {
  it('produces a schema-valid document inside the policy word band', async () => {
    const context = await buildReportContext(natal);
    const document = assembleReport(natal, context, planReport(natal, context));
    expect(() => reportDocumentSchema.parse(document)).not.toThrow();
    const policy = getReportPolicy('natal', 'pt', 'complete');
    const words = documentWords(document);
    expect(words).toBeGreaterThanOrEqual(policy.totalMinWords);
    expect(words).toBeLessThanOrEqual(policy.totalMaxWords);
  });

  it('never repeats a paragraph and covers every planned fact', async () => {
    const context = await buildReportContext(natal);
    const plan = planReport(natal, context);
    const document = assembleReport(natal, context, plan);
    const seen = new Set<string>();
    const cited = new Set<string>();
    for (const chapter of document.chapters) {
      for (const section of chapter.sections) {
        for (const paragraph of section.paragraphs) {
          const key = paragraph.toLowerCase().replace(/\s+/g, ' ').trim();
          expect(seen.has(key)).toBe(false);
          seen.add(key);
        }
        for (const id of [...section.evidenceIds, ...plan.requiredFactIds]) cited.add(id);
      }
      const planned = plan.chapters.find((item) => item.id === chapter.id);
      for (const id of planned?.factIds ?? []) cited.add(id);
    }
    for (const id of plan.requiredFactIds) expect(cited.has(id)).toBe(true);
  });

  it('opens chapters with synthesis over at least two indicators', async () => {
    const context = await buildReportContext(natal);
    const document = assembleReport(natal, context, planReport(natal, context));
    for (const chapter of document.chapters) {
      const [opening] = chapter.sections;
      expect(opening.evidenceIds.length).toBeGreaterThanOrEqual(2);
      expect(countWords(opening.paragraphs.join(' '))).toBeGreaterThan(60);
    }
  });

  it('is deterministic for the same context', async () => {
    const context = await buildReportContext(natal);
    const plan = planReport(natal, context);
    const stamp = '2026-10-10T00:00:00.000Z';
    const first = assembleReport(natal, context, plan, stamp);
    const second = assembleReport(natal, context, plan, stamp);
    expect(JSON.stringify(second)).toBe(JSON.stringify(first));
  });

  it('resolves known contradictions by rule instead of printing both flatly', async () => {
    const context = await buildReportContext(natal);
    // Synthetic contradiction: Venus hardened by Saturn, eased by Jupiter.
    const extra = [
      { id: 's0-aspect-91', kind: 'aspect', subjectIndex: 0, source: 'test', precision: 'computed',
        values: { planet1: 'venus', planet2: 'saturn', type: 'square', orbDeg: 2, applying: true } },
      { id: 's0-aspect-92', kind: 'aspect', subjectIndex: 0, source: 'test', precision: 'computed',
        values: { planet1: 'venus', planet2: 'jupiter', type: 'trine', orbDeg: 1.5, applying: false } },
    ] as ReportContext['facts'];
    const augmented: ReportContext = { ...context, facts: [...context.facts, ...extra] };
    const document = assembleReport(natal, augmented, planReport(natal, augmented));
    const love = document.chapters.find((chapter) => chapter.id === 'love');
    expect(love).toBeDefined();
    const text = love!.sections.map((section) => section.paragraphs.join(' ')).join(' ');
    expect(text).toMatch(/Saturno/i);
    expect(text).toMatch(/Júpiter/i);
    expect(text.toLowerCase()).toContain('ao mesmo tempo');
  });
});
