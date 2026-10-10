// ============================================================
// DB.TS — PostgreSQL pool, migrations and the report job store
//
// SQL stays deliberately portable (pg-mem for hermetic unit tests,
// real Postgres in compose/production): conditional single-statement
// UPDATEs make claims and lease commits atomic without advisory locks
// or SKIP LOCKED. Fencing: every stage commit must present the current
// lease token, so a worker with an expired lease cannot overwrite the
// progress of the worker that took over.
// ============================================================

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { Pool } from 'pg';
import { ApiError, ErrorCodes } from './errors.js';
import { stableStringify } from '../../src/reports/facts/context.js';
import type { ReportRequest } from '../../src/reports/core/types.js';

export interface PoolLike {
  query: (text: string, params?: unknown[]) => Promise<{ rows: Array<Record<string, unknown>>; rowCount: number }>;
  end?: () => Promise<void>;
}

export function createPool(databaseUrl: string): Pool {
  return new Pool({ connectionString: databaseUrl });
}

export async function runMigrations(pool: PoolLike): Promise<void> {
  const url = new URL('../migrations/001-reports.sql', import.meta.url);
  const withoutComments = readFileSync(url, 'utf8')
    .split('\n')
    .filter((line) => !line.trim().startsWith('--'))
    .join('\n');
  const statements = withoutComments
    .split(/;/)
    .map((statement) => statement.trim())
    .filter((statement) => statement.length > 0);
  for (const statement of statements) {
    await pool.query(statement);
  }
}

export function hashToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function hashRequest(request: unknown): string {
  return createHash('sha256').update(stableStringify(request), 'utf8').digest('hex');
}

export function newGuestCredentials(): { ownerId: string; token: string } {
  return { ownerId: randomUUID(), token: randomBytes(32).toString('base64url') };
}

export type JobStage =
  | 'queued' | 'calculating' | 'planning' | 'writing'
  | 'reviewing' | 'rendering' | 'ready' | 'failed' | 'cancelled';

export interface JobRow {
  jobId: string;
  ownerId: string;
  idempotencyKey: string;
  requestHash: string;
  requestJson: string;
  mode: string;
  stage: JobStage;
  totalChapters: number;
  completedChapters: number;
  documentAvailable: boolean;
  documentJson: string | null;
  artifactPath: string | null;
  errorCode: string | null;
  retryable: boolean;
  workerId: string | null;
  leaseToken: string | null;
  leaseExpiresAt: Date | null;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobSnapshot {
  jobId: string;
  stage: JobStage;
  completedChapters: number;
  totalChapters: number;
  documentAvailable: boolean;
  errorCode: string | null;
  retryable: boolean;
  updatedAt: string;
}

export interface ChapterRow {
  jobId: string;
  chapterId: string;
  position: number;
  draftJson: string;
  approved: boolean;
  attempts: number;
}

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  return new Date(String(value));
}

function toJobRow(row: Record<string, unknown>): JobRow {
  return {
    jobId: String(row.id),
    ownerId: String(row.owner_id),
    idempotencyKey: String(row.idempotency_key),
    requestHash: String(row.request_hash),
    requestJson: String(row.request_json),
    mode: String(row.mode ?? 'sample'),
    stage: row.stage as JobStage,
    totalChapters: Number(row.total_chapters ?? 0),
    completedChapters: Number(row.completed_chapters ?? 0),
    documentAvailable: Boolean(row.document_available),
    documentJson: row.document_json === null || row.document_json === undefined ? null : String(row.document_json),
    artifactPath: row.artifact_path === null || row.artifact_path === undefined ? null : String(row.artifact_path),
    errorCode: row.error_code === null || row.error_code === undefined ? null : String(row.error_code),
    retryable: Boolean(row.retryable),
    workerId: row.worker_id === null || row.worker_id === undefined ? null : String(row.worker_id),
    leaseToken: row.lease_token === null || row.lease_token === undefined ? null : String(row.lease_token),
    leaseExpiresAt: row.lease_expires_at === null || row.lease_expires_at === undefined ? null : toDate(row.lease_expires_at),
    attemptCount: Number(row.attempt_count ?? 0),
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at),
  };
}

