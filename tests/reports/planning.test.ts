import { describe, expect, it } from 'vitest';
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

describe('natal planner (4A)', () => {
  it('produces ten chapters with evidence inside the plan', async () => {
    const context = await buildReportContext(natal);
    const plan = planReport(natal, context);
    expect(plan.reportType).toBe('natal');
    expect(plan.chapters).toHaveLength(10);
    const factIds = new Set(context.facts.map((fact) => fact.id));
    const chapterIds = new Set(plan.chapters.map((chapter) => chapter.id));
    expect(chapterIds.size).toBe(10);
    for (const chapter of plan.chapters) {
      expect(chapter.maxWords).toBeGreaterThanOrEqual(chapter.minWords);
      for (const id of [...chapter.factIds, ...plan.requiredFactIds]) {
        expect(factIds.has(id)).toBe(true);
      }
    }
    // Priority evidence (Sun, Moon, Ascendant) is required, not optional.
    expect(plan.requiredFactIds).toContain('s0-position-sun');
    expect(plan.requiredFactIds).toContain('s0-position-moon');
  });

  it('refuses temporal reports until their slice lands', async () => {
    const context = await buildReportContext(natal);
    expect(() =>
      planReport(
        {
          ...natal,
          reportType: 'annual',
          period: {
            start: '2026-06-01T00:00:00Z',
            end: '2026-07-01T00:00:00Z',
            timeZoneId: 'Etc/UTC',
            basis: 'custom',
          },
        },
        context
      )
    ).toThrow(/PLANNER_UNSUPPORTED/);
  });
});
