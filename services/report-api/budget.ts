// ============================================================
// BUDGET.TS — Cost estimates and reservations
//
// Estimates derive from editorial word-count policies and a configured
// USD/1k-tokens placeholder (real provider price table: task 4).
// Reservations are checked against the project ceiling and the owner
// quota BEFORE the job is accepted; denied requests reserve nothing.
// NOTE: check-then-insert races under concurrent acceptors — acceptable
// for the single-process pilot, must move to SERIALIZABLE before scale.
// ============================================================

import type { ReportRequest } from '../../src/reports/core/types.js';
import { getReportPolicy } from '../../src/reports/core/policies.js';
import type { ServiceConfig } from '../shared/config.js';
import type { JobStore } from '../shared/db.js';
import { ApiError, ErrorCodes } from '../shared/errors.js';

const TOKENS_PER_WORD = 2; // input + output with margin
const REVIEW_MARGIN = 1.2; // review pass + one editorial retry

export function estimateReportCostUsd(request: ReportRequest, config: ServiceConfig): number {
  const policy = getReportPolicy(
    request.reportType,
    request.locale,
    request.mode,
    request.forecastGranularity
  );
  const tokens = policy.totalMaxWords * TOKENS_PER_WORD * REVIEW_MARGIN;
  return Math.ceil((tokens / 1000) * config.usdPer1kTokens * 1e6) / 1e6;
}

export async function reserveBudget(
  store: JobStore,
  config: ServiceConfig,
  jobId: string,
  ownerId: string,
  estimateUsd: number
): Promise<void> {
  if (!Number.isFinite(estimateUsd) || estimateUsd < 0) {
    throw new ApiError(400, ErrorCodes.INVALID_REQUEST, 'Invalid cost estimate');
  }
  const projectReserved = await store.sumReserved();
  if (projectReserved + estimateUsd > config.reportMaxCostUsd) {
    throw new ApiError(402, ErrorCodes.BUDGET_EXCEEDED, 'Project cost ceiling exceeded');
  }
  const ownerReserved = await store.sumReservedByOwner(ownerId);
  if (ownerReserved + estimateUsd > config.ownerQuotaUsd) {
    throw new ApiError(402, ErrorCodes.QUOTA_EXCEEDED, 'Owner cost quota exceeded');
  }
  await store.reserve(jobId, ownerId, estimateUsd);
}
