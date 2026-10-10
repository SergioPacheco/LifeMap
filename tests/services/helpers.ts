import { createServer, type Server } from 'node:http';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { newDb } from 'pg-mem';
import { JobStore, runMigrations, type PoolLike } from '../../services/shared/db';
import { testConfig, type ServiceConfig } from '../../services/shared/config';
import { LocalArtifactStorage } from '../../services/shared/storage';
import { createApiHandler } from '../../services/report-api/routes';

export interface TestApi {
  baseUrl: string;
  pool: PoolLike;
  store: JobStore;
  storage: LocalArtifactStorage;
  config: ServiceConfig;
  close: () => Promise<void>;
}

export async function startTestApi(overrides?: Partial<ServiceConfig>): Promise<TestApi> {
  // Hermetic default: pg-mem. Set LIFEMAP_TEST_DATABASE_URL to run the same
  // suite against real Postgres (tables are truncated per test).
  const realUrl = process.env.LIFEMAP_TEST_DATABASE_URL;
  let pool: PoolLike;
  let closePool: () => Promise<void>;
  if (realUrl) {
    const { Pool } = await import('pg');
    const real = new Pool({ connectionString: realUrl });
    pool = real as unknown as PoolLike;
    closePool = () => real.end();
    await runMigrations(pool);
    await pool.query(
      'TRUNCATE report_reservations, report_chapters, report_jobs, report_entitlements, report_sessions CASCADE'
    );
  } else {
    const mem = newDb();
    const { Pool } = mem.adapters.createPg();
    const memPool = new Pool() as PoolLike;
    pool = memPool;
    closePool = async () => {
      await (memPool as { end?: () => Promise<void> }).end?.();
    };
    await runMigrations(pool);
  }
  const config = testConfig({
    storageDir: mkdtempSync(join(tmpdir(), 'lifemap-artifacts-')),
    ...overrides,
  });
  const storage = new LocalArtifactStorage(config.storageDir);
  const store = new JobStore(pool);
  const handler = createApiHandler({ store, config, storage });
  const server: Server = createServer((req, res) => {
    void handler(req, res);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  return {
    baseUrl: `http://127.0.0.1:${port}`,
    pool,
    store,
    storage,
    config,
    close: async () => {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      );
      await closePool();
    },
  };
}

export async function createGuest(api: TestApi): Promise<{ ownerId: string; token: string }> {
  const response = await fetch(`${api.baseUrl}/v1/sessions/guest`, { method: 'POST' });
  if (!response.ok) throw new Error(`guest session failed: ${response.status}`);
  return (await response.json()) as { ownerId: string; token: string };
}

export function authHeaders(token: string, extra?: Record<string, string>): Record<string, string> {
  return { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...extra };
}
