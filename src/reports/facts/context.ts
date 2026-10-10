// ============================================================
// CONTEXT.TS — ReportRequest → versioned ReportContext
//
// The backend recalculates every map in the authorized environment;
// the browser never ships precomputed facts for premium reports.
// Evidence links are filtered against the fact registry, so no event
// can cite an invented ID. factsHash is a canonical hash of the fact
// set (cyrb53 over stable-stringified facts).
// ============================================================

import type {
  AstroFact,
  ReportContext,
  ReportRequest,
} from '../core/types';
import { validateReportRequest } from '../core/schemas';
import { buildSubjectChart, type SubjectChart } from '../../engine/forecast/chart';
import {
  buildTemporalFacts,
  collectForecastEvents,
  knownFactIds,
  retainKnownFactIds,
} from '../../engine/forecast/dataset';
import { buildNatalFacts } from './natal-facts';
import { buildRelationshipFacts } from './relationship-facts';

export { buildSubjectChart };
export type { SubjectChart };

export const FACTS_VERSION = 'lifemap-facts-v1';
const TEMPORAL_TYPES = ['annual', 'saturn-return', 'forecast'] as const;

export async function buildReportContext(request: ReportRequest): Promise<ReportContext> {
  const validated = validateReportRequest(request);
  const facts: AstroFact[] = [];
  const limitations: string[] = [];

  const charts = validated.subjects.map((subject) =>
    buildSubjectChart(subject, validated.houseSystem)
  );

  charts.forEach((entry, index) => {
    limitations.push(...entry.limitations);
    const natal = buildNatalFacts(entry.chart, index, {
      timeQuality: validated.subjects[index].timeQuality,
      timeUncertaintyMinutes: validated.subjects[index].timeUncertaintyMinutes,
      positionsProvenance: entry.chartProvenance.positions,
      housesProvenance: entry.chartProvenance.houses,
    });
    facts.push(...natal.facts);
    limitations.push(...natal.limitations);
  });

  if (charts.length === 2) {
    const relationship = buildRelationshipFacts(charts[0].chart, charts[1].chart, {
      positionsProvenanceA: charts[0].chartProvenance.positions,
      positionsProvenanceB: charts[1].chartProvenance.positions,
      housesKnownA: charts[0].housesKnown,
      housesKnownB: charts[1].housesKnown,
      housesA: charts[0].chart.houses,
      housesB: charts[1].chart.houses,
    });
    facts.push(...relationship.facts);
    limitations.push(...relationship.limitations);
  }

  let events: ReportContext['events'] = [];
  if ((TEMPORAL_TYPES as readonly string[]).includes(validated.reportType) && validated.period) {
    const primary = charts[0];
    const datasetOptions = {
      housesKnown: primary.housesKnown,
      subjectIndex: 0,
      birth: validated.subjects[0].birth,
    };
    const temporal = buildTemporalFacts(primary.chart, validated, datasetOptions);
    facts.push(...temporal.facts);
    limitations.push(...temporal.limitations);
    const collected = collectForecastEvents(primary.chart, validated, datasetOptions);
    limitations.push(...collected.limitations);
    events = retainKnownFactIds(
      collected.events,
      new Set([...knownFactIds(primary.chart, temporal.facts, 0, primary.housesKnown),
        ...facts.map((fact) => fact.id)])
    );
  }

  return {
    facts,
    events,
    limitations: [...new Set(limitations)],
    engineVersion: `${FACTS_VERSION}:${enginesUsed(charts)}`,
    factsHash: hashFacts(facts),
  };
}

function enginesUsed(charts: SubjectChart[]): string {
  const engines = new Set<string>();
  for (const entry of charts) {
    for (const provenance of Object.values(entry.chartProvenance.positions)) {
      engines.add(provenance.engine);
    }
    engines.add(entry.chartProvenance.houses.engine);
  }
  return [...engines].sort().join('+');
}

/** Stable stringify: object keys sorted recursively. */
export function stableStringify(value: unknown): string {
  if (value === null || typeof value !== 'object') return JSON.stringify(value) ?? 'null';
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  const entries = Object.entries(value as Record<string, unknown>)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${stableStringify(item)}`);
  return `{${entries.join(',')}}`;
}

/** cyrb53 hash as 16 hex chars — no Node-only crypto, runs anywhere. */
export function hashFacts(facts: AstroFact[]): string {
  const text = stableStringify(facts);
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < text.length; i++) {
    const ch = text.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0');
}
