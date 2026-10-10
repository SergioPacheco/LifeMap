// ============================================================
// MAIN.TS — Report worker bootstrap (claim → process loop)
//
// A restarted worker resumes from persisted checkpoints: approved
// chapters are reused, never rewritten. Only one worker generation
// holds a lease at a time (see shared/db.ts fencing).
// ============================================================

import { randomUUID } from 'node:crypto';
import { loadConfig } from '../shared/config.js';
import { createPool, runMigrations, JobStore } from '../shared/db.js';
import { LocalArtifactStorage } from '../shared/storage.js';
import { runWorkerOnce } from './jobs.js';
import { createFakePipeline } from './pipeline.js';

async function main(): Promise<void> {
  const config = loadConfig();
  if (!config.databaseUrl) {
    console.error('[report-worker] DATABASE_URL is required');
    process.exitCode = 1;
    return;
  }
  const workerId = `worker-${randomUUID().slice(0, 8)}`;
  const pool = createPool(config.databaseUrl);
  await runMigrations(pool);
  const deps = { store: new JobStore(pool), storage: new LocalArtifactStorage(config.storageDir), config };
  // Task 3 stand-in: deterministic engine, no model calls. Task 4 injects
  // the OpenAI pipeline behind the same interface.
  console.warn('[report-worker] FAKE pipeline active (no OpenAI calls) — task 4 replaces it');
  const pipeline = createFakePipeline();

  const once = process.argv.includes('--once');
  let running = true;
  const shutdown = () => {
    running = false;
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

  do {
    const jobId = await runWorkerOnce(deps, pipeline, workerId);
    if (!running) break;
    if (jobId) {
      console.log(`[report-worker] ${workerId} finished ${jobId}`);
    } else if (!once) {
      await new Promise((resolve) => setTimeout(resolve, config.workerPollMs));
    }
  } while (running && !once);

  await pool.end();
}

void main();
