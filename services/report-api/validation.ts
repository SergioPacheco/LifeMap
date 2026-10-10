// ============================================================
// VALIDATION.TS — Inbound request validation (server-side, always)
//
// The frontend may send anything; every report request is re-validated
// here with the shared Zod contracts before any work or spend happens.
// ============================================================

import type { ReportRequest } from '../../src/reports/core/types.js';
import { validateReportRequest } from '../../src/reports/core/schemas.js';
import { ApiError, ErrorCodes } from '../shared/errors.js';

export function requireIdempotencyKey(headers: Record<string, string | string[] | undefined>): string {
  const raw = headers['idempotency-key'];
  const key = Array.isArray(raw) ? raw[0] : raw;
  if (!key || !/^[A-Za-z0-9._-]{1,64}$/.test(key)) {
    throw new ApiError(400, ErrorCodes.MISSING_IDEMPOTENCY_KEY, 'Valid Idempotency-Key header required');
  }
  return key;
}

export function parseReportRequest(body: unknown): ReportRequest {
  try {
    return validateReportRequest(body);
  } catch (error) {
    const detail = error instanceof Error ? error.message.slice(0, 300) : 'invalid';
    throw new ApiError(400, ErrorCodes.INVALID_REQUEST, `Invalid report request: ${detail}`);
  }
}
