import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { ReportRequest } from '../../src/reports/core/types';
import { estimateReportCostUsd, reserveBudget } from '../../services/report-api/budget';
import { startTestApi, type TestApi } from './helpers';
import { reportSubjects } from '../fixtures/reports/profiles';

let api: TestApi;

beforeEach(async () => {
  api = await startTestApi();
});

afterEach(async () => {
  await api.close();
});

const natalSample: ReportRequest = {
  reportType: 'natal',
  subjects: [reportSubjects[0]],
  locale: 'pt',
  mode: 'sample',
  houseSystem: 'placidus',
};

const annualComplete: ReportRequest = {
  ...natalSample,
  reportType: 'annual',
  mode: 'complete',
  period: {
    start: '2026-06-01T00:00:00Z',
    end: '2026-07-01T00:00:00Z',
    timeZoneId: 'Etc/UTC',
    basis: 'custom',
  },
};

describe('report budget', () => {
  it('estimates deterministically and scales with editorial size', () => {
    const first = estimateReportCostUsd(natalSample, api.config);
    const second = estimateReportCostUsd(natalSample, api.config);
    expect(first).toBe(second);
    expect(first).toBeGreaterThan(0);
    expect(estimateReportCostUsd(annualComplete, api.config)).toBeGreaterThan(first);
  });

  async function jobFor(key: string): Promise<{ ownerId: string; jobId: string }> {
    const { ownerId } = await api.store.createSession();
    const { snapshot } = await api.store.createReportJob(
      ownerId,
      JSON.parse(JSON.stringify(natalSample)),
      key,
      0,
      0
    );
    return { ownerId, jobId: snapshot.jobId };
  }

  it('reserves within the ceiling and tracks the ledger', async () => {
    const first = await jobFor('budget-k1');
    const second = await jobFor('budget-k2');
    await reserveBudget(api.store, api.config, first.jobId, first.ownerId, 1.5);
    await reserveBudget(api.store, api.config, second.jobId, second.ownerId, 1.0);
    expect(await api.store.sumReserved()).toBeCloseTo(2.5, 6);
    expect(await api.store.sumReservedByOwner(first.ownerId)).toBeCloseTo(1.5, 6);
  });

  it('rejects over-ceiling and over-quota reservations without side effects', async () => {
    const { ownerId, jobId } = await jobFor('budget-k3');
    const count = async () =>
      (await api.pool.query("SELECT COUNT(*)::int AS n FROM report_reservations")).rows[0].n as number;
    const before = await count();
    await expect(
      reserveBudget(api.store, { ...api.config, reportMaxCostUsd: 1 }, jobId, ownerId, 50).then(
        () => ({ code: 'NO_THROW' }),
        (error: { code?: string }) => ({ code: error?.code ?? 'UNKNOWN' })
      )
    ).resolves.toMatchObject({ code: 'BUDGET_EXCEEDED' });
    await expect(
      reserveBudget(api.store, { ...api.config, ownerQuotaUsd: 1 }, jobId, ownerId, 2).then(
        () => ({ code: 'NO_THROW' }),
        (error: { code?: string }) => ({ code: error?.code ?? 'UNKNOWN' })
      )
    ).resolves.toMatchObject({ code: 'QUOTA_EXCEEDED' });
    expect(await count()).toBe(before);
  });

  it('releases reservations on cancel so quota returns', async () => {
    const { ownerId, jobId } = await jobFor('budget-k4');
    await reserveBudget(api.store, api.config, jobId, ownerId, 2);
    expect(await api.store.sumReservedByOwner(ownerId)).toBeCloseTo(2, 6);
    await api.store.releaseReservationsForJob(jobId);
    expect(await api.store.sumReservedByOwner(ownerId)).toBeCloseTo(0, 6);
  });
});
