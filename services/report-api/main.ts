// ============================================================
// MAIN.TS — Report API bootstrap (separate from the static site)
//
// The API key, price table and database credentials only ever exist in
// this process. The frontend talks to it over PUBLIC_REPORT_API_URL.
// ============================================================

import { createServer } from 'node:http';
import { loadConfig } from '../shared/config.js';
import { createPool, runMigrations, JobStore } from '../shared/db.js';
import { LocalArtifactStorage } from '../shared/storage.js';
import { createApiHandler } from './routes.js';

async function main(): Promise<void> {
  const config = loadConfig();
  if (!config.databaseUrl) {
    console.error('[report-api] DATABASE_URL is required');
    process.exitCode = 1;
    return;
  }
  const pool = createPool(config.databaseUrl);
  await runMigrations(pool);
  const store = new JobStore(pool);
  const storage = new LocalArtifactStorage(config.storageDir);
  const handler = createApiHandler({ store, config, storage });
  const server = createServer((req, res) => {
    void handler(req, res);
  });
  await new Promise<void>((resolve) => server.listen(config.port, '0.0.0.0', resolve));
  console.log(`[report-api] listening on :${config.port}`);
  const shutdown = () => {
    server.close(() => void pool.end().finally(() => process.exit(0)));
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

void main();
