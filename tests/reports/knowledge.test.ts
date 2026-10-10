import { readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  CATALOG_SOURCES,
  KNOWLEDGE_VERSION,
  getCatalog,
  getEntryText,
} from '../../src/reports/knowledge/catalog';
import { selectEntries } from '../../src/reports/knowledge/select';
import { buildReportContext } from '../../src/reports/facts/context';
import type { ReportRequest } from '../../src/reports/core/types';
import { reportSubjects } from '../fixtures/reports/profiles';

// Structural guard: the native-ESM TDZ cycle (interpret ↔ interpretations)
// broke Node/tsx/Workers while Vite merely tolerated it. Leaf modules must
// never import back toward interpret.ts.
describe('knowledge base integrity', () => {
  it('has no back-edge imports toward interpret.ts in locale leaves', () => {
    const dir = new URL('../../src/engine/interpretations', import.meta.url);
    for (const file of readdirSync(dir)) {
      if (!file.endsWith('.ts') || file === 'index.ts') continue;
      const source = readFileSync(new URL(`${dir}/${file}`), 'utf8');
      expect(source, file).not.toMatch(/from '\.\.\/interpret'/);
    }
  });

  it('is versioned with unique entry ids and documented sources', () => {
    expect(KNOWLEDGE_VERSION).toMatch(/^k\d+$/);
    expect(CATALOG_SOURCES.length).toBeGreaterThan(0);
    const ids = getCatalog().map((entry) => entry.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids.length).toBeGreaterThan(150);
  });

  it('covers natal evidence in Portuguese and fails explicitly elsewhere', () => {
    const catalog = getCatalog();
    const kinds = new Set(catalog.map((entry) => entry.kind));
    for (const kind of ['planet-house', 'planet-sign', 'aspect', 'theme-synthesis'] as const) {
      expect(kinds.has(kind)).toBe(true);
    }
    const aspect = catalog.find((entry) => entry.kind === 'aspect');
    const text = getEntryText(aspect!, 'pt');
    expect(text.texts.join(' ').split(/\s+/).length).toBeGreaterThan(10);
    expect(() => getEntryText(aspect!, 'en')).toThrow(/LOCALE_UNSUPPORTED/);
  });
});

describe('evidence-driven selection', () => {
  it('maps natal facts to entries without inventing evidence', async () => {
    const request: ReportRequest = {
      reportType: 'natal',
      subjects: [reportSubjects[0]],
      locale: 'pt',
      mode: 'complete',
      houseSystem: 'placidus',
    };
    const context = await buildReportContext(request);
    const selected = selectEntries(context.facts);
    expect(selected.length).toBeGreaterThan(20);
    const factIds = new Set(context.facts.map((fact) => fact.id));
    for (const item of selected) {
      for (const id of item.factIds) expect(factIds.has(id)).toBe(true);
    }
    // Every natal aspect fact selects its pair-register text.
    const aspectFacts = context.facts.filter((fact) => fact.kind === 'aspect');
    expect(aspectFacts.length).toBeGreaterThan(5);
  });

  it('covers every classical-planet pair (no holes in the aspect catalog)', async () => {
    const request: ReportRequest = {
      reportType: 'natal',
      subjects: [reportSubjects[0]],
      locale: 'pt',
      mode: 'complete',
      houseSystem: 'placidus',
    };
    const context = await buildReportContext(request);
    const classical = new Set(['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']);
    const selected = selectEntries(context.facts);
    const coveredPairs = new Set(
      selected.filter((item) => item.entry.kind === 'aspect').map((item) => item.entry.match.pair)
    );
    for (const fact of context.facts.filter((fact) => fact.kind === 'aspect')) {
      const planet1 = String(fact.values.planet1);
      const planet2 = String(fact.values.planet2);
      if (classical.has(planet1) && classical.has(planet2)) {
        const direct = `${planet1}-${planet2}`;
        const swapped = `${planet2}-${planet1}`;
        expect(coveredPairs.has(direct) || coveredPairs.has(swapped)).toBe(true);
      }
    }
  });
});
