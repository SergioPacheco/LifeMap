import { describe, expect, it } from 'vitest';
import { calculateComposite } from '../../src/engine/index';
import { reportContextSchema } from '../../src/reports/core/schemas';
import { buildSubjectChart } from '../../src/reports/facts/context';
import { buildNatalFacts } from '../../src/reports/facts/natal-facts';
import { buildRelationshipFacts } from '../../src/reports/facts/relationship-facts';
import { reportSubjects } from '../fixtures/reports/profiles';

function finiteValues(values: Record<string, string | number | boolean | null>): number[] {
  return Object.values(values).filter((v): v is number => typeof v === 'number');
}

describe('natal facts', () => {
  it('covers positions, houses, angles and aspects with finite values', async () => {
    const subject = reportSubjects[0]; // 1988-02-29, exact time
    const { chart, chartProvenance } = buildSubjectChart(subject, 'placidus');
    const { facts, limitations } = buildNatalFacts(chart, 0, {
      timeQuality: subject.timeQuality,
      positionsProvenance: chartProvenance.positions,
      housesProvenance: chartProvenance.houses,
    });

    const kinds = new Set(facts.map((fact) => fact.kind));
    for (const kind of ['position', 'house', 'angle', 'aspect', 'distribution'] as const) {
      expect(kinds.has(kind)).toBe(true);
    }
    const sun = facts.find((fact) => fact.id === 's0-position-sun');
    expect(sun).toBeDefined();
    expect(sun!.values.longitudeDeg).toBeGreaterThanOrEqual(0);
    expect(sun!.values.longitudeDeg).toBeLessThan(360);
    for (const fact of facts) {
      for (const value of finiteValues(fact.values)) {
        expect(Number.isFinite(value)).toBe(true);
      }
      expect(fact.subjectIndex).toBe(0);
      expect(fact.source.length).toBeGreaterThan(0);
    }
    // Natal aspects stay inside the widest configured orb.
    for (const fact of facts.filter((fact) => fact.kind === 'aspect')) {
      expect(fact.values.orbDeg as number).toBeLessThanOrEqual(8.5);
    }
    expect(Array.isArray(limitations)).toBe(true);
  });

  it('omits Chiron facts when the fallback is the active source', async () => {
    const subject = reportSubjects[0];
    const { chart, chartProvenance } = buildSubjectChart(subject, 'placidus');
    expect(chartProvenance.positions.chiron?.engine).toBe('mean-elements');
    const { facts, limitations } = buildNatalFacts(chart, 0, {
      timeQuality: subject.timeQuality,
      positionsProvenance: chartProvenance.positions,
      housesProvenance: chartProvenance.houses,
    });
    expect(facts.some((fact) => JSON.stringify(fact.values).includes('chiron'))).toBe(false);
    expect(limitations.join(' ')).toContain('Chiron');
    // Mean-grade Lilith stays, flagged approximate — never silent.
    const lilith = facts.find((fact) => fact.id === 's0-position-lilith');
    expect(lilith?.precision).toBe('approximate');
  });

  it('omits houses and angles for unknown birth time and intervals the Moon', async () => {
    const subject = reportSubjects[5]; // unknown time
    const { chart, chartProvenance } = buildSubjectChart(subject, 'placidus');
    const { facts, limitations } = buildNatalFacts(chart, 0, {
      timeQuality: subject.timeQuality,
      positionsProvenance: chartProvenance.positions,
      housesProvenance: chartProvenance.houses,
    });

    expect(facts.some((fact) => fact.kind === 'house' || fact.kind === 'angle')).toBe(false);
    const moon = facts.find((fact) => fact.id === 's0-position-moon');
    expect(moon?.precision).toBe('approximate');
    expect(moon?.values.longitudeMinDeg).toBeLessThan(moon?.values.longitudeMaxDeg as number);
    expect(limitations.join(' ').toLowerCase()).toContain('unknown');
  });

  it('marks approximate birth times as sensitive instead of exact', async () => {
    const subject = reportSubjects[3]; // approximate ±30min
    const { chart, chartProvenance } = buildSubjectChart(subject, 'placidus');
    const { facts, limitations } = buildNatalFacts(chart, 0, {
      timeQuality: subject.timeQuality,
      timeUncertaintyMinutes: subject.timeUncertaintyMinutes,
      positionsProvenance: chartProvenance.positions,
      housesProvenance: chartProvenance.houses,
    });

    expect(facts.find((fact) => fact.id === 's0-angle-asc')?.precision).toBe('approximate');
    expect(limitations.join(' ')).toContain('30');
  });
});

describe('relationship facts', () => {
  it('uses the existing composite engine and links both subjects', async () => {
    const [subjectA, subjectB] = [reportSubjects[0], reportSubjects[2]];
    const a = buildSubjectChart(subjectA, 'placidus');
    const b = buildSubjectChart(subjectB, 'placidus');
    const { facts } = buildRelationshipFacts(a.chart, b.chart, {
      positionsProvenanceA: a.chartProvenance.positions,
      positionsProvenanceB: b.chartProvenance.positions,
      housesKnownA: true,
      housesKnownB: true,
      housesA: a.chart.houses,
      housesB: b.chart.houses,
    });

    const kinds = new Set(facts.map((fact) => fact.kind));
    expect(kinds.has('synastry-aspect')).toBe(true);
    expect(kinds.has('house-overlay')).toBe(true);
    expect(kinds.has('composite-position')).toBe(true);
    expect(new Set(facts.map((fact) => fact.subjectIndex))).toEqual(new Set([0, 1]));

    // Composite positions match calculateComposite (midpoint), not a naive mean.
    const composite = calculateComposite(a.chart, b.chart);
    const compositeSun = facts.find((fact) => fact.id === 'r-composite-sun');
    expect(compositeSun?.values.longitudeDeg).toBeCloseTo(composite.positions.sun.longitude, 3);
  });

  it('omits overlays that depend on an unknown partner time', async () => {
    const [subjectA, subjectB] = [reportSubjects[0], reportSubjects[5]];
    const a = buildSubjectChart(subjectA, 'placidus');
    const b = buildSubjectChart(subjectB, 'placidus');
    const { facts, limitations } = buildRelationshipFacts(a.chart, b.chart, {
      positionsProvenanceA: a.chartProvenance.positions,
      positionsProvenanceB: b.chartProvenance.positions,
      housesKnownA: true,
      housesKnownB: false,
      housesA: a.chart.houses,
      housesB: b.chart.houses,
    });

    expect(facts.some((fact) => fact.kind === 'house-overlay')).toBe(false);
    expect(facts.some((fact) => fact.kind === 'synastry-aspect')).toBe(true);
    expect(limitations.length).toBeGreaterThan(0);
  });
});

describe('context schema', () => {
  it('parses a placeholder context so the suite guards the contract', () => {
    expect(() =>
      reportContextSchema.parse({
        facts: [],
        events: [],
        limitations: ['placeholder'],
        engineVersion: 'test',
        factsHash: 'test',
      })
    ).not.toThrow();
  });
});
