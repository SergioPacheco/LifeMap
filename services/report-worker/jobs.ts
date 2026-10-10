// ============================================================
// JOBS.TS — Resumable report pipeline execution
//
// Progress is checkpointed per approved chapter with the current lease
// token (fencing): restarting a worker never loses approved chapters
// and never lets a stale worker overwrite its successor. The approved
// document is persisted BEFORE rendering, so a PDF failure keeps the
// content state (ready-to-render) instead of failing the whole report.
// Reserved budget is NOT released on failure — a retry spends it.
// ============================================================

import type {
  ChapterDraft,
  PresentationData,
  ReportContext,
  ReportDocument,
  ReportPlan,
  ReportRequest,
} from '../../src/reports/core/types.js';
import { reportDocumentSchema } from '../../src/reports/core/schemas.js';
import type { ServiceConfig } from '../shared/config.js';
import { type JobRow, type JobStore } from '../shared/db.js';
import { ApiError, ErrorCodes } from '../shared/errors.js';
import type { ArtifactStorage } from '../shared/storage.js';

export interface ReportPipeline {
  calculate: (request: ReportRequest) => Promise<ReportContext>;
  plan: (request: ReportRequest, context: ReportContext) => Promise<ReportPlan>;
  write: (
    request: ReportRequest,
    context: ReportContext,
    plan: ReportPlan,
    approved: ChapterDraft[],
    onApproved: (chapter: ChapterDraft) => Promise<void>
  ) => Promise<ChapterDraft[]>;
  review: (document: ReportDocument) => Promise<ReportDocument>;
  render: (document: ReportDocument, presentation: PresentationData) => Promise<Uint8Array>;
}

export interface WorkerDeps {
  store: JobStore;
  storage: ArtifactStorage;
  config: ServiceConfig;
}

class StaleLease extends Error {
  constructor() {
    super('STALE_LEASE');
  }
}

class CancelledStop extends Error {
  constructor() {
    super('CANCELLED');
  }
}

export function parseJobRequest(row: JobRow): ReportRequest {
  return JSON.parse(row.requestJson) as ReportRequest;
}

/** Deterministic assembly; Task 4 generates real summaries here. */
export function assembleDocument(
  jobId: string,
  request: ReportRequest,
  context: ReportContext,
  plan: ReportPlan,
  drafts: ChapterDraft[],
  model: string
): ReportDocument {
  return {
    schemaVersion: 1,
    id: jobId,
    locale: request.locale,
    reportType: request.reportType,
    title: `Report ${request.reportType}`,
    summary: [],
    chapters: drafts,
    context,
    plan,
    metadata: {
      generatedAt: new Date().toISOString(),
      period: request.period ?? null,
      model,
      promptVersion: 'pipeline-v1',
      layoutVersion: 'layout-v1',
    },
  };
}

/** Presentation placeholders: real display names stay client-side (task 6). */
export function presentationForRequest(request: ReportRequest): PresentationData {
  return {
    subjects: request.subjects.map((subject) => ({
      displayName: '···',
      birthDate: subject.birth.date,
      birthTime: subject.birth.time || null,
      birthCity: subject.birth.city ?? '',
    })),
    editionLabel: `${request.reportType} · ${request.locale}`,
  };
}