export function toSnapshot(row: JobRow): JobSnapshot {
  return {
    jobId: row.jobId,
    stage: row.stage,
    completedChapters: row.completedChapters,
    totalChapters: row.totalChapters,
    documentAvailable: row.documentAvailable,
    errorCode: row.errorCode,
    retryable: row.retryable,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export class JobStore {
  constructor(readonly pool: PoolLike) {}

  async createSession(): Promise<{ ownerId: string; token: string }> {
    const { ownerId, token } = newGuestCredentials();
    await this.pool.query(
      'INSERT INTO report_sessions (owner_id, token_hash) VALUES ($1, $2)',
      [ownerId, hashToken(token)]
    );
    return { ownerId, token };
  }

  async findOwnerByToken(token: string): Promise<string | null> {
    const result = await this.pool.query('SELECT owner_id FROM report_sessions WHERE token_hash = $1', [
      hashToken(token),
    ]);
    if (result.rows.length === 0) return null;
    const ownerId = String(result.rows[0].owner_id);
    await this.pool.query('UPDATE report_sessions SET last_seen_at = now() WHERE owner_id = $1', [ownerId]);
    return ownerId;
  }

  async createReportJob(
    ownerId: string,
    request: ReportRequest,
    idempotencyKey: string,
    totalChapters: number,
    _estimateUsd: number
  ): Promise<{ snapshot: JobSnapshot; created: boolean }> {
    const requestHash = hashRequest(request);
    const existing = await this.pool.query(
      'SELECT * FROM report_jobs WHERE owner_id = $1 AND idempotency_key = $2',
      [ownerId, idempotencyKey]
    );
    if (existing.rows.length > 0) {
      const row = toJobRow(existing.rows[0]);
      if (row.requestHash !== requestHash) {
        throw new ApiError(409, ErrorCodes.IDEMPOTENCY_CONFLICT, 'Idempotency key reused with a different payload');
      }
      return { snapshot: toSnapshot(row), created: false };
    }
    const id = randomUUID();
    const mode = typeof request.mode === 'string' ? request.mode : 'sample';
    const inserted = await this.pool.query(
      `INSERT INTO report_jobs
        (id, owner_id, idempotency_key, request_hash, request_json, mode, stage, total_chapters)
       VALUES ($1, $2, $3, $4, $5, $6, 'queued', $7)
       RETURNING *`,
      [id, ownerId, idempotencyKey, requestHash, JSON.stringify(request), mode, totalChapters]
    );
    return { snapshot: toSnapshot(toJobRow(inserted.rows[0])), created: true };
  }

  async getJob(ownerId: string, jobId: string): Promise<JobRow | null> {
    const result = await this.pool.query('SELECT * FROM report_jobs WHERE id = $1 AND owner_id = $2', [
      jobId,
      ownerId,
    ]);
    return result.rows.length === 0 ? null : toJobRow(result.rows[0]);
  }

  async getJobById(jobId: string): Promise<JobRow | null> {
    const result = await this.pool.query('SELECT * FROM report_jobs WHERE id = $1', [jobId]);
    return result.rows.length === 0 ? null : toJobRow(result.rows[0]);
  }

  /**
   * Conditional stage commit. When expectedLeaseToken is given the row is
   * only touched if the caller still holds the current lease — a worker
   * with an expired lease can never overwrite its successor.
   */
  async updateStage(
    jobId: string,
    stage: JobStage,
    patch: {
      completedChapters?: number;
      totalChapters?: number;
      documentAvailable?: boolean;
      documentJson?: string | null;
      artifactPath?: string | null;
      errorCode?: string | null;
      retryable?: boolean;
    } = {},
    expectedLeaseToken?: string
  ): Promise<boolean> {
    const sets: string[] = ['stage = $2', 'updated_at = now()'];
    const params: unknown[] = [jobId, stage];
    const push = (column: string, value: unknown) => {
      params.push(value);
      sets.push(`${column} = $${params.length}`);
    };
    if (patch.completedChapters !== undefined) push('completed_chapters', patch.completedChapters);
    if (patch.totalChapters !== undefined) push('total_chapters', patch.totalChapters);
    if (patch.documentAvailable !== undefined) push('document_available', patch.documentAvailable);
    if (patch.documentJson !== undefined) push('document_json', patch.documentJson);
    if (patch.artifactPath !== undefined) push('artifact_path', patch.artifactPath);
    if (patch.errorCode !== undefined) push('error_code', patch.errorCode);
    if (patch.retryable !== undefined) push('retryable', patch.retryable);
    let where = 'WHERE id = $1';
    if (expectedLeaseToken !== undefined) {
      params.push(expectedLeaseToken);
      where += ` AND lease_token = $${params.length}`;
    }
    const result = await this.pool.query(`UPDATE report_jobs SET ${sets.join(', ')} ${where}`, params);
    return result.rowCount > 0;
  }

  /** Claim a specific job when it is queued and its lease is free/expired. */
  async claimJob(jobId: string, workerId: string, leaseSeconds: number): Promise<boolean> {
    const leaseToken = randomUUID();
    const expiresAt = new Date(Date.now() + leaseSeconds * 1000);
    const result = await this.pool.query(
      `UPDATE report_jobs
       SET worker_id = $2, lease_token = $3, lease_expires_at = $4,
           attempt_count = attempt_count + 1, updated_at = now()
       WHERE id = $1 AND stage = 'queued'
         AND (lease_expires_at IS NULL OR lease_expires_at < now())`,
      [jobId, workerId, leaseToken, expiresAt]
    );
    if (result.rowCount > 0) return true;
    throw new ApiError(409, ErrorCodes.LEASE_HELD, 'Job is not claimable (active lease or not queued)');
  }

  /** Oldest queued job whose lease is free/expired; null when idle. */
  async claimNextJob(workerId: string, leaseSeconds: number): Promise<JobRow | null> {
    const candidates = await this.pool.query(
      `SELECT id FROM report_jobs
       WHERE stage = 'queued' AND (lease_expires_at IS NULL OR lease_expires_at < now())
       ORDER BY created_at ASC LIMIT 5`
    );
    for (const candidate of candidates.rows) {
      const jobId = String(candidate.id);
      try {
        await this.claimJob(jobId, workerId, leaseSeconds);
      } catch {
        continue;
      }
      return this.getJobById(jobId);
    }
    return null;
  }

  async heartbeat(jobId: string, leaseToken: string, leaseSeconds: number): Promise<boolean> {
    const result = await this.pool.query(
      `UPDATE report_jobs
       SET lease_expires_at = $3, updated_at = now()
       WHERE id = $1 AND lease_token = $2`,
      [jobId, leaseToken, new Date(Date.now() + leaseSeconds * 1000)]
    );
    return result.rowCount > 0;
  }

  async saveChapter(
    jobId: string,
    chapterId: string,
    draftJson: string,
    approved: boolean,
    position: number
  ): Promise<void> {
    await this.pool.query(
      `INSERT INTO report_chapters (job_id, chapter_id, position, draft_json, approved, attempts)
       VALUES ($1, $2, $3, $4, $5, 1)
       ON CONFLICT (job_id, chapter_id)
       DO UPDATE SET draft_json = EXCLUDED.draft_json, approved = EXCLUDED.approved,
                     position = EXCLUDED.position, attempts = report_chapters.attempts + 1,
                     updated_at = now()`,
      [jobId, chapterId, position, draftJson, approved]
    );
  }

  async getApprovedChapters(jobId: string): Promise<ChapterRow[]> {
    const result = await this.pool.query(
      'SELECT * FROM report_chapters WHERE job_id = $1 AND approved = TRUE ORDER BY position ASC',
      [jobId]
    );
    return result.rows.map((row) => ({
      jobId: String(row.job_id),
      chapterId: String(row.chapter_id),
      position: Number(row.position ?? 0),
      draftJson: String(row.draft_json),
      approved: Boolean(row.approved),
      attempts: Number(row.attempts ?? 0),
    }));
  }

  async retryJob(ownerId: string, jobId: string): Promise<JobSnapshot> {
    const row = await this.getJob(ownerId, jobId);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return this.retryRow(row);
  }

  async retryJobById(jobId: string): Promise<JobSnapshot> {
    const row = await this.getJobById(jobId);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return this.retryRow(row);
  }

  private async retryRow(row: JobRow): Promise<JobSnapshot> {
    if (row.stage !== 'failed' || !row.retryable) {
      throw new ApiError(409, ErrorCodes.NOT_RETRYABLE, 'Only failed retryable jobs can be retried');
    }
    // Approved chapters are kept; the worker reuses them instead of
    // reprocessing (and re-billing) completed work.
    const result = await this.pool.query(
      `UPDATE report_jobs
       SET stage = 'queued', error_code = NULL, worker_id = NULL,
           lease_token = NULL, lease_expires_at = NULL, updated_at = now()
       WHERE id = $1`,
      [row.jobId]
    );
    if (result.rowCount === 0) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    const updated = await this.getJobById(row.jobId);
    if (!updated) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return toSnapshot(updated);
  }

  async cancelJob(ownerId: string, jobId: string): Promise<JobSnapshot> {
    const row = await this.getJob(ownerId, jobId);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return this.cancelRow(row);
  }

  async cancelJobById(jobId: string): Promise<JobSnapshot> {
    const row = await this.getJobById(jobId);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return this.cancelRow(row);
  }

  private async cancelRow(row: JobRow): Promise<JobSnapshot> {
    if (row.stage === 'ready') {
      throw new ApiError(409, ErrorCodes.NOT_RETRYABLE, 'Completed jobs cannot be cancelled');
    }
    await this.pool.query(
      `UPDATE report_jobs
       SET stage = 'cancelled', worker_id = NULL, lease_token = NULL,
           lease_expires_at = NULL, updated_at = now()
       WHERE id = $1`,
      [row.jobId]
    );
    await this.releaseReservationsForJob(row.jobId);
    const updated = await this.getJobById(row.jobId);
    if (!updated) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return toSnapshot(updated);
  }

  async deleteJob(ownerId: string, jobId: string): Promise<{ deleted: boolean; artifactPath: string | null }> {
    const row = await this.getJob(ownerId, jobId);
    if (!row) return { deleted: false, artifactPath: null };
    await this.pool.query('DELETE FROM report_jobs WHERE id = $1', [jobId]);
    return { deleted: true, artifactPath: row.artifactPath };
  }

  async grantEntitlement(ownerId: string, reportType: string, mode: string): Promise<void> {
    await this.pool.query(
      `INSERT INTO report_entitlements (owner_id, report_type, mode)
       VALUES ($1, $2, $3) ON CONFLICT DO NOTHING`,
      [ownerId, reportType, mode]
    );
  }

  async hasEntitlement(ownerId: string, reportType: string, mode: string): Promise<boolean> {
    const result = await this.pool.query(
      'SELECT 1 FROM report_entitlements WHERE owner_id = $1 AND report_type = $2 AND mode = $3',
      [ownerId, reportType, mode]
    );
    return result.rows.length > 0;
  }

  async reserve(jobId: string, ownerId: string, amountUsd: number): Promise<void> {
    await this.pool.query(
      "INSERT INTO report_reservations (id, job_id, owner_id, amount_usd, status) VALUES ($1, $2, $3, $4, 'reserved')",
      [randomUUID(), jobId, ownerId, amountUsd]
    );
  }

  async sumReserved(): Promise<number> {
    const result = await this.pool.query(
      "SELECT COALESCE(SUM(amount_usd), 0) AS total FROM report_reservations WHERE status = 'reserved'"
    );
    return Number(result.rows[0]?.total ?? 0);
  }

  async sumReservedByOwner(ownerId: string): Promise<number> {
    const result = await this.pool.query(
      "SELECT COALESCE(SUM(amount_usd), 0) AS total FROM report_reservations WHERE status = 'reserved' AND owner_id = $1",
      [ownerId]
    );
    return Number(result.rows[0]?.total ?? 0);
  }

  async releaseReservationsForJob(jobId: string): Promise<void> {
    await this.pool.query(
      "UPDATE report_reservations SET status = 'released' WHERE job_id = $1 AND status = 'reserved'",
      [jobId]
    );
  }

  async countJobsByOwnerMode(ownerId: string, mode: string): Promise<number> {
    const result = await this.pool.query(
      'SELECT COUNT(*)::int AS n FROM report_jobs WHERE owner_id = $1 AND mode = $2',
      [ownerId, mode]
    );
    return Number(result.rows[0]?.n ?? 0);
  }
}
