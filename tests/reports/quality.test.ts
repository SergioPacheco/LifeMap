import { describe, expect, it } from 'vitest';
import { validateReport } from '../../src/reports/quality/validate';
import { assembleReport } from '../../src/reports/assembler/assemble';
import { planReport } from '../../src/reports/planning/plan';
import { buildReportContext } from '../../src/reports/facts/context';
import type { ReportRequest } from '../../src/reports/core/types';
import { reportSubjects } from '../fixtures/reports/profiles';

const natal: ReportRequest = {
  reportType: 'natal',
  subjects: [reportSubjects[0]],
  locale: 'pt',
  mode: 'complete',
  houseSystem: 'placidus',
};

describe('report quality gates', () => {
  it('accepts a well-formed assembled document', async () => {
    const context = await buildReportContext(natal);
    const document = assembleReport(natal, context, planReport(natal, context));
    const result = validateReport(document);
    expect(result.accepted).toBe(true);
    expect(result.issues).toEqual([]);
  });

  it('rejects invented evidence, short documents and repetition', async () => {
    const context = await buildReportContext(natal);
    const plan = planReport(natal, context);
    const base = assembleReport(natal, context, plan);

    const invented = structuredClone(base);
    invented.chapters[0].sections[0].evidenceIds = ['s0-position-imaginary'];
    expect(validateReport(invented).accepted).toBe(false);
    expect(validateReport(invented).issues.some((issue) => issue.code === 'UNKNOWN_EVIDENCE')).toBe(true);

    const short = structuredClone(base);
    short.chapters = short.chapters.slice(0, 1);
    short.plan.chapters = short.plan.chapters.slice(0, 1);
    expect(validateReport(short).issues.some((issue) => issue.code === 'WORD_BAND')).toBe(true);

    const repeated = structuredClone(base);
    repeated.chapters[1].sections[0].paragraphs = [...base.chapters[0].sections[0].paragraphs];
    expect(validateReport(repeated).issues.some((issue) => issue.code === 'REPETITION')).toBe(true);
  });
});
