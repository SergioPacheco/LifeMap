import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createFakePipeline } from '../../services/report-worker/pipeline';
import { processReportJob } from '../../services/report-worker/jobs';
import { authHeaders, createGuest, startTestApi, type TestApi } from './helpers';
import { reportSubjects } from '../fixtures/reports/profiles';

let api: TestApi;

beforeEach(async () => {
  api = await startTestApi();
});

afterEach(async () => {
  await api.close();
});

const natalSample = {
  reportType: 'natal',
  subjects: [reportSubjects[0]],
  locale: 'pt',
  mode: 'sample',
  houseSystem: 'placidus',
};

async function postReport(token: string, body: unknown, key: string): Promise<Response> {
  return fetch(`${api.baseUrl}/v1/reports`, {
    method: 'POST',
    headers: authHeaders(token, { 'Idempotency-Key': key }),
    body: JSON.stringify(body),
  });
}

describe('report api', () => {
  it('creates guest sessions and rejects unknown tokens', async () => {
    const { token } = await createGuest(api);
    const denied = await fetch(`${api.baseUrl}/v1/reports/anything`);
    expect(denied.status).toBe(401);
    const unknown = await fetch(`${api.baseUrl}/v1/reports/anything`, {
      headers: { Authorization: 'Bearer invalid-token' },
    });
    expect(unknown.status).toBe(401);
    const mine = await postReport(token, natalSample, 'k-session');
    expect(mine.status).toBe(202);
  });

  it('is idempotent per key and conflicts on payload change', async () => {
    const { token } = await createGuest(api);
    const first = await (await postReport(token, natalSample, 'k-idem')).json();
    const replay = await (await postReport(token, natalSample, 'k-idem')).json();
    expect(replay.jobId).toBe(first.jobId);
    const altered = await postReport(token, { ...natalSample, locale: 'en' }, 'k-idem');
    expect(altered.status).toBe(409);
    const count = await api.pool.query('SELECT COUNT(*)::int AS n FROM report_jobs');
    expect(count.rows[0].n).toBe(1);
  });

  it('hides job existence from other owners', async () => {
    const first = await createGuest(api);
    const second = await createGuest(api);
    const created = await (await postReport(first.token, natalSample, 'k-private')).json();
    expect(await (await fetch(`${api.baseUrl}/v1/reports/${created.jobId}`)).status).toBe(401);
    const foreign = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}`, {
      headers: { Authorization: `Bearer ${second.token}` },
    });
    expect(foreign.status).toBe(404);
    const missing = await fetch(`${api.baseUrl}/v1/reports/00000000-0000-0000-0000-000000000000`, {
      headers: { Authorization: `Bearer ${first.token}` },
    });
    expect(missing.status).toBe(404);
  });

  it('requires entitlement for complete reports', async () => {
    const { ownerId, token } = await createGuest(api);
    const annual = {
      ...natalSample,
      reportType: 'annual',
      mode: 'complete',
      period: {
        start: '2026-06-01T00:00:00Z',
        end: '2026-07-01T00:00:00Z',
        timeZoneId: 'Etc/UTC',
        basis: 'custom',
      },
    };
    const denied = await postReport(token, annual, 'k-ent');
    expect(denied.status).toBe(403);
    expect((await denied.json()).code).toBe('NO_ENTITLEMENT');
    await api.store.grantEntitlement(ownerId, 'annual', 'complete');
    const allowed = await postReport(token, annual, 'k-ent');
    expect(allowed.status).toBe(202);
  });

  it('rejects invalid requests and missing idempotency keys', async () => {
    const { token } = await createGuest(api);
    const badLocale = await postReport(token, { ...natalSample, locale: 'xx' }, 'k-bad');
    expect(badLocale.status).toBe(400);
    const singlePartner = await postReport(
      token,
      { ...natalSample, reportType: 'relationship', mode: 'complete' },
      'k-bad2'
    );
    expect(singlePartner.status).toBe(400);
    const noKey = await fetch(`${api.baseUrl}/v1/reports`, {
      method: 'POST',
      headers: authHeaders(token),
      body: JSON.stringify(natalSample),
    });
    expect(noKey.status).toBe(400);
  });

  it('denies over-budget jobs without reserving cost', async () => {
    await api.close();
    api = await startTestApi({ reportMaxCostUsd: 0.01 });
    const { ownerId, token } = await createGuest(api);
    await api.store.grantEntitlement(ownerId, 'annual', 'complete');
    const before = await api.pool.query(
      "SELECT COUNT(*)::int AS n FROM report_reservations WHERE status = 'reserved'"
    );
    const annual = {
      ...natalSample,
      reportType: 'annual',
      mode: 'complete',
      period: {
        start: '2026-06-01T00:00:00Z',
        end: '2026-07-01T00:00:00Z',
        timeZoneId: 'Etc/UTC',
        basis: 'custom',
      },
    };
    const denied = await postReport(token, annual, 'k-budget');
    expect(denied.status).toBe(402);
    expect((await denied.json()).code).toBe('BUDGET_EXCEEDED');
    const after = await api.pool.query(
      "SELECT COUNT(*)::int AS n FROM report_reservations WHERE status = 'reserved'"
    );
    expect(after.rows[0].n).toBe(before.rows[0].n);
  });

  it('serves document and pdf only after approval', async () => {
    const { token } = await createGuest(api);
    const created = await (await postReport(token, natalSample, 'k-docs')).json();
    const headers = { Authorization: `Bearer ${token}` };
    expect(await (await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/document`, { headers })).status).toBe(404);
    expect(await (await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/pdf`, { headers })).status).toBe(404);

    await processReportJob(
      created.jobId,
      createFakePipeline(),
      { store: api.store, storage: api.storage, config: api.config },
      'worker-docs'
    );
    const document = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/document`, { headers });
    expect(document.status).toBe(200);
    const body = await document.json();
    expect(body.reportType).toBe('natal');
    expect(body.chapters.length).toBeGreaterThan(0);
    const pdf = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/pdf`, { headers });
    expect(pdf.status).toBe(200);
    expect(pdf.headers.get('content-type')).toContain('application/pdf');
    expect((await pdf.arrayBuffer()).byteLength).toBeGreaterThan(0);
  });

  it('reports a server error when a ready job lost its artifact', async () => {
    const { token } = await createGuest(api);
    const created = await (await postReport(token, natalSample, 'k-lost')).json();
    await api.pool.query(
      "UPDATE report_jobs SET stage = 'ready', document_available = TRUE, artifact_path = 'no-such-file.pdf' WHERE id = $1",
      [created.jobId]
    );
    const pdf = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(pdf.status).toBe(500);
    expect((await pdf.json()).code).toBe('ARTIFACT_MISSING');
  });

  it('retries failed jobs without reprocessing payment steps and cancels cleanly', async () => {
    const { token } = await createGuest(api);
    const created = await (await postReport(token, natalSample, 'k-retry')).json();
    const headers = { Authorization: `Bearer ${token}` };
    const early = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/retry`, { method: 'POST', headers });
    expect(early.status).toBe(409);
    await api.pool.query("UPDATE report_jobs SET stage = 'failed', error_code = 'WRITE_FAILED', retryable = TRUE WHERE id = $1", [
      created.jobId,
    ]);
    const retry = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/retry`, { method: 'POST', headers });
    expect(retry.status).toBe(202);
    expect((await retry.json()).stage).toBe('queued');
    const cancel = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}/cancel`, { method: 'POST', headers });
    expect(cancel.status).toBe(200);
    expect((await cancel.json()).stage).toBe('cancelled');
    const del = await fetch(`${api.baseUrl}/v1/reports/${created.jobId}`, { method: 'DELETE', headers });
    expect(del.status).toBe(200);
    expect(await (await fetch(`${api.baseUrl}/v1/reports/${created.jobId}`, { headers })).status).toBe(404);
  });

  it('rate-limits abusive callers without blocking normal use', async () => {
    await api.close();
    api = await startTestApi({ rateLimitMax: 2, rateLimitWindowMs: 60000 });
    const response = await fetch(`${api.baseUrl}/v1/sessions/guest`, { method: 'POST' });
    expect(response.status).toBe(201);
    await fetch(`${api.baseUrl}/v1/sessions/guest`, { method: 'POST' });
    const limited = await fetch(`${api.baseUrl}/v1/sessions/guest`, { method: 'POST' });
    expect(limited.status).toBe(429);
  });

  it('reflects only allowed CORS origins', async () => {
    await api.close();
    api = await startTestApi({ allowedOrigins: ['https://lifemap.example'] });
    const allowed = await fetch(`${api.baseUrl}/v1/sessions/guest`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://lifemap.example' },
    });
    expect(allowed.headers.get('access-control-allow-origin')).toBe('https://lifemap.example');
    const denied = await fetch(`${api.baseUrl}/v1/sessions/guest`, {
      method: 'OPTIONS',
      headers: { Origin: 'https://evil.example' },
    });
    expect(denied.headers.get('access-control-allow-origin')).toBeNull();
  });
});
