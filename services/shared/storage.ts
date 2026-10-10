// ============================================================
// STORAGE.TS — Private artifact storage (PDF/document bytes)
//
// Local filesystem backend for development and the hermetic test
// suite. Production object storage arrives behind this same interface;
// job rows only ever hold opaque artifact pointers, never bytes.
// ============================================================

import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export interface ArtifactStorage {
  put: (jobId: string, kind: 'pdf' | 'document', data: Uint8Array) => Promise<string>;
  get: (path: string) => Promise<Uint8Array | null>;
  delete: (path: string) => Promise<void>;
}

function safeJobId(jobId: string): string {
  if (!/^[A-Za-z0-9-]+$/.test(jobId)) throw new Error('INVALID_JOB_ID');
  return jobId;
}

export class LocalArtifactStorage implements ArtifactStorage {
  constructor(readonly dir: string) {
    mkdirSync(dir, { recursive: true });
  }

  async put(jobId: string, kind: 'pdf' | 'document', data: Uint8Array): Promise<string> {
    const name = `${safeJobId(jobId)}.${kind === 'pdf' ? 'pdf' : 'json'}`;
    writeFileSync(join(this.dir, name), data);
    return name;
  }

  async get(path: string): Promise<Uint8Array | null> {
    if (path.includes('/') || path.includes('\\') || path.includes('..')) return null;
    try {
      return await readFile(join(this.dir, path));
    } catch {
      return null;
    }
  }

  async delete(path: string): Promise<void> {
    if (!path || path.includes('/') || path.includes('\\') || path.includes('..')) return;
    try {
      rmSync(join(this.dir, path), { force: true });
    } catch {
      // Deletion is best-effort; the DB row is the source of truth.
    }
  }
}