export async function processReportJob(
  jobId: string,
  pipeline: ReportPipeline,
  deps: WorkerDeps,
  workerId: string
): Promise<void> {
  const { store, storage, config } = deps;
  // Take the lease, or adopt it when the caller (worker loop) already holds
  // it. Any other owner means someone else processes this job.
  let leaseToken: string | null = null;
  try {
    await store.claimJob(jobId, workerId, config.leaseSeconds);
    leaseToken = (await store.getJobById(jobId))?.leaseToken ?? null;
  } catch {
    const row = await store.getJobById(jobId);
    const active =
      row !== null &&
      row.workerId === workerId &&
      row.leaseToken !== null &&
      row.leaseExpiresAt !== null &&
      row.leaseExpiresAt.getTime() > Date.now();
    if (!active) return;
    leaseToken = row.leaseToken;
  }
  if (!leaseToken) return;

  const current = await store.getJobById(jobId);
  if (!current) return;
  const request = parseJobRequest(current);

  const guard = async (): Promise<JobRow> => {
    const row = await store.getJobById(jobId);
    if (!row) throw new CancelledStop();
    if (row.stage === 'cancelled') throw new CancelledStop();
    return row;
  };

  const setStage = async (
    stage: Parameters<JobStore['updateStage']>[1],
    patch: Parameters<JobStore['updateStage']>[2] = {}
  ): Promise<void> => {
    const committed = await store.updateStage(jobId, stage, patch, leaseToken);
    if (!committed) throw new StaleLease();
  };

  const fail = async (code: string): Promise<void> => {
    await store.updateStage(jobId, 'failed', { errorCode: code, retryable: true }, leaseToken);
  };

  try {
    await guard();
    await setStage('calculating');
    await store.heartbeat(jobId, leaseToken, config.leaseSeconds);
    let context: ReportContext;
    try {
      context = await pipeline.calculate(request);
    } catch {
      await fail(ErrorCodes.CALCULATE_FAILED);
      return;
    }

    await guard();
    await setStage('planning');
    let plan: ReportPlan;
    try {
      plan = await pipeline.plan(request, context);
    } catch {
      await fail(ErrorCodes.PLAN_FAILED);
      return;
    }
    await setStage('planning', { totalChapters: plan.chapters.length });

    await guard();
    await setStage('writing');
    const approvedRows = await store.getApprovedChapters(jobId);
    const approvedById = new Map<string, ChapterDraft>();
    for (const row of approvedRows) {
      approvedById.set(row.chapterId, JSON.parse(row.draftJson) as ChapterDraft);
    }
    const positionOf = new Map(plan.chapters.map((chapter, index) => [chapter.id, index]));
    let completed = approvedById.size;
    const onApproved = async (chapter: ChapterDraft): Promise<void> => {
      await store.saveChapter(jobId, chapter.id, JSON.stringify(chapter), true, positionOf.get(chapter.id) ?? 0);
      completed += 1;
      await setStage('writing', { completedChapters: completed });
    };
    try {
      await pipeline.write(
        request,
        context,
        plan,
        plan.chapters.filter((chapter) => approvedById.has(chapter.id)).map((chapter) => approvedById.get(chapter.id)!),
        onApproved
      );
    } catch {
      await fail(ErrorCodes.WRITE_FAILED);
      return;
    }

    const current = await guard();
    if (current.stage === 'cancelled') return;
    // Chapters written in this run were persisted via onApproved; reload all
    // so review/render see the complete approved set in plan order.
    const allRows = await store.getApprovedChapters(jobId);
    const allDrafts = allRows.map((row) => JSON.parse(row.draftJson) as ChapterDraft);
    const document = assembleDocument(jobId, request, context, plan, allDrafts, 'pipeline');

    await setStage('reviewing');
    let reviewed: ReportDocument;
    try {
      reviewed = await pipeline.review(document);
      reportDocumentSchema.parse(reviewed);
    } catch {
      await fail(ErrorCodes.REVIEW_FAILED);
      return;
    }
    await setStage('reviewing', { documentJson: JSON.stringify(reviewed) });

    await guard();
    await setStage('rendering');
    let pdf: Uint8Array;
    try {
      pdf = await pipeline.render(reviewed, presentationForRequest(request));
    } catch {
      // Content is approved and persisted; only the artifact is missing.
      // Retry resumes at rendering without rewriting chapters.
      await fail(ErrorCodes.RENDER_FAILED);
      return;
    }
    const artifactPath = await storage.put(jobId, 'pdf', pdf);
    await setStage('ready', { documentAvailable: true, artifactPath });
  } catch (error) {
    if (error instanceof StaleLease || error instanceof CancelledStop) return;
    if (error instanceof ApiError) throw error;
    await store.updateStage(jobId, 'failed', { errorCode: ErrorCodes.WRITE_FAILED, retryable: true }, leaseToken);
  }
}

/** Claim the oldest idle job and process it; null when the queue is empty. */
export async function runWorkerOnce(
  deps: WorkerDeps,
  pipeline: ReportPipeline,
  workerId: string
): Promise<string | null> {
  const claimed = await deps.store.claimNextJob(workerId, deps.config.leaseSeconds);
  if (!claimed) return null;
  await processReportJob(claimed.jobId, pipeline, deps, workerId);
  return claimed.jobId;
}
