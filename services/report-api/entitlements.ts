// ============================================================
// ENTITLEMENTS.TS — Who may spend on what
//
// A guest session identifies the owner but never authorizes spend by
// itself. Complete reports require a server-side entitlement (pilot
// allowlist or a verified grant — real checkout/webhook in task 6).
// Sample reports are quota-capped per owner. The payment mock never
// authorizes real spend.
// ============================================================

import type { ReportRequest } from '../../src/reports/core/types.js';
import type { ServiceConfig } from '../shared/config.js';
import type { JobStore } from '../shared/db.js';
import { ApiError, ErrorCodes } from '../shared/errors.js';

export async function authorizeConsumption(
  store: JobStore,
  config: ServiceConfig,
  ownerId: string,
  request: ReportRequest
): Promise<void> {
  if (request.mode === 'complete') {
    if (config.pilotOwnerIds.includes(ownerId)) return;
    const entitled = await store.hasEntitlement(ownerId, request.reportType, 'complete');
    if (!entitled) {
      throw new ApiError(403, ErrorCodes.NO_ENTITLEMENT, 'Complete reports require a server-side entitlement');
    }
    return;
  }
  const used = await store.countJobsByOwnerMode(ownerId, 'sample');
  if (used >= config.sampleQuotaPerOwner) {
    throw new ApiError(429, ErrorCodes.SAMPLE_QUOTA_EXHAUSTED, 'Personal sample quota exhausted');
  }
}
