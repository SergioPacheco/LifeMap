// ============================================================
// EVIDENCE.TS — Every cited ID must resolve to the context
// ============================================================

import type { QualityIssue, ReportDocument } from '../core/types.js';

/** All evidence/event IDs cited must resolve to the context. */
export function checkEvidence(document: ReportDocument): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const facts = new Set(document.context.facts.map((fact) => fact.id));
  const events = new Set(document.context.events.map((event) => event.id));
  document.chapters.forEach((chapter) =>
    chapter.sections.forEach((section) => {
      for (const id of section.evidenceIds) {
        if (!facts.has(id)) {
          issues.push({ code: 'UNKNOWN_EVIDENCE', chapterId: chapter.id, message: `Unknown evidence ID: ${id}` });
        }
      }
      for (const id of section.eventIds) {
        if (!events.has(id)) {
          issues.push({ code: 'UNKNOWN_EVENT', chapterId: chapter.id, message: `Unknown event ID: ${id}` });
        }
      }
    })
  );
  for (const id of document.plan.requiredFactIds) {
    if (!facts.has(id)) {
      issues.push({ code: 'UNKNOWN_EVIDENCE', chapterId: null, message: `Unknown required fact ID: ${id}` });
    }
  }
  return issues;
}
