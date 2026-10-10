-- 001-reports.sql — Report service tables (PostgreSQL).
-- Payloads are TEXT (JSON serialized by the app) so unit tests on pg-mem
-- and production Postgres execute byte-identical SQL. No exotic features:
-- plain keys, conditional UPDATEs (atomic claim/lease), no advisory locks.

CREATE TABLE IF NOT EXISTS report_sessions (
  owner_id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS report_jobs (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL REFERENCES report_sessions(owner_id) ON DELETE CASCADE,
  idempotency_key TEXT NOT NULL,
  request_hash TEXT NOT NULL,
  request_json TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'sample',
  stage TEXT NOT NULL DEFAULT 'queued',
  total_chapters INTEGER NOT NULL DEFAULT 0,
  completed_chapters INTEGER NOT NULL DEFAULT 0,
  document_available BOOLEAN NOT NULL DEFAULT FALSE,
  document_json TEXT,
  artifact_path TEXT,
  error_code TEXT,
  retryable BOOLEAN NOT NULL DEFAULT FALSE,
  worker_id TEXT,
  lease_token TEXT,
  lease_expires_at TIMESTAMPTZ,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (owner_id, idempotency_key)
);

CREATE TABLE IF NOT EXISTS report_chapters (
  job_id TEXT NOT NULL REFERENCES report_jobs(id) ON DELETE CASCADE,
  chapter_id TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  draft_json TEXT NOT NULL,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  attempts INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (job_id, chapter_id)
);

CREATE TABLE IF NOT EXISTS report_entitlements (
  owner_id TEXT NOT NULL REFERENCES report_sessions(owner_id) ON DELETE CASCADE,
  report_type TEXT NOT NULL,
  mode TEXT NOT NULL DEFAULT 'complete',
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (owner_id, report_type, mode)
);

CREATE TABLE IF NOT EXISTS report_reservations (
  id TEXT PRIMARY KEY,
  job_id TEXT NOT NULL REFERENCES report_jobs(id) ON DELETE CASCADE,
  owner_id TEXT NOT NULL,
  amount_usd DOUBLE PRECISION NOT NULL,
  status TEXT NOT NULL DEFAULT 'reserved',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
