// ============================================================
// PIPELINE.TS — Fake report pipeline (task 3 stand-in)
//
// Exercises every worker stage with the REAL deterministic engine
// (buildReportContext) but WITHOUT OpenAI: narrative text is marked
// FAKE. Task 4 replaces plan/write/review with model calls behind the
// same ReportPipeline interface; jobs.ts needs no changes.
// ============================================================

import type {
  ChapterDraft,
  NarrativeSection,
  PlannedChapter,
  ReportContext,
  ReportDocument,
  ReportPlan,
  ReportRequest,
} from '../../src/reports/core/types.js';
import { buildReportContext } from '../../src/reports/facts/context.js';
import type { ReportPipeline } from './jobs.js';

export interface FakePipelineHooks {
  onWriteChapter?: (chapter: ChapterDraft) => void;
}

const FAKE_CHAPTERS = [
  { id: 'ch-energies', titleKey: 'energies' },
  { id: 'ch-cycles', titleKey: 'cycles' },
  { id: 'ch-integration', titleKey: 'integration' },
] as const;

export function createFakePipeline(hooks?: FakePipelineHooks): ReportPipeline {
  return {
    calculate: async (request: ReportRequest): Promise<ReportContext> => {
      return buildReportContext(request);
    },

    plan: async (request: ReportRequest, context: ReportContext): Promise<ReportPlan> => {
      const chapters: PlannedChapter[] = FAKE_CHAPTERS.map((chapter, index) => ({
        id: chapter.id,
        titleKey: chapter.titleKey,
        factIds: context.facts.slice(index * 2, index * 2 + 2).map((fact) => fact.id),
        eventIds: context.events.slice(0, 1).map((event) => event.id),
        minWords: 50,
        maxWords: 500,
      }));
      return {
        reportType: request.reportType,
        chapters,
        requiredFactIds: [],
        editorialVersion: 'fake-v1',
      };
    },

    write: async (
      _request: ReportRequest,
      context: ReportContext,
      plan: ReportPlan,
      approved: ChapterDraft[],
      onApproved: (chapter: ChapterDraft) => Promise<void>
    ): Promise<ChapterDraft[]> => {
      const approvedIds = new Set(approved.map((chapter) => chapter.id));
      const drafts: ChapterDraft[] = [];
      for (const chapter of plan.chapters) {
        if (approvedIds.has(chapter.id)) continue;
        const section: NarrativeSection = {
          id: `${chapter.id}-s1`,
          heading: `FAKE ${chapter.titleKey}`,
          paragraphs: [
            `FAKE narrative for ${chapter.id}: ${context.facts.length} facts and ` +
              `${context.events.length} events were calculated deterministically; ` +
              'no model was involved in this smoke draft.',
          ],
          evidenceIds: [...chapter.factIds],
          eventIds: [...chapter.eventIds],
          possibleExpressions: ['FAKE'],
          recommendations: ['FAKE'],
          reflectionQuestions: ['FAKE?'],
        };
        const draft: ChapterDraft = { id: chapter.id, title: `FAKE ${chapter.titleKey}`, sections: [section] };
        hooks?.onWriteChapter?.(draft);
        await onApproved(draft);
        drafts.push(draft);
      }
      return drafts;
    },

    review: async (document: ReportDocument): Promise<ReportDocument> => document,

    render: async (): Promise<Uint8Array> => {
      // Minimal single-page PDF shell for the storage round-trip smoke test.
      // Editorial Chromium rendering lands in task 5.
      const pdf =
        '%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n' +
        '2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj\n' +
        '3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\n' +
        'trailer<</Root 1 0 R>>\n%%EOF';
      return new TextEncoder().encode(pdf);
    },
  };
}
