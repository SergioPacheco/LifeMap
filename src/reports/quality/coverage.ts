// ============================================================
// COVERAGE.TS — Planned chapters and priority facts in prose
// ============================================================

import type { QualityIssue, ReportDocument } from '../core/types.js';

/** Planned chapters and priority facts must all be written and cited. */
export function checkCoverage(document: ReportDocument): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const planned = new Set(document.plan.chapters.map((chapter) => chapter.id));
  const written = new Set(document.chapters.map((chapter) => chapter.id));
  for (const id of planned) {
    if (!written.has(id)) {
      issues.push({ code: 'MISSING_CHAPTER', chapterId: id, message: `Planned chapter not written: ${id}` });
    }
  }
  const cited = new Set<string>();
  for (const chapter of document.chapters) {
    for (const section of chapter.sections) {
      for (const id of [...section.evidenceIds, ...section.eventIds]) cited.add(id);
    }
  }
  for (const id of document.plan.requiredFactIds) {
    if (!cited.has(id)) {
      issues.push({ code: 'UNCOVERED_FACT', chapterId: null, message: `Priority fact never cited: ${id}` });
    }
  }
  return issues;
}
