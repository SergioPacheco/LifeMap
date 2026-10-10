import type { ReportDocument, PresentationData } from '../../../src/reports/core/types';
import type { Locale } from '../../../src/i18n';
import { displayNames, reportSubjects } from './profiles';

// Editorial and renderer fixtures, not approved interpretations or calculated charts.
export function makeReportDocument(locale: Locale = 'pt', long = false): ReportDocument {
  const paragraph = locale === 'ja' ? 'これは長い文章の表示を検証するための合成資料です。段落の連続性と日本語の文字表示を確認します。' : 'Este documento sintético verifica a leitura contínua e a preservação de parágrafos, sem afirmar acontecimentos pessoais ou posições calculadas.';
  return {
    schemaVersion: 1, id: `fixture-natal-${locale}`, locale, reportType: 'natal', title: 'Relatório sintético', summary: ['Fixture de apresentação.'],
    context: { facts: [{ id: 'sun', kind: 'position', subjectIndex: 0, values: { point: 'sun', longitude: 0 }, source: 'synthetic-fixture', precision: 'approximate' }], events: [], limitations: ['Dados sintéticos, sem uso interpretativo.'], engineVersion: 'fixture-v1', factsHash: 'fixture-hash' },
    plan: { reportType: 'natal', chapters: [{ id: 'identity', titleKey: 'identity', factIds: ['sun'], eventIds: [], minWords: 0, maxWords: 12000 }], requiredFactIds: ['sun'], editorialVersion: 'fixture-v1' },
    chapters: [{ id: 'identity', title: 'Identidade', sections: [{ id: 'overview', heading: 'Leitura contínua', paragraphs: Array.from({ length: long ? 240 : 2 }, (_, i) => `${i + 1}. ${paragraph}`), evidenceIds: ['sun'], eventIds: [], possibleExpressions: [], recommendations: [], reflectionQuestions: [] }] }],
    metadata: { generatedAt: '2026-10-10T00:00:00Z', period: null, model: 'fixture', promptVersion: 'fixture-v1', layoutVersion: 'fixture-v1' },
  };
}

export function makePresentationData(index = 0): PresentationData {
  const subject = reportSubjects[index];
  return { subjects: [{ displayName: displayNames[index % displayNames.length], birthDate: subject.birth.date, birthTime: subject.timeQuality === 'unknown' ? null : subject.birth.time, birthCity: subject.birth.city! }], editionLabel: 'Fixture sintética' };
}
