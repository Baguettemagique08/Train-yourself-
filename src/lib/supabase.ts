import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** Storage bucket holding case documents (BDNs, lab reports, scans, …). */
export const STORAGE_BUCKET = import.meta.env.VITE_SUPABASE_DOCUMENTS_BUCKET || 'documents'

/**
 * Whether real Supabase credentials are present. When false the app runs in
 * demo mode against local mock data, so the UI still renders without a backend.
 */
export const isSupabaseConfigured = Boolean(supabaseUrl) && Boolean(supabaseAnonKey)

// Guard: if env vars are missing, fall back to a placeholder client so importing
// modules never crashes. Reads degrade to mock data; writes throw a clear error.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  },
)

export type SupabaseClient = typeof supabase
