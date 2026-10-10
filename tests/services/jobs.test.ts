import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFakePipeline, type FakePipelineHooks } from '../../services/report-worker/pipeline';
import {
  processReportJob,
  runWorkerOnce,
  type ReportPipeline,
} from '../../services/report-worker/jobs';
import type { ChapterDraft } from '../../src/reports/core/types';
import { startTestApi, type TestApi } from './helpers';
import { reportSubjects } from '../fixtures/reports/profiles';

let api: TestApi;

const natalSample = {
  reportType: 'natal',
  subjects: [reportSubjects[0]],
  locale: 'pt',
  mode: 'sample',
  houseSystem: 'placidus',
} as const;

async function createJob(): Promise<string> {
  const { ownerId } = await (await fetch(`${api.baseUrl}/v1/sessions/guest`, { method: 'POST' })).json();
  const { snapshot } = await api.store.createReportJob(
    ownerId,
    JSON.parse(JSON.stringify(natalSample)),
    `idem-${Math.random()}`,
    0,
    0
  );
  return snapshot.jobId;
}

function deps() {
  return { store: api.store, storage: api.storage, config: api.config };
}

beforeEach(async () => {
  api = await startTestApi();
});

afterEach(async () => {
  await api.close();
});

describe('report worker', () => {
  it('completes a job with the fake pipeline and persists every chapter', async () => {
    const jobId = await createJob();
    await processReportJob(jobId, createFakePipeline(), deps(), 'worker-1');
    const snapshot = await api.store.getJobById(jobId);
    expect(snapshot?.stage).toBe('ready');
    expect(snapshot?.documentAvailable).toBe(true);
    expect(snapshot?.completedChapters).toBe(snapshot?.totalChapters);
    expect(snapshot?.totalChapters).toBeGreaterThan(0);
    const chapters = await api.store.getApprovedChapters(jobId);
    expect(chapters.length).toBe(snapshot?.totalChapters);
    const artifact = await api.storage.get(snapshot?.artifactPath ?? '');
    expect(artifact && artifact.length).toBeGreaterThan(0);
  });

  it('resumes after a crash reusing approved chapters', async () => {
    const jobId = await createJob();
    const written: string[] = [];
    const flaky = createFakePipeline({
      onWriteChapter: (chapter: ChapterDraft) => {
        written.push(chapter.id);
        if (written.length === 2) throw new Error('WRITE_BOOM');
      },
    } satisfies FakePipelineHooks);
    await processReportJob(jobId, flaky, deps(), 'worker-flaky');
    const failed = await api.store.getJobById(jobId);
    expect(failed?.stage).toBe('failed');
    expect(failed?.retryable).toBe(true);
    expect(failed?.errorCode).toBe('WRITE_FAILED');
    expect(failed?.completedChapters).toBe(1);

    written.length = 0;
    await api.store.retryJobById(jobId);
    await processReportJob(jobId, createFakePipeline({ onWriteChapter: (c) => void written.push(c.id) }), deps(), 'worker-resume');
    const ready = await api.store.getJobById(jobId);
    expect(ready?.stage).toBe('ready');
    // Chapter 1 was reused, only the missing chapters were rewritten.
    expect(written).toHaveLength((ready?.totalChapters ?? 1) - 1);
  });

  it('holds leases so two workers never process the same job', async () => {
    const jobId = await createJob();
    const claimed = await api.store.claimJob(jobId, 'worker-a', 60);
    expect(claimed).toBe(true);
    await expect(
      api.store.claimJob(jobId, 'worker-b', 60).then(
        () => ({ code: 'NO_THROW' }),
        (error: { code?: string }) => ({ code: error?.code ?? 'UNKNOWN' })
      )
    ).resolves.toMatchObject({ code: 'LEASE_HELD' });
    // An expired lease can be taken over.
    await api.pool.query('UPDATE report_jobs SET lease_expires_at = $1 WHERE id = $2', [
      new Date(Date.now() - 1000).toISOString(),
      jobId,
    ]);
    await expect(api.store.claimJob(jobId, 'worker-b', 60)).resolves.toBe(true);
  });

  it('rejects stage commits from a worker holding a stale lease', async () => {
    const jobId = await createJob();
    await api.store.claimJob(jobId, 'worker-a', 60);
    const row = await api.store.getJobById(jobId);
    const staleToken = row?.leaseToken ?? '';
    await api.pool.query('UPDATE report_jobs SET lease_expires_at = $1 WHERE id = $2', [
      new Date(Date.now() - 1000).toISOString(),
      jobId,
    ]);
    await api.store.claimJob(jobId, 'worker-b', 60);
    const committed = await api.store.updateStage(jobId, 'planning', {}, staleToken);
    expect(committed).toBe(false);
    const current = await api.store.getJobById(jobId);
    expect(current?.stage).toBe('queued');
  });

  it('stops when the job is cancelled mid-pipeline', async () => {
    const jobId = await createJob();
    const cancelling: ReportPipeline = {
      ...createFakePipeline(),
      write: async () => {
        await api.store.cancelJobById(jobId);
        return [];
      },
    };
    await processReportJob(jobId, cancelling, deps(), 'worker-cancel');
    const snapshot = await api.store.getJobById(jobId);
    expect(snapshot?.stage).toBe('cancelled');
    expect(snapshot?.documentAvailable).toBe(false);
  });

  it('returns null when the queue is empty', async () => {
    await expect(runWorkerOnce(deps(), createFakePipeline(), 'worker-idle')).resolves.toBeNull();
  });
});
