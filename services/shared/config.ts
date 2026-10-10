// ============================================================
// CONFIG.TS — Server-only service configuration
//
// Everything financial or secret lives here (never in the frontend,
// which only knows PUBLIC_REPORT_API_URL). testConfig() gives each
// test an isolated, low-ceiling configuration.
// ============================================================

export interface ServiceConfig {
  port: number;
  databaseUrl: string;
  storageBackend: 'local';
  storageDir: string;
  /** Project-wide ceiling for reserved (not yet spent) USD. */
  reportMaxCostUsd: number;
  /** Pricing placeholder for estimates (real price table: task 4). */
  usdPer1kTokens: number;
  /** Per-owner ceiling for reserved USD. */
  ownerQuotaUsd: number;
  /** Max sample-mode jobs ever created per owner. */
  sampleQuotaPerOwner: number;
  /** Pilot allowlist: owner IDs that may consume without entitlement rows. */
  pilotOwnerIds: string[];
  leaseSeconds: number;
  bodyLimitBytes: number;
  rateLimitWindowMs: number;
  rateLimitMax: number;
  allowedOrigins: string[];
  workerPollMs: number;
}

function numberFrom(value: string | undefined, fallback: number): number {
  const parsed = value === undefined ? Number.NaN : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function listFrom(value: string | undefined): string[] {
  return (value ?? '').split(',').map((item) => item.trim()).filter(Boolean);
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): ServiceConfig {
  return {
    port: numberFrom(env.PORT, 4100),
    databaseUrl: env.DATABASE_URL ?? '',
    storageBackend: 'local',
    storageDir: env.ARTIFACT_DIR ?? './var/artifacts',
    reportMaxCostUsd: numberFrom(env.REPORT_MAX_COST_USD, 25),
    usdPer1kTokens: numberFrom(env.REPORT_USD_PER_1K_TOKENS, 0.01),
    ownerQuotaUsd: numberFrom(env.REPORT_OWNER_QUOTA_USD, 10),
    sampleQuotaPerOwner: numberFrom(env.REPORT_SAMPLE_QUOTA, 5),
    pilotOwnerIds: listFrom(env.REPORT_PILOT_OWNERS),
    leaseSeconds: numberFrom(env.REPORT_LEASE_SECONDS, 60),
    bodyLimitBytes: numberFrom(env.REPORT_BODY_LIMIT_BYTES, 262144),
    rateLimitWindowMs: numberFrom(env.REPORT_RATE_WINDOW_MS, 60000),
    rateLimitMax: numberFrom(env.REPORT_RATE_MAX, 120),
    allowedOrigins: listFrom(env.REPORT_ALLOWED_ORIGINS),
    workerPollMs: numberFrom(env.REPORT_WORKER_POLL_MS, 2000),
  };
}

export function testConfig(overrides?: Partial<ServiceConfig>): ServiceConfig {
  return {
    port: 0,
    databaseUrl: 'pg-mem',
    storageBackend: 'local',
    storageDir: './var/test-artifacts',
    reportMaxCostUsd: 100,
    usdPer1kTokens: 0.01,
    ownerQuotaUsd: 50,
    sampleQuotaPerOwner: 10,
    pilotOwnerIds: [],
    leaseSeconds: 60,
    bodyLimitBytes: 262144,
    rateLimitWindowMs: 60000,
    rateLimitMax: 1000,
    allowedOrigins: [],
    workerPollMs: 50,
    ...overrides,
  };
}
