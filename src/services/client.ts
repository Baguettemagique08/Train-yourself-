import type { PostgrestError } from '@supabase/supabase-js'
import { supabase, isSupabaseConfigured, STORAGE_BUCKET } from '@/lib/supabase'

export { supabase, isSupabaseConfigured, STORAGE_BUCKET }

/**
 * A typed error surfaced by every service. React Query catches thrown errors and
 * exposes them as `error`, so services throw rather than return error tuples.
 */
export class ServiceError extends Error {
  code?: string
  details?: string
  constructor(message: string, opts?: { code?: string; details?: string; cause?: unknown }) {
    super(message)
    this.name = 'ServiceError'
    this.code = opts?.code
    this.details = opts?.details
    if (opts?.cause) (this as { cause?: unknown }).cause = opts.cause
  }
}

export function fromPostgrest(error: PostgrestError): ServiceError {
  return new ServiceError(error.message, { code: error.code, details: error.details })
}

/** Throw on error, require non-null data. */
export function unwrap<T>(res: { data: T | null; error: PostgrestError | null }): T {
  if (res.error) throw fromPostgrest(res.error)
  if (res.data === null) throw new ServiceError('No data returned', { code: 'NO_DATA' })
  return res.data
}

/** Throw on error, allow null data (e.g. maybeSingle). */
export function unwrapMaybe<T>(res: { data: T | null; error: PostgrestError | null }): T | null {
  if (res.error) throw fromPostgrest(res.error)
  return res.data
}

/** Guard for write paths — fail fast with a clear message in demo mode. */
export function assertConfigured(): void {
  if (!isSupabaseConfigured) {
    throw new ServiceError(
      'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable writes.',
      { code: 'NOT_CONFIGURED' },
    )
  }
}
