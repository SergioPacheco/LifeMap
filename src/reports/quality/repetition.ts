// ============================================================
// REPETITION.TS — No paragraph twice; padding by repeat fails here
// ============================================================

import type { QualityIssue, ReportDocument } from '../core/types.js';
import { normalizeParagraph } from '../assembler/assemble.js';

export function countWords(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0;
}

/** No paragraph may appear twice (normalized); padding by repetition fails here. */
export function checkRepetition(document: ReportDocument): QualityIssue[] {
  const issues: QualityIssue[] = [];
  const seen = new Map<string, string>();
  for (const chapter of document.chapters) {
    for (const section of chapter.sections) {
      for (const paragraph of section.paragraphs) {
        const key = normalizeParagraph(paragraph);
        const first = seen.get(key);
        if (first !== undefined) {
          issues.push({
            code: 'REPETITION',
            chapterId: chapter.id,
            message: `Paragraph repeats text first printed in ${first}`,
          });
        } else {
          seen.set(key, `${chapter.id}/${section.id}`);
        }
      }
    }
  }
  return issues;
}
