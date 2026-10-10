// ============================================================
// VALIDATE.TS — The final gate before a document becomes a PDF
// ============================================================

import type { QualityIssue, QualityResult, ReportDocument } from '../core/types.js';
import { reportDocumentSchema } from '../core/schemas.js';
import { getReportPolicy } from '../core/policies.js';
import { checkEvidence } from './evidence.js';
import { checkCoverage } from './coverage.js';
import { checkRepetition, countWords } from './repetition.js';

function sectionWordFields(section: ReportDocument['chapters'][number]['sections'][number]): number {
  return (
    section.paragraphs.reduce((n, p) => n + countWords(p), 0) +
    section.recommendations.reduce((n, p) => n + countWords(p), 0) +
    section.reflectionQuestions.reduce((n, p) => n + countWords(p), 0) +
    section.possibleExpressions.reduce((n, p) => n + countWords(p), 0)
  );
}

export function documentWords(document: ReportDocument): number {
  return document.chapters.reduce(
    (total, chapter) => total + chapter.sections.reduce((sub, section) => sub + sectionWordFields(section), 0),
    0
  );
}

export function chapterWords(chapter: ReportDocument['chapters'][number]): number {
  return chapter.sections.reduce((total, section) => total + sectionWordFields(section), 0);
}

function checkWordBand(document: ReportDocument): QualityIssue[] {
  const issues: QualityIssue[] = [];
  if (document.reportType !== 'natal') {
    issues.push({ code: 'WORD_BAND', chapterId: null, message: 'Word band gate covers natal in 4A' });
    return issues;
  }
  const policy = getReportPolicy(document.reportType, document.locale, 'complete');
  const words = documentWords(document);
  if (words < policy.totalMinWords || words > policy.totalMaxWords) {
    issues.push({
      code: 'WORD_BAND',
      chapterId: null,
      message: `Document has ${words} words, band is ${policy.totalMinWords}–${policy.totalMaxWords}`,
    });
  }
  const ranges = new Map(document.plan.chapters.map((chapter) => [chapter.id, chapter]));
  for (const chapter of document.chapters) {
    const range = ranges.get(chapter.id);
    if (!range) continue;
    const count = chapterWords(chapter);
    if (count < range.minWords || count > range.maxWords) {
      issues.push({
        code: 'WORD_BAND',
        chapterId: chapter.id,
        message: `Chapter ${chapter.id} has ${count} words, band is ${range.minWords}–${range.maxWords}`,
      });
    }
  }
  return issues;
}

export function validateReport(document: ReportDocument): QualityResult {
  const issues: QualityIssue[] = [];
  const parsed = reportDocumentSchema.safeParse(document);
  if (!parsed.success) {
    issues.push({ code: 'SCHEMA', chapterId: null, message: 'Document violates the report contract' });
  }
  // Content gates run even on schema failure (when the shape allows it),
  // so a rejection names every applicable code instead of only SCHEMA.
  const shaped = (document ?? {}) as Partial<ReportDocument>;
  if (Array.isArray(shaped.chapters) && shaped.context && shaped.plan) {
    issues.push(...checkWordBand(document));
    issues.push(...checkEvidence(document));
    issues.push(...checkCoverage(document));
    issues.push(...checkRepetition(document));
  }
  return { accepted: issues.length === 0, issues };
}
