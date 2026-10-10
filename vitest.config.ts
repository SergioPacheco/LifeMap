import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Services use explicit `.js` relative imports (required by NodeNext ESM
// and tsc emit). Vite resolves extensionless TS imports only, so this
// test-only bridge maps `./x.js` → `./x.ts` when the TS source exists.
const tsJsBridge = {
  name: 'ts-js-bridge',
  enforce: 'pre' as const,
  resolveId(source: string, importer: string | undefined): string | null {
    if (!importer || !importer.endsWith('.ts')) return null;
    if (!source.startsWith('./') && !source.startsWith('../')) return null;
    if (!source.endsWith('.js')) return null;
    const candidate = resolve(dirname(fileURLToPath(`file://${importer}`)), source.replace(/\.js$/, '.ts'));
    return existsSync(candidate) ? candidate : null;
  },
};

export default defineConfig({
  plugins: [tsJsBridge],
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/e2e/**'],
    // Real-Postgres verification shares one database across files: run
    // files serially there (pg-mem default stays hermetic + parallel).
    maxWorkers: process.env.LIFEMAP_TEST_DATABASE_URL ? 1 : undefined,
  },
});
