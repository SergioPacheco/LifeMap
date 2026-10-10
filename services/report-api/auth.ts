// ============================================================
// AUTH.TS — Guest sessions and bearer authentication
//
// Guest identity is an opaque token; only its sha256 hash is stored.
// A forged or unknown token yields 401 without revealing anything else.
// Account recovery/sync across devices is out of scope (spec §10).
// ============================================================

import { ApiError, ErrorCodes } from '../shared/errors.js';
import type { JobStore } from '../shared/db.js';

export async function authenticate(store: JobStore, header: string | undefined): Promise<string> {
  const token = (header ?? '').replace(/^Bearer\s+/i, '').trim();
  if (!token) throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Missing bearer token');
  const ownerId = await store.findOwnerByToken(token);
  if (!ownerId) throw new ApiError(401, ErrorCodes.UNAUTHORIZED, 'Unknown session token');
  return ownerId;
}
