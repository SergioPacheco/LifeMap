// ============================================================
// ERRORS.TS — Machine-readable API error codes
// ============================================================

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message?: string) {
    super(message ?? code);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

export const ErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_REQUEST: 'INVALID_REQUEST',
  MISSING_IDEMPOTENCY_KEY: 'MISSING_IDEMPOTENCY_KEY',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  NOT_FOUND: 'NOT_FOUND',
  NO_ENTITLEMENT: 'NO_ENTITLEMENT',
  SAMPLE_QUOTA_EXHAUSTED: 'SAMPLE_QUOTA_EXHAUSTED',
  BUDGET_EXCEEDED: 'BUDGET_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  DOCUMENT_NOT_READY: 'DOCUMENT_NOT_READY',
  PDF_NOT_READY: 'PDF_NOT_READY',
  ARTIFACT_MISSING: 'ARTIFACT_MISSING',
  NOT_RETRYABLE: 'NOT_RETRYABLE',
  RATE_LIMITED: 'RATE_LIMITED',
  PAYLOAD_TOO_LARGE: 'PAYLOAD_TOO_LARGE',
  LEASE_HELD: 'LEASE_HELD',
  STALE_LEASE: 'STALE_LEASE',
  ECLIPSE_COVERAGE_GAP: 'ECLIPSE_COVERAGE_GAP',
  PERIOD_REQUIRED: 'PERIOD_REQUIRED',
  CALCULATE_FAILED: 'CALCULATE_FAILED',
  PLAN_FAILED: 'PLAN_FAILED',
  WRITE_FAILED: 'WRITE_FAILED',
  REVIEW_FAILED: 'REVIEW_FAILED',
  RENDER_FAILED: 'RENDER_FAILED',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
