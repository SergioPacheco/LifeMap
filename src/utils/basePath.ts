// Base path helper for GitHub Pages compatibility
// In dev: base = '/', in production: base = '/LifeMap'
const BASE = import.meta.env.BASE_URL?.replace(/\/$/, '') || '';

/**
 * Prepend base path to internal links
 * Usage: href={basePath(`/${locale}/chart/natal`)}
 */
export function basePath(path: string): string {
  if (path.startsWith('http') || path.startsWith('#')) return path;
  return `${BASE}${path}`;
}

export default basePath;
