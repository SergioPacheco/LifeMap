// ============================================================
// ROUTES.TS — Private report API (Node http, no framework)
//
// Jobs never depend on a long-lived HTTP request: POST returns 202
// immediately and the worker progresses stages independently; clients
// poll GET /v1/reports/:jobId. Owner scoping on every lookup means a
// foreign owner sees 404, never a hint that the job exists.
// ============================================================

import type { IncomingMessage, ServerResponse } from 'node:http';
import type { ServiceConfig } from '../shared/config.js';
import { type JobSnapshot, type JobStore, toSnapshot } from '../shared/db.js';
import { ApiError, ErrorCodes } from '../shared/errors.js';
import type { ArtifactStorage } from '../shared/storage.js';
import { authenticate } from './auth.js';
import { authorizeConsumption } from './entitlements.js';
import { estimateReportCostUsd, reserveBudget } from './budget.js';
import { parseReportRequest, requireIdempotencyKey } from './validation.js';

export interface ApiDeps {
  store: JobStore;
  config: ServiceConfig;
  storage: ArtifactStorage;
}

type Handler = (req: IncomingMessage, res: ServerResponse, params: string[]) => Promise<void>;

export function createApiHandler(deps: ApiDeps): (req: IncomingMessage, res: ServerResponse) => Promise<void> {
  const { store, config, storage } = deps;
  const rate = new Map<string, { count: number; resetMs: number }>();

  const checkRateLimit = (req: IncomingMessage): void => {
    const forwarded = req.headers['x-forwarded-for'];
    const first = Array.isArray(forwarded) ? forwarded[0] : forwarded?.split(',')[0];
    const ip = (first ?? req.socket.remoteAddress ?? 'unknown').trim();
    const now = Date.now();
    const entry = rate.get(ip);
    if (!entry || entry.resetMs <= now) {
      rate.set(ip, { count: 1, resetMs: now + config.rateLimitWindowMs });
      if (rate.size > 10000) {
        for (const [key, value] of rate) {
          if (value.resetMs <= now) rate.delete(key);
        }
      }
      return;
    }
    entry.count += 1;
    if (entry.count > config.rateLimitMax) {
      throw new ApiError(429, ErrorCodes.RATE_LIMITED, 'Rate limit exceeded');
    }
  };

  const applyCors = (req: IncomingMessage, res: ServerResponse): boolean => {
    const origin = req.headers.origin;
    if (typeof origin === 'string' && config.allowedOrigins.includes(origin)) {
      res.setHeader('access-control-allow-origin', origin);
      res.setHeader('vary', 'origin');
    }
    if (req.method === 'OPTIONS') {
      if (typeof origin === 'string' && config.allowedOrigins.includes(origin)) {
        res.setHeader('access-control-allow-methods', 'GET, POST, DELETE, OPTIONS');
        res.setHeader('access-control-allow-headers', 'authorization, content-type, idempotency-key');
        res.setHeader('access-control-max-age', '600');
      }
      res.writeHead(204).end();
      return true;
    }
    return false;
  };

  const routes: Array<{ method: string; pattern: RegExp; handler: Handler }> = [
    { method: 'POST', pattern: /^\/v1\/sessions\/guest$/, handler: postGuest },
    { method: 'POST', pattern: /^\/v1\/reports$/, handler: postReport },
    { method: 'GET', pattern: /^\/v1\/reports\/([^/]+)$/, handler: getReport },
    { method: 'GET', pattern: /^\/v1\/reports\/([^/]+)\/document$/, handler: getDocument },
    { method: 'GET', pattern: /^\/v1\/reports\/([^/]+)\/pdf$/, handler: getPdf },
    { method: 'POST', pattern: /^\/v1\/reports\/([^/]+)\/retry$/, handler: postRetry },
    { method: 'POST', pattern: /^\/v1\/reports\/([^/]+)\/cancel$/, handler: postCancel },
    { method: 'DELETE', pattern: /^\/v1\/reports\/([^/]+)$/, handler: deleteReport },
    { method: 'GET', pattern: /^\/v1\/forecasts\/public$/, handler: getPublicForecasts },
  ];

  return async (req, res) => {
    try {
      if (applyCors(req, res)) return;
      checkRateLimit(req);
      const url = new URL(req.url ?? '/', 'http://local');
      const pathname = url.pathname.replace(/\/+$/, '') || '/';
      for (const route of routes) {
        if (req.method === route.method) {
          const match = route.pattern.exec(pathname);
          if (match) {
            await route.handler(req, res, match.slice(1));
            return;
          }
        }
      }
      sendJson(res, 404, { code: ErrorCodes.NOT_FOUND, message: 'Unknown route' });
    } catch (error) {
      if (error instanceof ApiError) {
        sendJson(res, error.status, { code: error.code, message: error.message });
        return;
      }
      console.error('[report-api] unhandled', error);
      sendJson(res, 500, { code: 'INTERNAL', message: 'Internal error' });
    }
  };

  async function postGuest(_req: IncomingMessage, res: ServerResponse): Promise<void> {
    const session = await store.createSession();
    sendJson(res, 201, session);
  }

  async function postReport(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    const key = requireIdempotencyKey(req.headers);
    const body = await readBody(req, config.bodyLimitBytes);
    const request = parseReportRequest(JSON.parse(body.toString('utf8')));
    await authorizeConsumption(store, config, ownerId, request);
    const estimateUsd = estimateReportCostUsd(request, config);
    const { snapshot, created } = await store.createReportJob(ownerId, request, key, 0, estimateUsd);
    if (!created) {
      sendJson(res, 202, snapshot);
      return;
    }
    try {
      await reserveBudget(store, config, snapshot.jobId, ownerId, estimateUsd);
    } catch (error) {
      // Denied requests must not leave a job row (nor quota debris) behind.
      await store.deleteJob(ownerId, snapshot.jobId);
      throw error;
    }
    sendJson(res, 202, snapshot);
  }

  async function getReport(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    const snapshot = await ownedSnapshot(ownerId, params[0]);
    sendJson(res, 200, snapshot);
  }

  async function getDocument(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    const row = await store.getJob(ownerId, params[0]);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    if (!row.documentAvailable || !row.documentJson) {
      throw new ApiError(404, ErrorCodes.DOCUMENT_NOT_READY, 'Approved document not available yet');
    }
    sendJson(res, 200, JSON.parse(row.documentJson));
  }

  async function getPdf(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    const row = await store.getJob(ownerId, params[0]);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    if (row.stage !== 'ready' || !row.artifactPath) {
      throw new ApiError(404, ErrorCodes.PDF_NOT_READY, 'PDF artifact not ready yet');
    }
    const bytes = await storage.get(row.artifactPath);
    if (!bytes) {
      // The job claims ready but its bytes are gone (lost volume, manual
      // deletion): a server-side inconsistency, not a pending render.
      if (row.stage === 'ready') {
        throw new ApiError(500, ErrorCodes.ARTIFACT_MISSING, 'PDF artifact missing for a ready job');
      }
      throw new ApiError(404, ErrorCodes.PDF_NOT_READY, 'PDF artifact not ready yet');
    }
    res.writeHead(200, {
      'content-type': 'application/pdf',
      'content-length': bytes.length,
      'cache-control': 'private, max-age=3600',
    });
    res.end(bytes);
  }

  async function postRetry(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    await readBody(req, config.bodyLimitBytes).catch(() => Buffer.alloc(0));
    const snapshot = await store.retryJob(ownerId, params[0]);
    sendJson(res, 202, snapshot);
  }

  async function postCancel(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    await readBody(req, config.bodyLimitBytes).catch(() => Buffer.alloc(0));
    const snapshot = await store.cancelJob(ownerId, params[0]);
    sendJson(res, 200, snapshot);
  }

  async function deleteReport(req: IncomingMessage, res: ServerResponse, params: string[]): Promise<void> {
    const ownerId = await authenticate(store, req.headers.authorization);
    const { deleted, artifactPath } = await store.deleteJob(ownerId, params[0]);
    if (!deleted) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    if (artifactPath) await storage.delete(artifactPath);
    sendJson(res, 200, { deleted: true });
  }

  async function getPublicForecasts(req: IncomingMessage, res: ServerResponse): Promise<void> {
    await authenticate(store, req.headers.authorization);
    // Scheduled public forecasts land in task 7; until then the shelf is
    // honestly empty instead of triggering paid generation per visitor.
    sendJson(res, 200, { forecasts: [] });
  }

  async function ownedSnapshot(ownerId: string, jobId: string): Promise<JobSnapshot> {
    const row = await store.getJob(ownerId, jobId);
    if (!row) throw new ApiError(404, ErrorCodes.NOT_FOUND, 'Job not found');
    return toSnapshot(row);
  }
}

function sendJson(res: ServerResponse, status: number, payload: unknown): void {
  const body = Buffer.from(JSON.stringify(payload), 'utf8');
  res.writeHead(status, { 'content-type': 'application/json', 'content-length': body.length });
  res.end(body);
}

async function readBody(req: IncomingMessage, limitBytes: number): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buffer.length;
    if (size > limitBytes) {
      req.destroy();
      throw new ApiError(413, ErrorCodes.PAYLOAD_TOO_LARGE, 'Request body too large');
    }
    chunks.push(buffer);
  }
  return Buffer.concat(chunks);
}
